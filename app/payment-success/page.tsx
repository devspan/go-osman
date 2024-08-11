import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default async function PaymentSuccessPage({ searchParams }: { searchParams: { id: string } }) {
  const paymentId = searchParams.id;

  if (!paymentId) {
    notFound();
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { ride: true },
  });

  if (!payment) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Payment Successful</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">
            Your payment of ${payment.amount.toFixed(2)} for ride #{payment.ride.id} has been confirmed.
          </p>
          <div className="bg-gray-100 p-4 rounded-md">
            <h2 className="font-semibold mb-2">Payment Details:</h2>
            <p>Payment ID: {payment.id}</p>
            <p>Date: {new Date(payment.createdAt).toLocaleString()}</p>
            <p>Method: Cash</p>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}