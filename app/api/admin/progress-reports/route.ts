import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { analyzeProgress } from '@/lib/ai';

const reportSchema = z.object({
  customerId: z.string().uuid(),
  reportType: z.enum(['PROGRESS', 'GOAL_SETTING']),
  title: z.string().min(1),
  content: z.string().min(1),
  goals: z.array(
    z.object({
      goal: z.string(),
      targetDate: z.string(),
      status: z.string().optional(),
    })
  ).optional(),
});

// GET /api/admin/progress-reports - List all progress reports
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // TODO: Check admin role

  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const reportType = searchParams.get('type');

    let where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (reportType) {
      where.reportType = reportType.toUpperCase();
    }

    const reports = await prisma.progressReport.findMany({
      where,
      include: {
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reports);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST /api/admin/progress-reports - Create new progress report
export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // TODO: Check admin/teacher role

  try {
    const body = await request.json();
    const { customerId, reportType, title, content, goals } = reportSchema.parse(body);

    // Create report
    const report = await prisma.progressReport.create({
      data: {
        customerId,
        teacherId: user.userId,
        reportType,
        title,
        content,
        goals: goals || [],
        sentAt: new Date(),
      },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
      },
    });

    // If report has goals, analyze progress (async - could be done in background job)
    if (goals && goals.length > 0) {
      try {
        // Get customer attendance since goal setting
        const customer = await prisma.customer.findUnique({
          where: { id: customerId },
          include: {
            bookings: {
              include: {
                classInstance: {
                  include: {
                    class: true,
                  },
                },
              },
              where: {
                bookedAt: {
                  gte: report.sentAt,
                },
              },
            },
          },
        });

        if (customer) {
          const analysis = await analyzeProgress({
            customerName: `${customer.user.firstName} ${customer.user.lastName}`,
            goals: goals.map((g) => ({
              goal: g.goal,
              targetDate: g.targetDate,
              status: g.status || 'in progress',
            })),
            attendanceSinceGoal: customer.bookings.length,
            totalClassesAttended: customer.totalClassesAttended,
            classesAttended: customer.bookings.map((b) => ({
              className: b.classInstance.class.name,
              date: b.classInstance.scheduledStartTime.toISOString(),
            })),
          });

          // Update report with AI analysis
          await prisma.progressReport.update({
            where: { id: report.id },
            data: {
              aiAnalysis: analysis,
            },
          });
        }
      } catch (error) {
        console.error('AI analysis error:', error);
        // Don't fail the report creation if AI analysis fails
      }
    }

    // TODO: Send email to customer (would integrate with email service here)
    // For now, just create notification
    await prisma.notification.create({
      data: {
        userId: customer.user.userId,
        notificationType: 'PROGRESS_REPORT',
        title: `New ${reportType === 'PROGRESS' ? 'Progress' : 'Goal Setting'} Report`,
        message: `${title}`,
        actionUrl: `/dashboard/progress`,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create report' },
      { status: 500 }
    );
  }
}
