'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface DashboardStats {
  todayBookings: number
  todayPax: number
  upcomingBookings: number
  monthRevenue: number
  weekBookings: number
  recentActivity: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    todayPax: 0,
    upcomingBookings: 0,
    monthRevenue: 0,
    weekBookings: 0,
    recentActivity: 'No recent activity'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, bookingsResponse] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/bookings')
        ])
        
        if (!userResponse.ok) {
          router.push('/')
          return
        }
        
        const userData = await userResponse.json()
        setUser(userData.user)

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          const bookings = bookingsData.bookings || []
          
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          
          const startOfWeek = new Date(today)
          startOfWeek.setDate(today.getDate() - today.getDay())
          
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
          
          const todayBookings = bookings.filter((b: any) => {
            const bookingDate = new Date(b.sessionDate)
            return bookingDate >= today && bookingDate < tomorrow && b.status !== 'CANCELLED'
          })
          
          const weekBookings = bookings.filter((b: any) => {
            const bookingDate = new Date(b.sessionDate)
            return bookingDate >= startOfWeek && b.status !== 'CANCELLED'
          })
          
          const upcomingBookings = bookings.filter((b: any) => {
            const bookingDate = new Date(b.sessionDate)
            return bookingDate >= today && b.status !== 'CANCELLED'
          })
          
          const monthBookings = bookings.filter((b: any) => {
            const bookingDate = new Date(b.sessionDate)
            return bookingDate >= startOfMonth && b.status !== 'CANCELLED'
          })
          
          const monthRevenue = monthBookings.reduce((sum: number, b: any) => 
            sum + (b.totalAmountPaid || 0), 0
          )
          
          const todayPax = todayBookings.reduce((sum: number, b: any) => 
            sum + (b.numberOfPeople || 0), 0
          )
          
          setStats({
            todayBookings: todayBookings.length,
            todayPax,
            upcomingBookings: upcomingBookings.length,
            monthRevenue,
            weekBookings: weekBookings.length,
            recentActivity: bookings.length > 0 ? `${bookings.length} total bookings` : 'No bookings yet'
          })
        }
      } catch (error) {
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-300 opacity-20 mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatRevenue = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      // Round to nearest thousand for cleaner display
      const rounded = Math.round(amount / 1000)
      return `${rounded}K`
    }
    return amount.toFixed(0)
  }

  const isStaff = user?.role === 'STAFF'

  const allSections = [
    {
      title: 'Calendar',
      icon: '🗓️',
      description: 'View booking schedule',
      href: '/dashboard/calendar',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-purple-100',
      count: stats.todayBookings,
      countLabel: 'today',
      allowedRoles: ['ADMIN', 'STAFF']
    },
    {
      title: 'Bookings',
      icon: '📅',
      description: 'Manage class bookings',
      href: '/dashboard/bookings',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-100',
      count: stats.upcomingBookings,
      countLabel: 'upcoming',
      allowedRoles: ['ADMIN', 'STAFF']
    },
    {
      title: 'Inventory',
      icon: '📦',
      description: 'Manage stock & inventory',
      href: '/dashboard/inventory',
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-50 to-purple-50',
      iconBg: 'bg-indigo-100',
      allowedRoles: ['ADMIN', 'STAFF']
    },
    {
      title: 'Expenses',
      icon: '💰',
      description: 'Track business expenses',
      href: '/dashboard/expenses',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-orange-100',
      allowedRoles: ['ADMIN']
    },
    {
      title: 'Reports',
      icon: '📊',
      description: 'View analytics & insights',
      href: '/dashboard/reports',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-100',
      allowedRoles: ['ADMIN']
    },
    {
      title: 'Settings',
      icon: '⚙️',
      description: 'Manage app settings',
      href: '/dashboard/settings',
      gradient: 'from-gray-500 to-slate-500',
      bgGradient: 'from-gray-50 to-slate-50',
      iconBg: 'bg-gray-100',
      allowedRoles: ['ADMIN']
    },
  ]

  const sections = allSections.filter(section => 
    section.allowedRoles.includes(user?.role || 'STAFF')
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Artistic Header */}
      <header className="relative overflow-hidden">
        {/* Gradient Background with animated glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0tNiAwaDJ2LTJoLTJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">House of Glow</h1>
                <p className="text-sm text-white/90 font-medium">{getGreeting()}, {user.name.split(' ')[0]}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all border border-white/30"
              aria-label="Sign out"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* Stats Cards */}
          <div className={`grid gap-3 ${isStaff ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="text-3xl font-bold text-white">{stats.todayBookings}</div>
              <div className="text-xs text-white/90 font-medium mt-1">Today</div>
              <div className="text-xs text-white/70">{stats.todayPax} people</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="text-3xl font-bold text-white">{stats.weekBookings}</div>
              <div className="text-xs text-white/90 font-medium mt-1">This Week</div>
              <div className="text-xs text-white/70">bookings</div>
            </div>
            {!isStaff && (
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                <div className="text-2xl font-bold text-white truncate">₹{formatRevenue(stats.monthRevenue)}</div>
                <div className="text-xs text-white/90 font-medium mt-1">Revenue</div>
                <div className="text-xs text-white/70">this month</div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-28">
        {/* Quick Actions Title */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
          <p className="text-sm text-gray-600 mt-0.5">Manage your art classes</p>
        </div>

        {/* Beautiful Action Cards */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Link
              key={section.href}
              href={section.href}
              className="block group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`relative bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden`}>
                {/* Subtle gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${section.bgGradient} opacity-50`}></div>
                
                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${section.iconBg} rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {section.description}
                      </p>
                      {section.count !== undefined && section.count > 0 && (
                        <div className="mt-1.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${section.gradient} text-white`}>
                            {section.count} {section.countLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">📈</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Activity</h3>
          </div>
          <p className="text-sm text-gray-600">{stats.recentActivity}</p>
        </div>
      </main>

      {/* Floating Action Button - New Booking */}
      <Link
        href="/dashboard/calendar"
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl flex items-center justify-center text-white text-3xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-110 active:scale-95 z-50 group"
      >
        <span className="group-hover:rotate-90 transition-transform duration-300">+</span>
      </Link>
    </div>
  )
}
