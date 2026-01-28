'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { SessionTime, BookingStatus } from '@prisma/client'
import BookingModal from '../components/BookingModal'

interface Booking {
  id: string
  issueNumber: string
  studentName: string
  studentEmail: string | null
  studentPhone: string | null
  numberOfPeople: number
  sessionDate: string
  sessionTime: SessionTime
  totalAmountPaid: number | null
  bookingType?: string
  status: BookingStatus
  notes: string | null
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

function SessionDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const date = searchParams.get('date')
  const session = searchParams.get('session') as SessionTime

  const [bookings, setBookings] = useState<Booking[]>([])
  const [capacity, setCapacity] = useState({ booked: 0, available: 0, percentage: 0, maxCapacity: 10 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editBooking, setEditBooking] = useState<Booking | null>(null)
  const [showAddBookingModal, setShowAddBookingModal] = useState(false)

  const fetchSessionData = async () => {
    setLoading(true)
    setError('')

    try {
      const [bookingsRes, capacityRes] = await Promise.all([
        fetch(`/api/bookings?date=${date}&sessionTime=${session}`),
        fetch(`/api/sessions/capacity?date=${date}`),
      ])

      if (bookingsRes.ok && capacityRes.ok) {
        const bookingsData = await bookingsRes.json()
        const capacityData = await capacityRes.json()
        
        const filteredBookings = bookingsData.bookings.filter(
          (b: Booking) => b.status !== BookingStatus.CANCELLED
        )
        setBookings(filteredBookings)

        const sessionCapacity = capacityData.sessions[0]
        if (sessionCapacity) {
          const cap = session === SessionTime.SESSION_1 
            ? sessionCapacity.session1 
            : sessionCapacity.session2
          setCapacity({
            ...cap,
            maxCapacity: capacityData.maxCapacity || 10,
          })
        } else {
          // If no capacity data, use maxCapacity from response
          setCapacity({
            booked: 0,
            available: capacityData.maxCapacity || 10,
            percentage: 0,
            maxCapacity: capacityData.maxCapacity || 10,
          })
        }
      } else {
        setError('Failed to load session data')
      }
    } catch (err) {
      setError('Failed to load session data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (date && session) {
      fetchSessionData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, session])

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDeleteConfirm(null)
        fetchSessionData() // Refresh data
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete booking')
      }
    } catch (err) {
      alert('Failed to delete booking')
    }
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCreatedDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getSessionTitle = () => {
    return session === SessionTime.SESSION_1 ? 'Session 1' : 'Session 2'
  }

  const getSessionTime = () => {
    return session === SessionTime.SESSION_1 ? '7:00 PM - 8:00 PM' : '9:00 PM - 10:00 PM'
  }

  const getCapacityColor = (percentage: number): string => {
    if (percentage === 0) return 'text-gray-400'
    if (percentage <= 33) return 'text-green-600'
    if (percentage <= 66) return 'text-blue-600'
    if (percentage < 100) return 'text-orange-600'
    return 'text-red-600'
  }

