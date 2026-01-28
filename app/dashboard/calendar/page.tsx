'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SessionTime, BookingStatus } from '@prisma/client'
import BookingModal from './components/BookingModal'

type ViewMode = 'daily' | 'weekly' | 'monthly'

interface Booking {
  id: string
  studentName: string
  studentEmail: string | null
  studentPhone: string | null
  numberOfPeople: number
  sessionDate: string
  sessionTime: SessionTime
  status: BookingStatus
  notes: string | null
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

interface SessionCapacity {
  date: string
  maxCapacity: number
  session1: {
    booked: number
    available: number
    percentage: number
  }
  session2: {
    booked: number
    available: number
    percentage: number
  }
}

export default function CalendarPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [capacities, setCapacities] = useState<SessionCapacity[]>([])
  const [maxCapacity, setMaxCapacity] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [currentDate, viewMode])

  const fetchData = async () => {
    setLoading(true)
    setError('')

    try {
      const dateStr = formatDate(currentDate)
      
      // Fetch bookings and capacity based on view mode
      let bookingsUrl = ''
      let capacityUrl = ''

      if (viewMode === 'daily') {
        bookingsUrl = `/api/bookings?date=${dateStr}`
        capacityUrl = `/api/sessions/capacity?date=${dateStr}`
      } else if (viewMode === 'weekly') {
        const { start, end } = getWeekRange(currentDate)
        bookingsUrl = `/api/bookings?startDate=${formatDate(start)}&endDate=${formatDate(end)}`
        capacityUrl = `/api/sessions/capacity?startDate=${formatDate(start)}&endDate=${formatDate(end)}`
      } else {
        const { start, end } = getMonthRange(currentDate)
        bookingsUrl = `/api/bookings?startDate=${formatDate(start)}&endDate=${formatDate(end)}`
        capacityUrl = `/api/sessions/capacity?startDate=${formatDate(start)}&endDate=${formatDate(end)}`
      }

      const [bookingsRes, capacityRes] = await Promise.all([
        fetch(bookingsUrl),
        fetch(capacityUrl),
      ])

      if (bookingsRes.ok && capacityRes.ok) {
        const bookingsData = await bookingsRes.json()
        const capacityData = await capacityRes.json()
        setBookings(bookingsData.bookings)
        setCapacities(capacityData.sessions)
        setMaxCapacity(capacityData.maxCapacity || 10)
      } else {
        setError('Failed to load calendar data')
      }
    } catch (err) {
      setError('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const getWeekRange = (date: Date) => {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
    const end = new Date(start)
    end.setDate(start.getDate() + 6) // End of week (Saturday)
    return { start, end }
  }

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return { start, end }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    if (viewMode === 'daily') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'weekly') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    
    setCurrentDate(newDate)
  }

  const getCapacityColor = (percentage: number): string => {
    if (percentage === 0) return 'text-gray-400'
    if (percentage <= 33) return 'text-green-600'
    if (percentage <= 66) return 'text-blue-600'
    if (percentage < 100) return 'text-orange-600'
    return 'text-red-600'
  }

  const getCapacityBg = (percentage: number): string => {
    if (percentage === 0) return 'bg-gray-50 border-gray-200'
    if (percentage <= 33) return 'bg-green-50 border-green-200'
    if (percentage <= 66) return 'bg-blue-50 border-blue-200'
    if (percentage < 100) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-300'
  }

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getSessionBookings = (sessionTime: SessionTime) => {
    const dateStr = formatDate(currentDate)
    return bookings.filter(
      (b) =>
        b.sessionDate.split('T')[0] === dateStr &&
        b.sessionTime === sessionTime &&
        b.status !== BookingStatus.CANCELLED
    )
  }

  const getSessionCapacity = (sessionTime: SessionTime) => {
    const dateStr = formatDate(currentDate)
    const capacity = capacities.find((c) => c.date === dateStr)
    
    if (!capacity) {
      return { booked: 0, available: maxCapacity, percentage: 0 }
    }
    
    return sessionTime === SessionTime.SESSION_1 ? capacity.session1 : capacity.session2
  }

  const renderDailyView = () => {
    const session1Bookings = getSessionBookings(SessionTime.SESSION_1)
    const session2Bookings = getSessionBookings(SessionTime.SESSION_2)
    const session1Capacity = getSessionCapacity(SessionTime.SESSION_1)
    const session2Capacity = getSessionCapacity(SessionTime.SESSION_2)

    const SessionCard = ({
      title,
      time,
      sessionTime,
      bookings,
      capacity,
    }: {
      title: string
      time: string
      sessionTime: SessionTime
      bookings: Booking[]
      capacity: { booked: number; available: number; percentage: number }
    }) => (
      <div
        onClick={() => router.push(`/dashboard/calendar/session?date=${formatDate(currentDate)}&session=${sessionTime}`)}
        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg ${getCapacityBg(capacity.percentage)}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{time}</p>
          </div>
          {capacity.percentage === 100 && (
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
              FULL
            </span>
          )}
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-2xl font-bold ${getCapacityColor(capacity.percentage)}`}>
              {capacity.booked}/{maxCapacity}
            </span>
            <span className="text-sm text-gray-600">Booked</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all ${
                capacity.percentage === 0
                  ? 'bg-gray-400'
                  : capacity.percentage <= 33
                  ? 'bg-green-600'
                  : capacity.percentage <= 66
                  ? 'bg-blue-600'
                  : capacity.percentage < 100
                  ? 'bg-orange-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${capacity.percentage}%` }}
            />
          </div>
        </div>

        {bookings.length > 0 && (
          <div className="text-sm text-gray-700">
            <p className="font-medium">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    )

    return (
      <div className="space-y-4">
        <SessionCard
          title="🌙 Session 1"
          time="7:00 PM - 8:00 PM"
          sessionTime={SessionTime.SESSION_1}
          bookings={session1Bookings}
          capacity={session1Capacity}
        />
        <SessionCard
          title="🌙 Session 2"
          time="9:00 PM - 10:00 PM"
          sessionTime={SessionTime.SESSION_2}
          bookings={session2Bookings}
          capacity={session2Capacity}
        />
      </div>
    )
  }

  const renderWeeklyView = () => {
    const { start } = getWeekRange(currentDate)
    const days = []
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }

    return (
      <div className="overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {days.map((day, index) => {
            const dateStr = formatDate(day)
            const capacity = capacities.find((c) => c.date === dateStr)
            const isToday = formatDate(new Date()) === dateStr

            return (
              <div
                key={index}
                onClick={() => setCurrentDate(day)}
                className={`flex-shrink-0 w-24 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <p className="text-xs text-gray-600 font-medium">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 my-1">{day.getDate()}</p>
                  
                  {/* Session 1 */}
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        !capacity || capacity.session1.percentage === 0
                          ? 'bg-gray-300'
                          : capacity.session1.percentage <= 33
                          ? 'bg-green-500'
                          : capacity.session1.percentage <= 66
                          ? 'bg-blue-500'
                          : capacity.session1.percentage < 100
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <span className="text-xs text-gray-700">
                      {capacity?.session1.booked || 0}
                    </span>
                  </div>
                  
                  {/* Session 2 */}
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        !capacity || capacity.session2.percentage === 0
                          ? 'bg-gray-300'
                          : capacity.session2.percentage <= 33
                          ? 'bg-green-500'
                          : capacity.session2.percentage <= 66
                          ? 'bg-blue-500'
                          : capacity.session2.percentage < 100
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <span className="text-xs text-gray-700">
                      {capacity?.session2.booked || 0}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMonthlyView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDay = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return (
      <div>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="aspect-square" />
            }

            const date = new Date(year, month, day)
            const dateStr = formatDate(date)
            const capacity = capacities.find((c) => c.date === dateStr)
            const isToday = formatDate(new Date()) === dateStr

            return (
              <div
                key={index}
                onClick={() => {
                  setCurrentDate(date)
                  setViewMode('daily')
                }}
                className={`aspect-square p-1 rounded-lg border cursor-pointer transition-all ${
                  isToday
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{day}</p>
                  {capacity && (
                    <div className="flex justify-center gap-0.5 mt-1">
                      {capacity.session1.booked > 0 && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            capacity.session1.percentage <= 33
                              ? 'bg-green-500'
                              : capacity.session1.percentage <= 66
                              ? 'bg-blue-500'
                              : capacity.session1.percentage < 100
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          }`}
                        />
                      )}
                      {capacity.session2.booked > 0 && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            capacity.session2.percentage <= 33
                              ? 'bg-green-500'
                              : capacity.session2.percentage <= 66
                              ? 'bg-blue-500'
                              : capacity.session2.percentage < 100
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          }`}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
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
              <h1 className="text-xl font-bold text-gray-900">Calendar</h1>
              <p className="text-xs text-gray-600">View and manage bookings</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 mb-4">
            {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-700"
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

            <h2 className="text-base font-semibold text-gray-900">
              {viewMode === 'daily'
                ? formatDateDisplay(currentDate)
                : viewMode === 'weekly'
                ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>

            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-700"
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
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading calendar...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : (
          <>
            {viewMode === 'daily' && renderDailyView()}
            {viewMode === 'weekly' && renderWeeklyView()}
            {viewMode === 'monthly' && renderMonthlyView()}
          </>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowBookingModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all transform hover:scale-110"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        selectedDate={currentDate}
        onSuccess={() => {
          fetchData()
        }}
      />
    </div>
  )
}
