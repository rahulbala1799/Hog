'use client'

import { useSession, signOut } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/')
    }
  }, [session, isPending, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Welcome back, {session.user?.name || session.user?.email}!</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-2">User Info</h2>
              <p className="text-purple-700">Email: {session.user?.email}</p>
              {session.user?.name && (
                <p className="text-purple-700">Name: {session.user.name}</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-pink-900 mb-2">Session</h2>
              <p className="text-pink-700">Session ID: {session.session?.id?.substring(0, 8)}...</p>
            </div>

            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-orange-900 mb-2">Status</h2>
              <p className="text-orange-700">Authenticated ✓</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
