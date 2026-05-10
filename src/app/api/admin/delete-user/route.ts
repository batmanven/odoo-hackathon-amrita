import { prisma } from '@/lib/prisma'
import { getSession } from '@/utils/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.userId }
  })

  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await request.json()

  if (userId === session.userId) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
  }

  await prisma.user.delete({
    where: { id: userId }
  })

  return NextResponse.json({ success: true })
}
