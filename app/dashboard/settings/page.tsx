'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()

  const settingsSections = [
    {
      title: 'Add Users',
      icon: '👥',
      description: 'Manage user accounts',
      href: '/dashboard/settings/users',
    },
    {
      title: 'Class Settings',
      icon: '🎨',
      description: 'Configure class parameters',
      href: '/dashboard/settings/class',
    },
    {
      title: 'Currency',
      icon: '💱',
      description: 'Set app currency',
      href: '/dashboard/settings/currency',
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
        {/* Settings Sections */}
        <div className="space-y-3">
          {settingsSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="block"
            >
              <div className="card-interactive p-5">
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
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
