'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export default function DashboardSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/dashboard/trips?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations, trips..."
          className="pl-12 pr-12 h-14 text-base bg-white border-gray-200 rounded-xl shadow-sm focus-visible:ring-primary cursor-text"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/trips?groupBy=status')}
          className="h-14 px-6 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
        >
          Group by
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/trips')}
          className="h-14 px-6 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" /> Filter
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/trips?sortBy=date')}
          className="h-14 px-6 rounded-xl border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
        >
          Sort by...
        </Button>
      </div>
    </form>
  )
}
