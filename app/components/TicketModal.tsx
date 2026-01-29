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
    pdfUrl: string
    previewUrl: string
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
      const response = await fetch(`/api/bookings/${bookingId}/ticket?format=preview`)
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
      link.href = ticketData.pdfUrl
      link.download = ticketData.filename
      link.click()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">Your Ticket</h2>
            {ticketData && (
              <p className="text-purple-100 text-xs sm:text-sm mt-1 truncate">
                {ticketData.issueNumber}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0 ml-2"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 flex-1">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-200 rounded-full"></div>
                <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p className="mt-4 sm:mt-6 text-gray-600 font-medium text-sm sm:text-base">Generating your ticket...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 flex-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-medium text-sm sm:text-base text-center px-4">{error}</p>
              <button
                onClick={fetchTicket}
                className="mt-4 px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : ticketData ? (
            <div className="flex flex-col flex-1">
              {/* PDF Preview - perfectly scaled */}
              <div className="flex-1 bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-2">
                <div className="w-full h-full flex items-center justify-center">
                  <iframe
                    src={`${ticketData.previewUrl}#view=Fit&toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
                    className="w-full h-full border-0 rounded-lg"
                    title="Ticket Preview"
                    style={{
                      minHeight: '450px',
                      maxHeight: '600px',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => window.open(ticketData.pdfUrl, '_blank')}
                  className="px-4 sm:px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="hidden sm:inline">Open</span>
                  <span className="sm:hidden">View</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
