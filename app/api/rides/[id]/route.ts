
// src/app/api/rides/[id]/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { cashPaymentSchema } from "@/lib/validations";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: params.id },
    });

    if (!ride || ride.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = cashPaymentSchema.parse(body);

    const payment = await prisma.payment.create({
      data: {
        rideId: params.id,
        amount: validatedData.amount,
        paymentMethod: "CASH",
        status: "COMPLETED",
      },
    });

    await prisma.ride.update({
      where: { id: params.id },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}