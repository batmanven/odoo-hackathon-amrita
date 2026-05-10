/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Pencil,
  StickyNote,
  SlidersHorizontal,
  Check,
  MapPin
} from 'lucide-react'
import { toast } from 'sonner'
import { addNoteAction, updateNoteAction, deleteNoteAction } from '@/app/actions/notes'

type FilterMode = 'all' | 'stop'

export default function NotesClient({ trips }: { trips: any[] }) {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selectedStopId, setSelectedStopId] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newStopId, setNewStopId] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const selectedTrip = trips.find(t => t.id === selectedTripId)

  const notes = useMemo(() => {
    if (!selectedTrip) return []
    let filtered = selectedTrip.notes.filter((n: any) =>
      n.content.toLowerCase().includes(query.toLowerCase())
    )
    if (filterMode === 'stop' && selectedStopId) {
      filtered = filtered.filter((n: any) => n.stopId === selectedStopId)
    }
    if (sortBy === 'oldest') {
      filtered = [...filtered].sort((a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    }
    return filtered
  }, [selectedTrip, query, sortBy, filterMode, selectedStopId])

  const handleAdd = async () => {
    if (!newContent.trim()) { toast.error('Write something first'); return }
    setIsAdding(true)
    try {
      await addNoteAction({
        tripId: selectedTripId,
        stopId: newStopId || undefined,
        content: newContent.trim()
      })
      toast.success('Note saved')
      setNewContent('')
      setNewStopId('')
      setShowAddForm(false)
      window.location.reload()
    } catch {
      toast.error('Failed to save')
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdate = async (noteId: string) => {
    if (!editContent.trim()) return
    setIsSaving(true)
    try {
      await updateNoteAction(noteId, editContent.trim())
      toast.success('Note updated')
      setEditingId(null)
      window.location.reload()
    } catch {
      toast.error('Failed to update')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    setDeletingId(noteId)
    try {
      await deleteNoteAction(noteId)
      toast.success('Note deleted')
      window.location.reload()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center px-4">
        <StickyNote className="w-16 h-16 text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">No Trips Yet</h2>
        <p className="text-gray-400 font-medium">Create a trip to start writing notes.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-2 px-4">

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Trip Notes</h1>
        <p className="text-gray-500 font-medium text-lg">Jot down reminders, check-in details, and travel tips</p>
      </div>

      <section className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-14 pr-12 h-14 text-base bg-white border-none rounded-2xl shadow-sm focus-visible:ring-primary font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="h-14 px-6 rounded-2xl border-none bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-bold cursor-pointer"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Sort by...
          </Button>
          {showSortMenu && (
            <Card className="absolute top-16 right-0 z-50 rounded-2xl border-none shadow-2xl p-2 min-w-[160px]">
              <button
                onClick={() => { setSortBy('newest'); setShowSortMenu(false) }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm cursor-pointer ${sortBy === 'newest' ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Newest First
              </button>
              <button
                onClick={() => { setSortBy('oldest'); setShowSortMenu(false) }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm cursor-pointer ${sortBy === 'oldest' ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Oldest First
              </button>
            </Card>
          )}
        </div>
      </section>

      <section className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={selectedTripId}
            onChange={(e) => { setSelectedTripId(e.target.value); setSelectedStopId('') }}
            className="h-12 px-5 rounded-2xl bg-white border-none shadow-sm text-sm font-bold text-gray-700 cursor-pointer min-w-[240px]"
          >
            {trips.map((t: any) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <Button
              variant={filterMode === 'all' ? 'default' : 'outline'}
              onClick={() => { setFilterMode('all'); setSelectedStopId('') }}
              className={`rounded-xl font-bold cursor-pointer h-10 px-5 text-sm ${filterMode === 'all' ? 'bg-gray-900 text-white' : 'border-none bg-white shadow-sm text-gray-600 hover:bg-gray-50'}`}
            >
              All
            </Button>
            <Button
              variant={filterMode === 'stop' ? 'default' : 'outline'}
              onClick={() => setFilterMode('stop')}
              className={`rounded-xl font-bold cursor-pointer h-10 px-5 text-sm ${filterMode === 'stop' ? 'bg-gray-900 text-white' : 'border-none bg-white shadow-sm text-gray-600 hover:bg-gray-50'}`}
            >
              by Stop
            </Button>
          </div>

          {filterMode === 'stop' && selectedTrip?.stops?.length > 0 && (
            <select
              value={selectedStopId}
              onChange={(e) => setSelectedStopId(e.target.value)}
              className="h-10 px-4 rounded-xl bg-white border-none shadow-sm text-sm font-bold text-gray-700 cursor-pointer"
            >
              <option value="">All stops</option>
              {selectedTrip.stops.map((s: any) => (
                <option key={s.id} value={s.id}>{s.city.name}</option>
              ))}
            </select>
          )}
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-xl font-bold cursor-pointer h-11 px-6 bg-gray-900 hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Note
        </Button>
      </section>

      {showAddForm && (
        <Card className="p-6 rounded-2xl border-none shadow-lg bg-white space-y-4 animate-in fade-in slide-in-from-top-4">
          {selectedTrip?.stops?.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Attach to Stop (optional)</label>
              <select
                value={newStopId}
                onChange={(e) => setNewStopId(e.target.value)}
                className="w-full md:w-auto h-10 px-4 rounded-xl bg-gray-50 border-none text-sm font-bold text-gray-700 cursor-pointer"
              >
                <option value="">General trip note</option>
                {selectedTrip.stops.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.city.name} stop</option>
                ))}
              </select>
            </div>
          )}
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Hotel check-in after 2pm, room 302, breakfast included (7-10am)..."
            rows={4}
            className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium text-gray-700 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => { setShowAddForm(false); setNewContent(''); setNewStopId('') }}
              className="rounded-xl font-bold cursor-pointer text-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isAdding}
              className="rounded-xl font-bold cursor-pointer px-6"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Note'}
            </Button>
          </div>
        </Card>
      )}

      <section className="space-y-4">
        {notes.length > 0 ? notes.map((note: any) => (
          <Card
            key={note.id}
            className="p-5 rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-all group"
          >
            {editingId === note.id ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium text-gray-700 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(null)}
                    className="rounded-xl font-bold cursor-pointer text-gray-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(note.id)}
                    disabled={isSaving}
                    className="rounded-xl font-bold cursor-pointer px-5"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Save</>}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    {note.stop && (
                      <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                        <MapPin className="w-3 h-3" /> {note.stop.city.name} stop
                      </span>
                    )}
                    <p className="text-xs font-bold text-gray-400">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingId(note.id); setEditContent(note.content) }}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                  >
                    {deletingId === note.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </Card>
        )) : (
          <div className="py-16 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-lg">No notes yet.</p>
            <p className="text-gray-300 font-medium text-sm mt-1">Click &quot;Add Note&quot; to get started.</p>
          </div>
        )}
      </section>
    </div>
  )
}
