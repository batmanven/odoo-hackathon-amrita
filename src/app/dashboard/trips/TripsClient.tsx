/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, Plus, Calendar, MapPin, ArrowRight, X, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

function TripSection({ title, trips }: { title: string; trips: any[] }) {
    if (trips.length === 0) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {trips.map((trip) => (
                    <div
                        key={trip.id}
                        className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col md:flex-row min-h-[220px]"
                    >
                        <div className="relative w-full md:w-80 h-48 md:h-auto overflow-hidden">
                            {trip.imageUrl ? (
                                <Image src={trip.imageUrl} alt={trip.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                    <MapPin className="h-12 w-12 text-primary/30" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
                        </div>

                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{trip.title}</h3>
                                        <div className="flex items-center gap-4 text-gray-500 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm">{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4" />
                                                <span className="text-sm">{trip._count.stops} {trip._count.stops === 1 ? 'Destination' : 'Destinations'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-500 line-clamp-2 text-base max-w-2xl leading-relaxed">
                                    {trip.description || "No description provided for this adventure. Start planning your daily activities to make the most of it!"}
                                </p>
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <Button asChild className="rounded-2xl px-6 py-6 font-bold group/btn shadow-md hover:shadow-lg transition-all cursor-pointer">
                                    <Link href={`/dashboard/trips/${trip.id}/view`} className="flex items-center gap-2">
                                        View Itinerary
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default function TripsClient({ initialTrips, initialSearch = '' }: { initialTrips: any[], initialSearch?: string }) {
    const [search, setSearch] = useState(initialSearch)
    const [sortBy, setSortBy] = useState<'date' | 'name'>('date')

    const filteredTrips = useMemo(() => {
        let result = initialTrips.filter(t =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
        )

        if (sortBy === 'name') {
            result = [...result].sort((a, b) => a.title.localeCompare(b.title))
        } else {
            result = [...result].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        }

        return result
    }, [initialTrips, search, sortBy])

    const now = new Date()
    const ongoingTrips = filteredTrips.filter(t => new Date(t.startDate) <= now && new Date(t.endDate) >= now)
    const upcomingTrips = filteredTrips.filter(t => new Date(t.startDate) > now)
    const completedTrips = filteredTrips.filter(t => new Date(t.endDate) < now)

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        My Trips
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Manage and explore all your past and upcoming adventures.
                    </p>
                </div>
                <Link href="/dashboard/create">
                    <Button className="h-14 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 font-bold text-lg cursor-pointer flex items-center gap-2">
                        <Plus className="h-6 w-6" />
                        Plan a new trip
                    </Button>
                </Link>
            </section>

            <section className="flex flex-col md:flex-row gap-4 p-2 bg-gray-50/50 rounded-3xl border border-gray-100 backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search trips by name..."
                        className="pl-12 pr-12 h-14 text-base bg-white border-gray-200 rounded-2xl shadow-xs focus-visible:ring-primary cursor-text"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setSortBy(sortBy === 'date' ? 'name' : 'date')}
                        className="h-14 px-6 rounded-2xl border-gray-200 bg-white shadow-xs hover:bg-gray-50 text-gray-700 font-bold cursor-pointer"
                    >
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        {sortBy === 'date' ? 'Sort by Name' : 'Sort by Date'}
                    </Button>
                    <Button variant="outline" className="h-14 px-6 rounded-2xl border-gray-200 bg-white shadow-xs hover:bg-gray-50 text-gray-700 font-bold cursor-pointer">
                        <SlidersHorizontal className="mr-2 h-4 w-4" /> Filter
                    </Button>
                </div>
            </section>

            {filteredTrips.length === 0 && (
                <section className="bg-white border-2 border-gray-100 border-dashed rounded-[40px] p-20 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-8">
                        <MapPin className="h-10 w-10 text-primary opacity-40" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No trips found</h3>
                    <p className="text-gray-500 mb-10 max-w-md text-lg">
                        {search ? `No trips matching "${search}"` : "You haven't created any trips yet. Start by planning your first destination!"}
                    </p>
                    {!search && (
                        <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-12 py-7 text-xl font-bold shadow-xl hover:shadow-primary/20 transition-all">
                            <Link href="/dashboard/create">Plan Your First Trip</Link>
                        </Button>
                    )}
                </section>
            )}

            <div className="space-y-16">
                <TripSection title="Ongoing" trips={ongoingTrips} />
                <TripSection title="Upcoming" trips={upcomingTrips} />
                <TripSection title="Completed" trips={completedTrips} />
            </div>
        </div>
    )
}
