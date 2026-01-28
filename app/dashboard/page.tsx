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

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/')
          return
        }
        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const sections = [
    {
      title: 'Bookings',
      icon: '📅',
      description: 'Manage class bookings',
      href: '/dashboard/bookings',
      color: 'from-blue-50 to-blue-100',
      badge: '0',
    },
    {
      title: 'Calendar',
      icon: '🗓️',
      description: 'View booking schedule',
      href: '/dashboard/calendar',
      color: 'from-purple-50 to-purple-100',
    },
    {
      title: 'Expenses',
      icon: '💰',
      description: 'Track business expenses',
      href: '/dashboard/expenses',
      color: 'from-orange-50 to-orange-100',
      badge: '₹0',
    },
    {
      title: 'Reports',
      icon: '📊',
      description: 'View analytics & insights',
      href: '/dashboard/reports',
      color: 'from-green-50 to-green-100',
    },
    {
      title: 'Settings',
      icon: '⚙️',
      description: 'Manage app settings',
      href: '/dashboard/settings',
      color: 'from-gray-50 to-gray-100',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#8B7355]">House of Glow</h1>
              <p className="text-xs text-gray-600 mt-0.5">Welcome, {user.name}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Sign out"
            >
              <span className="text-lg">👤</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-safe">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-600 mt-1">Today&apos;s Bookings</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600">₹0</div>
            <div className="text-xs text-gray-600 mt-1">This Month</div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="space-y-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="block"
            >
              <div className={`card-interactive bg-gradient-to-br ${section.color} p-5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{section.icon}</div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </h2>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {section.badge && (
                      <span className="text-xs font-medium text-gray-700 bg-white/60 px-2 py-1 rounded-full">
                        {section.badge}
                      </span>
                    )}
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Add Button - Floating */}
        <Link
          href="/dashboard/bookings/new"
          className="fixed bottom-20 right-4 w-14 h-14 bg-[#8B7355] rounded-full shadow-lg flex items-center justify-center text-white text-2xl active:scale-95 transition-transform z-50"
        >
          +
        </Link>
      </main>
    </div>
  )
}
