import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CommunityClient from './CommunityClient'


export default async function CommunityPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const posts = await prisma.communityPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  })

  return <CommunityClient posts={posts} currentUserId={session.userId} />
}
