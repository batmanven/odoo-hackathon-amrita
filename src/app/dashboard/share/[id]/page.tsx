import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ShareClient from './ShareClient'


export default async function SharePage({ params }: { params: { id: string } }) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { firstName: true, lastName: true }
      },
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

  if (!trip || !trip.isPublic) {
    notFound()
  }

  return <ShareClient trip={trip} />
}
