/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import {
  Plus,
  Trash2,
  MapPin,
  ChevronLeft,
  Save,
  GripVertical,
  DollarSign,
  Clock,
  Check,
  Loader2,
  StickyNote
} from 'lucide-react'
import { Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getItineraryAction, saveItineraryAction } from '@/app/actions/itinerary'
import { Reorder, useDragControls } from 'framer-motion'

interface Activity {
  id: string
  name: string
  time: string
  cost: string
}

interface Stop {
  id: string
  city: string
  dates: string
  budget: string
  description: string
  activities: Activity[]
}

function ActivityItem({
  activity,
  onUpdate,
  onDelete
}: {
  activity: Activity
  onUpdate: (field: keyof Activity, val: string) => void
  onDelete: () => void
}) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={activity}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 bg-gray-50/80 p-4 rounded-2xl group/item hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-[#714B67]/5"
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab active:cursor-grabbing p-2 text-gray-200 hover:text-[#714B67] transition-colors touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <Input
          value={activity.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          placeholder="Activity name"
          className="border-none bg-transparent h-10 px-0 text-base font-bold focus-visible:ring-0 placeholder:text-gray-300"
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
          <Clock className="w-4 h-4 text-[#714B67]/40" />
          <Input
            value={activity.time}
            onChange={(e) => onUpdate('time', e.target.value)}
            placeholder="Time"
            className="bg-transparent border-none font-bold text-xs h-6 w-16 p-0 outline-none text-gray-700 focus-visible:ring-0"
          />
        </div>
        <button
          onClick={onDelete}
          className="w-9 h-9 rounded-xl text-gray-200 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover/item:opacity-100 flex items-center justify-center cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Reorder.Item>
  )
}

function ItineraryStop({
  stop,
  index,
  onUpdate,
  onRemove,
  onAddActivity,
  onUpdateActivity,
  onRemoveActivity,
  onReorderActivities
}: {
  stop: Stop
  index: number
  onUpdate: (field: keyof Stop, value: any) => void
  onRemove: () => void
  onAddActivity: () => void
  onUpdateActivity: (activityId: string, field: keyof Activity, value: string) => void
  onRemoveActivity: (activityId: string) => void
  onReorderActivities: (newActivities: Activity[]) => void
}) {
  const [query, setQuery] = useState(stop.city)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const trimmedQuery = query.trim()
    if (trimmedQuery.length < 2 || stop.city === trimmedQuery) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(trimmedQuery)}&limit=5`)
        if (!res.ok) throw new Error('API request failed')
        const data = await res.json()
        const cities = data.features
          .map((f: any) => {
            const name = f.properties.name
            const city = f.properties.city || f.properties.state
            const country = f.properties.country
            return [name, city, country].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')
          })
          .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)

        setSuggestions(cities)
        setShowSuggestions(true)
      } catch (err) {
        console.error('Photon fetch error:', err)
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 400)
    return () => clearTimeout(timer)
  }, [query, stop.city])

  return (
    <div
      className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gray-100 rounded-full group-hover:bg-[#714B67]/20 transition-colors hidden md:block" />

      <Card className="rounded-[32px] border-none shadow-xl overflow-hidden bg-white hover:shadow-2xl transition-all duration-500">
        <div className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Section {index + 1}</h3>

              <div className="relative" ref={dropdownRef}>
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Which city are you visiting?"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                  className="pl-12 h-14 text-lg bg-gray-50 border-none rounded-2xl focus-visible:ring-[#714B67]/20 font-semibold"
                />
                {showSuggestions && (suggestions.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {isSearching && (
                      <div className="px-4 py-3 text-sm text-gray-400 italic font-medium flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                      </div>
                    )}
                    {suggestions.map((city, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          onUpdate('city', city)
                          setQuery(city)
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-[#714B67]/5 flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-400 group-hover:text-[#714B67]" />
                          <span className="text-gray-700 font-medium">{city}</span>
                        </div>
                        {stop.city === city && <Check className="h-4 w-4 text-[#714B67]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onRemove}
              className="self-end md:self-start w-10 h-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white border border-red-100 transition-all flex items-center justify-center cursor-pointer shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Travel Dates</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="e.g. May 10 - May 14"
                  value={stop.dates}
                  onChange={(e) => onUpdate('dates', e.target.value)}
                  className="pl-12 h-14 bg-gray-50 border-none rounded-2xl focus-visible:ring-[#714B67]/20 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Section Budget</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="number"
                  placeholder="Estimated cost"
                  value={stop.budget}
                  onChange={(e) => onUpdate('budget', e.target.value)}
                  className="pl-12 h-14 bg-gray-50 border-none rounded-2xl focus-visible:ring-[#714B67]/20 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Section Notes</label>
            <div className="relative">
              <StickyNote className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <Textarea
                placeholder="What's the plan for this section?"
                value={stop.description}
                onChange={(e) => onUpdate('description', e.target.value)}
                className="min-h-[100px] pl-12 pt-4 bg-gray-50 border-none rounded-2xl focus-visible:ring-[#714B67]/10 text-gray-700 leading-relaxed font-medium resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Planned Activities</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddActivity}
                className="text-[#714B67] hover:bg-[#714B67]/5 font-bold rounded-xl border-none h-9 px-4 cursor-pointer"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add Activity
              </Button>
            </div>

            <Reorder.Group
              axis="y"
              values={stop.activities}
              onReorder={onReorderActivities}
              className="space-y-3"
            >
              {stop.activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onUpdate={(field, val) => onUpdateActivity(activity.id, field, val)}
                  onDelete={() => onRemoveActivity(activity.id)}
                />
              ))}
            </Reorder.Group>

            {stop.activities.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30 text-gray-400 text-sm font-medium italic">
                No activities added yet. Click &quot;Add Activity&quot; to start planning.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function ItineraryBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string

  const [stops, setStops] = useState<Stop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchItinerary() {
      try {
        const data = await getItineraryAction(tripId)
        if (data && data.length > 0) {
          setStops(data)
        }
      } catch (err) {
        console.error('Failed to fetch itinerary:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchItinerary()
  }, [tripId])

  const addStop = () => {
    const newStop: Stop = {
      id: `new-${Math.random().toString(36).substr(2, 9)}`,
      city: '',
      dates: '',
      budget: '',
      description: '',
      activities: []
    }
    setStops([...stops, newStop])
    toast.success('New section added!')
  }

  const removeStop = (id: string) => {
    setStops(stops.filter(s => s.id !== id))
    toast.error('Section removed')
  }

  const addActivity = (stopId: string) => {
    setStops(stops.map(stop => {
      if (stop.id === stopId) {
        return {
          ...stop,
          activities: [
            ...stop.activities,
            { id: `new-act-${Math.random().toString(36).substr(2, 9)}`, name: '', time: '', cost: '' }
          ]
        }
      }
      return stop
    }))
  }

  const updateStop = (id: string, field: keyof Stop, value: any) => {
    setStops(stops.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const updateActivity = (stopId: string, activityId: string, field: keyof Activity, value: string) => {
    setStops(stops.map(stop => {
      if (stop.id === stopId) {
        return {
          ...stop,
          activities: stop.activities.map(act =>
            act.id === activityId ? { ...act, [field]: value } : act
          )
        }
      }
      return stop
    }))
  }

  const removeActivity = (stopId: string, activityId: string) => {
    setStops(stops.map(stop => {
      if (stop.id === stopId) {
        return {
          ...stop,
          activities: stop.activities.filter(act => act.id !== activityId)
        }
      }
      return stop
    }))
  }

  const handleReorderActivities = (stopId: string, newActivities: Activity[]) => {
    setStops(stops.map(stop => stop.id === stopId ? { ...stop, activities: newActivities } : stop))
  }

  const handleSave = async () => {
    if (stops.length === 0) {
      toast.error('Add at least one section before saving.')
      return
    }

    setIsSaving(true)
    try {
      await saveItineraryAction(tripId, stops)
      toast.success('Itinerary saved successfully!')
      router.refresh()
    } catch (err) {
      toast.error('Failed to save itinerary.')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-[#714B67] animate-spin" />
          <p className="text-gray-500 font-medium">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/trips">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 cursor-pointer">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Build Itinerary</h1>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Trip ID: {tripId}</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-2xl px-8 h-12 font-bold bg-gray-900 hover:bg-gray-800 text-white shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Plan Your Journey</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Break your trip into sections, assign budgets, and drag activities into order.
          </p>
        </div>

        <div className="space-y-8">
          {stops.map((stop, index) => (
            <ItineraryStop
              key={stop.id}
              stop={stop}
              index={index}
              onUpdate={(field, value) => updateStop(stop.id, field, value)}
              onRemove={() => removeStop(stop.id)}
              onAddActivity={() => addActivity(stop.id)}
              onUpdateActivity={(actId, field, value) => updateActivity(stop.id, actId, field, value)}
              onRemoveActivity={(actId) => removeActivity(stop.id, actId)}
              onReorderActivities={(newActivities) => handleReorderActivities(stop.id, newActivities)}
            />
          ))}

          {stops.length === 0 && (
            <div className="text-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-[40px] shadow-sm">
              <div className="bg-[#714B67]/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-10 w-10 text-[#714B67] opacity-40" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Your itinerary is empty</h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">
                Start building your trip by adding your first section below.
              </p>
              <Button
                onClick={addStop}
                className="rounded-2xl font-bold px-8 py-6 bg-[#714B67] hover:bg-[#5E3D55] text-white shadow-xl cursor-pointer"
              >
                Add First Section
              </Button>
            </div>
          )}
        </div>

        {stops.length > 0 && (
          <Button
            onClick={addStop}
            variant="outline"
            className="w-full py-10 rounded-[32px] border-2 border-dashed border-gray-200 bg-white hover:bg-gray-50 hover:border-[#714B67]/50 transition-all text-gray-400 hover:text-[#714B67] group shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Plus className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span className="text-xl font-bold tracking-tight">Add Another Section</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  )
}
