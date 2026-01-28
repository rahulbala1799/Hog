'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { SessionTime, BookingStatus } from '@prisma/client'
import BookingModal from '../components/BookingModal'

interface Booking {
  id: string
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
              <h1 className="text-xl font-bold text-gray-900">Session Details</h1>
              <p className="text-xs text-gray-600">{formatDate(date)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading session...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : (
          <>
            {/* Session Info */}
            <div className="card p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">🌙 {getSessionTitle()}</h2>
                  <p className="text-sm text-gray-600">{getSessionTime()}</p>
                </div>
                {capacity.percentage === 100 && (
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                    FULL
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Capacity</span>
                  <span className={`text-2xl font-bold ${getCapacityColor(capacity.percentage)}`}>
                    {capacity.booked} / {capacity.maxCapacity}
                  </span>
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
                <p className="text-xs text-gray-500 mt-2">
                  {capacity.available} spot{capacity.available !== 1 ? 's' : ''} remaining
                </p>
              </div>
            </div>

            {/* Bookings List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bookings ({bookings.length})
              </h3>

              {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This session is available for booking
                  </p>
                  <button
                    onClick={() => router.push(`/dashboard/bookings/new?date=${date}&session=${session}`)}
                    className="btn-primary"
                  >
                    + Add Booking
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="card p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{booking.studentName}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === BookingStatus.CONFIRMED
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === BookingStatus.PENDING
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : booking.status === BookingStatus.COMPLETED
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          {booking.studentEmail && (
                            <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {booking.studentEmail}
                            </p>
                          )}

                          {booking.studentPhone && (
                            <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {booking.studentPhone}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">PAX:</span> {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}
                            </p>
                            {booking.totalAmountPaid && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Amount:</span> ₹{booking.totalAmountPaid.toFixed(2)}
                                {booking.numberOfPeople > 1 && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    (₹{(booking.totalAmountPaid / booking.numberOfPeople).toFixed(2)}/person)
                                  </span>
                                )}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Booked: {formatCreatedDate(booking.createdAt)}
                            </p>
                          </div>

                          {booking.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              Note: {booking.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditBooking(booking)}
                            className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit booking"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(booking.id)}
                            className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete booking"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/dashboard/bookings/new?date=${date}&session=${session}`)}
                className="w-full btn-primary"
                disabled={capacity.percentage === 100}
              >
                + Add Booking to Session
              </button>
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
