'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { BookingStatus, SessionTime } from '@prisma/client'
import BookingModal from '../calendar/components/BookingModal'
import TicketModal from '@/app/components/TicketModal'

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
  status: BookingStatus
  createdAt: string
}

interface PaginationInfo {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('All')
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(30)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [ticketBookingId, setTicketBookingId] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('STAFF')

  // Fetch user role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUserRole(data.user.role)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  const isStaff = userRole === 'STAFF'

  useEffect(() => {
    // Reset to page 1 when filter, debouncedSearch, or pageSize changes
    setPage(1)
    fetchBookings(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, debouncedSearch, pageSize])

  useEffect(() => {
    // Fetch when page changes
    fetchBookings(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const fetchBookings = async (currentPage: number = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'All') {
        params.append('status', filter.toUpperCase())
      }
      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim())
      }
      params.append('page', currentPage.toString())
      params.append('pageSize', pageSize.toString())
      
      const url = `/api/bookings?${params.toString()}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
        setPagination(data.pagination || null)
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Set new timeout for debounce (500ms)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value)
    }, 500)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50">
      {/* Artistic Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600"></div>
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
              <h1 className="text-2xl font-bold text-white">Bookings</h1>
              <p className="text-sm text-white/90 font-medium">Manage class bookings</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
              <div className="text-2xl font-bold text-white">{pagination?.totalCount || bookings.length}</div>
              <div className="text-xs text-white/90 font-medium mt-0.5">{filter === 'All' ? 'Total' : filter} Bookings</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30">
              <div className="text-2xl font-bold text-white">
                {bookings.reduce((sum, b) => sum + b.numberOfPeople, 0)}
              </div>
              <div className="text-xs text-white/90 font-medium mt-0.5">People (Current Page)</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        {/* Add New Booking Card */}
        <div 
          onClick={() => setShowBookingModal(true)}
          className="relative bg-white rounded-3xl p-5 mb-6 cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white font-bold">+</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Add New Booking
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Create a new class booking
                </p>
              </div>
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone, or issue number..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400 shadow-sm"
            />
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
            )}
          </div>
        </div>

        {/* Filter Tabs and Page Size Selector */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
            {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  filter === filterOption
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>
          
          {/* Page Size Selector */}
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border-2 border-gray-200">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-transparent border-none outline-none text-sm font-semibold text-gray-900 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-300 opacity-20"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">📅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No bookings {filter !== 'All' ? `(${filter})` : search ? 'found' : 'yet'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {search 
                ? `No bookings found matching "${search}"`
                : filter === 'All' 
                  ? 'Start by adding your first booking'
                  : `No ${filter.toLowerCase()} bookings found`}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {bookings.map((booking, index) => (
              <div
                key={booking.id}
                onClick={() => router.push(`/dashboard/calendar/session?date=${booking.sessionDate.split('T')[0]}&session=${booking.sessionTime}`)}
                className="relative bg-white rounded-3xl p-5 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group"
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
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {booking.studentName}
                      </h3>
                      <div className="flex flex-col gap-1 mt-1">
                        {booking.studentPhone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {booking.studentPhone}
                          </p>
                        )}
                        {booking.studentEmail && (
                          <p className="text-sm text-gray-600 truncate flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {booking.studentEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ml-2 ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-2xl p-3">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium">Date</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(booking.sessionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-3">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium">Time</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {booking.sessionTime === SessionTime.SESSION_1 ? '7-8 PM' : '9-10 PM'}
                      </p>
                    </div>
                  </div>

                  {/* PAX and Amount */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">People</p>
                        <p className="text-sm font-bold text-gray-900">{booking.numberOfPeople} PAX</p>
                      </div>
                    </div>
                    
                    {!isStaff && booking.totalAmountPaid && (
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
                    )}
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">
                      {((pagination.page - 1) * pagination.pageSize) + 1}
                    </span> to{' '}
                    <span className="font-semibold text-gray-900">
                      {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
                    </span> of{' '}
                    <span className="font-semibold text-gray-900">{pagination.totalCount}</span> bookings
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        pagination.hasPreviousPage
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum: number
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i
                        } else {
                          pageNum = pagination.page - 2 + i
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                              pageNum === pagination.page
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.hasNextPage}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        pagination.hasNextPage
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
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

      {/* Ticket Modal */}
      {ticketBookingId && (
        <TicketModal
          bookingId={ticketBookingId}
          isOpen={!!ticketBookingId}
          onClose={() => setTicketBookingId(null)}
        />
      )}
    </div>
  )
}
