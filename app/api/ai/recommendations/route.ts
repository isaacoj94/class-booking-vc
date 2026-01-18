import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { generateRecommendations } from '@/lib/ai';

// GET /api/ai/recommendations - Get AI-powered class recommendations
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { userId: user.userId },
      include: {
        user: true,
        bookings: {
          include: {
            classInstance: {
              include: {
                class: true,
              },
            },
          },
          orderBy: {
            bookedAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get available class instances
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // Next 30 days

    const availableInstances = await prisma.classInstance.findMany({
      where: {
        scheduledStartTime: {
          gte: now,
          lte: futureDate,
        },
        status: 'scheduled',
      },
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
      orderBy: {
        scheduledStartTime: 'asc',
      },
      take: 20,
    });

    // Filter to available classes only
    const available = availableInstances
      .filter((instance) => instance.bookings.length < instance.class.maxCapacity)
      .slice(0, 10);

    // Prepare context
    const pastClasses = customer.bookings
      .map((b) => b.classInstance.class.name)
      .filter((name, index, self) => self.indexOf(name) === index); // unique

    const preferredTimes = customer.bookings
      .map((b) => {
        const date = new Date(b.classInstance.scheduledStartTime);
        return date.getHours();
      })
      .reduce((acc: Record<number, number>, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

    const mostPreferredHours = Object.entries(preferredTimes)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    const context = {
      customerName: `${customer.user.firstName} ${customer.user.lastName}`,
      pastClasses,
      totalClasses: customer.totalClassesAttended,
      preferredTimes: mostPreferredHours.length > 0 ? mostPreferredHours : ['09:00', '18:00'],
      availableClasses: available.map((instance) => ({
        name: instance.class.name,
        instructorName: instance.class.instructorName,
        time: new Date(instance.scheduledStartTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        date: new Date(instance.scheduledStartTime).toLocaleDateString(),
        difficulty: instance.class.name.toLowerCase().includes('beginner')
          ? 'beginner'
          : instance.class.name.toLowerCase().includes('advanced')
          ? 'advanced'
          : 'intermediate',
      })),
    };

    // Generate recommendations
    const recommendations = await generateRecommendations(context);

    return NextResponse.json({
      recommendations: recommendations.slice(0, 3),
      availableClasses: available.map((instance) => ({
        id: instance.id,
        className: instance.class.name,
        instructorName: instance.class.instructorName,
        scheduledStartTime: instance.scheduledStartTime,
        priceCredits: instance.class.priceCredits,
      })),
    });
  } catch (error: any) {
    console.error('AI recommendations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
