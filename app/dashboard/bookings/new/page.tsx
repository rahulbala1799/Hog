'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

function NewBookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [maxCapacity, setMaxCapacity] = useState(10)
  const [remainingCapacity, setRemainingCapacity] = useState<number | null>(null)
  
  const prefilledDate = searchParams.get('date') || ''
  const prefilledSession = searchParams.get('session') || ''

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    numberOfPeople: 1,
    sessionDate: prefilledDate,
    sessionTime: prefilledSession,
    status: 'PENDING',
    notes: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (formData.sessionDate && formData.sessionTime) {
      checkCapacity()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.sessionDate, formData.sessionTime])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setMaxCapacity(data.settings.maxPersonsPerClass)
      }
    } catch (err) {
      console.error('Failed to fetch settings')
    }
  }

  const checkCapacity = async () => {
    try {
      const response = await fetch(
        `/api/sessions/capacity?date=${formData.sessionDate}`
      )
      if (response.ok) {
        const data = await response.json()
        const session = data.sessions[0]
        if (session) {
          const capacity =
            formData.sessionTime === 'SESSION_1'
              ? session.session1
              : session.session2
          setRemainingCapacity(capacity.available)
        } else {
          setRemainingCapacity(maxCapacity)
        }
      }
    } catch (err) {
      console.error('Failed to check capacity')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard/calendar')
        router.refresh()
      } else {
        setError(data.error || 'Failed to create booking')
        setLoading(false)
      }
    } catch (err) {
      setError('Failed to create booking')
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePaxChange = (delta: number) => {
    const newValue = Math.max(1, formData.numberOfPeople + delta)
    if (remainingCapacity !== null && newValue <= remainingCapacity) {
      setFormData({ ...formData, numberOfPeople: newValue })
    } else if (remainingCapacity === null) {
      setFormData({ ...formData, numberOfPeople: newValue })
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
            <div>
              <h1 className="text-xl font-bold text-gray-900">New Booking</h1>
              <p className="text-xs text-gray-600">Add a class booking</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Student Information */}
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Student Information
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="studentName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Student Name *
                </label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  required
                  value={formData.studentName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                  placeholder="Enter student name"
                />
              </div>

              <div>
                <label
                  htmlFor="studentEmail"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="studentEmail"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="studentPhone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="studentPhone"
                  name="studentPhone"
                  value={formData.studentPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Session Details
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="sessionDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date *
                </label>
                <input
                  type="date"
                  id="sessionDate"
                  name="sessionDate"
                  required
                  value={formData.sessionDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                />
              </div>

              <div>
                <label
                  htmlFor="sessionTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Session *
                </label>
                <select
                  id="sessionTime"
                  name="sessionTime"
                  required
                  value={formData.sessionTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base bg-white"
                >
                  <option value="">Select a session</option>
                  <option value="SESSION_1">Session 1 (7:00 PM - 8:00 PM)</option>
                  <option value="SESSION_2">Session 2 (9:00 PM - 10:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of People (PAX) *
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handlePaxChange(-1)}
                    disabled={formData.numberOfPeople <= 1}
                    className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 font-bold text-xl hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <p className="text-3xl font-bold text-gray-900">
                      {formData.numberOfPeople}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formData.numberOfPeople === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePaxChange(1)}
                    disabled={
                      remainingCapacity !== null &&
                      formData.numberOfPeople >= remainingCapacity
                    }
                    className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                {remainingCapacity !== null && (
                  <p
                    className={`text-sm mt-2 text-center ${
                      remainingCapacity <= 3 ? 'text-orange-600' : 'text-gray-600'
                    }`}
                  >
                    {remainingCapacity > 0
                      ? `${remainingCapacity} spot${remainingCapacity !== 1 ? 's' : ''} remaining`
                      : 'Session is full'}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base bg-white"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base resize-none"
                  placeholder="Any special requirements or notes..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || remainingCapacity === 0}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <NewBookingForm />
    </Suspense>
  )
}
