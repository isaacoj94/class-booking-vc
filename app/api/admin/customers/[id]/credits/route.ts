import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const creditAdjustmentSchema = z.object({
  amount: z.number().int(),
  notes: z.string().optional(),
});

// POST /api/admin/customers/[id]/credits - Adjust customer credits
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // TODO: Check admin role

  try {
    const body = await request.json();
    const { amount, notes } = creditAdjustmentSchema.parse(body);

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Update credits and create transaction in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const balanceBefore = customer.creditsRemaining;
      const balanceAfter = balanceBefore + amount;

      // Update customer credits
      const updatedCustomer = await tx.customer.update({
        where: { id: params.id },
        data: {
          creditsRemaining: {
            increment: amount,
          },
        },
      });

      // Record transaction
      await tx.creditTransaction.create({
        data: {
          customerId: params.id,
          transactionType: 'ADMIN_ADJUSTMENT',
          amount,
          balanceBefore,
          balanceAfter,
          adminId: user.userId,
          notes: notes || `Admin credit adjustment`,
        },
      });

      return updatedCustomer;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to adjust credits' },
      { status: 500 }
    );
  }
}
