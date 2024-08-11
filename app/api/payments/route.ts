import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const paymentSchema = z.object({
  rideId: z.string().uuid(),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = paymentSchema.parse(body);

    const { rideId, amount } = validatedData;

    // Check if the ride exists and belongs to the user
    const ride = await prisma.ride.findUnique({
      where: { id: rideId, userId: session.user.id },
    });

    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    if (ride.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Ride is not completed' }, { status: 400 });
    }

    // Create a new payment record
    const payment = await prisma.payment.create({
      data: {
        amount,
        rideId,
        userId: session.user.id,
        status: 'PENDING', // Initially set as pending
        method: 'CASH',
      },
    });

    // Update the ride status to PAID
    await prisma.ride.update({
      where: { id: rideId },
      data: { status: 'PAID' },
    });

    return NextResponse.json({ success: true, payment }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Payment processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      include: { ride: true },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}