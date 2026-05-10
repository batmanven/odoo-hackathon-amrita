'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createTripAction } from '@/app/actions/trip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, MapPin, Image as ImageIcon, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'

interface PhotonFeature {
  properties: {
    name: string;
    city?: string;
    country: string;
    state?: string;
  };
}

export default function CreateTripPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [destination, setDestination] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Photon Autocomplete State
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Photon Search Logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmedQuery = query.trim()
      if (trimmedQuery.length < 2 || destination === trimmedQuery) {
        setSuggestions([])
        return
      }

      setIsSearching(true)
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(trimmedQuery)}&limit=5`)
        if (!res.ok) throw new Error('API request failed')
        const data = await res.json()
        
        if (!data || !data.features) {
          setSuggestions([])
          return
        }

        const uniqueCities = Array.from(new Set(data.features.map((f: PhotonFeature) => {
          const p = f.properties;
          return `${p.name}${p.state ? `, ${p.state}` : ''}, ${p.country}`;
        }))) as string[]
        setSuggestions(uniqueCities)
      } catch (error) {
        console.error('Photon fetch error:', error)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [query, destination])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageUrl(reader.result as string)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates.')
      return
    }

    if (!destination) {
      toast.error('Please select a destination from the list.')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('startDate', startDate.toISOString())
    formData.set('endDate', endDate.toISOString())
    formData.set('destination', destination)
    formData.set('imageUrl', imageUrl)

    startTransition(async () => {
      const result = await createTripAction(null, formData)

      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success('Trip created successfully!')
        router.push('/dashboard')
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <div className="space-y-12">
        <div className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Plan a new trip</h1>
            <p className="text-gray-500 mt-2">Fill out the details below to start your next adventure.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Trip Name</label>
              <Input
                name="title"
                placeholder="e.g. Summer Backpacking in Europe"
                className="h-14 text-base rounded-xl border-gray-200 shadow-sm focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Select a Place</label>
              <div className="relative" ref={dropdownRef}>
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    if (destination) setDestination('')
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search for a city..."
                  className="h-14 pl-12 pr-10 text-base rounded-xl border-gray-200 shadow-sm focus-visible:ring-primary w-full"
                  required
                  autoComplete="off"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}

                {showSuggestions && (suggestions.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.map((city, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setDestination(city)
                          setQuery(city)
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center cursor-pointer gap-3">
                          <MapPin className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                          <span className="text-gray-700 font-medium">{city}</span>
                        </div>
                        {destination === city && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                    {!isSearching && suggestions.length === 0 && query.length >= 2 && (
                      <div className="px-4 py-3 text-sm text-gray-500 italic">No cities found...</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-14 justify-start text-left font-normal rounded-xl cursor-pointer",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5 opacity-70" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-14 cursor-pointer justify-start text-left font-normal rounded-xl",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5 opacity-70" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Trip Description <span className="text-gray-400 font-normal">(Optional)</span></label>
              <Textarea
                name="description"
                placeholder="What are your goals for this trip?"
                className="min-h-[120px] rounded-xl resize-none p-4 text-base border-gray-200 shadow-sm focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Cover Photo <span className="text-gray-400 font-normal">(Optional)</span></label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors text-center relative cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Processing image...</p>
                  </div>
                ) : imageUrl ? (
                  <div className="relative h-48 w-full rounded-lg overflow-hidden">
                    <Image src={imageUrl} alt="Cover preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium text-sm">Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium mt-1">Click or drag image to upload</p>
                    <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isPending || isUploading}
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer bg-primary hover:bg-primary/90 text-white"
              >
                {isPending ? 'Saving Trip...' : 'Create Trip'}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Suggestion for Places to Visit / Activities to perform</h2>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: "Historical Landmarks", img: "https://plus.unsplash.com/premium_photo-1661919589683-f11880119fb7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
              { name: "Local Cuisine", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80" },
              { name: "Nature & Parks", img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80" },
              { name: "Hidden Gems", img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80" },
              { name: "Museums & Art", img: "https://images.unsplash.com/photo-1636307268087-82fea49c541e?q=80&w=3089&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
              { name: "Nightlife", img: "https://plus.unsplash.com/premium_photo-1666700698946-fbf7baa0134a?q=80&w=1036&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
            ].map((item, i) => (
              <div
                key={i}
                className="group relative aspect-square rounded-3xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer"
              >
                <Image src={item.img} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 text-white font-bold text-xl leading-tight tracking-wide drop-shadow-md">
                  {item.name}
                  {destination && <p className="text-xs font-medium text-white/80 mt-1">Available in {destination.split(',')[0]}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
