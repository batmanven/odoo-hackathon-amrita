import Link from 'next/link'
import { Map, Wallet, Shield, Users, ArrowRight, Sparkles, Globe, Compass, LayoutDashboard } from 'lucide-react'
import { getSession } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { Caveat } from 'next/font/google'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const caveat = Caveat({ subsets: ['latin'] })

export default async function Home() {
  const session = await getSession()
  let user = null

  if (session?.userId) {
    user = await prisma.user.findUnique({
      where: { id: session.userId }
    })
  }

  return (
    <div className="min-h-screen bg-[#FDFCFD] font-sans text-[#1C1C1C] selection:bg-[#714B67]/10 overflow-x-hidden">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#714B67] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-[#714B67]/20">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#2C2C2C]">Traveloop</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-8">
            {user ? (
              <div className="flex items-center gap-3 sm:gap-5">
                <Link href="/dashboard" className="hidden xs:flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#714B67] transition-colors group">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link href="/dashboard/profile">
                  <Avatar className="h-8 w-8 sm:h-10 ring-2 ring-gray-100 ring-offset-2 transition-transform hover:scale-105 active:scale-95">
                    <AvatarImage src={user.avatarBase64 || ''} alt={user.firstName} className="object-cover" />
                    <AvatarFallback className="bg-[#714B67]/10 text-[#714B67] font-bold text-xs">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-6">
                <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-[#714B67] transition-colors">Login</Link>
                <Link href="/register" className="bg-[#714B67] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-[#5E3D55] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#714B67]/20 whitespace-nowrap">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="pt-32 sm:pt-48 pb-20 sm:pb-32 px-6 relative">
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] sm:h-[600px] bg-[#714B67]/5 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative text-center">
          <h1 className={`${caveat.className} text-5xl sm:text-7xl md:text-[110px] tracking-tight leading-none sm:leading-[0.85] mb-8 sm:mb-12 text-[#212529]`}>
            All your trips on <br />
            <span className="relative inline-block mt-2 sm:mt-4 px-2">
              <span className="relative z-10">one platform.</span>
              <div className="absolute inset-x-0 bottom-2 md:bottom-5 h-5 sm:h-8 md:h-14 bg-[#FDB833] -rotate-1 z-0 opacity-80 rounded-sm" />
            </span>
          </h1>

          <div className="relative mb-12 sm:mb-20 max-w-4xl mx-auto">
            <p className={`${caveat.className} text-2xl sm:text-4xl md:text-6xl font-bold text-[#212529] tracking-tight`}>
              Simple, efficient, yet <span className="relative inline-block px-1">
                affordable!
                <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3 text-[#4CA5FF]" preserveAspectRatio="none" viewBox="0 0 100 10" fill="none">
                  <path d="M0 5C20 2 80 8 100 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </p>


          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? "/dashboard" : "/register"} className="w-full sm:w-auto bg-[#714B67] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-black hover:bg-[#5E3D55] transition-all hover:scale-105 shadow-xl shadow-[#714B67]/30 flex items-center justify-center gap-3 group active:scale-95">
              {user ? 'Go to Dashboard' : 'Start now - It\'s free'}
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 sm:gap-12">
            <AppIcon icon={<Map className="w-6 h-6 sm:w-8 sm:h-8" color="#FF8D6F" />} label="Itinerary" />
            <AppIcon icon={<Wallet className="w-6 h-6 sm:w-8 sm:h-8" color="#6AD1C1" />} label="Budget" />
            <AppIcon icon={<Users className="w-6 h-6 sm:w-8 sm:h-8" color="#4CA5FF" />} label="Community" />
            <AppIcon icon={<Globe className="w-6 h-6 sm:w-8 sm:h-8" color="#9C8CF0" />} label="Packing" />
            <AppIcon icon={<Sparkles className="w-6 h-6 sm:w-8 sm:h-8" color="#FFB833" />} label="Notes" />
            <AppIcon icon={<Shield className="w-6 h-6 sm:w-8 sm:h-8" color="#714B67" />} label="Admin" />
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 sm:py-32 px-6 bg-[#FDFCFD]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className={`text-4xl sm:text-5xl font-black tracking-tight text-[#212529] mb-4 ${caveat.className}`}>The only app you need.</h2>
            <p className="text-lg sm:text-xl text-gray-500 font-medium max-w-2xl mx-auto italic">Traveloop consolidates your entire travel workflow into a single, beautiful dashboard.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
            <div className="space-y-8 sm:space-y-12 text-center lg:text-left">
              <FeatureItem title="Organized Itinerary" desc="Plan your days with precision. Drag-and-drop stops, set timings, and never miss a landmark." />
              <FeatureItem title="Financial Clarity" desc="Real-time budget tracking. See where your money goes with elegant charts and insights." />
              <FeatureItem title="Community Feed" desc="Share your trips and get inspired by others. Discover the world together." />
            </div>
            <div className="relative group max-w-md sm:max-w-xl mx-auto">
              <div className="absolute inset-0 bg-[#714B67]/10 rounded-[30px] sm:rounded-[40px] blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <div className="relative bg-white p-4 sm:p-6 rounded-[30px] sm:rounded-[40px] border border-gray-100 shadow-2xl">
                <div className="aspect-square bg-gray-50 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-gray-100 overflow-hidden relative">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#714B67_1.5px,transparent_1px)] bg-size-[20px_20px]" />
                  <Compass className="w-20 h-20 sm:w-32 sm:h-32 text-[#714B67] animate-pulse" />
                </div>
              </div>
              <div className={`${caveat.className} absolute -bottom-6 sm:-bottom-8 -right-2 sm:-right-4 bg-[#FDB833] text-gray-900 px-4 sm:px-6 py-1 sm:py-2 rounded-lg rotate-3 shadow-lg text-xl sm:text-2xl font-bold`}>
                Everything works offline!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 sm:py-20 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#714B67] rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">Traveloop</span>
          </div>
          <p className="text-gray-400 font-medium text-center sm:text-left">© 2026 Traveloop. Inspired by Odoo.</p>
        </div>
      </footer>
    </div>
  )
}

function AppIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 group cursor-pointer">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center group-hover:shadow-xl group-hover:-translate-y-1 sm:group-hover:-translate-y-2 transition-all duration-500">
        {icon}
      </div>
      <span className="font-bold text-gray-600 text-xs sm:text-sm group-hover:text-[#212529] transition-colors">{label}</span>
    </div>
  )
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="group">
      <h4 className="text-xl sm:text-2xl font-black text-[#212529] mb-2 group-hover:text-[#714B67] transition-colors">{title}</h4>
      <p className="text-gray-500 font-medium leading-relaxed text-sm sm:text-base">{desc}</p>
    </div>
  )
}
