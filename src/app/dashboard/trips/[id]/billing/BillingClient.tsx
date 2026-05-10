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
   const remaining = budget - grandTotal

   const chartData = [
      { name: "Spent", value: grandTotal, fill: "#714B67" },
      { name: "Remaining", value: Math.max(0, remaining), fill: remaining < 0 ? "#ef4444" : "#f1f1f1" },
   ]

   const chartConfig = {
      spent: { label: "Total Spent", color: "#714B67" },
      remaining: { label: "Remaining", color: remaining < 0 ? "#ef4444" : "#f1f1f1" },
   } satisfies ChartConfig

   return (
      <div className="min-h-screen bg-[#FDFCFD] pb-32">
         <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
               <div className="flex items-center gap-6 flex-1">
                  <Link href="/dashboard/trips" className="text-xl font-black text-[#212529] tracking-tight">Traveloop</Link>
                  <div className="relative max-w-md w-full hidden md:block">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <Input
                        placeholder="Search invoices......"
                        className="pl-11 h-11 bg-gray-50 border-none rounded-xl font-medium focus:ring-[#714B67]"
                     />
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <div className="flex -space-x-3 mr-4">
                     {['G', 'B', 'L', 'P', 'T'].map((char, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm`} style={{ backgroundColor: ['#714B67', '#4CA5FF', '#FDB833', '#10b981', '#ef4444'][i] }}>
                           {char}
                        </div>
                     ))}
                     <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm">+259</div>
                  </div>
                  <Button variant="outline" className="rounded-xl font-bold border-gray-200 h-10 px-4 hidden sm:flex gap-2">
                     <Filter className="w-4 h-4" /> Filter
                  </Button>
                  <Button variant="outline" className="rounded-xl font-bold border-gray-200 h-10 px-4 hidden sm:flex gap-2">
                     <ArrowUpDown className="w-4 h-4" /> Sort
                  </Button>
                  <div className="w-10 h-10 rounded-full border-2 border-gray-100 overflow-hidden shadow-sm">
                     <Image src={trip.user.avatarBase64 || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'} alt="User" width={40} height={40} className="object-cover" />
                  </div>
               </div>
            </div>
         </header>

         <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8 relative">
            <div className="absolute top-20 right-[15%] pointer-events-none z-10 hidden lg:block">
               <CursorIndicator name="Serene Scorpion" color="#714B67" />
            </div>
            <div className="absolute bottom-[20%] left-[40%] pointer-events-none z-10 hidden lg:block">
               <CursorIndicator name="Sophisticated Gazelle" color="#4CA5FF" />
            </div>

            <Link href={`/dashboard/trips/${trip.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
               <ArrowLeft className="w-4 h-4" />
               back to My Trips
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <Card className="lg:col-span-2 rounded-[32px] border border-gray-100 shadow-sm bg-white overflow-hidden p-8 sm:p-10">
                  <div className="flex flex-col md:flex-row gap-10">
                     <div className="w-full md:w-48 h-48 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 relative group">
                        <Image src={trip.imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop'} alt={trip.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 left-2 pointer-events-none">
                           <CursorIndicator name="Timely Wasp" color="#FDB833" size="sm" />
                        </div>
                     </div>

                     <div className="flex-1 space-y-6">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{trip.title}</h2>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {trip.stops.length} cities
                           </p>
                           <p className="text-[10px] font-bold text-gray-400">created by {trip.user.firstName}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-50">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice Id</p>
                              <p className="font-black text-gray-900">INV-{trip.id.slice(0, 8).toUpperCase()}</p>
                           </div>
                           <div className="space-y-1 text-right md:text-left">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generated date</p>
                              <p className="font-black text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Traveler Details</p>
                              <div className="flex flex-wrap gap-1">
                                 <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100">{trip.user.firstName}</span>
                                 <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100">Arjun</span>
                                 <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100">Jerry</span>
                              </div>
                           </div>
                           <div className="space-y-1 text-right md:text-left">
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

               <Card className="rounded-[32px] border border-gray-100 shadow-sm bg-white p-8">
                  <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                     <Wallet className="w-4 h-4 text-[#714B67]" />
                     Budget Insights
                  </h3>

                  <div className="flex flex-col items-center">
                     <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[200px]">
                        <PieChart>
                           <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                           <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5} />
                        </PieChart>
                     </ChartContainer>

                     <div className="w-full space-y-4 mt-6">
                        <div className="flex justify-between items-center px-2">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Budget</span>
                           <span className="font-black text-gray-900">${budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center px-2">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Spent</span>
                           <span className="font-black text-gray-900">${grandTotal.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-gray-50" />
                        <div className="flex justify-between items-center px-2">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Remaining</span>
                           <span className={`font-black ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                              {remaining < 0 ? '-' : ''}${Math.abs(remaining).toLocaleString()}
                           </span>
                        </div>
                     </div>

                     <Button variant="outline" className="w-full mt-8 rounded-2xl h-12 font-black border-gray-200 hover:bg-gray-50 text-sm">
                        View Full Budget
                     </Button>
                  </div>
               </Card>
            </div>

            <Card className="rounded-[40px] border border-gray-100 shadow-2xl bg-white overflow-hidden">
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
                     <tbody className="divide-y divide-gray-50 relative">
                        {trip.expenses.map((exp: any, i: number) => (
                           <tr key={exp.id} className="group hover:bg-gray-50/30 transition-colors">
                              <td className="px-8 py-5 text-sm font-bold text-gray-400">{i + 1}</td>
                              <td className="px-6 py-5">
                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">
                                    {exp.category}
                                 </span>
                              </td>
                              <td className="px-6 py-5 text-sm font-black text-gray-900">{exp.description || 'General Expense'}</td>
                              <td className="px-6 py-5 text-sm font-bold text-gray-400">1 unit</td>
                              <td className="px-6 py-5 text-sm font-black text-gray-900">${exp.amount.toLocaleString()}</td>
                              <td className="px-8 py-5 text-sm font-black text-[#212529] text-right">${exp.amount.toLocaleString()}</td>
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
                           <td className="px-8 py-2 text-sm font-black text-gray-600 text-right">${tax.toLocaleString()}</td>
                        </tr>
                        <tr>
                           <td colSpan={4} />
                           <td className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Discount</td>
                           <td className="px-8 py-2 text-sm font-black text-[#ef4444] text-right">-${discount.toLocaleString()}</td>
                        </tr>
                        <tr className="relative">
                           <td colSpan={4} />
                           <td className="px-6 py-8 text-sm font-black text-gray-900 uppercase tracking-widest">Grand Total</td>
                           <td className="px-8 py-8 text-4xl font-black text-[#212529] text-right relative">
                              <div className="absolute top-0 right-[20%] pointer-events-none">
                                 <CursorIndicator name="True Leopard" color="#ef4444" size="sm" />
                              </div>
                              ${grandTotal.toLocaleString()}
                           </td>
                        </tr>
                     </tfoot>
                  </table>
               </div>
            </Card>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
               <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex gap-3 w-full sm:w-auto">
                     <Button variant="outline" className="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-black border-2 border-gray-100 hover:bg-gray-50 flex gap-2 active:scale-95 transition-all">
                        <Download className="w-5 h-5" /> Download Invoice
                     </Button>
                     <Button variant="outline" className="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-black border-2 border-gray-100 hover:bg-gray-50 flex gap-2 active:scale-95 transition-all">
                        <FileText className="w-5 h-5" /> Export as PDF
                     </Button>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto">
                     <div className="hidden lg:block text-right">
                        <p className={`${caveat.className} text-2xl text-gray-400 -rotate-1`}>Invoice ready for settlement</p>
                     </div>
                     <Button
                        onClick={() => setIsPaid(!isPaid)}
                        className={`w-full sm:w-auto h-14 px-12 rounded-2xl font-black shadow-xl transition-all active:scale-95 flex gap-2 ${isPaid ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-[#714B67] hover:bg-[#5E3D55] shadow-[#714B67]/20'}`}
                     >
                        {isPaid ? <CheckCircle2 className="w-5 h-5" /> : null}
                        {isPaid ? 'Paid' : 'Mark as paid'}
                     </Button>
                  </div>
               </div>
            </div>

            <div className="fixed bottom-24 right-10 pointer-events-none opacity-20 hidden 2xl:block">
               <CursorIndicator name="Beautiful Snail" color="#ec4899" />
            </div>
         </div>
      </div>
   )
}

function CursorIndicator({ name, color, size = 'default' }: { name: string, color: string, size?: 'sm' | 'default' }) {
   return (
      <div className="flex flex-col items-start gap-1 group">
         <MousePointer2 className={`fill-${color} text-white drop-shadow-sm group-hover:scale-110 transition-transform`} style={{ color: color, fill: color }} size={size === 'sm' ? 14 : 20} />
         <div className={`px-2.5 py-1 rounded-lg shadow-xl border-2 border-white text-white font-black whitespace-nowrap animate-in fade-in zoom-in duration-300 ${size === 'sm' ? 'text-[8px]' : 'text-[10px]'}`} style={{ backgroundColor: color }}>
            {name}
         </div>
      </div>
   )
}
