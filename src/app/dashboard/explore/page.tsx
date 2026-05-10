import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ExploreClient from './ExploreClient'


export default async function ExplorePage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const trips = await prisma.trip.findMany({
    where: { userId: session.userId },
    orderBy: { startDate: 'desc' },
    select: { id: true, title: true }
  })

  return <ExploreClient trips={trips} />
}