  if (!date || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid session parameters</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Artistic Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0tNiAwaDJ2LTJoLTJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all border border-white/30"
            >
              <svg
                className="w-6 h-6 text-white"
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
              <h1 className="text-2xl font-bold text-white">🌙 {getSessionTitle()}</h1>
              <p className="text-sm text-white/90 font-medium">{formatDate(date)}</p>
            </div>
          </div>

          {/* Session Time & Capacity Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-white/80 font-medium">Time</span>
              </div>
              <div className="text-lg font-bold text-white">{getSessionTime()}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs text-white/80 font-medium">Capacity</span>
              </div>
              <div className="text-lg font-bold text-white">{capacity.booked}/{capacity.maxCapacity}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        {loading ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-300 opacity-20"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading session...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">⚠️</span>
            </div>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : (
          <>
            {/* Capacity Card */}
            <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Class Capacity</h2>
                {capacity.percentage === 100 ? (
                  <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-xl shadow-lg">
                    FULL
                  </span>
                ) : capacity.percentage >= 80 ? (
                  <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-xl shadow-lg">
                    ALMOST FULL
                  </span>
                ) : (
                  <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg">
                    AVAILABLE
                  </span>
                )}
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 font-medium">Current Capacity</span>
                  <span className={`text-4xl font-bold ${getCapacityColor(capacity.percentage)}`}>
                    {capacity.booked}<span className="text-2xl text-gray-400">/{capacity.maxCapacity}</span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all ${
                      capacity.percentage === 0
                        ? 'bg-gray-400'
                        : capacity.percentage <= 33
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : capacity.percentage <= 66
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : capacity.percentage < 100
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${capacity.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm text-gray-600">
                    {capacity.available} spot{capacity.available !== 1 ? 's' : ''} remaining
                  </p>
                  <p className="text-sm font-bold text-gray-700">
                    {capacity.percentage}% Full
                  </p>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Bookings ({bookings.length})
                </h3>
                <button
                  onClick={() => setShowAddBookingModal(true)}
                  disabled={capacity.percentage === 100}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  + Add Booking
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-5xl">📅</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    This session is available for booking
                  </p>
                  <button
                    onClick={() => setShowAddBookingModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95"
                  >
                    + Add First Booking
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking, index) => (
                    <div
                      key={booking.id}
                      className="relative bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Status indicator bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        booking.status === 'CONFIRMED' ? 'bg-gradient-to-b from-green-400 to-green-600' :
                        booking.status === 'PENDING' ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' :
                        booking.status === 'COMPLETED' ? 'bg-gradient-to-b from-blue-400 to-blue-600' :
                        'bg-gradient-to-b from-gray-400 to-gray-600'
                      }`}></div>

                      <div className="pl-3">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="px-2.5 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold rounded-lg">
                                {booking.issueNumber}
                              </span>
                              <h4 className="text-lg font-bold text-gray-900 truncate">{booking.studentName}</h4>
                              <span className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap ${
                                booking.status === BookingStatus.CONFIRMED
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === BookingStatus.PENDING
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : booking.status === BookingStatus.COMPLETED
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {booking.studentPhone && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {booking.studentPhone}
                                </p>
                              )}
                              {booking.studentEmail && (
                                <p className="text-sm text-gray-600 flex items-center gap-2 truncate">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {booking.studentEmail}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 ml-3">
                            <button
                              onClick={() => window.open(`/api/bookings/${booking.id}/ticket`, '_blank')}
                              className="p-2.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                              title="Generate ticket"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditBooking(booking)}
                              className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Edit booking"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(booking.id)}
                              className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete booking"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">People</p>
                              <p className="text-sm font-bold text-gray-900">{booking.numberOfPeople} PAX</p>
                            </div>
                          </div>

                          {booking.totalAmountPaid ? (
                            <div className="text-right">
                              <p className="text-xs text-gray-500 font-medium">Amount</p>
                              <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                ₹{booking.totalAmountPaid > 999 ? `${(booking.totalAmountPaid / 1000).toFixed(1)}k` : booking.totalAmountPaid.toFixed(0)}
                              </p>
                              {booking.numberOfPeople > 1 && (
                                <p className="text-xs text-gray-500">
                                  ₹{(booking.totalAmountPaid / booking.numberOfPeople).toFixed(0)}/person
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-right">
                              <p className="text-xs text-gray-500 font-medium">Booked</p>
                              <p className="text-sm font-semibold text-gray-900">{formatCreatedDate(booking.createdAt)}</p>
                            </div>
                          )}
                        </div>

                        {booking.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500 font-medium mb-1">Note</p>
                            <p className="text-sm text-gray-700 italic">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Booking?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this booking? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBooking(deleteConfirm)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddBookingModal && (
        <BookingModal
          isOpen={showAddBookingModal}
          onClose={() => setShowAddBookingModal(false)}
          selectedDate={date ? new Date(date) : new Date()}
          initialSessionTime={session}
          onSuccess={() => {
            fetchSessionData()
            setShowAddBookingModal(false)
          }}
        />
      )}

      {/* Edit Booking Modal */}
      {editBooking && (
        <BookingModal
          isOpen={!!editBooking}
          onClose={() => setEditBooking(null)}
          selectedDate={new Date(editBooking.sessionDate)}
          booking={editBooking}
          onSuccess={() => {
            fetchSessionData()
            setEditBooking(null)
          }}
        />
      )}
    </div>
  )
}

export default function SessionDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SessionDetailContent />
    </Suspense>
  )
}
