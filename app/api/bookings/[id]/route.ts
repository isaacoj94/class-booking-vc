import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

// DELETE /api/bookings/[id] - Cancel a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: user.userId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        classInstance: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.customerId !== customer.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if class has already started
    if (booking.classInstance.scheduledStartTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot cancel a class that has already started' },
        { status: 400 }
      );
    }

    // Refund credits and cancel booking in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: params.id },
        data: {
          bookingStatus: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      // Refund credits
      const updatedCustomer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          creditsRemaining: {
            increment: booking.creditsUsed,
          },
        },
      });

      // Record credit transaction
      await tx.creditTransaction.create({
        data: {
          customerId: customer.id,
          transactionType: 'REFUND',
          amount: booking.creditsUsed,
          balanceBefore: customer.creditsRemaining,
          balanceAfter: updatedCustomer.creditsRemaining,
          notes: `Refund for cancelled booking`,
        },
      });

      return updatedBooking;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
