'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewBookingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    classTypeId: '',
    classDate: '',
    classTime: '',
    status: 'PENDING',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Submit to API
    console.log('Form data:', formData)

    setTimeout(() => {
      setLoading(false)
      router.push('/dashboard/bookings')
    }, 1000)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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

          {/* Class Details */}
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Class Details
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="classTypeId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Class Type *
                </label>
                <select
                  id="classTypeId"
                  name="classTypeId"
                  required
                  value={formData.classTypeId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base bg-white"
                >
                  <option value="">Select a class type</option>
                  <option value="1">Beginner Makeup - ₹3000</option>
                  <option value="2">Advanced Techniques - ₹5000</option>
                  <option value="3">Bridal Makeup - ₹4500</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="classDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Date *
                  </label>
                  <input
                    type="date"
                    id="classDate"
                    name="classDate"
                    required
                    value={formData.classDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                  />
                </div>

                <div>
                  <label
                    htmlFor="classTime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Time *
                  </label>
                  <input
                    type="time"
                    id="classTime"
                    name="classTime"
                    required
                    value={formData.classTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                  />
                </div>
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
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </form>
      </main>
    </div>
  )
}
