import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/classes/[id] - Get single class
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classData = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        instances: {
          where: {
            scheduledDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            scheduledStartTime: 'asc',
          },
          take: 10,
        },
      },
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(classData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch class' },
      { status: 500 }
    );
  }
}

// PATCH /api/classes/[id] - Update class (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json();

    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update class' },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id] - Delete class (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin authentication check
    await prisma.class.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Class deactivated' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete class' },
      { status: 500 }
    );
  }
}
