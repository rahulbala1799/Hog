'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewExpensePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: '',
  })

  const categories = [
    { value: 'ART_SUPPLIES', label: '🎨 Art Supplies', color: 'bg-purple-100' },
    { value: 'RENT', label: '🏠 Rent', color: 'bg-blue-100' },
    { value: 'MARKETING', label: '📢 Marketing', color: 'bg-pink-100' },
    { value: 'UTILITIES', label: '💡 Utilities', color: 'bg-yellow-100' },
    { value: 'STAFF', label: '👥 Staff', color: 'bg-green-100' },
    { value: 'EQUIPMENT', label: '🔧 Equipment', color: 'bg-orange-100' },
    { value: 'OTHER', label: '📦 Other', color: 'bg-gray-100' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Submit to API
    console.log('Form data:', formData)

    setTimeout(() => {
      setLoading(false)
      router.push('/dashboard/expenses')
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
              <h1 className="text-xl font-bold text-gray-900">New Expense</h1>
              <p className="text-xs text-gray-600">Record an expense</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.category === cat.value
                      ? 'border-[#8B7355] bg-[#8B7355]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Expense Details */}
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Expense Details
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                    ₹
                  </span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    required
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                  placeholder="What was this expense for?"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent outline-none transition text-base"
                />
              </div>
            </div>
          </div>

          {/* Receipt Upload (Optional) */}
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Receipt (Optional)
            </h2>
            <button
              type="button"
              className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">📸</div>
                <div className="text-sm font-medium text-gray-700">
                  Tap to upload receipt
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 10MB
                </div>
              </div>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Saving Expense...' : 'Save Expense'}
          </button>
        </form>
      </main>
    </div>
  )
}
