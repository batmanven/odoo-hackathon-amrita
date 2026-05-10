import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ShareClient from './ShareClient'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const trip = await prisma.trip.findUnique({
    where: { id },
    select: { title: true, description: true, imageUrl: true }
  })

  if (!trip) return { title: 'Trip Not Found | Traveloop' }

  const description = trip.description || `Check out this travel itinerary on Traveloop!`
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/share/${id}`

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


export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip = await prisma.trip.findUnique({
    where: { id },
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

  if (!trip) {
    notFound()
  }

  if (!trip.isPublic) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[40px] p-12 text-center shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Private Itinerary</h1>
          <p className="text-gray-500 font-medium leading-relaxed mb-8">
            This travel plan has been set to private by the author. You&apos;ll need permission to view these adventure details.
          </p>
          <div className="h-1 bg-gray-50 rounded-full w-20 mx-auto"></div>
        </div>
      </div>
    )
  }

  return <ShareClient trip={trip} />
}
