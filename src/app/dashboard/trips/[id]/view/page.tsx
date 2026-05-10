import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ViewClient from './ViewClient'


export default async function TripViewPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      stops: {
        orderBy: { order: 'asc' },
        include: {
          city: true,
          activities: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  if (!trip) redirect('/dashboard/trips')

  return <ViewClient trip={trip} />
}

