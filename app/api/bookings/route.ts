import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bookingSchema = z.object({
  classInstanceId: z.string().uuid(),
});

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // upcoming, past, all

    const customer = await prisma.customer.findUnique({
      where: { userId: user.userId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    let where: any = {
      customerId: customer.id,
    };

    if (status === 'upcoming') {
      where.classInstance = {
        scheduledStartTime: { gte: now },
      };
      where.bookingStatus = {
        in: ['CONFIRMED', 'ATTENDED'],
      };
    } else if (status === 'past') {
      where.classInstance = {
        scheduledStartTime: { lt: now },
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        classInstance: {
          include: {
            class: {
              select: {
                name: true,
                instructorName: true,
                durationMinutes: true,
              },
            },
          },
        },
      },
      orderBy: {
        bookedAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const { classInstanceId } = bookingSchema.parse(body);

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { userId: user.userId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if membership is active
    if (customer.membershipStatus !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Membership is not active' },
        { status: 400 }
      );
    }

    // Get class instance with class info
    const classInstance = await prisma.classInstance.findUnique({
      where: { id: classInstanceId },
      include: {
        class: true,
        bookings: {
          where: {
            bookingStatus: {
              in: ['CONFIRMED', 'ATTENDED'],
            },
          },
        },
      },
    });

    if (!classInstance) {
      return NextResponse.json(
        { error: 'Class instance not found' },
        { status: 404 }
      );
    }

    // Check if class is in the future
    if (classInstance.scheduledStartTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book past classes' },
        { status: 400 }
      );
    }

    // Check capacity
    if (classInstance.bookings.length >= classInstance.class.maxCapacity) {
      return NextResponse.json(
        { error: 'Class is fully booked' },
        { status: 400 }
      );
    }

    // Check if already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        customerId: customer.id,
        classInstanceId: classInstanceId,
        bookingStatus: {
          in: ['CONFIRMED', 'ATTENDED'],
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Already booked for this class' },
        { status: 400 }
      );
    }

    // Check credits
    const priceCredits = classInstance.class.priceCredits;
    if (customer.creditsRemaining < priceCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Create booking and deduct credits in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create booking
      const booking = await tx.booking.create({
        data: {
          customerId: customer.id,
          classInstanceId: classInstanceId,
          creditsUsed: priceCredits,
          bookingStatus: 'CONFIRMED',
        },
        include: {
          classInstance: {
            include: {
              class: {
                select: {
                  name: true,
                  instructorName: true,
                },
              },
            },
          },
        },
      });

      // Update customer credits
      const updatedCustomer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          creditsRemaining: {
            decrement: priceCredits,
          },
        },
      });

      // Record credit transaction
      await tx.creditTransaction.create({
        data: {
          customerId: customer.id,
          transactionType: 'CLASS_BOOKING',
          amount: -priceCredits,
          balanceBefore: customer.creditsRemaining,
          balanceAfter: updatedCustomer.creditsRemaining,
          notes: `Booking for ${classInstance.class.name}`,
        },
      });

      return booking;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
