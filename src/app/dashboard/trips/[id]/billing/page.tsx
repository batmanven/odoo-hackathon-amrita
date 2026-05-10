import { prisma } from '@/lib/prisma'
import { getSession } from '@/utils/auth'
import { redirect } from 'next/navigation'
import BillingClient from './BillingClient'

export default async function BillingPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const trip = await prisma.trip.findUnique({
    where: { id: params.id, userId: session.userId },
    include: {
      user: true,
      expenses: true,
      stops: {
        include: { city: true }
      }
    }
  })

  if (!trip) redirect('/dashboard/trips')

  return <BillingClient trip={trip} />
}
