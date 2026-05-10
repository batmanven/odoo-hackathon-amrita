/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getItineraryAction(tripId: string) {
  try {
    const stops = await prisma.tripStop.findMany({
      where: { tripId },
      orderBy: { order: 'asc' },
      include: {
        city: true,
        activities: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return stops.map(stop => ({
      id: stop.id,
      city: stop.city.name + (stop.city.country ? `, ${stop.city.country}` : ''),
      dates: stop.notes || '',
      budget: stop.budget?.toString() || '',
      description: stop.notes || '',
      activities: stop.activities.map(act => ({
        id: act.id,
        name: act.name || '',
        time: act.plannedTime || '',
        cost: act.cost?.toString() || ''
      }))
    }))
  } catch (error) {
    console.error('Error fetching itinerary:', error)
    return []
  }
}

export async function saveItineraryAction(tripId: string, stops: any[]) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.tripStop.deleteMany({
        where: { tripId }
      })

      //create new stops and activities
      for (let i = 0; i < stops.length; i++) {
        const stopData = stops[i]

        const cityParts = stopData.city.split(',').map((s: string) => s.trim())
        const cityName = cityParts[0]
        const countryName = cityParts[1] || ''

        let city = await tx.city.findFirst({
          where: { name: cityName, country: countryName }
        })

        if (!city) {
          city = await tx.city.create({
            data: { name: cityName, country: countryName }
          })
        }

        const createdStop = await tx.tripStop.create({
          data: {
            tripId,
            cityId: city.id,
            order: i,
            budget: stopData.budget ? parseFloat(stopData.budget) : null,
            notes: stopData.description,
          }
        })

        if (stopData.activities && stopData.activities.length > 0) {
          await tx.stopActivity.createMany({
            data: stopData.activities.map((act: any, actIndex: number) => ({
              stopId: createdStop.id,
              name: act.name,
              plannedTime: act.time,
              cost: act.cost ? parseFloat(act.cost) : null,
              order: actIndex
            }))
          })
        }
      }
    })

    revalidatePath(`/dashboard/trips/${tripId}`)
    revalidatePath(`/dashboard/trips/${tripId}/view`)
    revalidatePath('/dashboard/trips')
    return { success: true }
  } catch (error) {
    console.error('Error saving itinerary:', error)
    throw new Error('Failed to save itinerary')
  }
}
