import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ActivitiesClient from './ActivitiesClient'


export default async function ActivitiesPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const trips = await prisma.trip.findMany({
    where: { userId: session.userId },
    orderBy: { startDate: 'desc' },
    include: {
      stops: {
        orderBy: { order: 'asc' },
        include: { city: true }
      }
    }
  })

  return <ActivitiesClient trips={trips} />
}
