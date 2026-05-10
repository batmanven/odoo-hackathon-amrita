/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Search,
  MapPin,
  Globe,
  DollarSign,
  Plus,
  Loader2,
  X,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { addCityToTripAction } from '@/app/actions/explore'

interface CityResult {
  name: string
  country: string
  state?: string
  lat: number
  lon: number
}

const POPULAR_CITIES = [
  { name: 'Paris', country: 'France', costIndex: 'High', popularity: 9.8, image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80' },
  { name: 'Tokyo', country: 'Japan', costIndex: 'High', popularity: 9.6, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80' },
  { name: 'Rome', country: 'Italy', costIndex: 'Medium', popularity: 9.5, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80' },
  { name: 'Bali', country: 'Indonesia', costIndex: 'Low', popularity: 9.3, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80' },
  { name: 'New York', country: 'United States', costIndex: 'Very High', popularity: 9.7, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80' },
  { name: 'Barcelona', country: 'Spain', costIndex: 'Medium', popularity: 9.2, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=400&q=80' },
  { name: 'Dubai', country: 'UAE', costIndex: 'Very High', popularity: 9.1, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80' },
  { name: 'London', country: 'United Kingdom', costIndex: 'High', popularity: 9.4, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80' },
]

const REGIONS = ['All', 'Europe', 'Asia', 'Americas', 'Middle East', 'Oceania', 'Africa']

const REGION_MAP: Record<string, string[]> = {
  Europe: ['France', 'Italy', 'Spain', 'United Kingdom', 'Germany', 'Netherlands', 'Greece', 'Portugal', 'Switzerland', 'Austria'],
  Asia: ['Japan', 'Indonesia', 'Thailand', 'India', 'Vietnam', 'South Korea', 'China', 'Malaysia', 'Singapore'],
  Americas: ['United States', 'Canada', 'Brazil', 'Mexico', 'Argentina', 'Colombia', 'Peru'],
  'Middle East': ['UAE', 'Turkey', 'Jordan', 'Qatar', 'Saudi Arabia'],
  Oceania: ['Australia', 'New Zealand', 'Fiji'],
  Africa: ['South Africa', 'Morocco', 'Kenya', 'Egypt', 'Tanzania']
}

export default function ExploreClient({ trips }: { trips: { id: string; title: string }[] }) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<CityResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [addingCity, setAddingCity] = useState<string | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<string>(trips[0]?.id || '')
  const [showTripPicker, setShowTripPicker] = useState<string | null>(null)

  const searchCities = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setIsSearching(true)
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=12&layer=city`)
      const data = await res.json()
      const cities: CityResult[] = data.features
        ?.filter((f: any) => f.properties?.name && f.properties?.country)
        .map((f: any) => ({
          name: f.properties.name,
          country: f.properties.country,
          state: f.properties.state,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
        }))
        // deduplicate
        .filter((c: CityResult, i: number, arr: CityResult[]) =>
          arr.findIndex(x => x.name === c.name && x.country === c.country) === i
        ) || []
      setResults(cities)
    } catch {
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => searchCities(query), 350)
    return () => clearTimeout(timeout)
  }, [query, searchCities])

  const handleAddToTrip = async (cityName: string, country: string, tripId: string) => {
    setAddingCity(cityName)
    try {
      const res = await addCityToTripAction({ tripId, cityName, country })
      if (res.success) {
        toast.success(`${cityName} added to your trip!`)
        setShowTripPicker(null)
      }
    } catch {
      toast.error('Failed to add city')
    } finally {
      setAddingCity(null)
    }
  }

  const filteredPopular = selectedRegion === 'All'
    ? POPULAR_CITIES
    : POPULAR_CITIES.filter(c => REGION_MAP[selectedRegion]?.includes(c.country))

  const costColor = (cost: string) => {
    switch (cost) {
      case 'Low': return 'text-green-600 bg-green-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'High': return 'text-orange-600 bg-orange-50'
      case 'Very High': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 pt-2 px-4">

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Explore Cities</h1>
        <p className="text-gray-500 font-medium text-lg">Discover destinations and add them to your trips</p>
      </div>

      {/* Search Bar */}
      <section className="relative">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any city in the world..."
            className="pl-14 pr-12 h-16 text-lg bg-white border-none rounded-2xl shadow-lg focus-visible:ring-primary font-medium"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]) }} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          )}
          {isSearching && (
            <Loader2 className="absolute right-14 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {results.length > 0 && (
          <Card className="absolute top-20 left-0 right-0 z-50 rounded-2xl border-none shadow-2xl overflow-hidden max-h-[500px] overflow-y-auto">
            <div className="p-2">
              {results.map((city, i) => (
                <div
                  key={`${city.name}-${city.country}-${i}`}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{city.name}</h4>
                      <p className="text-sm text-gray-500 font-medium">
                        {city.state ? `${city.state}, ` : ''}{city.country}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    {showTripPicker === `${city.name}-${i}` ? (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                        <select
                          value={selectedTrip}
                          onChange={(e) => setSelectedTrip(e.target.value)}
                          className="h-10 px-3 rounded-xl bg-gray-50 border-none text-sm font-bold text-gray-700 cursor-pointer focus:ring-primary"
                        >
                          {trips.map(t => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          onClick={() => handleAddToTrip(city.name, city.country, selectedTrip)}
                          disabled={addingCity === city.name || !selectedTrip}
                          className="rounded-xl font-bold cursor-pointer h-10 px-4"
                        >
                          {addingCity === city.name ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                        </Button>
                        <button onClick={() => setShowTripPicker(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (trips.length === 0) {
                            toast.error('Create a trip first!')
                            return
                          }
                          setShowTripPicker(`${city.name}-${i}`)
                        }}
                        className="rounded-xl font-bold text-primary hover:bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add to Trip
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>

      {/* Region Filter */}
      <section className="flex flex-wrap gap-3">
        {REGIONS.map(region => (
          <Button
            key={region}
            variant={selectedRegion === region ? 'default' : 'outline'}
            onClick={() => setSelectedRegion(region)}
            className={`rounded-xl font-bold cursor-pointer h-10 px-5 ${selectedRegion === region
              ? 'bg-gray-900 text-white shadow-lg'
              : 'border-none bg-white shadow-sm hover:bg-gray-50 text-gray-600'
              }`}
          >
            {region}
          </Button>
        ))}
      </section>

      {/* Popular Cities Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Popular Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPopular.map((city) => (
            <Card key={city.name} className="group rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bg-white">
              {/* City Image */}
              <div className="relative h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-black text-white leading-tight">{city.name}</h3>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{city.country}</p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${costColor(city.costIndex)}`}>
                      {city.costIndex}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-black text-gray-700">{city.popularity}</span>
                  </div>
                </div>

                <div className="relative">
                  {showTripPicker === city.name ? (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                      <select
                        value={selectedTrip}
                        onChange={(e) => setSelectedTrip(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-gray-50 border-none text-sm font-bold text-gray-700 cursor-pointer"
                      >
                        {trips.map(t => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddToTrip(city.name, city.country, selectedTrip)}
                          disabled={addingCity === city.name || !selectedTrip}
                          className="flex-1 rounded-xl font-bold cursor-pointer h-9"
                        >
                          {addingCity === city.name ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTripPicker(null)}
                          className="rounded-xl font-bold cursor-pointer h-9 text-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (trips.length === 0) {
                          toast.error('Create a trip first!')
                          return
                        }
                        setShowTripPicker(city.name)
                      }}
                      className="w-full rounded-xl font-bold cursor-pointer h-9 border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-all"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add to Trip
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredPopular.length === 0 && (
          <div className="py-16 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-lg">No destinations found in this region.</p>
          </div>
        )}
      </section>
    </div>
  )
}
