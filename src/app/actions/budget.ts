'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/utils/auth'
import { revalidatePath } from 'next/cache'

export async function addExpenseAction(data: {
  tripId: string
  amount: number
  category: string
  description: string
}) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.tripExpense.create({
    data: {
      tripId: data.tripId,
      amount: data.amount,
      category: data.category,
      description: data.description
    }
  })

  revalidatePath('/dashboard/budget')
  return { success: true }
}

export async function deleteExpenseAction(expenseId: string) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.tripExpense.delete({
    where: { id: expenseId }
  })

  revalidatePath('/dashboard/budget')
  return { success: true }
}
