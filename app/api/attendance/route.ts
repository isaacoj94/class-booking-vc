import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const attendanceSchema = z.object({
  bookingId: z.string().uuid(),
  checkInMethod: z.enum(['AUTOMATIC', 'MANUAL', 'QR_CODE']).default('MANUAL'),
  notes: z.string().optional(),
});

// POST /api/attendance - Mark attendance for a booking
export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    // TODO: Check if user is admin or teacher for manual check-in
    const body = await request.json();
    const { bookingId, checkInMethod, notes } = attendanceSchema.parse(body);

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        classInstance: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if already marked as attended
    const existingAttendance = await prisma.attendance.findUnique({
      where: { bookingId },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already marked' },
        { status: 400 }
      );
    }

    // Check if class has started or passed
    const now = new Date();
    if (booking.classInstance.scheduledStartTime > now) {
      return NextResponse.json(
        { error: 'Cannot mark attendance before class starts' },
        { status: 400 }
      );
    }

    // Create attendance and update customer stats in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create attendance record
      const attendance = await tx.attendance.create({
        data: {
          bookingId,
          customerId: booking.customerId,
          classInstanceId: booking.classInstanceId,
          checkInMethod,
          notes,
        },
      });

      // Update booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: 'ATTENDED',
        },
      });

      // Update customer stats
      const updatedCustomer = await tx.customer.update({
        where: { id: booking.customerId },
        data: {
          totalClassesAttended: {
            increment: 1,
          },
        },
      });

      // Check and update checkpoints
      await checkAndCreateCheckpoints(tx, booking.customerId, updatedCustomer.totalClassesAttended);

      // Update streak (simplified - would need more logic to track weekly streaks)
      // This is a placeholder - would need to track weeks properly

      return attendance;
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
      { error: error.message || 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}

// Helper function to check and create checkpoints
async function checkAndCreateCheckpoints(
  tx: any,
  customerId: string,
  totalClasses: number
) {
  const checkpoints = [
    { type: 'FIRST_CLASS', threshold: 1 },
    { type: 'THIRD_CLASS', threshold: 3 },
    { type: 'TENTH_CLASS', threshold: 10 },
  ];

  for (const checkpoint of checkpoints) {
    if (totalClasses === checkpoint.threshold) {
      // Check if checkpoint already exists
      const existing = await tx.checkpoint.findFirst({
        where: {
          customerId,
          checkpointType: checkpoint.type as any,
        },
      });

      if (!existing) {
        await tx.checkpoint.create({
          data: {
            customerId,
            checkpointType: checkpoint.type as any,
            classCountAtAchievement: totalClasses,
          },
        });
      }
    }
  }
}
