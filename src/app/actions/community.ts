'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/utils/auth'
import { revalidatePath } from 'next/cache'

export async function createPostAction(data: {
  title: string
  content: string
}) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.communityPost.create({
    data: {
      userId: session.userId,
      title: data.title,
      content: data.content
    }
  })

  revalidatePath('/dashboard/community')
  return { success: true }
}

export async function likePostAction(postId: string) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.communityPost.update({
    where: { id: postId },
    data: { likes: { increment: 1 } }
  })

  revalidatePath('/dashboard/community')
  return { success: true }
}

export async function deletePostAction(postId: string) {
  const session = await getSession()
  if (!session?.userId) throw new Error('Not authenticated')

  await prisma.communityPost.delete({
    where: { id: postId, userId: session.userId }
  })

  revalidatePath('/dashboard/community')
  return { success: true }
}
