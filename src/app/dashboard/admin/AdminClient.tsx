/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Search,
  Users,
  MapPin,
  Ticket,
  X,
  Trash2,
  Loader2,
  BarChart3
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts'
import { toast } from 'sonner'

const TABS = ['Manage Users', 'Popular Cities', 'Popular Activities', 'User Trends and Analytics']

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6']

export default function AdminClient({
  users,
  trips,
  cities,
  activities,
  monthlyTrips
}: {
  users: any[]
  trips: any[]
  cities: any[]
  activities: any[]
  monthlyTrips: Record<string, number>
}) {
  const [activeTab, setActiveTab] = useState('Manage Users')
  const [query, setQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const totalUsers = users.length
  const totalTrips = trips.length
  const totalCities = cities.length
  const totalActivities = activities.length

  const popularCities = useMemo(() => {
    return [...cities]
      .sort((a: any, b: any) => b._count.stops - a._count.stops)
      .slice(0, 10)
  }, [cities])

  const popularActivitiesData = useMemo(() => {
    const counts: Record<string, number> = {}
    activities.forEach((a: any) => {
      const name = a.name || 'Unnamed'
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))
  }, [activities])

  const cityPieData = useMemo(() => {
    return popularCities.slice(0, 6).map((c: any) => ({
      name: c.name,
      value: c._count.stops
    }))
  }, [popularCities])

  const trendData = useMemo(() => {
    return Object.entries(monthlyTrips).map(([month, count]) => ({
      month,
      trips: count
    }))
  }, [monthlyTrips])

  const filteredUsers = users.filter((u: any) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(query.toLowerCase())
  )

  const handleDeleteUser = async (userId: string) => {
    setDeletingId(userId)
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        body: JSON.stringify({ userId }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        toast.success('User deleted')
        window.location.reload()
      }
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-2 px-4">

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 font-medium text-lg">Monitor platform usage, trends, and manage users</p>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl border-none shadow-sm bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50"><Users className="w-5 h-5 text-indigo-600" /></div>
            <div>
              <p className="text-2xl font-black text-gray-900">{totalUsers}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Users</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 rounded-2xl border-none shadow-sm bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50"><BarChart3 className="w-5 h-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-black text-gray-900">{totalTrips}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trips</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 rounded-2xl border-none shadow-sm bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50"><MapPin className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-black text-gray-900">{totalCities}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cities</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 rounded-2xl border-none shadow-sm bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50"><Ticket className="w-5 h-5 text-rose-600" /></div>
            <div>
              <p className="text-2xl font-black text-gray-900">{totalActivities}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activities</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="flex flex-wrap gap-2">
        {TABS.map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl font-bold cursor-pointer h-10 px-5 text-sm ${activeTab === tab
              ? 'bg-gray-900 text-white shadow-lg'
              : 'border-none bg-white shadow-sm hover:bg-gray-50 text-gray-600'
              }`}
          >
            {tab}
          </Button>
        ))}
      </section>

      {activeTab === 'Manage Users' && (
        <section className="space-y-4">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-14 h-12 bg-white border-none rounded-2xl shadow-sm font-medium"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredUsers.map((user: any) => (
              <Card key={user.id} className="p-5 rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-gray-500">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm">{user.firstName} {user.lastName}</p>
                      {user.role === 'admin' && (
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Admin</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-black text-gray-900">{user._count.trips}</p>
                      <p className="text-[10px] font-bold text-gray-400">Trips</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-gray-900">{user._count.posts}</p>
                      <p className="text-[10px] font-bold text-gray-400">Posts</p>
                    </div>
                    <div className="text-center hidden md:block">
                      <p className="font-bold text-gray-600 text-xs">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400">Joined</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deletingId === user.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 cursor-pointer p-2 rounded-lg hover:bg-red-50 shrink-0"
                  >
                    {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'Popular Cities' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
              <h3 className="font-black text-gray-900 mb-4">Top Cities by Visits</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularCities.map((c: any) => ({ name: c.name, visits: c._count.stops }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
              <h3 className="font-black text-gray-900 mb-4">City Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={cityPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name }) => name}>
                    {cityPieData.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="space-y-3">
            {popularCities.map((city: any, i: number) => (
              <Card key={city.id} className="p-4 rounded-2xl border-none shadow-sm bg-white flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <span className="text-xs font-black text-indigo-600">#{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{city.name}</p>
                  <p className="text-xs font-bold text-gray-400">{city.country}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-gray-100 rounded-full w-24 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(city._count.stops / Math.max(1, popularCities[0]?._count.stops || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="font-black text-gray-700 text-sm min-w-[30px] text-right">{city._count.stops}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'Popular Activities' && (
        <section className="space-y-6">
          <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
            <h3 className="font-black text-gray-900 mb-4">Most Popular Activities</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={popularActivitiesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 11, fontWeight: 700 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="space-y-3">
            {popularActivitiesData.map((act: any, i: number) => (
              <Card key={act.name} className="p-4 rounded-2xl border-none shadow-sm bg-white flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <span className="text-xs font-black text-emerald-600">#{i + 1}</span>
                </div>
                <p className="font-bold text-gray-900 text-sm flex-1">{act.name}</p>
                <span className="font-black text-gray-700 text-sm">{act.count} times</span>
              </Card>
            ))}
            {popularActivitiesData.length === 0 && (
              <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold">No activity data yet.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'User Trends and Analytics' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 rounded-2xl border-none shadow-sm bg-white">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Trips/User</p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                {totalUsers > 0 ? (totalTrips / totalUsers).toFixed(1) : '0'}
              </p>
            </Card>
            <Card className="p-5 rounded-2xl border-none shadow-sm bg-white">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Stops/Trip</p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                {totalTrips > 0 ? (trips.reduce((s: number, t: any) => s + t.stops.length, 0) / totalTrips).toFixed(1) : '0'}
              </p>
            </Card>
            <Card className="p-5 rounded-2xl border-none shadow-sm bg-white">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Budget Planned</p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                ${trips.reduce((s: number, t: any) => s + (t.budget || 0), 0).toLocaleString()}
              </p>
            </Card>
          </div>

          <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
            <h3 className="font-black text-gray-900 mb-4">Trips Created Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="trips" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 rounded-2xl border-none shadow-sm bg-white">
            <h3 className="font-black text-gray-900 mb-4">User Engagement</h3>
            <div className="space-y-4">
              {users.slice(0, 8).map((user: any) => (
                <div key={user.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-[10px] font-black text-gray-500">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  </div>
                  <p className="font-bold text-gray-700 text-sm flex-1 min-w-0 truncate">{user.firstName} {user.lastName}</p>
                  <div className="flex items-center gap-2 w-48">
                    <div className="h-2 bg-gray-100 rounded-full flex-1 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, (user._count.trips / Math.max(1, ...users.map((u: any) => u._count.trips))) * 100)}%` }}
                      />
                    </div>
                    <span className="font-black text-gray-700 text-xs min-w-[24px] text-right">{user._count.trips}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  )
}
