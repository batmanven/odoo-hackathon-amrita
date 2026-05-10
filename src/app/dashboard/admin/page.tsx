import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId }
  })

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3">Access Denied</h2>
        <p className="text-gray-500 font-medium text-lg mb-8 max-w-md mx-auto">You are not authorized to view this page. Only administrators can access the Admin Dashboard.</p>
        <a href="/dashboard" className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors">
          Back to Dashboard
        </a>
      </div>
    )
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { trips: true, posts: true }
      }
    }
  })

  const trips = await prisma.trip.findMany({
    include: {
      user: { select: { firstName: true, lastName: true } },
      stops: {
        include: {
          city: true,
          activities: true
        }
      }
    }
  })

  const cities = await prisma.city.findMany({
    include: {
      _count: { select: { stops: true } }
    }
  })

  const activities = await prisma.stopActivity.findMany({
    where: { name: { not: null } },
    select: { name: true, cost: true }
  })

  const monthlyTrips: Record<string, number> = {}
  trips.forEach(t => {
    const key = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    monthlyTrips[key] = (monthlyTrips[key] || 0) + 1
  })

  return (
    <AdminClient
      users={users}
      trips={trips}
      cities={cities}
      activities={activities}
      monthlyTrips={monthlyTrips}
    />
  )
}
