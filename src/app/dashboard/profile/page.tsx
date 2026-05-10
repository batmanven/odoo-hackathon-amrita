import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
    const session = await getSession()
    if (!session?.userId) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            trips: {
                include: {
                    _count: { select: { stops: true } }
                },
                orderBy: { startDate: 'desc' }
            }
        }
    })

    if (!user) redirect('/login')

    return <ProfileClient user={user} />
}
