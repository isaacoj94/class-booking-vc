import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// GET /api/admin/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // TODO: Check admin role

  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'classes'; // classes, streak, attendance
    const limit = parseInt(searchParams.get('limit') || '10');

    let customers;

    if (type === 'classes') {
      // Top by total classes attended
      customers = await prisma.customer.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          totalClassesAttended: 'desc',
        },
        take: limit,
      });
    } else if (type === 'streak') {
      // Top by consecutive weeks streak
      customers = await prisma.customer.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          consecutiveWeeksStreak: 'desc',
        },
        take: limit,
      });
    } else if (type === 'attendance') {
      // Top by attendance rate (would need to calculate based on bookings vs attendance)
      // For now, just use total classes attended
      customers = await prisma.customer.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          bookings: {
            include: {
              attendance: true,
            },
          },
        },
        orderBy: {
          totalClassesAttended: 'desc',
        },
        take: limit,
      });

      // Calculate attendance rate
      customers = customers.map((customer) => {
        const totalBookings = customer.bookings.length;
        const attendedBookings = customer.bookings.filter((b) => b.attendance).length;
        const attendanceRate = totalBookings > 0 ? (attendedBookings / totalBookings) * 100 : 0;

        return {
          ...customer,
          attendanceRate: Math.round(attendanceRate * 10) / 10,
        };
      }).sort((a: any, b: any) => b.attendanceRate - a.attendanceRate);
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be: classes, streak, or attendance' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      type,
      customers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
