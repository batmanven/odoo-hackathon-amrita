import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ExploreClient from './ExploreClient'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'


export default async function ExplorePage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const trips = await prisma.trip.findMany({
    where: { userId: session.userId },
    orderBy: { startDate: 'desc' },
    select: { id: true, title: true }
  })

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ExploreClient trips={trips} />
    </Suspense>
  )
}
