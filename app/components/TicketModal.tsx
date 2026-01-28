'use client'

import { useState, useEffect } from 'react'

interface TicketModalProps {
  bookingId: string
  isOpen: boolean
  onClose: () => void
}

export default function TicketModal({ bookingId, isOpen, onClose }: TicketModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ticketData, setTicketData] = useState<{
    url: string
    filename: string
    issueNumber: string
    guestName: string
  } | null>(null)

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchTicket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bookingId])

  const fetchTicket = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/bookings/${bookingId}/ticket`)
      if (!response.ok) throw new Error('Failed to generate ticket')
      
      const data = await response.json()
      setTicketData(data)
    } catch (err) {
      setError('Failed to load ticket. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (ticketData) {
      const link = document.createElement('a')
      link.href = ticketData.url
      link.download = ticketData.filename
      link.click()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Admission Ticket</h2>
            {ticketData && (
              <p className="text-purple-100 text-sm mt-1">
                {ticketData.issueNumber} • {ticketData.guestName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p className="mt-6 text-gray-600 font-medium">Generating your ticket...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchTicket}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : ticketData ? (
            <div>
              {/* PDF Preview */}
              <div className="bg-gray-100 rounded-2xl overflow-hidden mb-6" style={{ height: '500px' }}>
                <iframe
                  src={ticketData.url}
                  className="w-full h-full"
                  title="Ticket Preview"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Ticket
                </button>
                <button
                  onClick={() => window.open(ticketData.url, '_blank')}
                  className="px-6 py-3.5 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
