import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, Plus, Wallet, Map, Compass } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) redirect('/login')

  const trips = await prisma.trip.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' }
  })

  const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0)

  const regions = [
    { name: "Paris, France", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80" },
    { name: "Tokyo, Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80" },
    { name: "Rome, Italy", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80" },
    { name: "Bali, Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" }
  ]

  return (
    <div className="space-y-10 relative pb-20">

      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Ready for your next adventure?
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center gap-5 shadow-sm">
          <div className="bg-primary/10 p-3 rounded-full">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Planned Budget</p>
            <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/trips" className="h-auto">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center justify-center gap-3 rounded-2xl border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm cursor-pointer group">
            <Map className="h-6 w-6 text-gray-500 group-hover:text-primary transition-colors" />
            <span className="font-semibold text-gray-700 group-hover:text-primary transition-colors">My Trips</span>
          </Button>
        </Link>
        <Link href="/dashboard/explore" className="h-auto">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center justify-center gap-3 rounded-2xl border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm cursor-pointer group">
            <Compass className="h-6 w-6 text-gray-500 group-hover:text-primary transition-colors" />
            <span className="font-semibold text-gray-700 group-hover:text-primary transition-colors">Discover Places</span>
          </Button>
        </Link>
        <Link href="/dashboard/budget" className="h-auto">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center justify-center gap-3 rounded-2xl border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm cursor-pointer group">
            <Wallet className="h-6 w-6 text-gray-500 group-hover:text-primary transition-colors" />
            <span className="font-semibold text-gray-700 group-hover:text-primary transition-colors">Track Expenses</span>
          </Button>
        </Link>
      </section>

      <section>
        <div className="relative h-72 md:h-96 w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100 group">
          <Image
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
            alt="Travel Banner"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-center p-8 md:p-16">
            <div className="max-w-xl">
              <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold tracking-wider mb-4 uppercase">
                Explore the world
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-xl leading-tight mb-4">
                Discover Your <br className="hidden md:block" /> Next Journey
              </h1>
              <p className="text-gray-100 text-lg md:text-xl font-medium drop-shadow-md max-w-md">
                Plan, organize, and share your multi-city itineraries effortlessly with Traveloop.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search destinations, trips..."
            className="pl-12 h-14 text-base bg-white border-gray-200 rounded-xl shadow-sm focus-visible:ring-primary cursor-text"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="h-14 px-6 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-medium cursor-pointer">
            Group by
          </Button>
          <Button variant="outline" className="h-14 px-6 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-medium cursor-pointer">
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" className="h-14 px-6 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-medium cursor-pointer">
            Sort by...
          </Button>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Top Regional Selections</h2>
          <div className="h-px bg-gray-200 flex-1 mt-1"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {regions.map((region, i) => (
            <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-gray-100">
              <Image src={region.image} alt={region.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-5 left-5 right-5 text-white font-semibold text-lg tracking-wide">
                {region.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link href="/dashboard/create">
        <Button
          className="fixed bottom-8 right-8 h-16 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gray-900 hover:bg-gray-800 text-white text-lg font-bold border border-gray-700 z-50 cursor-pointer"
        >
          <Plus className="mr-2 h-6 w-6 stroke-3" />
          Plan a trip
        </Button>
      </Link>

    </div>
  )
}
