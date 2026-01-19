import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Check admin role
  if (authResult.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  try {
    // Get date range for "this week"
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    // Total customers
    const totalCustomers = await prisma.customer.count();

    // Active memberships
    const activeMemberships = await prisma.customer.count({
      where: {
        membershipStatus: 'ACTIVE',
      },
    });

    // Classes this week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const classesThisWeek = await prisma.classInstance.count({
      where: {
        scheduledStartTime: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
    });

    // Average attendance rate
    const totalBookings = await prisma.booking.count({
      where: {
        bookingStatus: {
          in: ['CONFIRMED', 'ATTENDED'],
        },
      },
    });

    const attendedBookings = await prisma.booking.count({
      where: {
        bookingStatus: 'ATTENDED',
      },
    });

    const averageAttendance = totalBookings > 0
      ? Math.round((attendedBookings / totalBookings) * 100)
      : 0;

    // Recent activity
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: {
        bookedAt: 'desc',
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        classInstance: {
          include: {
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      totalCustomers,
      activeMemberships,
      classesThisWeek,
      averageAttendance,
      recentBookings: recentBookings.map((booking) => ({
        id: booking.id,
        customerName: `${booking.customer.user.firstName} ${booking.customer.user.lastName}`,
        className: booking.classInstance.class.name,
        bookedAt: booking.bookedAt,
        status: booking.bookingStatus,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
