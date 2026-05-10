import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ShareClient from './ShareClient'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, imageUrl: true }
  })

  if (!trip) return { title: 'Trip Not Found | Traveloop' }

  const description = trip.description || `Check out this travel itinerary on Traveloop!`
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/share/${params.id}`

  return {
    title: `${trip.title} | Traveloop`,
    description,
    openGraph: {
      title: trip.title,
      description,
      url,
      images: trip.imageUrl ? [{ url: trip.imageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: trip.title,
      description,
      images: trip.imageUrl ? [trip.imageUrl] : [],
    }
  }
}


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
