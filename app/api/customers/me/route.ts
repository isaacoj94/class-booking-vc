import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// GET /api/customers/me - Get current customer data
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: user.userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
          },
        },
        bookings: {
          where: {
            bookingStatus: {
              in: ['CONFIRMED', 'ATTENDED'],
            },
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
          orderBy: {
            bookedAt: 'asc',
          },
          take: 5,
        },
        checkpoints: {
          orderBy: {
            achievedAt: 'desc',
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Filter upcoming classes
    const now = new Date();
    const upcomingClasses = customer.bookings.filter((booking) => {
      const classDate = new Date(booking.classInstance.scheduledStartTime);
      return classDate > now;
    });

    return NextResponse.json({
      ...customer,
      upcomingClasses,
      user: customer.user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer data' },
      { status: 500 }
    );
  }
}

// PATCH /api/customers/me - Update current customer profile
export async function PATCH(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const { firstName, lastName, phone } = body;

    // Get customer to find userId
    const customer = await prisma.customer.findUnique({
      where: { userId: user.userId },
      select: { userId: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: customer.userId },
      data: {
        firstName,
        lastName,
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
