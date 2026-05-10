'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/utils/auth'

export async function copyTripAction(tripId: string) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  const original = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: {
        orderBy: { order: 'asc' },
        include: {
          activities: { orderBy: { order: 'asc' } }
        }
      }
    }
  })

  if (!original) throw new Error('Trip not found')

  const newTrip = await prisma.trip.create({
    data: {
      userId: session.userId,
      title: original.title,
      startDate: original.startDate,
      endDate: original.endDate,
      budget: original.budget,
      description: original.description,
      imageUrl: original.imageUrl,
      isPublic: false,
    }
  })

  for (const stop of original.stops) {
    const newStop = await prisma.tripStop.create({
      data: {
        tripId: newTrip.id,
        cityId: stop.cityId,
        order: stop.order,
        arrival: stop.arrival,
        departure: stop.departure,
        budget: stop.budget,
        notes: stop.notes
      }
    })

    for (const act of stop.activities) {
      await prisma.stopActivity.create({
        data: {
          stopId: newStop.id,
          activityId: act.activityId,
          name: act.name,
          plannedTime: act.plannedTime,
          cost: act.cost,
          order: act.order
        }
      })
    }
  }

  return { success: true, newTripId: newTrip.id }
}

export async function toggleTripPublicAction(tripId: string, isPublic: boolean) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.trip.update({
    where: { id: tripId, userId: session.userId },
    data: { isPublic }
  })

  return { success: true }
}
