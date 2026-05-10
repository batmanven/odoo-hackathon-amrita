/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Search,
  SlidersHorizontal,
  Clock,
  DollarSign,
  Plus,
  Loader2,
  X,
  Mountain,
  Utensils,
  Landmark,
  Waves,
  Music,
  ShoppingBag,
  Camera,
  Heart,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { addActivityToStopAction } from '@/app/actions/activities'

const CATEGORIES = [
  { key: 'all', label: 'All', icon: Search },
  { key: 'adventure', label: 'Adventure', icon: Mountain },
  { key: 'food', label: 'Food & Dining', icon: Utensils },
  { key: 'culture', label: 'Culture', icon: Landmark },
  { key: 'water', label: 'Water Sports', icon: Waves },
  { key: 'nightlife', label: 'Nightlife', icon: Music },
  { key: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { key: 'photography', label: 'Photography', icon: Camera },
  { key: 'wellness', label: 'Wellness', icon: Heart },
]

const SAMPLE_ACTIVITIES = [
  { name: 'Paragliding over the Valley', category: 'adventure', cost: 120, duration: '2-3 hrs', description: 'Soar over breathtaking landscapes with a certified tandem pilot. Includes safety briefing and GoPro footage.', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80' },
  { name: 'Street Food Walking Tour', category: 'food', cost: 45, duration: '3 hrs', description: 'Taste authentic local cuisine with a passionate food guide. Visit hidden gems and legendary street vendors.', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
  { name: 'Ancient Temple Guided Tour', category: 'culture', cost: 30, duration: '2 hrs', description: 'Explore centuries-old temples with an expert historian. Learn about the architecture and spiritual significance.', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80' },
  { name: 'Scuba Diving Experience', category: 'water', cost: 150, duration: '4 hrs', description: 'Discover vibrant coral reefs and marine life with certified PADI instructors. Equipment and training included.', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80' },
  { name: 'Rooftop Jazz Night', category: 'nightlife', cost: 60, duration: '4 hrs', description: 'Enjoy live jazz performances at a stunning rooftop venue. Includes two craft cocktails and gourmet appetizers.', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80' },
  { name: 'Local Artisan Market Tour', category: 'shopping', cost: 15, duration: '2 hrs', description: 'Browse handcrafted goods from local artisans. Find unique souvenirs and support the local community.', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=400&q=80' },
  { name: 'Golden Hour Photo Walk', category: 'photography', cost: 55, duration: '2 hrs', description: 'Capture stunning shots during the magic hour with a professional photographer guiding your composition.', image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Traditional Spa Retreat', category: 'wellness', cost: 80, duration: '3 hrs', description: 'Rejuvenate with traditional healing treatments including massage, herbal bath, and meditation session.', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80' },
  { name: 'Mountain Bike Trail Ride', category: 'adventure', cost: 75, duration: '3 hrs', description: 'Tackle scenic mountain trails with high-quality rental bikes. Routes available for all skill levels.', image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?auto=format&fit=crop&w=400&q=80' },
  { name: 'Cooking Class with a Chef', category: 'food', cost: 90, duration: '4 hrs', description: 'Learn to prepare five signature dishes with a local master chef. Take home the recipes and your creations.', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Museum & Gallery Pass', category: 'culture', cost: 25, duration: '5 hrs', description: 'Full-day access to the top museums and contemporary art galleries. Audio guide included.', image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=400&q=80' },
  { name: 'Sunset Kayaking', category: 'water', cost: 65, duration: '2 hrs', description: 'Paddle through calm waters as the sun sets. Includes equipment rental and a certified guide.', image: 'https://images.unsplash.com/photo-1472745942893-4b9f730c7668?auto=format&fit=crop&w=400&q=80' },
]

const SORT_OPTIONS = ['Recommended', 'Price: Low', 'Price: High', 'Duration']

export default function ActivitiesClient({ trips }: { trips: any[] }) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('Recommended')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [addingActivity, setAddingActivity] = useState<string | null>(null)
  const [pickerFor, setPickerFor] = useState<string | null>(null)
  const [selectedStop, setSelectedStop] = useState<string>('')
  const [addedActivities, setAddedActivities] = useState<Set<string>>(new Set())

  const allStops = trips.flatMap(t =>
    t.stops.map((s: any) => ({
      id: s.id,
      label: `${s.city.name} - ${t.title}`
    }))
  )

  let filtered = SAMPLE_ACTIVITIES.filter(a => {
    const matchesQuery = a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.description.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory
    return matchesQuery && matchesCategory
  })

  if (sortBy === 'Price: Low') filtered = [...filtered].sort((a, b) => a.cost - b.cost)
  if (sortBy === 'Price: High') filtered = [...filtered].sort((a, b) => b.cost - a.cost)

  const handleAdd = async (activity: typeof SAMPLE_ACTIVITIES[0], stopId: string) => {
    setAddingActivity(activity.name)
    try {
      const res = await addActivityToStopAction({
        stopId,
        name: activity.name,
        cost: activity.cost,
        plannedTime: activity.duration,
        category: activity.category
      })
      if (res.success) {
        toast.success(`${activity.name} added to your itinerary`)
        setAddedActivities(prev => new Set(prev).add(activity.name))
        setPickerFor(null)
      }
    } catch {
      toast.error('Failed to add activity')
    } finally {
      setAddingActivity(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-2 px-4">

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Activity Search</h1>
        <p className="text-gray-500 font-medium text-lg">Browse experiences and add them to your trip stops</p>
      </div>

      <section className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paragliding, Food Tour, Museum..."
            className="pl-14 pr-12 h-14 text-base bg-white border-none rounded-2xl shadow-sm focus-visible:ring-primary font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="h-14 px-6 rounded-2xl border-none bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-bold cursor-pointer"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" /> {sortBy}
            </Button>
            {showSortMenu && (
              <Card className="absolute top-16 right-0 z-50 rounded-2xl border-none shadow-2xl p-2 min-w-[180px]">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setSortBy(opt); setShowSortMenu(false) }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${sortBy === opt ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {opt}
                  </button>
                ))}
              </Card>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <Button
            key={cat.key}
            variant={selectedCategory === cat.key ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat.key)}
            className={`rounded-xl font-bold cursor-pointer h-10 px-4 text-sm ${selectedCategory === cat.key
              ? 'bg-gray-900 text-white shadow-lg'
              : 'border-none bg-white shadow-sm hover:bg-gray-50 text-gray-600'
              }`}
          >
            <cat.icon className="w-4 h-4 mr-1.5" />
            {cat.label}
          </Button>
        ))}
      </section>

      <section className="space-y-2">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">
          {filtered.length} Results
        </p>

        <div className="space-y-4">
          {filtered.map((activity) => (
            <Card
              key={activity.name}
              className="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white group"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-gray-700 shadow-sm">
                      {CATEGORIES.find(c => c.key === activity.category)?.label || activity.category}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                      {activity.name}
                    </h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-gray-400 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        {activity.duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 font-bold text-xs">
                        <DollarSign className="w-3.5 h-3.5" />
                        ${activity.cost}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end">
                    {addedActivities.has(activity.name) ? (
                      <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                        <Check className="w-4 h-4" />
                        Added to itinerary
                      </div>
                    ) : pickerFor === activity.name ? (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                        <select
                          value={selectedStop}
                          onChange={(e) => setSelectedStop(e.target.value)}
                          className="h-10 px-3 rounded-xl bg-gray-50 border-none text-sm font-bold text-gray-700 cursor-pointer max-w-[220px]"
                        >
                          <option value="">Select a stop</option>
                          {allStops.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          onClick={() => handleAdd(activity, selectedStop)}
                          disabled={addingActivity === activity.name || !selectedStop}
                          className="rounded-xl font-bold cursor-pointer h-10 px-5"
                        >
                          {addingActivity === activity.name ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                        </Button>
                        <button onClick={() => setPickerFor(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (allStops.length === 0) {
                            toast.error('Add a city stop to a trip first')
                            return
                          }
                          setPickerFor(activity.name)
                        }}
                        className="rounded-xl font-bold cursor-pointer h-10 px-5 border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-all"
                      >
                        <Plus className="w-4 h-4 mr-1.5" /> Add to Trip
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-lg">No activities match your search.</p>
              <p className="text-gray-300 font-medium text-sm mt-1">Try a different keyword or category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
