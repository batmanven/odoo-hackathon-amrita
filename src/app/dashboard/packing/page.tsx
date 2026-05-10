import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import PackingClient from './PackingClient'


export default async function PackingPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const trips = await prisma.trip.findMany({
    where: { userId: session.userId },
    orderBy: { startDate: 'desc' },
    select: { id: true, title: true },
  })

  const allItems = await prisma.packingItem.findMany({
    where: {
      trip: { userId: session.userId }
    },
    orderBy: { name: 'asc' }
  })

  return <PackingClient trips={trips} items={allItems} />
}
