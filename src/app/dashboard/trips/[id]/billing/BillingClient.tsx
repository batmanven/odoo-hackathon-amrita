/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
   ArrowLeft,
   Download,
   FileText,
   CheckCircle2,
   Search,
   Filter,
   ArrowUpDown,
   MousePointer2,
   Wallet,
} from 'lucide-react'
import {
   ChartConfig,
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from '@/components/ui/chart'
import { Pie, PieChart } from "recharts"
import Link from 'next/link'
import Image from 'next/image'
import { Caveat } from 'next/font/google'

const caveat = Caveat({ subsets: ['latin'] })

export default function BillingClient({ trip }: { trip: any }) {
   const [isPaid, setIsPaid] = useState(false)

   const subtotal = trip.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
   const tax = subtotal * 0.05
   const discount = 50
   const grandTotal = subtotal + tax - discount

   const budget = trip.budget || 20000
   const totalSpent = grandTotal
   const remaining = budget - totalSpent

   const chartData = [
      { name: "Spent", value: totalSpent, fill: "#714B67" },
      { name: "Remaining", value: Math.max(0, remaining), fill: remaining < 0 ? "#ef4444" : "#f3f4f6" },
   ]

   const chartConfig = {
      spent: { label: "Total Spent", color: "#714B67" },
      remaining: { label: "Remaining", color: remaining < 0 ? "#ef4444" : "#f3f4f6" },
   } satisfies ChartConfig

   return (
      <div className="min-h-screen bg-[#FAFAFA] text-gray-900 pb-32">
         <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
               <div className="flex items-center gap-8 flex-1">
                  <div className="relative max-w-xl w-full hidden md:block">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <Input
                        placeholder="Search invoices......"
                        className="pl-11 h-12 bg-gray-50 border-gray-100 rounded-2xl font-medium focus:ring-primary"
                     />
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <Button variant="outline" className="rounded-2xl font-bold border-gray-200 h-11 px-6 hover:bg-gray-50 transition-all">
                     <Filter className="w-4 h-4 mr-2" /> Filter
                  </Button>
                  <Button variant="outline" className="rounded-2xl font-bold border-gray-200 h-11 px-6 hover:bg-gray-50 transition-all">
                     <ArrowUpDown className="w-4 h-4 mr-2" /> Sort
                  </Button>
                  <div className="w-11 h-11 rounded-full border-2 border-gray-100 overflow-hidden shadow-sm">
                     <Image src={trip.user.avatarBase64 || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'} alt="User" width={44} height={44} className="object-cover" />
                  </div>
               </div>
            </div>
         </header>

         <div className="max-w-7xl mx-auto px-6 pt-10 space-y-10">
            <Link href={`/dashboard/trips/${trip.id}/view`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-all">
               <ArrowLeft className="w-4 h-4" />
               back to My Trips
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <Card className="lg:col-span-8 rounded-[32px] border border-gray-100 shadow-sm bg-white overflow-hidden p-8 sm:p-10">
                  <div className="flex flex-col md:flex-row gap-10">
                     <div className="w-full md:w-48 h-48 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 relative">
                        <Image src={trip.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop'} alt={trip.title} fill className="object-cover" />
                     </div>

                     <div className="flex-1 space-y-6">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{trip.title}</h2>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {trip.stops.length} cities
                           </p>
                           <p className="text-[10px] font-bold text-gray-400">created by {trip.user.firstName}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-12 gap-y-8 py-8 border-y border-gray-50">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice Id</p>
                              <p className="font-black text-gray-900">INV-{trip.id.slice(0, 8).toUpperCase()}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generated date</p>
                              <p className="font-black text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Traveler Details</p>
                              <div className="flex flex-wrap gap-2">
                                 {['James', 'Arjun', 'Jerry', 'Cristina'].map(name => (
                                    <span key={name} className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-600 border border-gray-100">{name}</span>
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment status</p>
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                 {isPaid ? 'Paid' : 'Pending'}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </Card>

               <Card className="lg:col-span-4 rounded-[32px] border border-gray-100 shadow-sm bg-white p-8">
                  <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                     Budget Insights
                  </h3>

                  <div className="flex flex-col items-center">
                     <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[180px]">
                        <PieChart>
                           <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                           <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5} />
                        </PieChart>
                     </ChartContainer>

                     <div className="w-full space-y-4 mt-8">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Budget</span>
                           <span className="font-black text-gray-900">${budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Spent</span>
                           <span className="font-black text-gray-900">${totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-gray-50" />
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Remaining</span>
                           <span className={`font-black ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                              ${Math.abs(remaining).toLocaleString()}
                           </span>
                        </div>
                     </div>

                     <Button variant="outline" className="w-full mt-8 rounded-2xl h-12 font-bold border-gray-200 hover:bg-gray-50 text-sm">
                        View Full Budget
                     </Button>
                  </div>
               </Card>
            </div>

            <Card className="rounded-[32px] border border-gray-100 shadow-sm bg-white overflow-hidden mb-20">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">#</th>
                           <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                           <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                           <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty/details</th>
                           <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit Cost</th>
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {trip.expenses.map((exp: any, i: number) => (
                           <tr key={exp.id} className="group hover:bg-gray-50/30 transition-colors">
                              <td className="px-8 py-5 text-sm font-bold text-gray-400">{i + 1}</td>
                              <td className="px-6 py-5">
                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600">
                                    {exp.category}
                                 </span>
                              </td>
                              <td className="px-6 py-5 text-sm font-black text-gray-900">{exp.description || 'General Expense'}</td>
                              <td className="px-6 py-5 text-sm font-bold text-gray-400">1 unit</td>
                              <td className="px-6 py-5 text-sm font-black text-gray-900">${exp.amount.toLocaleString()}</td>
                              <td className="px-8 py-5 text-sm font-black text-gray-900 text-right">${exp.amount.toLocaleString()}</td>
                           </tr>
                        ))}
                        {[1, 2, 3].map((n) => (
                           <tr key={`pad-${n}`} className="h-16">
                              <td colSpan={6} />
                           </tr>
                        ))}
                     </tbody>
                     <tfoot>
                        <tr className="border-t-2 border-gray-100">
                           <td colSpan={4} className="px-8 py-4" />
                           <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Subtotal</td>
                           <td className="px-8 py-4 text-lg font-black text-gray-900 text-right">${subtotal.toLocaleString()}</td>
                        </tr>
                        <tr>
                           <td colSpan={4} />
                           <td className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">tax (5%)</td>
                           <td className="px-8 py-2 text-sm font-black text-gray-500 text-right">${tax.toLocaleString()}</td>
                        </tr>
                        <tr>
                           <td colSpan={4} />
                           <td className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Discount</td>
                           <td className="px-8 py-2 text-sm font-black text-red-500 text-right">-${discount.toLocaleString()}</td>
                        </tr>
                        <tr className="relative">
                           <td colSpan={4} />
                           <td className="px-6 py-8 text-sm font-black text-gray-900 uppercase tracking-widest">Grand Total</td>
                           <td className="px-8 py-8 text-4xl font-black text-gray-900 text-right">
                              ${grandTotal.toLocaleString()}
                           </td>
                        </tr>
                     </tfoot>
                  </table>
               </div>
            </Card>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50">
               <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex gap-4 w-full sm:w-auto">
                     <Button variant="outline" className="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-bold border-gray-200 hover:bg-gray-50 flex gap-2 transition-all">
                        <Download className="w-5 h-5" /> Download Invoice
                     </Button>
                     <Button variant="outline" className="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-bold border-gray-200 hover:bg-gray-50 flex gap-2 transition-all">
                        <FileText className="w-5 h-5" /> Export as PDF
                     </Button>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto">
                     <div className="hidden lg:block text-right">
                        <p className={`${caveat.className} text-2xl text-gray-400 -rotate-1`}>Settlement ready</p>
                     </div>
                     <Button
                        onClick={() => setIsPaid(!isPaid)}
                        className={`w-full sm:w-auto h-14 px-12 rounded-2xl font-black shadow-xl transition-all active:scale-95 flex gap-2 ${isPaid ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-gray-900 hover:bg-gray-800 text-white shadow-gray-900/20'}`}
                     >
                        {isPaid ? <CheckCircle2 className="w-5 h-5" /> : null}
                        {isPaid ? 'Paid' : 'Mark as paid'}
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

