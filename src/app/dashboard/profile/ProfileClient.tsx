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
  Loader2,
  Calendar,
  Compass,
  ArrowRight,
  Trash2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { updateProfileAction, deleteAccountAction } from '@/app/actions/profile'
import { Caveat } from 'next/font/google'

const caveat = Caveat({ subsets: ['latin'] })

export default function ProfileClient({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 pt-8 px-6">

      {/* Premium Profile Header */}
      <section className="relative">
        <div className="absolute inset-0 bg-linear-to-tr from-[#714B67]/5 to-[#4CA5FF]/5 rounded-[40px] blur-3xl -z-10" />
        <Card className="relative bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden p-8 sm:p-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Avatar Section */}
            <div className="relative group/avatar">
              <div className="w-36 h-36 rounded-3xl overflow-hidden shadow-2xl relative ring-4 ring-white">
                {user.avatarBase64 ? (
                  <Image src={user.avatarBase64} alt={user.firstName} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[#FDFCFD] flex items-center justify-center">
                    <User className="w-16 h-16 text-[#714B67]/20" />
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                  onClick={() => toast.info('Click the edit button to update info!')}
                >
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#714B67] rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                <Compass className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-6 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {!isEditing ? (
                  <div className="space-y-2">
                    <h1 className="text-4xl sm:text-5xl font-black text-[#212529] tracking-tight">
                      {user.firstName} {user.lastName}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-3 text-gray-500 font-bold">
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-lg">{user.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">First Name</label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="h-12 bg-gray-50 border-gray-100 rounded-2xl font-bold px-5 focus:ring-[#714B67]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Last Name</label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="h-12 bg-gray-50 border-gray-100 rounded-2xl font-bold px-5"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 bg-gray-50 border-gray-100 rounded-2xl font-bold px-5"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-center md:block">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-white hover:bg-gray-50 text-[#714B67] border-2 border-gray-100 h-14 px-8 rounded-2xl font-black shadow-sm flex items-center gap-2 active:scale-95 transition-all"
                    >
                      <Edit3 className="w-5 h-5" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                        className="rounded-2xl h-14 px-6 font-bold text-gray-400 hover:bg-gray-100 active:scale-95 transition-all"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-14 px-10 rounded-2xl bg-[#714B67] hover:bg-[#5E3D55] text-white font-black shadow-xl shadow-[#714B67]/20 flex items-center gap-2 active:scale-95 transition-all"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 2 Clean Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <StatCard
          label="Total Trips"
          value={user.trips.length}
          icon={<Globe className="w-8 h-8" />}
          color="#714B67"
        />
        <StatCard
          label="Completed"
          value={previousTrips.length}
          icon={<CheckCircle2 className="w-8 h-8" />}
          color="#10b981"
        />
      </section>

      {/* Trips Lists */}
      <div className="space-y-16">
        {/* Preplanned Trips */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-[#212529] tracking-tight">Upcoming Journeys</h2>
            <Link href="/dashboard/activities" className="text-sm font-bold text-[#714B67] hover:underline flex items-center gap-1 group">
              Plan new
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {preplannedTrips.length > 0 ? preplannedTrips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} status="upcoming" formatDate={formatDate} />
            )) : (
              <EmptyState message="No upcoming trips planned." subMessage="Start your next adventure in the Activities tab!" />
            )}
          </div>
        </section>

        {/* Previous Trips */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-[#212529] tracking-tight opacity-50">Past Explorations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {previousTrips.length > 0 ? previousTrips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} status="previous" formatDate={formatDate} />
            )) : (
              <EmptyState message="No trip history yet" subMessage="Your past adventures will appear here." />
            )}
          </div>
        </section>
      </div>

      {/* Danger Zone */}
      <section className="border border-red-100 rounded-[32px] p-8 space-y-4 bg-red-50/30">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-red-600">Danger Zone</h3>
          <p className="text-sm text-gray-500 font-medium">Permanently delete your account and all associated data. This action cannot be undone.</p>
        </div>
        <Button
          variant="outline"
          disabled={isDeleting}
          onClick={async () => {
            const confirmed = window.confirm('Are you sure you want to delete your account? All your trips and data will be permanently removed.')
            if (!confirmed) return
            setIsDeleting(true)
            try {
              await deleteAccountAction()
            } catch {
              toast.error('Failed to delete account.')
              setIsDeleting(false)
            }
          }}
          className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-2xl h-12 px-6 font-bold transition-all cursor-pointer"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
          Delete My Account
        </Button>
      </section>

      <div className="flex justify-center pt-8">
        <p className={`${caveat.className} text-3xl text-gray-400 rotate-2`}>
          Traveloop — built for explorers.
        </p>
      </div>

    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <Card className="p-8 rounded-[32px] border border-gray-100 shadow-sm bg-white hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[100px] z-0 opacity-50 group-hover:bg-[#714B67]/5 transition-colors" />
      <div className="flex items-center gap-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}10`, color: color }}>
          {icon}
        </div>
        <div>
          <p className="text-4xl font-black text-[#212529] leading-none mb-1">{value}</p>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function TripCard({ trip, status, formatDate }: { trip: any, status: 'upcoming' | 'previous', formatDate: any }) {
  return (
    <Card className="group relative bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden flex flex-col h-full">
      <div className="relative aspect-16/10 w-full overflow-hidden">
        <Image
          src={trip.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
          alt={trip.title}
          fill
          className={`object-cover group-hover:scale-110 transition-transform duration-700 ${status === 'previous' ? 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100' : ''}`}
        />
        <div className={`absolute top-4 left-4 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'upcoming' ? 'text-[#714B67]' : 'text-gray-400'} shadow-sm`}>
          {status === 'upcoming' ? 'Upcoming' : 'Completed'}
        </div>
      </div>
      <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
        <div>
          <h4 className="text-xl font-black text-[#212529] leading-tight mb-2 group-hover:text-[#714B67] transition-colors line-clamp-1">{trip.title}</h4>
          <p className="text-sm font-bold text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(trip.startDate)}
          </p>
        </div>
        <Link href={`/dashboard/trips/${trip.id}`} className="block">
          <Button className="w-full bg-[#714B67]/5 hover:bg-[#714B67] text-[#714B67] hover:text-white rounded-2xl font-black h-12 cursor-pointer shadow-none transition-all active:scale-95">
            {status === 'upcoming' ? 'Manage Trip' : 'Review History'}
          </Button>
        </Link>
      </div>
    </Card>
  )
}

function EmptyState({ message, subMessage }: { message: string, subMessage: string }) {
  return (
    <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
        <Globe className="w-8 h-8 text-gray-200" />
      </div>
      <p className="text-xl font-black text-gray-900 mb-2">{message}</p>
      <p className="text-gray-400 font-medium">{subMessage}</p>
    </div>
  )
}
