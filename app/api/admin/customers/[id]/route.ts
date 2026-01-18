import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/admin/customers/[id] - Get single customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // TODO: Check admin role

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            createdAt: true,
          },
        },
        bookings: {
          include: {
            classInstance: {
              include: {
                class: {
                  select: {
                    name: true,
                    instructorName: true,
                  },
                },
              },
            },
            attendance: true,
          },
          orderBy: {
            bookedAt: 'desc',
          },
        },
        checkpoints: {
          orderBy: {
            achievedAt: 'desc',
          },
        },
        creditTransactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        progressReports: {
          include: {
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
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/customers/[id] - Update customer
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // TODO: Check admin role

  try {
    const body = await request.json();

    // Update customer
    if (body.creditsRemaining !== undefined || body.membershipStatus || body.renewalDate) {
      await prisma.customer.update({
        where: { id: params.id },
        data: {
          creditsRemaining: body.creditsRemaining,
          membershipStatus: body.membershipStatus,
          renewalDate: body.renewalDate ? new Date(body.renewalDate) : undefined,
        },
      });
    }

    // Update user
    if (body.firstName || body.lastName || body.phone) {
      const customer = await prisma.customer.findUnique({
        where: { id: params.id },
        select: { userId: true },
      });

      if (customer) {
        await prisma.user.update({
          where: { id: customer.userId },
          data: {
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
          },
        });
      }
    }

    return NextResponse.json({ message: 'Customer updated' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update customer' },
      { status: 500 }
    );
  }
}
