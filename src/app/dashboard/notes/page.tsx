import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import NotesClient from './NotesClient'

export default async function NotesPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const trips = await prisma.trip.findMany({
    where: { userId: session.userId },
    orderBy: { startDate: 'desc' },
    include: {
      notes: {
        orderBy: { createdAt: 'desc' },
        include: {
          stop: {
            include: { city: true }
          }
        }
      },
      stops: {
        orderBy: { order: 'asc' },
        include: { city: true }
      }
    }
  })

  return <NotesClient trips={trips} />
}
