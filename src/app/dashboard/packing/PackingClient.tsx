'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
  Loader2,
  X,
  Trash2,
  RotateCcw,
  CheckSquare,
  Square,
  FileText,
  Shirt,
  Smartphone,
  Pill,
  Briefcase,
  Package,
  SlidersHorizontal
} from 'lucide-react'
import { toast } from 'sonner'
import {
  addPackingItemAction,
  togglePackingItemAction,
  deletePackingItemAction,
  resetPackingListAction
} from '@/app/actions/packing'
import Link from 'next/link'

interface PackingItem {
  id: string
  tripId: string
  name: string
  category: string
  isPacked: boolean
}

const CATEGORIES = [
  { key: 'documents', label: 'Documents', icon: FileText, color: '#3b82f6' },
  { key: 'clothing', label: 'Clothing', icon: Shirt, color: '#f59e0b' },
  { key: 'electronics', label: 'Electronics', icon: Smartphone, color: '#8b5cf6' },
  { key: 'toiletries', label: 'Toiletries', icon: Pill, color: '#10b981' },
  { key: 'essentials', label: 'Essentials', icon: Briefcase, color: '#ef4444' },
  { key: 'general', label: 'General', icon: Package, color: '#6b7280' },
]

export default function PackingClient({
  trips,
  items: initialItems
}: {
  trips: { id: string; title: string }[]
  items: PackingItem[]
}) {
  const [items, setItems] = useState<PackingItem[]>(initialItems)
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '')
  const [query, setQuery] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('general')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  const tripItems = useMemo(() =>
    items
      .filter(i => i.tripId === selectedTripId)
      .filter(i => i.name.toLowerCase().includes(query.toLowerCase())),
    [items, selectedTripId, query]
  )

  const grouped = useMemo(() => {
    const groups: Record<string, PackingItem[]> = {}
    tripItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    })
    return groups
  }, [tripItems])

  const totalCount = tripItems.length
  const packedCount = tripItems.filter(i => i.isPacked).length
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0

  const handleAdd = async () => {
    if (!newItemName.trim()) { toast.error('Enter an item name'); return }
    setIsAdding(true)
    try {
      const res = await addPackingItemAction({
        tripId: selectedTripId,
        name: newItemName.trim(),
        category: newItemCategory
      })
      if (res.success && res.item) {
        setItems(prev => [...prev, res.item as PackingItem])
        setNewItemName('')
        toast.success('Item added')
      }
    } catch {
      toast.error('Failed to add')
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggle = async (item: PackingItem) => {
    const newState = !item.isPacked
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPacked: newState } : i))
    try {
      await togglePackingItemAction(item.id, newState)
    } catch {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPacked: !newState } : i))
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const backup = items
    setItems(prev => prev.filter(i => i.id !== id))
    try {
      await deletePackingItemAction(id)
    } catch {
      setItems(backup)
      toast.error('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    setItems(prev => prev.map(i => i.tripId === selectedTripId ? { ...i, isPacked: false } : i))
    try {
      await resetPackingListAction(selectedTripId)
      toast.success('Checklist reset')
    } catch {
      toast.error('Failed to reset')
    } finally {
      setIsResetting(false)
    }
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center px-4">
        <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">No Trips Yet</h2>
        <p className="text-gray-400 font-medium">Create a trip to start your packing checklist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 pt-6 px-4">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Packing List</h1>
        <p className="text-gray-500 font-medium">Keep track of everything you need for your trip.</p>
      </header>

      <section className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items..."
            className="pl-12 h-14 bg-white border-gray-100 rounded-2xl shadow-sm focus-visible:ring-primary/20 font-medium"
          />
        </div>
        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          className="h-14 px-6 rounded-2xl bg-white border border-gray-100 shadow-sm font-bold text-gray-700 cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
        >
          {trips.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </section>

      <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 space-y-4">
        <div className="flex justify-between items-end">
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
            Progress: {packedCount}/{totalCount} items
          </p>
          <p className="text-sm font-black text-primary">{progress.toFixed(0)}%</p>
        </div>
        <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <div className="space-y-10">
        {CATEGORIES.map(cat => {
          const catItems = grouped[cat.key]
          if (!catItems || catItems.length === 0) return null
          const catPacked = catItems.filter(i => i.isPacked).length

          return (
            <section key={cat.key} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                  <h3 className="text-xl font-black text-gray-900">{cat.label}</h3>
                </div>
                <span className="text-xs font-black text-gray-400">{catPacked}/{catItems.length}</span>
              </div>

              <div className="space-y-2">
                {catItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item)}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer group ${
                      item.isPacked ? 'bg-gray-50 border-transparent' : 'bg-white border-gray-100 hover:border-primary/30'
                    }`}
                  >
                    <div className="shrink-0">
                      {item.isPacked ? (
                        <CheckSquare className="w-6 h-6 text-primary" />
                      ) : (
                        <Square className="w-6 h-6 text-gray-200 group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <span className={`flex-1 font-bold text-lg ${
                      item.isPacked ? 'text-gray-300 line-through' : 'text-gray-700'
                    }`}>
                      {item.name}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <div className="pt-6 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="h-12 px-4 rounded-xl bg-gray-50 border-none font-bold text-sm text-gray-700 cursor-pointer outline-none"
          >
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <div className="flex-1 flex gap-2">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Add item name..."
              className="h-12 bg-gray-50 border-none rounded-xl font-bold flex-1"
            />
            <Button
              onClick={handleAdd}
              disabled={isAdding}
              className="h-12 px-8 rounded-xl font-black bg-gray-900 hover:bg-black text-white"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          className="h-12 rounded-xl font-bold border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Reset Entire List
        </Button>
      </div>
    </div>
  )
}
