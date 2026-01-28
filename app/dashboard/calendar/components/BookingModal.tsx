'use client'

import { useState, useEffect } from 'react'
import { SessionTime } from '@prisma/client'

interface ClassTiming {
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  onSuccess: () => void
}

export default function BookingModal({
  isOpen,
  onClose,
  selectedDate,
  onSuccess,
}: BookingModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [classTimings, setClassTimings] = useState<ClassTiming[]>([])
  const [maxCapacity, setMaxCapacity] = useState(10)
  const [remainingCapacity, setRemainingCapacity] = useState<{ [key: string]: number }>({})

  const [formData, setFormData] = useState({
    studentName: '',
    studentPhone: '',
    studentEmail: '',
    numberOfPeople: 1,
    sessionTime: '' as SessionTime | '',
    bookingType: 'REGULAR' as 'REGULAR' | 'GIFTS' | 'INFLUENCER',
    totalAmountPaid: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchSettings()
      fetchCapacity()
      // Reset form
      setFormData({
        studentName: '',
        studentPhone: '',
        studentEmail: '',
        numberOfPeople: 1,
        sessionTime: '',
        bookingType: 'REGULAR',
        totalAmountPaid: '',
      })
      setError('')
    }
  }, [isOpen, selectedDate])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setMaxCapacity(data.settings.maxPersonsPerClass)
        
        // Get class timings for the selected day
        const dayOfWeek = selectedDate.getDay()
        const timingsForDay = data.settings.classTimings.filter(
          (t: ClassTiming) => t.dayOfWeek === dayOfWeek
        )
        setClassTimings(timingsForDay)
      }
    } catch (err) {
      console.error('Failed to fetch settings')
    }
  }

  const fetchCapacity = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/sessions/capacity?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        const session = data.sessions[0]
        if (session) {
          setRemainingCapacity({
            SESSION_1: session.session1.available,
            SESSION_2: session.session2.available,
          })
        } else {
          setRemainingCapacity({
            SESSION_1: maxCapacity,
            SESSION_2: maxCapacity,
          })
        }
      }
    } catch (err) {
      console.error('Failed to fetch capacity')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.studentName || !formData.studentPhone || !formData.sessionTime) {
      setError('Name, Phone, and Time Slot are required')
      setLoading(false)
      return
    }

    // Check capacity
    const available = remainingCapacity[formData.sessionTime] || 0
    if (formData.numberOfPeople > available) {
      setError(`Only ${available} spot${available !== 1 ? 's' : ''} available for this session`)
      setLoading(false)
      return
    }

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
          studentName: formData.studentName,
          studentPhone: formData.studentPhone,
          studentEmail: formData.studentEmail || null,
          numberOfPeople: formData.numberOfPeople,
          sessionDate: dateStr,
          sessionTime: formData.sessionTime,
          bookingType: formData.bookingType,
          totalAmountPaid: formData.totalAmountPaid ? parseFloat(formData.totalAmountPaid) : null,
          status: 'CONFIRMED',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        setError(data.error || 'Failed to create booking')
        setLoading(false)
      }
    } catch (err) {
      setError('Failed to create booking')
      setLoading(false)
    }
  }

  const handlePaxChange = (delta: number) => {
    const newValue = Math.max(1, formData.numberOfPeople + delta)
    const available = formData.sessionTime ? remainingCapacity[formData.sessionTime] || 0 : maxCapacity
    if (newValue <= available) {
      setFormData({ ...formData, numberOfPeople: newValue })
    }
  }

  const getTimeSlotLabel = (sessionTime: SessionTime): string => {
    // Find matching timing from class timings
    const timing = classTimings.find((t) => {
      if (sessionTime === SessionTime.SESSION_1) {
        // Session 1 is typically 7-8pm (19:00-20:00)
        return t.startTime === '19:00' || t.startTime.startsWith('19:')
      } else {
        // Session 2 is typically 9-10pm (21:00-22:00)
        return t.startTime === '21:00' || t.startTime.startsWith('21:')
      }
    })

    if (timing) {
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
        return `${displayHour}:${minutes} ${ampm}`
      }
      return `${formatTime(timing.startTime)} - ${formatTime(timing.endTime)}`
    }

    // Fallback
    return sessionTime === SessionTime.SESSION_1
      ? '7:00 PM - 8:00 PM'
      : '9:00 PM - 10:00 PM'
  }

  if (!isOpen) return null

  const availableSession1 = remainingCapacity.SESSION_1 ?? maxCapacity
  const availableSession2 = remainingCapacity.SESSION_2 ?? maxCapacity

  // Calculate per person amount
  const totalAmount = formData.totalAmountPaid && formData.totalAmountPaid !== '' 
    ? parseFloat(formData.totalAmountPaid) 
    : 0
  const perPersonAmount = formData.numberOfPeople > 0 && totalAmount > 0 && !isNaN(totalAmount)
    ? totalAmount / formData.numberOfPeople
    : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Add Booking</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.studentName}
              onChange={(e) =>
                setFormData({ ...formData, studentName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
              placeholder="Enter name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.studentPhone}
              onChange={(e) =>
                setFormData({ ...formData, studentPhone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
              placeholder="+91 98765 43210"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.studentEmail}
              onChange={(e) =>
                setFormData({ ...formData, studentEmail: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
              placeholder="student@example.com"
            />
          </div>

          {/* Number of People */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Number of People *
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePaxChange(-1)}
                disabled={formData.numberOfPeople <= 1}
                className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 font-bold text-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-gray-900">
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
                  !formData.sessionTime ||
                  formData.numberOfPeople >=
                    (remainingCapacity[formData.sessionTime] || 0)
                }
                className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            {formData.sessionTime && (
              <p
                className={`text-xs mt-1.5 text-center ${
                  (remainingCapacity[formData.sessionTime] || 0) <= 3
                    ? 'text-orange-600'
                    : 'text-gray-600'
                }`}
              >
                {(remainingCapacity[formData.sessionTime] || 0) > 0
                  ? `${remainingCapacity[formData.sessionTime] || 0} spot${(remainingCapacity[formData.sessionTime] || 0) !== 1 ? 's' : ''} remaining`
                  : 'Session is full'}
              </p>
            )}
          </div>

          {/* Total Amount Paid */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Total Amount Paid (Optional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.totalAmountPaid}
              onChange={(e) =>
                setFormData({ ...formData, totalAmountPaid: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
              placeholder="0.00"
            />
            {totalAmount > 0 && formData.numberOfPeople > 0 && !isNaN(perPersonAmount) && (
              <p className="text-xs text-gray-600 mt-1.5 text-center">
                ₹{perPersonAmount.toFixed(2)} per person
              </p>
            )}
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Time Slot *
            </label>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, sessionTime: SessionTime.SESSION_1 })}
                disabled={availableSession1 === 0}
                className={`w-full p-2.5 rounded-lg border-2 transition-all text-left ${
                  formData.sessionTime === SessionTime.SESSION_1
                    ? 'border-purple-500 bg-purple-50'
                    : availableSession1 === 0
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {getTimeSlotLabel(SessionTime.SESSION_1)}
                  </span>
                  {availableSession1 === 0 ? (
                    <span className="text-xs text-red-600 font-medium">FULL</span>
                  ) : (
                    <span className="text-xs text-gray-600">
                      {availableSession1} available
                    </span>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, sessionTime: SessionTime.SESSION_2 })}
                disabled={availableSession2 === 0}
                className={`w-full p-2.5 rounded-lg border-2 transition-all text-left ${
                  formData.sessionTime === SessionTime.SESSION_2
                    ? 'border-purple-500 bg-purple-50'
                    : availableSession2 === 0
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {getTimeSlotLabel(SessionTime.SESSION_2)}
                  </span>
                  {availableSession2 === 0 ? (
                    <span className="text-xs text-red-600 font-medium">FULL</span>
                  ) : (
                    <span className="text-xs text-gray-600">
                      {availableSession2} available
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Booking Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Booking Type
            </label>
            <div className="flex gap-2">
              {(['REGULAR', 'GIFTS', 'INFLUENCER'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, bookingType: type })}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                    formData.bookingType === type
                      ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.sessionTime}
              className="flex-1 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
