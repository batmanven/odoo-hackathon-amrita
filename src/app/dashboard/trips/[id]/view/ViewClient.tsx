/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
    ChevronLeft,
    Search,
    Calendar,
    MapPin,
    Clock,
    Wallet,
    ArrowRight,
    X,
    ArrowUpDown,
    Globe,
    Lock,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { toggleTripPublicAction } from '@/app/actions/trip'
import { toast } from 'sonner'

export default function ViewClient({ trip }: { trip: any }) {
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<'default' | 'cost' | 'name'>('default')
    const [isPublic, setIsPublic] = useState(trip.isPublic)
    const [isToggling, setIsToggling] = useState(false)

    const handleTogglePublic = async (checked: boolean) => {
        setIsToggling(true)
        try {
            const res = await toggleTripPublicAction(trip.id, checked)
            if (res.success) {
                setIsPublic(checked)
                toast.success(checked ? 'Trip is now public!' : 'Trip is now private.')
            } else {
                toast.error(res.error || 'Failed to update visibility.')
            }
        } catch (err) {
            console.error(err)
            toast.error('An error occurred.')
        } finally {
            setIsToggling(false)
        }
    }

    const formatDate = (date: Date | string) => {
        return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date))
    }

    const filteredStops = useMemo(() => {
        let result = trip.stops.map((stop: any) => ({
            ...stop,
            activities: stop.activities.filter((act: any) =>
                (act.name || '').toLowerCase().includes(search.toLowerCase())
            )
        })).filter((stop: any) =>
            stop.city.name.toLowerCase().includes(search.toLowerCase()) || stop.activities.length > 0
        )

        if (sortBy === 'cost') {
            result = [...result].sort((a, b) => (b.budget || 0) - (a.budget || 0))
        } else if (sortBy === 'name') {
            result = [...result].sort((a, b) => a.city.name.localeCompare(b.city.name))
        }

        return result
    }, [trip.stops, search, sortBy])

    const totalBudget = trip.stops.reduce((sum: number, stop: any) => sum + (stop.budget || 0), 0)
    const actualExpenses = trip.stops.reduce((sum: number, stop: any) =>
        sum + stop.activities.reduce((aSum: number, act: any) => aSum + (act.cost || 0), 0), 0
    )

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/trips">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 cursor-pointer">
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{trip.title}</h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Itinerary Overview</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                            {isToggling ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : isPublic ? (
                                <Globe className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <Lock className="w-4 h-4 text-amber-500" />
                            )}
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 min-w-[45px]">
                                {isPublic ? 'Public' : 'Private'}
                            </span>
                            <Switch
                                checked={isPublic}
                                className='cursor-pointer'
                                onCheckedChange={handleTogglePublic}
                                disabled={isToggling}
                            />
                        </div>
                        <Link href={`/share/${trip.id}`} target="_blank">
                            <Button variant="outline" className="rounded-2xl px-6 font-bold border-gray-200 hover:bg-gray-50 text-gray-600 cursor-pointer">
                                Share
                            </Button>
                        </Link>
                        <Link href={`/dashboard/trips/${trip.id}`}>
                            <Button className="rounded-2xl px-6 font-bold bg-gray-900 hover:bg-gray-800 text-white shadow-lg cursor-pointer">
                                Edit Plan
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 mt-10 space-y-12">
                <section className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search activities or cities..."
                            className="pl-12 h-14 text-base bg-white border-none rounded-2xl shadow-sm focus-visible:ring-primary cursor-text font-medium"
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
                            onClick={() => setSortBy(sortBy === 'cost' ? 'default' : 'cost')}
                            className={`h-14 px-6 rounded-2xl border-none shadow-sm font-bold transition-all ${sortBy === 'cost' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <ArrowUpDown className="mr-2 h-4 w-4" /> Sort by Budget
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setSortBy(sortBy === 'name' ? 'default' : 'name')}
                            className={`h-14 px-6 rounded-2xl border-none shadow-sm font-bold transition-all ${sortBy === 'name' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <ArrowUpDown className="mr-2 h-4 w-4" /> Sort by Name
                        </Button>
                    </div>
                </section>

                <div className="text-center space-y-4">
                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Itinerary for {trip.title}</h2>
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary font-bold text-sm">
                            <Calendar className="w-4 h-4" />
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-600 font-bold text-sm">
                            <Wallet className="w-4 h-4" />
                            Budget: ${totalBudget.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="space-y-16 mt-16">
                    <div className="grid grid-cols-12 gap-8 px-4">
                        <div className="col-span-8">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-widest text-center">Physical Activity</h3>
                        </div>
                        <div className="col-span-4 text-right">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Expense</h3>
                        </div>
                    </div>

                    <div className="space-y-24 relative">
                        <div className="absolute left-13 top-10 bottom-10 w-1 bg-linear-to-b from-primary/20 via-primary/10 to-transparent rounded-full hidden md:block"></div>

                        {filteredStops.length > 0 ? filteredStops.map((stop: any, index: number) => (
                            <div key={stop.id} className="relative group animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 150}ms` }}>
                                <div className="absolute -left-4 md:-left-12 top-0 z-10">
                                    <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black shadow-2xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                        Day {index + 1}
                                    </div>
                                </div>

                                <div className="space-y-8 pl-12 md:pl-20">
                                    <div className="flex items-center gap-4 group/city">
                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover/city:scale-110 transition-transform">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-3xl font-black text-gray-900 tracking-tight">{stop.city.name}</h4>
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">{stop.city.country}</span>
                                    </div>

                                    <div className="space-y-6">
                                        {stop.activities.map((activity: any, actIndex: number) => (
                                            <div key={activity.id} className="grid grid-cols-12 gap-6 items-center">
                                                <div className="col-span-8">
                                                    <Card className="p-6 rounded-[28px] border-none shadow-sm bg-white hover:shadow-xl transition-all duration-500 group/item border-l-4 border-l-transparent hover:border-l-primary relative overflow-hidden">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="space-y-1 flex-1">
                                                                <h5 className="text-xl font-bold text-gray-800">{activity.name}</h5>
                                                                <div className="flex items-center gap-3 text-gray-400 font-bold text-xs uppercase tracking-widest">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    {activity.plannedTime}
                                                                </div>
                                                            </div>
                                                            <ArrowRight className="w-5 h-5 text-gray-100 group-hover/item:text-primary transition-colors" />
                                                        </div>
                                                    </Card>
                                                </div>
                                                <div className="col-span-4">
                                                    <Card className="p-6 rounded-[28px] border-none shadow-sm bg-white/50 group-hover:bg-white transition-colors text-right">
                                                        <p className="text-2xl font-black text-gray-900 leading-none mb-1">
                                                            ${activity.cost?.toLocaleString() || '0'}
                                                        </p>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cost</p>
                                                    </Card>
                                                </div>
                                                {actIndex < stop.activities.length - 1 && (
                                                    <div className="col-span-8 flex justify-center py-2">
                                                        <div className="h-8 w-px bg-gray-200"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {stop.activities.length === 0 && (
                                            <div className="p-8 text-center bg-gray-50/50 rounded-[28px] border-2 border-dashed border-gray-100 text-gray-400 font-bold italic">
                                                {search ? "No activities match your search." : "No activities planned for this stop yet."}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                                <p className="text-xl font-black text-gray-900">No results found</p>
                                <p className="text-gray-400 font-medium">Try clearing your search or filters.</p>
                            </div>
                        )}
                    </div>
                </div>

                <section className="pt-20 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Adventure Summary</h3>
                        <p className="text-gray-500 font-medium">Ready for your trip to {trip.title}?</p>
                    </div>
                    <div className="flex gap-4">
                        <Card className="p-6 rounded-3xl border-none shadow-xl bg-gray-900 text-white min-w-[200px]">
                            <p className="text-3xl font-black">${actualExpenses.toLocaleString()}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Actual Expenses</p>
                        </Card>
                        <Card className="p-6 rounded-3xl border-none shadow-xl bg-white min-w-[200px]">
                            <p className="text-3xl font-black text-gray-900">${(totalBudget - actualExpenses).toLocaleString()}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Remaining Budget</p>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
    )
}
