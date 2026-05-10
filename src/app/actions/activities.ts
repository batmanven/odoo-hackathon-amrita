'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/utils/auth'

export async function addActivityToStopAction(data: {
  stopId: string
  name: string
  cost: number
  plannedTime: string
  category: string
}) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  const maxActivity = await prisma.stopActivity.findFirst({
    where: { stopId: data.stopId },
    orderBy: { order: 'desc' }
  })

  await prisma.stopActivity.create({
    data: {
      stopId: data.stopId,
      name: data.name,
      cost: data.cost,
      plannedTime: data.plannedTime,
      order: (maxActivity?.order ?? -1) + 1
    }
  })

  return { success: true }
}
