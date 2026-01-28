'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { SessionTime, BookingStatus } from '@prisma/client'
import BookingModal from './BookingModal'

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

interface CalendarViewProps {
  viewMode: ViewMode
}

function CalendarViewContent({ viewMode }: CalendarViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  const [currentDate, setCurrentDate] = useState(
    dateParam ? new Date(dateParam) : new Date()
  )
  const [bookings, setBookings] = useState<Booking[]>([])
  const [capacities, setCapacities] = useState<SessionCapacity[]>([])
  const [maxCapacity, setMaxCapacity] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    if (dateParam) {
      setCurrentDate(new Date(dateParam))
    }
  }, [dateParam])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return 'bg-red-50 border-red-200'
  }

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getSessionBookings = (sessionTime: SessionTime): Booking[] => {
    const dateStr = formatDate(currentDate)
    return bookings.filter(
      (b) =>
        formatDate(new Date(b.sessionDate)) === dateStr &&
        b.sessionTime === sessionTime &&
        b.status !== BookingStatus.CANCELLED
    )
  }

  const getSessionCapacity = (sessionTime: SessionTime) => {
    const dateStr = formatDate(currentDate)
    const dayCapacity = capacities.find((c) => c.date === dateStr) || {
      date: dateStr,
      maxCapacity,
      session1: { booked: 0, available: maxCapacity, percentage: 0 },
      session2: { booked: 0, available: maxCapacity, percentage: 0 },
    }
    return sessionTime === SessionTime.SESSION_1 ? dayCapacity.session1 : dayCapacity.session2
  }

  const renderDailyView = () => {
    const session1Bookings = getSessionBookings(SessionTime.SESSION_1)
    const session2Bookings = getSessionBookings(SessionTime.SESSION_2)
    const session1Capacity = getSessionCapacity(SessionTime.SESSION_1)
    const session2Capacity = getSessionCapacity(SessionTime.SESSION_2)

    const totalBooked = session1Capacity.booked + session2Capacity.booked
    const totalCapacity = maxCapacity * 2
    const totalPercentage = Math.round((totalBooked / totalCapacity) * 100)

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
      <div className={`rounded-2xl border-2 overflow-hidden transition-all ${getCapacityBg(capacity.percentage)}`}>
        {/* Session Header - Clickable to view details */}
        <div
          onClick={() => router.push(`/dashboard/calendar/session?date=${formatDate(currentDate)}&session=${sessionTime}`)}
          className="p-5 cursor-pointer hover:bg-white/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-0.5">{time}</p>
            </div>
            <div className="flex items-center gap-2">
              {capacity.percentage === 100 ? (
                <span className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full">
                  FULL
                </span>
              ) : capacity.percentage === 0 ? (
                <span className="px-3 py-1.5 bg-gray-400 text-white text-xs font-bold rounded-full">
                  EMPTY
                </span>
              ) : (
                <span className={`px-3 py-1.5 ${
                  capacity.percentage <= 33 
                    ? 'bg-green-100 text-green-700'
                    : capacity.percentage <= 66
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-orange-100 text-orange-700'
                } text-xs font-bold rounded-full`}>
                  {capacity.available} LEFT
                </span>
              )}
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-3xl font-bold ${getCapacityColor(capacity.percentage)}`}>
                {capacity.booked}<span className="text-gray-400">/{maxCapacity}</span>
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                {capacity.percentage}% Full
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
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
        </div>

        {/* Bookings Preview */}
        {bookings.length > 0 ? (
          <div className="border-t-2 border-gray-200 bg-white/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                📋 {bookings.length} Booking{bookings.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => router.push(`/dashboard/calendar/session?date=${formatDate(currentDate)}&session=${sessionTime}`)}
                className="text-xs text-purple-600 font-medium hover:text-purple-700"
              >
                View All →
              </button>
            </div>
            <div className="space-y-2">
              {bookings.slice(0, 3).map((booking, index) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking.studentName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.studentPhone}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                      {booking.numberOfPeople} PAX
                    </span>
                  </div>
                </div>
              ))}
              {bookings.length > 3 && (
                <p className="text-xs text-center text-gray-500 pt-1">
                  +{bookings.length - 3} more booking{bookings.length - 3 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="border-t-2 border-gray-200 bg-white/30 p-4">
            <p className="text-sm text-gray-500 text-center">No bookings yet</p>
          </div>
        )}
      </div>
    )

    return (
      <div className="space-y-5">
        {/* Daily Summary Stats */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm opacity-90">Today's Total</p>
              <p className="text-4xl font-bold mt-1">
                {totalBooked}<span className="text-2xl opacity-75">/{totalCapacity}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Sessions</p>
              <p className="text-4xl font-bold mt-1">2</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${totalPercentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{totalPercentage}%</span>
          </div>
        </div>

        {/* Session Cards */}
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
      <div className="space-y-3">
        {days.map((day, index) => {
          const dateStr = formatDate(day)
          const capacity = capacities.find((c) => c.date === dateStr)
          const isToday = formatDate(new Date()) === dateStr
          const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))
          
          const session1Capacity = capacity?.session1 || { booked: 0, available: maxCapacity, percentage: 0 }
          const session2Capacity = capacity?.session2 || { booked: 0, available: maxCapacity, percentage: 0 }

          return (
            <div
              key={index}
              className={`p-4 rounded-2xl border-2 transition-all ${
                isToday 
                  ? 'border-purple-500 bg-purple-50' 
                  : isPast 
                  ? 'border-gray-200 bg-gray-50 opacity-60' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${isToday ? 'text-purple-700' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isToday ? 'text-purple-700' : 'text-gray-900'}`}>
                      {day.toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                    <p className="text-xs text-gray-600">
                      {day.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {isToday && (
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                    TODAY
                  </span>
                )}
              </div>

              {/* Sessions */}
              <div className="space-y-2">
                {/* Session 1 */}
                <div
                  onClick={() => router.push(`/dashboard/calendar/session?date=${dateStr}&session=${SessionTime.SESSION_1}`)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    session1Capacity.percentage === 100
                      ? 'bg-red-50 border-2 border-red-200'
                      : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          session1Capacity.percentage === 0
                            ? 'bg-gray-300'
                            : session1Capacity.percentage <= 33
                            ? 'bg-green-500'
                            : session1Capacity.percentage <= 66
                            ? 'bg-blue-500'
                            : session1Capacity.percentage < 100
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Session 1</p>
                        <p className="text-xs text-gray-600">7:00 PM - 8:00 PM</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getCapacityColor(session1Capacity.percentage)}`}>
                        {session1Capacity.booked}/{maxCapacity}
                      </p>
                      {session1Capacity.percentage === 100 && (
                        <p className="text-xs text-red-600 font-medium">FULL</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Session 2 */}
                <div
                  onClick={() => router.push(`/dashboard/calendar/session?date=${dateStr}&session=${SessionTime.SESSION_2}`)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    session2Capacity.percentage === 100
                      ? 'bg-red-50 border-2 border-red-200'
                      : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          session2Capacity.percentage === 0
                            ? 'bg-gray-300'
                            : session2Capacity.percentage <= 33
                            ? 'bg-green-500'
                            : session2Capacity.percentage <= 66
                            ? 'bg-blue-500'
                            : session2Capacity.percentage < 100
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Session 2</p>
                        <p className="text-xs text-gray-600">9:00 PM - 10:00 PM</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getCapacityColor(session2Capacity.percentage)}`}>
                        {session2Capacity.booked}/{maxCapacity}
                      </p>
                      {session2Capacity.percentage === 100 && (
                        <p className="text-xs text-red-600 font-medium">FULL</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderMonthlyView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
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
                  router.push(`/dashboard/calendar/daily?date=${dateStr}`)
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
                onClick={() => router.push(`/dashboard/calendar/${mode}`)}
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
          <div className="space-y-3">
            {/* Date Picker for Daily View */}
            {viewMode === 'daily' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={formatDate(currentDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setCurrentDate(new Date(e.target.value))
                    }
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2.5 bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-200 transition-colors"
                >
                  Today
                </button>
              </div>
            )}
            
            {/* Navigation Arrows */}
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

              <h2 className="text-base font-semibold text-gray-900 text-center">
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
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg flex items-center justify-center text-3xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
        title="Add New Booking"
      >
        +
      </button>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        selectedDate={currentDate}
        onSuccess={() => {
          fetchData()
          setShowBookingModal(false)
        }}
      />
    </div>
  )
}

export default function CalendarView({ viewMode }: CalendarViewProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    }>
      <CalendarViewContent viewMode={viewMode} />
    </Suspense>
  )
}
