'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const CURRENCIES = [
  { value: 'INR', label: '₹ Indian Rupee (INR)', symbol: '₹' },
  { value: 'USD', label: '$ US Dollar (USD)', symbol: '$' },
  { value: 'EUR', label: '€ Euro (EUR)', symbol: '€' },
  { value: 'GBP', label: '£ British Pound (GBP)', symbol: '£' },
]

export default function CurrencyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currency, setCurrency] = useState('INR')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setCurrency(data.settings.currency)
      } else {
        setError('Failed to load settings')
      }
    } catch (err) {
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Currency updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update currency')
      }
    } catch (err) {
      setError('Failed to update currency')
    } finally {
      setSaving(false)
    }
  }

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
              <h1 className="text-xl font-bold text-gray-900">Currency</h1>
              <p className="text-xs text-gray-600">Set app currency</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355] mx-auto"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            <div className="card p-5 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Currency
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Choose the currency for displaying prices and amounts throughout the app.
              </p>

              <div className="space-y-3">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.value}
                    onClick={() => setCurrency(curr.value)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      currency === curr.value
                        ? 'border-[#8B7355] bg-[#8B7355]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {curr.label}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Symbol: {curr.symbol}
                        </div>
                      </div>
                      {currency === curr.value && (
                        <div className="w-6 h-6 rounded-full bg-[#8B7355] flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full btn-primary"
            >
              {saving ? 'Saving...' : 'Save Currency'}
            </button>
          </>
        )}
      </main>
    </div>
  )
}
