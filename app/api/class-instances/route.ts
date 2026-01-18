import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateWeeklyInstances } from '@/lib/class-instances';

// GET /api/class-instances - Get available class instances
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('classId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const availableOnly = searchParams.get('available') === 'true';

    const where: any = {
      scheduledDate: {
        gte: startDate ? new Date(startDate) : new Date(),
      },
      status: 'scheduled',
    };

    if (classId) {
      where.classId = classId;
    }

    if (endDate) {
      where.scheduledDate.lte = new Date(endDate);
    }

    const instances = await prisma.classInstance.findMany({
      where,
      include: {
        class: {
          select: {
            name: true,
            instructorName: true,
            priceCredits: true,
            durationMinutes: true,
          },
        },
        bookings: {
          where: {
            bookingStatus: {
              in: ['CONFIRMED', 'ATTENDED'],
            },
          },
        },
      },
      orderBy: {
        scheduledStartTime: 'asc',
      },
    });

    // If availableOnly is true, filter by capacity
    const result = availableOnly
      ? instances.map((instance) => {
          const bookedCount = instance.bookings.length;
          const available = bookedCount < instance.class.maxCapacity;
          return {
            ...instance,
            available,
            spotsRemaining: instance.class.maxCapacity - bookedCount,
          };
        }).filter((i) => i.available)
      : instances.map((instance) => {
          const bookedCount = instance.bookings.length;
          return {
            ...instance,
            spotsRemaining: instance.class.maxCapacity - bookedCount,
          };
        });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch class instances' },
      { status: 500 }
    );
  }
}

// POST /api/class-instances/generate - Generate instances for a class (admin)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json();
    const { classId, weeks = 4 } = body;

    if (!classId) {
      return NextResponse.json(
        { error: 'classId is required' },
        { status: 400 }
      );
    }

    const count = await generateWeeklyInstances(classId, weeks);

    return NextResponse.json({
      message: `Generated ${count} class instances`,
      count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate instances' },
      { status: 500 }
    );
  }
}
