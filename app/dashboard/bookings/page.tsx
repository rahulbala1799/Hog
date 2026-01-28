'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BookingStatus, SessionTime } from '@prisma/client'
import BookingModal from '../calendar/components/BookingModal'

interface Booking {
  id: string
  studentName: string
  studentEmail: string | null
  studentPhone: string | null
  numberOfPeople: number
  sessionDate: string
  sessionTime: SessionTime
  totalAmountPaid: number | null
  status: BookingStatus
  createdAt: string
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('All')
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [filter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      let url = '/api/bookings'
      if (filter !== 'All') {
        url += `?status=${filter.toUpperCase()}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusClass = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-100 text-green-800'
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case BookingStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800'
      case BookingStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getSessionTimeLabel = (sessionTime: SessionTime) => {
    return sessionTime === SessionTime.SESSION_1 ? '7:00 PM - 8:00 PM' : '9:00 PM - 10:00 PM'
  }

  const filteredBookings = filter === 'All' 
    ? bookings 
    : bookings.filter(b => b.status === filter.toUpperCase())

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
              <h1 className="text-xl font-bold text-gray-900">Bookings</h1>
              <p className="text-xs text-gray-600">Manage class bookings</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        {/* Add New Booking Card */}
        <div 
          onClick={() => setShowBookingModal(true)}
          className="card-interactive bg-gradient-to-br from-purple-600 to-pink-600 p-5 mb-6 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">+</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Add New Booking
                </h2>
                <p className="text-sm text-white/80 mt-0.5">
                  Create a new class booking
                </p>
              </div>
            </div>
            <svg
              className="w-6 h-6 text-white/80"
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

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === filterOption
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No bookings {filter !== 'All' ? `(${filter})` : ''}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {filter === 'All' 
                ? 'Start by adding your first booking from the calendar'
                : `No ${filter.toLowerCase()} bookings found`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => router.push(`/dashboard/calendar/session?date=${booking.sessionDate.split('T')[0]}&session=${booking.sessionTime}`)}
                className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {booking.studentName}
                    </h3>
                    {booking.studentEmail && (
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.studentEmail}
                      </p>
                    )}
                    {booking.studentPhone && (
                      <p className="text-sm text-gray-600">
                        {booking.studentPhone}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{formatDate(booking.sessionDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{getSessionTimeLabel(booking.sessionTime)}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-700">
                    <span>
                      <span className="font-medium">PAX:</span> {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}
                    </span>
                    {booking.totalAmountPaid && (
                      <span>
                        <span className="font-medium">Amount:</span> ₹{booking.totalAmountPaid.toFixed(2)}
                        {booking.numberOfPeople > 1 && (
                          <span className="text-xs text-gray-500 ml-1">
                            (₹{(booking.totalAmountPaid / booking.numberOfPeople).toFixed(2)}/person)
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        selectedDate={new Date()}
        onSuccess={() => {
          fetchBookings()
          setShowBookingModal(false)
        }}
      />
    </div>
  )
}
