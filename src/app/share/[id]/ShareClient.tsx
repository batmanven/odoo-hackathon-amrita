/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Copy,
  Check,
  Share2,
  Globe,
  Loader2,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { copyTripAction } from '@/app/actions/share'
import { Caveat } from 'next/font/google'

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function ShareClient({ trip }: { trip: any }) {
  const [copied, setCopied] = useState(false)
  const [isCopying, setIsCopying] = useState(false)

  const totalBudget = trip.budget || 0
  const totalActivities = trip.stops.reduce(
    (sum: number, stop: any) => sum + stop.activities.length, 0
  )
  const totalCost = trip.stops.reduce(
    (sum: number, stop: any) =>
      sum + stop.activities.reduce((a: number, act: any) => a + (act.cost || 0), 0), 0
  )
  const startDate = new Date(trip.startDate)
  const endDate = new Date(trip.endDate)
  const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyTrip = async () => {
    setIsCopying(true)
    try {
      const res = await copyTripAction(trip.id)
      if (res.success) {
        toast.success('Trip copied to your account!')
      }
    } catch {
      toast.error('Sign in to copy this trip')
    } finally {
      setIsCopying(false)
    }
  }

  const handleShareX = () => {
    const text = `Check out this trip: ${trip.title}`
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  const handleShareWhatsApp = () => {
    const text = `Check out this trip itinerary: ${trip.title} - ${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
            Traveloop
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
              <Globe className="w-3.5 h-3.5" />
              Public Trip
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-12">

        <section className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Shared by {trip.user.firstName} {trip.user.lastName}
            </p>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
              {trip.title}
            </h1>
            {trip.description && (
              <p className="text-gray-500 font-medium text-lg max-w-2xl leading-relaxed">
                {trip.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Card className="px-5 py-3 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
                <p className="font-bold text-gray-900 text-sm">{days} days</p>
              </div>
            </Card>
            <Card className="px-5 py-3 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cities</p>
                <p className="font-bold text-gray-900 text-sm">{trip.stops.length} stops</p>
              </div>
            </Card>
            <Card className="px-5 py-3 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Budget</p>
                <p className="font-bold text-gray-900 text-sm">${totalBudget.toLocaleString()}</p>
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleCopyTrip}
              disabled={isCopying}
              className="rounded-xl font-bold cursor-pointer h-12 px-6 bg-gray-900 hover:bg-gray-800"
            >
              {isCopying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy This Trip
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="rounded-xl font-bold cursor-pointer h-12 px-6 border-gray-200 hover:bg-gray-50"
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Share2 className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              variant="outline"
              onClick={handleShareX}
              className="rounded-xl font-bold cursor-pointer h-12 px-6 border-gray-200 hover:bg-gray-50 text-gray-600"
            >
              Share on X
            </Button>
            <Button
              variant="outline"
              onClick={handleShareWhatsApp}
              className="rounded-xl font-bold cursor-pointer h-12 px-6 border-gray-200 hover:bg-gray-50 text-gray-600"
            >
              Share on WhatsApp
            </Button>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Full Itinerary</h2>

          {trip.stops.map((stop: any, index: number) => (
            <Card key={stop.id} className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg">
                    Day {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="text-xl font-black text-gray-900">{stop.city.name}</h3>
                    <span className="text-gray-400 font-bold text-sm">{stop.city.country}</span>
                  </div>
                </div>

                {stop.notes && (
                  <p className="text-gray-500 font-medium text-sm bg-gray-50 p-4 rounded-xl">{stop.notes}</p>
                )}

                {stop.activities.length > 0 ? (
                  <div className="space-y-3">
                    {stop.activities.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-1.5 h-10 bg-primary/30 rounded-full" />
                          <div>
                            <p className="font-bold text-gray-900">{activity.name || 'Unnamed Activity'}</p>
                            {activity.plannedTime && (
                              <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" /> {activity.plannedTime}
                              </p>
                            )}
                          </div>
                        </div>
                        {activity.cost > 0 && (
                          <span className="font-black text-gray-700 text-sm">${activity.cost}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300 font-medium text-sm">No activities planned for this stop.</p>
                )}

                {index < trip.stops.length - 1 && (
                  <div className="flex justify-center pt-2">
                    <ArrowRight className="w-5 h-5 text-gray-200 rotate-90" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </section>

        {trip.stops.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-lg">This trip has no stops yet.</p>
          </div>
        )}

        <section className="flex flex-wrap gap-4 items-center justify-between bg-white p-6 rounded-3xl shadow-sm">
          <div className="space-y-1">
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Trip Summary</p>
            <p className="font-bold text-gray-700">
              {trip.stops.length} cities &middot; {totalActivities} activities &middot; ${totalCost.toLocaleString()} estimated cost
            </p>
          </div>
          <Button
            onClick={handleCopyTrip}
            disabled={isCopying}
            className="rounded-xl font-bold cursor-pointer h-12 px-8 bg-gray-900 hover:bg-gray-800"
          >
            {isCopying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
            Copy to My Trips
          </Button>
        </section>

        <footer className="text-center py-8">
          <p className={`text-sm text-gray-400 font-medium ${caveat.className}`}>
            Powered by <Link href="/" className="text-primary font-bold hover:underline">Traveloop</Link>
          </p>
        </footer>
      </main>
    </div>
  )
}
