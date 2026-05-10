/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Trash2,
  Loader2,
  Plane,
  Home,
  Utensils,
  Ticket,
  ShoppingBag,
  Car,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { toast } from 'sonner'
import { addExpenseAction, deleteExpenseAction } from '@/app/actions/budget'

const EXPENSE_CATEGORIES = [
  { key: 'transport', label: 'Transport', icon: Car, color: '#6366f1' },
  { key: 'accommodation', label: 'Stay', icon: Home, color: '#f59e0b' },
  { key: 'activities', label: 'Activities', icon: Ticket, color: '#10b981' },
  { key: 'food', label: 'Meals', icon: Utensils, color: '#ef4444' },
  { key: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#8b5cf6' },
  { key: 'flights', label: 'Flights', icon: Plane, color: '#3b82f6' },
]

export default function BudgetClient({ trips }: { trips: any[] }) {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set([trips[0]?.id]))
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'food',
    description: ''
  })

  const selectedTrip = trips.find(t => t.id === selectedTripId)

  const totals = useMemo(() => {
    if (!selectedTrip) return { budget: 0, activityCosts: 0, expenses: 0, total: 0, perDay: 0, days: 1, categoryBreakdown: {} as Record<string, number> }

    const budget = selectedTrip.budget || 0
    const activityCosts = selectedTrip.stops.reduce((sum: number, stop: any) =>
      sum + stop.activities.reduce((aSum: number, act: any) => aSum + (act.cost || 0), 0), 0)
    const expenses = selectedTrip.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    const total = activityCosts + expenses

    const start = new Date(selectedTrip.startDate)
    const end = new Date(selectedTrip.endDate)
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    const perDay = total / days

    const categoryBreakdown: Record<string, number> = {}
    selectedTrip.expenses.forEach((exp: any) => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount
    })
    if (activityCosts > 0) {
      categoryBreakdown['activities'] = (categoryBreakdown['activities'] || 0) + activityCosts
    }

    return { budget, activityCosts, expenses, total, perDay, days, categoryBreakdown }
  }, [selectedTrip])

  const budgetUsed = totals.budget > 0 ? (totals.total / totals.budget) * 100 : 0
  const isOverBudget = budgetUsed > 100

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      toast.error('Fill in all fields')
      return
    }
    setIsAdding(true)
    try {
      const res = await addExpenseAction({
        tripId: selectedTripId,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description
      })
      if (res.success) {
        toast.success('Expense added')
        setNewExpense({ amount: '', category: 'food', description: '' })
        setShowAddForm(false)
        window.location.reload()
      }
    } catch {
      toast.error('Failed to add expense')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteExpenseAction(id)
      toast.success('Expense removed')
      window.location.reload()
    } catch {
      toast.error('Failed to remove')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleTrip = (id: string) => {
    setExpandedTrips(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const maxCategory = Object.values(totals.categoryBreakdown).length > 0
    ? Math.max(...Object.values(totals.categoryBreakdown))
    : 1

  if (trips.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center px-4">
        <Wallet className="w-16 h-16 text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">No Trips Yet</h2>
        <p className="text-gray-400 font-medium">Create a trip to start tracking your budget.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 pt-2 px-4">

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Trip Budget</h1>
          <p className="text-gray-500 font-medium text-lg">Track spending and stay within budget</p>
        </div>
        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          className="h-12 px-5 rounded-2xl bg-white border-none shadow-sm text-sm font-bold text-gray-700 cursor-pointer min-w-[240px]"
        >
          {trips.map((t: any) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {selectedTrip && (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 rounded-3xl border-none shadow-xl bg-gray-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20 blur-2xl" />
              <div className="relative space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Budget</p>
                <p className="text-4xl font-black">${totals.budget.toLocaleString()}</p>
                <p className="text-sm font-bold text-gray-400">{totals.days} days planned</p>
              </div>
            </Card>

            <Card className={`p-8 rounded-3xl border-none shadow-xl relative overflow-hidden ${isOverBudget ? 'bg-red-50' : 'bg-white'}`}>
              <div className="space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Spent</p>
                <p className={`text-4xl font-black ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                  ${totals.total.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  {isOverBudget ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  )}
                  <p className={`text-sm font-bold ${isOverBudget ? 'text-red-500' : 'text-green-600'}`}>
                    {budgetUsed.toFixed(0)}% of budget
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 rounded-3xl border-none shadow-xl bg-white">
              <div className="space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Avg Per Day</p>
                <p className="text-4xl font-black text-gray-900">${totals.perDay.toFixed(0)}</p>
                <p className="text-sm font-bold text-gray-400">
                  ${(totals.budget > 0 ? (totals.budget - totals.total) : 0).toLocaleString()} remaining
                </p>
              </div>
            </Card>
          </section>

          {isOverBudget && (
            <Card className="p-5 rounded-2xl border-none shadow-sm bg-red-50 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-black text-red-700">Over Budget</p>
                <p className="text-sm font-medium text-red-500">
                  You have exceeded your planned budget by ${(totals.total - totals.budget).toLocaleString()}.
                </p>
              </div>
            </Card>
          )}

          {totals.budget > 0 && (
            <section className="space-y-3">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Budget Progress</p>
              <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${isOverBudget
                    ? 'bg-linear-to-r from-red-400 to-red-600'
                    : 'bg-linear-to-r from-primary to-emerald-400'
                    }`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black text-gray-600 drop-shadow-sm">
                    ${totals.total.toLocaleString()} / ${totals.budget.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>
          )}

          <section className="space-y-6">
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Cost Breakdown by Category</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXPENSE_CATEGORIES.map(cat => {
                const amount = totals.categoryBreakdown[cat.key] || 0
                const pct = maxCategory > 0 ? (amount / maxCategory) * 100 : 0
                return (
                  <Card key={cat.key} className="p-5 rounded-2xl border-none shadow-sm bg-white flex items-center gap-5">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: `${cat.color}15` }}>
                      <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700 text-sm">{cat.label}</span>
                        <span className="font-black text-gray-900">${amount.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Expense Log</p>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="rounded-xl font-bold cursor-pointer h-10 px-5 bg-gray-900 hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Expense
              </Button>
            </div>

            {showAddForm && (
              <Card className="p-6 rounded-2xl border-none shadow-lg bg-white space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount ($)</label>
                    <Input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                      className="h-12 bg-gray-50 border-none rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-full h-12 px-3 rounded-xl bg-gray-50 border-none font-bold text-sm text-gray-700 cursor-pointer"
                    >
                      {EXPENSE_CATEGORIES.map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <Input
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="What did you spend on?"
                      className="h-12 bg-gray-50 border-none rounded-xl font-bold"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="ghost" onClick={() => setShowAddForm(false)} className="rounded-xl font-bold cursor-pointer text-gray-400">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddExpense}
                    disabled={isAdding}
                    className="rounded-xl font-bold cursor-pointer px-6"
                  >
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Expense'}
                  </Button>
                </div>
              </Card>
            )}

            <div className="space-y-3">
              {selectedTrip.expenses.length > 0 ? selectedTrip.expenses.map((exp: any) => {
                const cat = EXPENSE_CATEGORIES.find(c => c.key === exp.category)
                return (
                  <Card key={exp.id} className="p-4 rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${cat?.color || '#6b7280'}15` }}>
                      {cat ? <cat.icon className="w-5 h-5" style={{ color: cat.color }} /> : <Wallet className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{exp.description}</p>
                      <p className="text-xs font-bold text-gray-400">
                        {cat?.label || exp.category} &middot; {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="font-black text-gray-900">${exp.amount.toLocaleString()}</p>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deletingId === exp.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 cursor-pointer p-1"
                    >
                      {deletingId === exp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </Card>
                )
              }) : (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">No expenses logged yet. Add one above.</p>
                </div>
              )}
            </div>
          </section>

          {selectedTrip.stops.length > 0 && (
            <section className="space-y-6">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Per-Stop Activity Costs</p>
              <div className="space-y-4">
                {selectedTrip.stops.map((stop: any) => {
                  const stopTotal = stop.activities.reduce((s: number, a: any) => s + (a.cost || 0), 0)
                  const isExpanded = expandedTrips.has(stop.id)
                  return (
                    <Card key={stop.id} className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                      <button
                        onClick={() => toggleTrip(stop.id)}
                        className="w-full p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                            <Ticket className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-gray-900">{stop.city.name}</p>
                            <p className="text-xs font-bold text-gray-400">{stop.activities.length} activities</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-gray-900">${stopTotal.toLocaleString()}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>
                      {isExpanded && stop.activities.length > 0 && (
                        <div className="px-5 pb-4 space-y-2 border-t border-gray-50">
                          {stop.activities.map((act: any) => (
                            <div key={act.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50">
                              <div>
                                <p className="font-medium text-gray-700 text-sm">{act.name || 'Unnamed activity'}</p>
                                {act.plannedTime && <p className="text-xs text-gray-400">{act.plannedTime}</p>}
                              </div>
                              <span className="font-bold text-gray-600 text-sm">${(act.cost || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
