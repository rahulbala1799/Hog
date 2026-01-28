'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  role: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const settingsSections = [
    {
      title: 'Business',
      items: [
        { label: 'Business Details', icon: '🏢', href: '/dashboard/settings/business' },
        { label: 'Class Types', icon: '🎨', href: '/dashboard/settings/class-types' },
        { label: 'Pricing', icon: '💵', href: '/dashboard/settings/pricing' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', icon: '👤', href: '/dashboard/settings/profile' },
        { label: 'Security', icon: '🔒', href: '/dashboard/settings/security' },
        { label: 'Notifications', icon: '🔔', href: '/dashboard/settings/notifications' },
      ],
    },
    {
      title: 'App',
      items: [
        { label: 'Appearance', icon: '🎨', href: '/dashboard/settings/appearance' },
        { label: 'Currency', icon: '💱', href: '/dashboard/settings/currency' },
        { label: 'Date Format', icon: '📅', href: '/dashboard/settings/date-format' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help & FAQ', icon: '❓', href: '/dashboard/settings/help' },
        { label: 'Contact Support', icon: '💬', href: '/dashboard/settings/support' },
        { label: 'About', icon: 'ℹ️', href: '/dashboard/settings/about' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
              <p className="text-xs text-gray-600">Manage preferences</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        {/* User Profile Card */}
        {user && (
          <div className="card p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B7355] to-[#6B5645] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-[#8B7355] text-white text-xs rounded-full">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                {section.title}
              </h3>
              <div className="card divide-y divide-gray-100">
                {section.items.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors active:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.label}
                      </span>
                    </div>
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
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full mt-8 py-3 px-6 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors active:scale-95"
        >
          Sign Out
        </button>

        {/* App Version */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            House of Glow v1.0.0
          </p>
        </div>
      </main>
    </div>
  )
}
