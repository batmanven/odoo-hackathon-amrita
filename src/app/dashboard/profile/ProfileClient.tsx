/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  User,
  Mail,
  Camera,
  Globe,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Loader2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { updateProfileAction } from '@/app/actions/profile'

export default function ProfileClient({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  })

  const now = new Date()
  const preplannedTrips = user.trips.filter((t: any) => new Date(t.startDate) > now)
  const previousTrips = user.trips.filter((t: any) => new Date(t.endDate) < now)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await updateProfileAction(formData)
      if (res.success) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      } else {
        toast.error(res.error || 'Failed to update profile')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (date: any) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 pt-2 px-6">

      <section className="relative">
        <Card className="relative bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group/avatar">
              <div className="w-28 h-28 rounded-full border-4 border-slate-50 overflow-hidden shadow-lg relative">
                {user.avatarBase64 ? (
                  <Image src={user.avatarBase64} alt={user.firstName} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex items-center justify-between">
                {!isEditing ? (
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                      {user.firstName} {user.lastName}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 font-bold text-sm">
                      <Mail className="w-4 h-4 text-primary/40" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 mr-4 animate-in fade-in slide-in-from-top-2">
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="First Name"
                      className="h-10 bg-gray-50 border-none rounded-xl font-bold text-sm"
                    />
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Last Name"
                      className="h-10 bg-gray-50 border-none rounded-xl font-bold text-sm"
                    />
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email"
                      className="md:col-span-2 h-10 bg-gray-50 border-none rounded-xl font-bold text-sm"
                    />
                  </div>
                )}

                <div className="shrink-0">
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="rounded-full h-10 w-10 hover:bg-primary/10 text-primary cursor-pointer"
                    >
                      <Edit3 className="w-5 h-5" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                        className="rounded-full h-10 w-10 hover:bg-gray-100 text-gray-400 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90 text-white cursor-pointer shadow-md"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Trips', value: user.trips.length, icon: Globe, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Completed', value: previousTrips.length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-all flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none mb-1">{stat.value}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          </Card>
        ))}
      </section>

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Preplanned Trips</h2>
            <Link href="/dashboard/trips" className="text-xs font-bold text-primary hover:underline">See all trips</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {preplannedTrips.length > 0 ? preplannedTrips.map((trip: any) => (
              <Card key={trip.id} className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image src={trip.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'} alt={trip.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                    Upcoming
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-lg font-black text-gray-900 leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">{trip.title}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formatDate(trip.startDate)}</p>
                  </div>
                  <Link href={`/dashboard/trips/${trip.id}`} className="block">
                    <Button size="sm" className="w-full rounded-xl font-bold h-10 cursor-pointer shadow-sm">
                      View Itinerary
                    </Button>
                  </Link>
                </div>
              </Card>
            )) : (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold italic">No upcoming trips planned.</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Previous Trips</h2>
            <Link href="/dashboard/trips" className="text-xs font-bold text-gray-400 hover:underline">View history</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousTrips.length > 0 ? previousTrips.map((trip: any) => (
              <Card key={trip.id} className="group relative bg-slate-50/50 rounded-3xl border border-transparent hover:border-gray-200 hover:bg-white shadow-xs hover:shadow-lg transition-all duration-500 overflow-hidden flex flex-col h-full opacity-80 hover:opacity-100">
                <div className="relative aspect-video w-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                  <Image src={trip.imageUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80'} alt={trip.title} fill className="object-cover" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-700 leading-tight mb-1 group-hover:text-gray-900 transition-colors line-clamp-1">{trip.title}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ended {formatDate(trip.endDate)}</p>
                  </div>
                  <Link href={`/dashboard/trips/${trip.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full rounded-xl font-bold h-10 cursor-pointer border-gray-200 hover:bg-gray-100 shadow-xs">
                      Review
                    </Button>
                  </Link>
                </div>
              </Card>
            )) : (
              <div className="col-span-full py-12 text-center bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100">
                <p className="text-gray-300 font-bold uppercase tracking-[0.2em] text-sm">No trip history yet</p>
              </div>
            )}
          </div>
        </section>
      </div>

    </div>
  )
}
