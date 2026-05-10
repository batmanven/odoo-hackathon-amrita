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
  Package
} from 'lucide-react'
import { toast } from 'sonner'
import {
  addPackingItemAction,
  togglePackingItemAction,
  deletePackingItemAction,
  resetPackingListAction
} from '@/app/actions/packing'

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
      await addPackingItemAction({
        tripId: selectedTripId,
        name: newItemName.trim(),
        category: newItemCategory
      })
      setItems(prev => [...prev, {
        id: `temp-${Date.now()}`,
        tripId: selectedTripId,
        name: newItemName.trim(),
        category: newItemCategory,
        isPacked: false
      }])
      setNewItemName('')
      toast.success('Item added')
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
      <div className="max-w-6xl mx-auto py-20 text-center px-4">
        <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">No Trips Yet</h2>
        <p className="text-gray-400 font-medium">Create a trip to start your packing checklist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-2 px-4">

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Packing Checklist</h1>
        <p className="text-gray-500 font-medium text-lg">Stay organized and never forget the essentials</p>
      </div>

      <section className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items..."
            className="pl-14 pr-12 h-14 text-base bg-white border-none rounded-2xl shadow-sm focus-visible:ring-primary font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          className="h-14 px-5 rounded-2xl bg-white border-none shadow-sm text-sm font-bold text-gray-700 cursor-pointer min-w-[240px]"
        >
          {trips.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-700">
            Progress: <span className="text-primary">{packedCount}/{totalCount}</span> items packed
          </p>
          <p className="text-sm font-black text-gray-400">{progress.toFixed(0)}%</p>
        </div>
        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 bg-linear-to-r from-primary to-emerald-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <div className="space-y-8">
        {CATEGORIES.map(cat => {
          const catItems = grouped[cat.key]
          if (!catItems || catItems.length === 0) return null
          const catPacked = catItems.filter(i => i.isPacked).length

          return (
            <section key={cat.key} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${cat.color}15` }}>
                    <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <h3 className="font-black text-gray-900">{cat.label}</h3>
                </div>
                <span className="text-sm font-black text-gray-400">{catPacked}/{catItems.length}</span>
              </div>

              <div className="space-y-2">
                {catItems.map(item => (
                  <Card
                    key={item.id}
                    className={`p-4 rounded-2xl border-none shadow-sm flex items-center gap-4 group transition-all duration-300 cursor-pointer ${item.isPacked ? 'bg-gray-50' : 'bg-white hover:shadow-md'
                      }`}
                    onClick={() => handleToggle(item)}
                  >
                    <div className="transition-transform duration-200 hover:scale-110">
                      {item.isPacked ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <span className={`flex-1 font-medium transition-all duration-300 ${item.isPacked ? 'line-through text-gray-400' : 'text-gray-700'
                      }`}>
                      {item.name}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                      disabled={deletingId === item.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 cursor-pointer p-1"
                    >
                      {deletingId === item.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </Card>
                ))}
              </div>
            </section>
          )
        })}

        {totalCount === 0 && !query && (
          <div className="py-16 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-lg">No items yet.</p>
            <p className="text-gray-300 font-medium text-sm mt-1">Add your first packing item below.</p>
          </div>
        )}
      </div>

      {showAddForm && (
        <Card className="p-6 rounded-2xl border-none shadow-lg bg-white space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full h-12 px-3 rounded-xl bg-gray-50 border-none font-bold text-sm text-gray-700 cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Item Name</label>
              <div className="flex gap-3">
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Passport, Sunscreen, Charger..."
                  className="h-12 bg-gray-50 border-none rounded-xl font-bold flex-1"
                />
                <Button
                  onClick={handleAdd}
                  disabled={isAdding}
                  className="rounded-xl font-bold cursor-pointer h-12 px-6"
                >
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <section className="flex flex-wrap gap-3">
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-xl font-bold cursor-pointer h-12 px-6 bg-gray-900 hover:bg-gray-800 flex-1 md:flex-none"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Item to Checklist
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isResetting || totalCount === 0}
          className="rounded-xl font-bold cursor-pointer h-12 px-6 border-gray-200 text-gray-600 hover:bg-gray-50 flex-1 md:flex-none"
        >
          {isResetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
          Reset All
        </Button>
      </section>
    </div>
  )
}
