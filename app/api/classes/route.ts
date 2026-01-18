import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const classSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  instructorName: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  maxCapacity: z.number().int().positive(),
  priceCredits: z.number().int().positive().default(1),
  recurrencePattern: z.object({
    pattern: z.enum(['weekly', 'daily']),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    timezone: z.string(),
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  timezone: z.string(),
  isActive: z.boolean().default(true),
});

// GET /api/classes - Get all classes (available for customers)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const availableOnly = searchParams.get('available') === 'true';
    
    const where = availableOnly ? { isActive: true } : {};
    
    const classes = await prisma.class.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(classes);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

// POST /api/classes - Create new class (admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json();
    const validated = classSchema.parse(body);

    const newClass = await prisma.class.create({
      data: {
        name: validated.name,
        description: validated.description,
        instructorName: validated.instructorName,
        durationMinutes: validated.durationMinutes,
        maxCapacity: validated.maxCapacity,
        priceCredits: validated.priceCredits,
        recurrencePattern: validated.recurrencePattern,
        startTime: validated.startTime,
        endTime: validated.endTime,
        timezone: validated.timezone,
        isActive: validated.isActive,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create class' },
      { status: 500 }
    );
  }
}
