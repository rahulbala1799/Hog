'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ReportData {
  // Revenue
  totalRevenue: number
  monthRevenue: number
  weekRevenue: number
  avgBookingValue: number
  revenueByType: { type: string; amount: number; count: number }[]
  
  // Bookings
  totalBookings: number
  monthBookings: number
  weekBookings: number
  todayBookings: number
  capacityUtilization: number
  bookingsBySession: { session: string; count: number; pax: number }[]
  
  // Inventory
  totalInventoryValue: number
  lowStockCount: number
  inventoryItems: number
  
  // Expenses
  totalExpenses: number
  monthExpenses: number
  expensesByCategory: { category: string; amount: number; count: number }[]
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReportData | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')

  useEffect(() => {
    fetchReportData()
  }, [timeRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const [bookingsRes, inventoryRes, expensesRes, settingsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/inventory'),
        fetch('/api/expenses'),
        fetch('/api/settings'),
      ])

      const bookings = bookingsRes.ok ? (await bookingsRes.json()).bookings || [] : []
      const inventory = inventoryRes.ok ? await inventoryRes.json() : []
      const expenses = expensesRes.ok ? await expensesRes.json() : []
      const settings = settingsRes.ok ? await settingsRes.json() : { maxPersonsPerClass: 15 }

      // Calculate date ranges
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - 7)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfToday = new Date(now)
      startOfToday.setHours(0, 0, 0, 0)

      // Filter bookings
      const confirmedBookings = bookings.filter((b: any) => b.status !== 'CANCELLED')
      const monthBookings = confirmedBookings.filter((b: any) => new Date(b.sessionDate) >= startOfMonth)
      const weekBookings = confirmedBookings.filter((b: any) => new Date(b.sessionDate) >= startOfWeek)
      const todayBookings = confirmedBookings.filter((b: any) => {
        const bookingDate = new Date(b.sessionDate)
        return bookingDate >= startOfToday && bookingDate < new Date(startOfToday.getTime() + 86400000)
      })

      // Revenue calculations
      const totalRevenue = confirmedBookings.reduce((sum: number, b: any) => sum + (b.totalAmountPaid || 0), 0)
      const monthRevenue = monthBookings.reduce((sum: number, b: any) => sum + (b.totalAmountPaid || 0), 0)
      const weekRevenue = weekBookings.reduce((sum: number, b: any) => sum + (b.totalAmountPaid || 0), 0)
      const avgBookingValue = confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0

      // Revenue by type
      const revenueByType = ['REGULAR', 'GIFTS', 'INFLUENCER'].map(type => {
        const typeBookings = confirmedBookings.filter((b: any) => b.bookingType === type)
        return {
          type,
          amount: typeBookings.reduce((sum: number, b: any) => sum + (b.totalAmountPaid || 0), 0),
          count: typeBookings.length,
        }
      })

      // Bookings by session
      const bookingsBySession = ['SESSION_1', 'SESSION_2'].map(session => {
        const sessionBookings = confirmedBookings.filter((b: any) => b.sessionTime === session)
        return {
          session: session === 'SESSION_1' ? '7-8 PM' : '9-10 PM',
          count: sessionBookings.length,
          pax: sessionBookings.reduce((sum: number, b: any) => sum + (b.numberOfPeople || 0), 0),
        }
      })

      // Capacity utilization
      const totalCapacity = confirmedBookings.length * settings.maxPersonsPerClass
      const totalPax = confirmedBookings.reduce((sum: number, b: any) => sum + (b.numberOfPeople || 0), 0)
      const capacityUtilization = totalCapacity > 0 ? (totalPax / totalCapacity) * 100 : 0

      // Inventory calculations
      const totalInventoryValue = inventory.reduce((sum: number, item: any) => 
        sum + (item.currentStock * item.currentCost), 0
      )
      const lowStockCount = inventory.filter((item: any) => 
        item.reorderLevel && item.currentStock <= item.reorderLevel
      ).length

      // Expense calculations
      const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0)
      const monthExpenses = expenses
        .filter((e: any) => new Date(e.date) >= startOfMonth)
        .reduce((sum: number, e: any) => sum + e.amount, 0)

      // Expenses by category
      const categoryMap = new Map()
      expenses.forEach((e: any) => {
        const cat = e.category?.name || 'Uncategorized'
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { category: cat, amount: 0, count: 0 })
        }
        const entry = categoryMap.get(cat)
        entry.amount += e.amount
        entry.count += 1
      })
      const expensesByCategory = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount)

      setData({
        totalRevenue,
        monthRevenue,
        weekRevenue,
        avgBookingValue,
        revenueByType,
        totalBookings: confirmedBookings.length,
        monthBookings: monthBookings.length,
        weekBookings: weekBookings.length,
        todayBookings: todayBookings.length,
        capacityUtilization,
        bookingsBySession,
        totalInventoryValue,
        lowStockCount,
        inventoryItems: inventory.length,
        totalExpenses,
        monthExpenses,
        expensesByCategory,
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(0)
  }

  const formatCurrency = (num: number): string => {
    return `₹${formatNumber(num)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-6 shadow-xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </Link>
        <h1 className="text-2xl font-bold text-white mb-1">Analytics & Reports</h1>
        <p className="text-blue-100 text-xs">Business insights and performance</p>
      </div>

      {/* Content */}
      <main className="px-4 py-4 space-y-4">
        {/* Revenue Section */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue</h2>
              <p className="text-xs text-gray-600">Income from bookings</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Total</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">This Month</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(data.monthRevenue)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">This Week</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(data.weekRevenue)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Avg/Booking</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(data.avgBookingValue)}</p>
            </div>
          </div>

          {/* Revenue by Type */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">By Booking Type</p>
            {data.revenueByType.map((item) => {
              const percentage = data.totalRevenue > 0 ? (item.amount / data.totalRevenue) * 100 : 0
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-700">
                      {item.type} <span className="text-gray-500">({item.count})</span>
                    </span>
                    <span className="font-bold text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bookings</h2>
              <p className="text-xs text-gray-600">Class reservations</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Total</p>
              <p className="text-xl font-bold text-blue-600">{data.totalBookings}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">This Month</p>
              <p className="text-xl font-bold text-purple-600">{data.monthBookings}</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">This Week</p>
              <p className="text-xl font-bold text-cyan-600">{data.weekBookings}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Today</p>
              <p className="text-xl font-bold text-orange-600">{data.todayBookings}</p>
            </div>
          </div>

          {/* Capacity Utilization */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Capacity Utilization</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-indigo-600">{data.capacityUtilization.toFixed(1)}%</p>
              <p className="text-sm text-gray-600 mb-1">of total capacity</p>
            </div>
            <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min(data.capacityUtilization, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Bookings by Session */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">By Session Time</p>
            {data.bookingsBySession.map((session) => (
              <div key={session.session} className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{session.session}</p>
                    <p className="text-xs text-gray-600">{session.count} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{session.pax}</p>
                    <p className="text-xs text-gray-600">people</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Inventory</h2>
              <p className="text-xs text-gray-600">Stock management</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Items</p>
              <p className="text-xl font-bold text-indigo-600">{data.inventoryItems}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Value</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(data.totalInventoryValue)}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Low</p>
              <p className="text-xl font-bold text-red-600">{data.lowStockCount}</p>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💸</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Expenses</h2>
              <p className="text-xs text-gray-600">Business costs</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Total</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(data.totalExpenses)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">This Month</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(data.monthExpenses)}</p>
            </div>
          </div>

          {/* Expenses by Category */}
          {data.expensesByCategory.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">By Category</p>
              {data.expensesByCategory.slice(0, 5).map((item) => {
                const percentage = data.totalExpenses > 0 ? (item.amount / data.totalExpenses) * 100 : 0
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-700">
                        {item.category} <span className="text-gray-500">({item.count})</span>
                      </span>
                      <span className="font-bold text-gray-900">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Profit Overview */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-5 shadow-lg text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Net Profit (Month)</h2>
              <p className="text-xs text-purple-100">Revenue minus expenses</p>
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-5xl font-bold mb-2">
              {formatCurrency(data.monthRevenue - data.monthExpenses)}
            </p>
            <p className="text-sm text-purple-100">
              {data.monthRevenue > 0 
                ? `${(((data.monthRevenue - data.monthExpenses) / data.monthRevenue) * 100).toFixed(1)}% profit margin`
                : 'No revenue data'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <p className="text-xs font-semibold text-purple-100 mb-1">Revenue</p>
              <p className="text-lg font-bold">{formatCurrency(data.monthRevenue)}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <p className="text-xs font-semibold text-purple-100 mb-1">Expenses</p>
              <p className="text-lg font-bold">{formatCurrency(data.monthExpenses)}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
