'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ReportsPage() {
  const router = useRouter()
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month')

  // Mock data - replace with actual data from API
  const stats = {
    revenue: 0,
    bookings: 0,
    expenses: 0,
    profit: 0,
    previousRevenue: 0,
    previousBookings: 0,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const revenueChange = calculateChange(stats.revenue, stats.previousRevenue)
  const bookingsChange = calculateChange(stats.bookings, stats.previousBookings)

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
              <h1 className="text-xl font-bold text-gray-900">Reports</h1>
              <p className="text-xs text-gray-600">Analytics & insights</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        {/* Period Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'week' as const, label: 'This Week' },
            { value: 'month' as const, label: 'This Month' },
            { value: 'quarter' as const, label: 'This Quarter' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                period === p.value
                  ? 'bg-[#8B7355] text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Revenue Card */}
        <div className="card p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.revenue)}
              </div>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          {revenueChange !== 0 && (
            <div className={`text-sm font-medium ${revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueChange > 0 ? '↑' : '↓'} {Math.abs(revenueChange).toFixed(1)}% from last period
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-5">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.bookings}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
            {bookingsChange !== 0 && (
              <div className={`text-xs font-medium mt-2 ${bookingsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {bookingsChange > 0 ? '↑' : '↓'} {Math.abs(bookingsChange).toFixed(1)}%
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="text-3xl mb-2">💸</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(stats.expenses)}
            </div>
            <div className="text-sm text-gray-600">Total Expenses</div>
          </div>

          <div className="col-span-2 card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Net Profit</div>
                <div className={`text-3xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.profit)}
                </div>
              </div>
              <div className="text-4xl">
                {stats.profit >= 0 ? '📈' : '📉'}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trend
          </h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm text-gray-600">Chart coming soon</p>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expense Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { category: 'Art Supplies', amount: 0, icon: '🎨', color: 'bg-purple-100' },
              { category: 'Rent', amount: 0, icon: '🏠', color: 'bg-blue-100' },
              { category: 'Marketing', amount: 0, icon: '📢', color: 'bg-pink-100' },
              { category: 'Other', amount: 0, icon: '📦', color: 'bg-gray-100' },
            ].map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {item.category}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <button className="w-full btn-primary">
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Report
          </div>
        </button>
      </main>
    </div>
  )
}
