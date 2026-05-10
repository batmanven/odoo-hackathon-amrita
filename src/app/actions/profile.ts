'use server'

import { prisma } from '@/lib/prisma'
import { getSession, clearSession } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfileAction(data: { firstName: string, lastName: string, email: string }) {
  try {
    const session = await getSession()
    if (!session?.userId) throw new Error('Not authenticated')

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      }
    })

    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

export async function deleteAccountAction() {
  try {
    const session = await getSession()
    if (!session?.userId) throw new Error('Not authenticated')

    await prisma.user.delete({
      where: { id: session.userId }
    })

    await clearSession()
  } catch (error) {
    console.error('Error deleting account:', error)
    return { success: false, error: 'Failed to delete account' }
  }

  redirect('/login')
}

