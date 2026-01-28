'use client'

import { useState, useEffect } from 'react'
import { signIn } from '@/lib/auth/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [canSignUp, setCanSignUp] = useState(false)
  const [checkingSignUp, setCheckingSignUp] = useState(true)

  useEffect(() => {
    // Check for success message from signup
    const message = searchParams.get('message')
    if (message) {
      // Show success message (you can add a success banner here if needed)
      console.log('Message:', message)
    }

    // Check if sign-up is available
    const checkSignUp = async () => {
      try {
        const response = await fetch('/api/auth/check-admin')
        const data = await response.json()
        setCanSignUp(data.canSignUp)
      } catch (err) {
        console.error('Error checking sign-up availability:', err)
      } finally {
        setCheckingSignUp(false)
      }
    }

    checkSignUp()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || 'Invalid email or password')
        setLoading(false)
        return
      }

      if (result.data) {
        // Redirect to dashboard after successful login
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
              House of Glow
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Sign-up Link (only show if no admin exists) */}
          {!checkingSignUp && canSignUp && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                No admin account exists yet
              </p>
              <Link
                href="/signup"
                className="text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                Create Superadmin Account →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
