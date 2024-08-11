import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PaymentForm from '@/components/PaymentForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

async function getRideDetails(rideId: string, userId: string) {
  const ride = await prisma.ride.findUnique({
    where: { 
      id: rideId,
      userId: userId,
      status: 'COMPLETED',
    },
    include: { payment: true },
  });

  if (!ride) {
    notFound();
  }

  return ride;
}

export default async function PaymentPage({ params }: { params: { rideId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }

  const ride = await getRideDetails(params.rideId, session.user.id);

  if (ride.payment) {
    // If payment exists, redirect to payment success page
    redirect(`/payment-success?id=${ride.payment.id}`);
  }

  // In a real app, you'd calculate this based on distance, time, etc.
  // For this example, we'll use a simple calculation
  const amount = parseFloat((ride.distance * 2.5).toFixed(2)); // Assuming $2.5 per km

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Alert>
              <AlertTitle>Ride Details</AlertTitle>
              <AlertDescription>
                <p>From: {ride.startLocation}</p>
                <p>To: {ride.endLocation}</p>
                <p>Distance: {ride.distance} km</p>
                <p>Date: {new Date(ride.createdAt).toLocaleString()}</p>
              </AlertDescription>
            </Alert>
          </div>
          <PaymentForm rideId={ride.id} amount={amount} />
        </CardContent>
      </Card>
    </div>
  );
}