'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/utils/auth'

export async function addCityToTripAction(data: {
  tripId: string
  cityName: string
  country: string
}) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  let city = await prisma.city.findFirst({
    where: { name: data.cityName, country: data.country }
  })

  if (!city) {
    city = await prisma.city.create({
      data: { name: data.cityName, country: data.country }
    })
  }

  const maxStop = await prisma.tripStop.findFirst({
    where: { tripId: data.tripId },
    orderBy: { order: 'desc' }
  })

  await prisma.tripStop.create({
    data: {
      tripId: data.tripId,
      cityId: city.id,
      order: (maxStop?.order ?? -1) + 1
    }
  })

  return { success: true, cityName: data.cityName }
}
