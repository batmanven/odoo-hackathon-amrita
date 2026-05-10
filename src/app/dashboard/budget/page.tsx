import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BudgetClient from './BudgetClient'

export default async function BudgetPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const trips = await prisma.trip.findMany({
    where: { userId: session.userId },
    orderBy: { startDate: 'desc' },
    include: {
      stops: {
        orderBy: { order: 'asc' },
        include: {
          city: true,
          activities: {
            orderBy: { order: 'asc' }
          }
        }
      },
      expenses: {
        orderBy: { date: 'desc' }
      }
    }
  })

  return <BudgetClient trips={trips} />
}
