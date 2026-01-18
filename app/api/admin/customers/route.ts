import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// GET /api/admin/customers - List all customers
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // TODO: Check if user is ADMIN
  // if (user.role !== 'ADMIN') {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  // }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // active, paused, cancelled, all
    const search = searchParams.get('search'); // name or email search

    let where: any = {};

    if (status && status !== 'all') {
      where.membershipStatus = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        bookings: {
          include: {
            classInstance: {
              select: {
                scheduledStartTime: true,
              },
            },
            attendance: {
              select: {
                attendedAt: true,
              },
            },
          },
          orderBy: {
            bookedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response with last class and last contact
    const formatted = customers.map((customer) => {
      const lastBooking = customer.bookings[0];
      const lastClass = lastBooking?.classInstance?.scheduledStartTime
        ? new Date(lastBooking.classInstance.scheduledStartTime)
        : null;
      const lastAttendance = lastBooking?.attendance?.attendedAt
        ? new Date(lastBooking.attendance.attendedAt)
        : null;

      return {
        ...customer,
        lastClassAttended: lastAttendance || lastClass,
        user: customer.user,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
