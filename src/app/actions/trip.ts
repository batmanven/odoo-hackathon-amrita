'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/utils/auth'
import { revalidatePath } from 'next/cache'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createTripAction(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session?.userId) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const destination = formData.get('destination') as string
  const startDateStr = formData.get('startDate') as string
  const endDateStr = formData.get('endDate') as string
  const description = formData.get('description') as string
  const imageUrl = formData.get('imageUrl') as string

  if (!title || !startDateStr || !endDateStr) {
    return { error: 'Trip Name, Start Date, and End Date are required.' }
  }

  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)

  if (endDate < startDate) {
    return { error: 'End Date cannot be before Start Date.' }
  }

  try {
    const trip = await prisma.trip.create({
      data: {
        userId: session.userId,
        title,
        startDate,
        endDate,
        description: description || null,
        imageUrl: imageUrl || null,
      }
    })

    if (destination) {
      const parts = destination.split(',').map(s => s.trim())
      const cityName = parts[0]
      const countryName = parts.length > 1 ? parts[parts.length - 1] : 'Unknown'

      let city = await prisma.city.findFirst({
        where: { name: cityName, country: countryName }
      })

      if (!city) {
        city = await prisma.city.create({
          data: {
            name: cityName,
            country: countryName
          }
        })
      }

      await prisma.tripStop.create({
        data: {
          tripId: trip.id,
          cityId: city.id,
          order: 1,
          arrival: startDate,
          departure: endDate,
        }
      })
    }

    revalidatePath('/dashboard', 'layout')
    return { success: true, tripId: trip.id }
  } catch (error) {
    console.error('Create trip error:', error)
    return { error: 'Failed to create trip. Please try again.' }
  }
}
