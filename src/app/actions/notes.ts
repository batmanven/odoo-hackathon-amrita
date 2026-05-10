'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/utils/auth'
import { revalidatePath } from 'next/cache'

export async function addNoteAction(data: {
  tripId: string
  stopId?: string
  content: string
}) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.tripNote.create({
    data: {
      tripId: data.tripId,
      stopId: data.stopId || null,
      content: data.content
    }
  })

  revalidatePath('/dashboard/notes')
  return { success: true }
}

export async function updateNoteAction(noteId: string, content: string) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.tripNote.update({
    where: { id: noteId },
    data: { content }
  })

  revalidatePath('/dashboard/notes')
  return { success: true }
}

export async function deleteNoteAction(noteId: string) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.tripNote.delete({
    where: { id: noteId }
  })

  revalidatePath('/dashboard/notes')
  return { success: true }
}
