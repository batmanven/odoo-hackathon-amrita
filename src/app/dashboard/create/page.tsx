/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createTripAction } from '@/app/actions/trip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import {
  CalendarIcon,
  MapPin,
  Image as ImageIcon,
  Plus,
  Trash2,
  DollarSign,
  StickyNote,
  GripVertical,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'
import { DateRange } from "react-day-picker"
import { Reorder, useDragControls } from 'framer-motion'

interface Activity {
  id: string;
  name: string;
  time: string;
}

interface Section {
  id: string;
  destination: string;
  query: string;
  dateRange: DateRange | undefined;
  budget: string;
  notes: string;
  suggestions: string[];
  isSearching: boolean;
  showSuggestions: boolean;
  activities: Activity[];
}

export default function CreateTripPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [tripTitle, setTripTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [sections, setSections] = useState<Section[]>([
    {
      id: crypto.randomUUID(),
      destination: '',
      query: '',
      dateRange: undefined,
      budget: '',
      notes: '',
      suggestions: [],
      isSearching: false,
      showSuggestions: false,
      activities: [
        { id: crypto.randomUUID(), name: 'Flying', time: '10:00' },
        { id: crypto.randomUUID(), name: 'Shopping', time: '13:00' }
      ]
    }
  ])

  // Photon Search Logic per Section
  useEffect(() => {
    sections.forEach((section) => {
      if (!section.query || section.query.length < 2 || section.query === section.destination) return

      const fetchSuggestions = async () => {
        try {
          const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(section.query)}&limit=5`)
          const data = await res.json()
          const uniqueCities = Array.from(new Set(data.features.map((f: any) => {
            const p = f.properties;
            return `${p.name}${p.state ? `, ${p.state}` : ''}, ${p.country}`;
          }))) as string[]

          updateSection(section.id, { suggestions: uniqueCities, isSearching: false })
        } catch {
          updateSection(section.id, { suggestions: [], isSearching: false })
        }
      }

      updateSection(section.id, { isSearching: true })
      const timer = setTimeout(fetchSuggestions, 300)
      return () => clearTimeout(timer)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map(s => s.query).join(',')])

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const addSection = () => {
    setSections([...sections, {
      id: crypto.randomUUID(),
      destination: '',
      query: '',
      dateRange: undefined,
      budget: '',
      notes: '',
      suggestions: [],
      isSearching: false,
      showSuggestions: false,
      activities: []
    }])
  }

  const removeSection = (id: string) => {
    if (sections.length > 1) {
      setSections(prev => prev.filter(s => s.id !== id))
    }
  }

  const addActivity = (sectionId: string) => {
    const newActivity = { id: crypto.randomUUID(), name: '', time: '12:00' }
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, activities: [...s.activities, newActivity] } : s))
  }

  const updateActivity = (sectionId: string, activityId: string, updates: Partial<Activity>) => {
    setSections(prev => prev.map(s => s.id === sectionId ? {
      ...s,
      activities: s.activities.map(a => a.id === activityId ? { ...a, ...updates } : a)
    } : s))
  }

  const removeActivity = (sectionId: string, activityId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? {
      ...s,
      activities: s.activities.filter(a => a.id !== activityId)
    } : s))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageUrl(reader.result as string)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (sections.some(s => !s.destination || !s.dateRange?.from)) {
      toast.error('Please complete all section details.')
      return
    }

    const formData = new FormData()
    formData.set('title', tripTitle)
    formData.set('imageUrl', imageUrl)
    formData.set('startDate', sections[0].dateRange?.from?.toISOString() || '')
    formData.set('endDate', sections[sections.length - 1].dateRange?.to?.toISOString() || '')
    formData.set('destination', sections[0].destination)

    startTransition(async () => {
      const result = await createTripAction(null, formData)
      if (result.success && result.tripId) {
        toast.success('Trip created! Now add your itinerary sections.')
        router.push(`/dashboard/trips/${result.tripId}`)
      } else {
        toast.error(result.error || 'Something went wrong')
      }
    })
  }

  return (
    <div className="max-w-5xl mx-auto pb-40 px-6 pt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-[#212529] tracking-tight">Design Itinerary</h1>
          <p className="text-gray-500 font-medium italic text-lg">Build your perfect journey step-by-step</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold border-gray-200">Save Draft</Button>
          <Button onClick={handleSubmit} disabled={isPending} className="h-14 px-10 rounded-2xl bg-[#714B67] hover:bg-[#5E3D55] text-white shadow-2xl shadow-[#714B67]/20 font-black text-lg transition-all active:scale-95">
            {isPending ? 'Publishing...' : 'Finalize Trip'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <CardWrapper className="bg-white/50 backdrop-blur-sm border-gray-100 shadow-xl">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Trip Name</label>
                <Input
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  placeholder="e.g. Paris & Swiss Alps Summer 2026"
                  className="h-16 text-2xl font-black rounded-2xl border-none bg-gray-100/50 focus:bg-white focus:ring-2 focus:ring-[#714B67]/10 transition-all px-8"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Itinerary Background</label>
                <div className="relative group h-64 rounded-[40px] overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-[#714B67]/40 transition-all hover:bg-white">
                  {imageUrl ? (
                    <Image src={imageUrl} alt="Cover" fill className="object-cover" />
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto group-hover:bg-[#714B67]/5 transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-[#714B67]/40" />
                      </div>
                      <p className="text-sm font-black text-gray-400">Click or drag cover image</p>
                    </div>
                  )}
                  <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                </div>
              </div>
            </div>
          </CardWrapper>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={section.id} className="relative group">
                <div className="absolute -left-16 top-0 bottom-0 w-px bg-gray-100 hidden md:block">
                  <div className="absolute top-12 left-[-20px] w-12 h-12 rounded-2xl bg-white border-2 border-gray-100 shadow-xl flex items-center justify-center font-black text-[#714B67] text-lg">
                    {index + 1}
                  </div>
                </div>

                <CardWrapper className="relative border-none shadow-2xl hover:shadow-[#714B67]/5 transition-all p-10">
                  <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-gray-900 tracking-tight">Section {index + 1}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Itinerary leg details</p>
                    </div>
                    {sections.length > 1 && (
                      <button onClick={() => removeSection(section.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center cursor-pointer">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-10">

                    <div className="space-y-2">
                      <div className="relative">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <Input
                          value={section.query}
                          onChange={(e) => updateSection(section.id, { query: e.target.value, showSuggestions: true })}
                          placeholder="Search for a city or place..."
                          className="h-16 pl-16 pr-14 text-xl font-black rounded-3xl border-none bg-gray-100/50 focus:bg-white focus:ring-4 focus:ring-[#714B67]/5"
                        />
                        {section.showSuggestions && (section.suggestions.length > 0 || section.isSearching) && (
                          <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 py-4 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {section.suggestions.map((city, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => updateSection(section.id, { destination: city, query: city, showSuggestions: false })}
                                className="w-full text-left px-8 py-5 hover:bg-[#714B67]/5 flex items-center gap-5 transition-colors font-black text-gray-700"
                              >
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                </div>
                                {city}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Travel Dates</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={cn(
                              "w-full h-16 px-8 rounded-3xl border-2 border-gray-50 flex items-center gap-4 text-left transition-all hover:border-[#714B67]/40 focus:border-[#714B67] outline-none",
                              section.dateRange?.from ? "border-[#714B67]/20 bg-[#714B67]/5" : "bg-white"
                            )}>
                              <CalendarIcon className="w-5 h-5 text-gray-400" />
                              <div className="flex-1 overflow-hidden">
                                {section.dateRange?.from ? (
                                  <span className="font-black text-gray-900">
                                    {format(section.dateRange.from, "MMM d")} - {section.dateRange.to ? format(section.dateRange.to, "MMM d") : "..."}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 font-bold">e.g. May 10 - May 14</span>
                                )}
                              </div>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-3xl shadow-2xl border-gray-100 overflow-hidden" align="start">
                            <Calendar
                              mode="range"
                              selected={section.dateRange}
                              onSelect={(range) => updateSection(section.id, { dateRange: range })}
                              numberOfMonths={2}
                              className="rounded-3xl p-4"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Section Budget</label>
                        <div className="relative">
                          <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="number"
                            value={section.budget}
                            onChange={(e) => updateSection(section.id, { budget: e.target.value })}
                            placeholder="Amount in USD"
                            className="h-16 pl-14 rounded-3xl border-2 border-gray-50 focus:border-[#714B67] transition-all font-black"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Planned Activities</label>
                        <button
                          onClick={() => addActivity(section.id)}
                          className="flex items-center gap-2 text-[10px] font-black text-[#714B67] uppercase tracking-widest hover:bg-[#714B67]/5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Activity
                        </button>
                      </div>

                      <Reorder.Group
                        axis="y"
                        values={section.activities}
                        onReorder={(newActivities: Activity[]) => updateSection(section.id, { activities: newActivities })}
                        className="space-y-3"
                      >
                        {section.activities.map((activity) => (
                          <ActivityItem
                            key={activity.id}
                            activity={activity}
                            onUpdate={(updates) => updateActivity(section.id, activity.id, updates)}
                            onDelete={() => removeActivity(section.id, activity.id)}
                          />
                        ))}
                      </Reorder.Group>

                      {section.activities.length === 0 && (
                        <div className="py-8 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                          <p className="text-xs font-bold text-gray-400">No activities planned yet for this section.</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Section Notes</label>
                      <div className="relative">
                        <StickyNote className="absolute left-6 top-6 w-5 h-5 text-gray-400" />
                        <Textarea
                          value={section.notes}
                          onChange={(e) => updateSection(section.id, { notes: e.target.value })}
                          placeholder="Describe your plans for this leg of the trip..."
                          className="min-h-[160px] pl-14 pt-6 rounded-[32px] border-none bg-gray-100/50 focus:bg-white focus:ring-4 focus:ring-[#714B67]/5 transition-all text-base font-bold resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </CardWrapper>
              </div>
            ))}

            <Button onClick={addSection} variant="outline" className="w-full h-24 rounded-[40px] border-4 border-dashed border-gray-100 hover:border-[#714B67]/40 hover:bg-[#714B67]/5 transition-all flex items-center justify-center gap-4 text-gray-300 hover:text-[#714B67] font-black text-xl active:scale-[0.98]">
              <Plus className="w-8 h-8" />
              Add Itinerary Leg
            </Button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            <CardWrapper className="bg-gray-900 border-none text-white overflow-hidden p-8 shadow-2xl relative">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              <h4 className="text-2xl font-black mb-4">Summary</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Legs</span>
                  <span className="text-2xl font-black text-[#FDB833]">{sections.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Planned Budget</span>
                  <span className="text-2xl font-black text-[#10b981]">
                    ${sections.reduce((acc, s) => acc + (Number(s.budget) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardWrapper>

            <CardWrapper className="p-8 border-gray-100">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Planning Progress</h4>
              <div className="space-y-6">
                {sections.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${s.destination ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                    <div className="flex-1">
                      <p className="text-xs font-black text-gray-900 line-clamp-1">{s.destination || `Section ${i + 1}`}</p>
                      <p className="text-[10px] font-bold text-gray-400">{s.dateRange?.from ? 'Dates set' : 'Missing dates'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity, onUpdate, onDelete }: { activity: Activity, onUpdate: (u: Partial<Activity>) => void, onDelete: () => void }) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={activity}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-4 bg-gray-50/80 p-4 rounded-2xl group/item hover:bg-white hover:shadow-xl transition-all"
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab active:cursor-grabbing p-2 text-gray-300 hover:text-[#714B67] transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <Input
          value={activity.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="What activity?"
          className="border-none bg-transparent h-10 px-0 text-base font-black focus-visible:ring-0 placeholder:text-gray-300"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <Clock className="w-4 h-4 text-[#714B67]/40" />
          <input
            type="time"
            value={activity.time}
            onChange={(e) => onUpdate({ time: e.target.value })}
            className="bg-transparent border-none font-black text-sm outline-none text-gray-700"
          />
        </div>
        <button
          onClick={onDelete}
          className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  )
}

function CardWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm", className)}>
      {children}
    </div>
  )
}
