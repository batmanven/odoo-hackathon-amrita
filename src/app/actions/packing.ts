'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/utils/auth'
import { revalidatePath } from 'next/cache'

export async function addPackingItemAction(data: {
  tripId: string
  name: string
  category: string
}) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  const item = await prisma.packingItem.create({
    data: {
      tripId: data.tripId,
      name: data.name,
      category: data.category
    }
  })

  revalidatePath('/dashboard/packing')
  return { success: true, item }
}

export async function togglePackingItemAction(itemId: string, isPacked: boolean) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.packingItem.update({
    where: { id: itemId },
    data: { isPacked }
  })

  revalidatePath('/dashboard/packing')
  return { success: true }
}

export async function deletePackingItemAction(itemId: string) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.packingItem.delete({
    where: { id: itemId }
  })

  revalidatePath('/dashboard/packing')
  return { success: true }
}

export async function resetPackingListAction(tripId: string) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.packingItem.updateMany({
    where: { tripId },
    data: { isPacked: false }
  })

  revalidatePath('/dashboard/packing')
  return { success: true }
}
