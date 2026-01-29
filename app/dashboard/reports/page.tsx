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
  totalPax: number
  monthPax: number
  capacityUtilization: number
  bookingsBySession: { session: string; count: number; pax: number }[]
  
  // Inventory
  totalInventoryValue: number
  lowStockCount: number
  inventoryItems: number
  stockReport: { 
    id: string
    name: string
    currentStock: number
    unit: string
    currentCost: number
    value: number
    reorderLevel: number | null
    isLowStock: boolean
  }[]
  
  // Cost of Sale
  totalCostOfSale: number
  monthCostOfSale: number
  weekCostOfSale: number
  avgCostPerPerson: number
  costOfSaleByItem: {
    name: string
    quantityPerPerson: number
    unit: string
    totalQuantity: number
    monthQuantity: number
    costPerUnit: number
    totalCost: number
    monthCost: number
  }[]
  
  // Expenses
  totalExpenses: number
  monthExpenses: number
  weekExpenses: number
  expensesByCategory: { category: string; amount: number; count: number }[]
  
  // Profit
  grossProfit: number
  monthGrossProfit: number
  profitMargin: number
  monthProfitMargin: number
}

type TabType = 'overview' | 'revenue' | 'bookings' | 'cogs' | 'inventory' | 'expenses' | 'profit'

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReportData | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const [bookingsRes, inventoryRes, expensesRes, settingsRes, costOfSaleRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/inventory'),
        fetch('/api/expenses'),
        fetch('/api/settings'),
        fetch('/api/cost-of-sale'),
      ])

      const bookings = bookingsRes.ok ? (await bookingsRes.json()).bookings || [] : []
      const inventory = inventoryRes.ok ? await inventoryRes.json() : []
      const expenses = expensesRes.ok ? await expensesRes.json() : []
      const settings = settingsRes.ok ? await settingsRes.json() : { maxPersonsPerClass: 15 }
      const costOfSaleItems = costOfSaleRes.ok ? await costOfSaleRes.json() : []

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
      const monthPax = monthBookings.reduce((sum: number, b: any) => sum + (b.numberOfPeople || 0), 0)
      const weekPax = weekBookings.reduce((sum: number, b: any) => sum + (b.numberOfPeople || 0), 0)
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
      const weekExpenses = expenses
        .filter((e: any) => new Date(e.date) >= startOfWeek)
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

      // Stock Report
      const stockReport = inventory.map((item: any) => ({
        id: item.id,
        name: item.name,
        currentStock: item.currentStock,
        unit: item.unit,
        currentCost: item.currentCost,
        value: item.currentStock * item.currentCost,
        reorderLevel: item.reorderLevel,
        isLowStock: item.reorderLevel ? item.currentStock <= item.reorderLevel : false,
      })).sort((a: any, b: any) => b.value - a.value)

      // Cost of Sale calculations
      const costOfSaleByItem = costOfSaleItems.map((cosItem: any) => {
        const totalQuantity = cosItem.quantityPerPerson * totalPax
        const monthQuantity = cosItem.quantityPerPerson * monthPax
        const totalCost = totalQuantity * cosItem.item.currentCost
        const monthCost = monthQuantity * cosItem.item.currentCost
        return {
          name: cosItem.item.name,
          quantityPerPerson: cosItem.quantityPerPerson,
          unit: cosItem.item.unit,
          totalQuantity,
          monthQuantity,
          costPerUnit: cosItem.item.currentCost,
          totalCost,
          monthCost,
        }
      })
      
      const totalCostOfSale = costOfSaleByItem.reduce((sum: number, item: any) => sum + item.totalCost, 0)
      const monthCostOfSale = costOfSaleByItem.reduce((sum: number, item: any) => sum + item.monthCost, 0)
      const weekCostOfSale = costOfSaleByItem.reduce((sum: number, item: any) => {
        const weekQuantity = item.quantityPerPerson * weekPax
        return sum + (weekQuantity * item.costPerUnit)
      }, 0)
      const avgCostPerPerson = totalPax > 0 ? totalCostOfSale / totalPax : 0

      // Profit calculations
      const grossProfit = totalRevenue - totalCostOfSale - totalExpenses
      const monthGrossProfit = monthRevenue - monthCostOfSale - monthExpenses
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
      const monthProfitMargin = monthRevenue > 0 ? (monthGrossProfit / monthRevenue) * 100 : 0

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
        totalPax,
        monthPax,
        capacityUtilization,
        bookingsBySession,
        totalInventoryValue,
        lowStockCount,
        inventoryItems: inventory.length,
        stockReport,
        totalCostOfSale,
        monthCostOfSale,
        weekCostOfSale,
        avgCostPerPerson,
        costOfSaleByItem,
        totalExpenses,
        monthExpenses,
        weekExpenses,
        expensesByCategory,
        grossProfit,
        monthGrossProfit,
        profitMargin,
        monthProfitMargin,
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      // Round to nearest thousand for cleaner display
      const rounded = Math.round(num / 1000)
      return `${rounded}K`
    }
    return num.toFixed(0)
  }

  const formatCurrency = (num: number): string => {
    return `₹${formatNumber(num)}`
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'revenue' as TabType, label: 'Revenue', icon: '💰' },
    { id: 'bookings' as TabType, label: 'Bookings', icon: '📅' },
    { id: 'cogs' as TabType, label: 'COGS', icon: '🧮' },
    { id: 'inventory' as TabType, label: 'Stock', icon: '📦' },
    { id: 'expenses' as TabType, label: 'Expenses', icon: '💸' },
    { id: 'profit' as TabType, label: 'Profit', icon: '📈' },
  ]

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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-4 shadow-xl sticky top-0 z-40">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-[108px] z-30 shadow-sm">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex px-2 py-2 gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
        {activeTab === 'overview' && <OverviewTab data={data} formatCurrency={formatCurrency} />}
        {activeTab === 'revenue' && <RevenueTab data={data} formatCurrency={formatCurrency} />}
        {activeTab === 'bookings' && <BookingsTab data={data} formatCurrency={formatCurrency} />}
        {activeTab === 'cogs' && <COGSTab data={data} formatCurrency={formatCurrency} />}
        {activeTab === 'inventory' && <InventoryTab data={data} formatCurrency={formatCurrency} />}
        {activeTab === 'expenses' && <ExpensesTab data={data} formatCurrency={formatCurrency} />}
        {activeTab === 'profit' && <ProfitTab data={data} formatCurrency={formatCurrency} />}
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

// Overview Tab
function OverviewTab({ data, formatCurrency }: { data: ReportData; formatCurrency: (n: number) => string }) {
  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-4 text-white shadow-xl">
          <p className="text-xs font-semibold opacity-90 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
          <p className="text-xs opacity-75 mt-1">All time</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-4 text-white shadow-xl">
          <p className="text-xs font-semibold opacity-90 mb-1">Total Bookings</p>
          <p className="text-2xl font-bold">{data.totalBookings}</p>
          <p className="text-xs opacity-75 mt-1">{data.totalPax} people</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-4 text-white shadow-xl">
          <p className="text-xs font-semibold opacity-90 mb-1">Total COGS</p>
          <p className="text-2xl font-bold">{formatCurrency(data.totalCostOfSale)}</p>
          <p className="text-xs opacity-75 mt-1">Cost of sale</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-4 text-white shadow-xl">
          <p className="text-xs font-semibold opacity-90 mb-1">Gross Profit</p>
          <p className="text-2xl font-bold">{formatCurrency(data.grossProfit)}</p>
          <p className="text-xs opacity-75 mt-1">{data.profitMargin.toFixed(1)}% margin</p>
        </div>
      </div>

      {/* This Month */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">📅</span>
          This Month
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">Revenue</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(data.monthRevenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">Bookings</p>
            <p className="text-xl font-bold text-blue-600">{data.monthBookings}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">COGS</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(data.monthCostOfSale)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">Profit</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(data.monthGrossProfit)}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-1">Avg/Booking</p>
          <p className="text-xl font-bold text-indigo-600">{formatCurrency(data.avgBookingValue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-1">Capacity</p>
          <p className="text-xl font-bold text-cyan-600">{data.capacityUtilization.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-1">Stock Value</p>
          <p className="text-xl font-bold text-teal-600">{formatCurrency(data.totalInventoryValue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-1">Low Stock</p>
          <p className="text-xl font-bold text-red-600">{data.lowStockCount}</p>
        </div>
      </div>
    </div>
  )
}

// Revenue Tab
function RevenueTab({ data, formatCurrency }: { data: ReportData; formatCurrency: (n: number) => string }) {
  return (
    <div className="space-y-4">
      {/* Revenue Summary */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">Total Revenue</h2>
            <p className="text-xs opacity-75">All-time earnings</p>
          </div>
        </div>
        <p className="text-4xl font-bold mb-2">{formatCurrency(data.totalRevenue)}</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">This Month</p>
            <p className="text-lg font-bold">{formatCurrency(data.monthRevenue)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">This Week</p>
            <p className="text-lg font-bold">{formatCurrency(data.weekRevenue)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">Avg/Booking</p>
            <p className="text-lg font-bold">{formatCurrency(data.avgBookingValue)}</p>
          </div>
        </div>
      </div>

      {/* Revenue by Type */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Type</h3>
        <div className="space-y-3">
          {data.revenueByType.map((item) => {
            const percentage = data.totalRevenue > 0 ? (item.amount / data.totalRevenue) * 100 : 0
            return (
              <div key={item.type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{item.type}</p>
                    <p className="text-xs text-gray-500">{item.count} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(item.amount)}</p>
                    <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
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

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">This Month</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
            <span className="font-semibold text-gray-700">Revenue</span>
            <span className="font-bold text-green-600">{formatCurrency(data.monthRevenue)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="font-semibold text-gray-700">Bookings</span>
            <span className="font-bold text-gray-900">{data.monthBookings}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
            <span className="font-semibold text-gray-700">Average/Booking</span>
            <span className="font-bold text-blue-600">
              {formatCurrency(data.monthBookings > 0 ? data.monthRevenue / data.monthBookings : 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Bookings Tab
function BookingsTab({ data, formatCurrency }: { data: ReportData; formatCurrency: (n: number) => string }) {
  return (
    <div className="space-y-4">
      {/* Bookings Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-2xl">📅</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">Total Bookings</h2>
            <p className="text-xs opacity-75">All-time reservations</p>
          </div>
        </div>
        <p className="text-4xl font-bold mb-2">{data.totalBookings}</p>
        <p className="text-sm opacity-90">{data.totalPax} total people</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">This Month</p>
            <p className="text-lg font-bold">{data.monthBookings}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">This Week</p>
            <p className="text-lg font-bold">{data.weekBookings}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">Today</p>
            <p className="text-lg font-bold">{data.todayBookings}</p>
          </div>
        </div>
      </div>

      {/* Capacity Utilization */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Capacity Utilization</h3>
        <div className="text-center mb-4">
          <p className="text-5xl font-bold text-indigo-600">{data.capacityUtilization.toFixed(1)}%</p>
          <p className="text-sm text-gray-600 mt-2">of total capacity used</p>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
            style={{ width: `${Math.min(data.capacityUtilization, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Bookings by Session */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">By Session Time</h3>
        <div className="space-y-3">
          {data.bookingsBySession.map((session) => (
            <div key={session.session} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-bold text-gray-900">{session.session}</p>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{session.pax}</p>
                  <p className="text-xs text-gray-600">people</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{session.count} bookings</p>
            </div>
          ))}
        </div>
      </div>

      {/* PAX Statistics */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">People Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
            <span className="font-semibold text-gray-700">Total PAX</span>
            <span className="font-bold text-purple-600">{data.totalPax}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl">
            <span className="font-semibold text-gray-700">This Month</span>
            <span className="font-bold text-indigo-600">{data.monthPax}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
            <span className="font-semibold text-gray-700">Avg/Booking</span>
            <span className="font-bold text-blue-600">
              {(data.totalPax / data.totalBookings).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// COGS Tab
function COGSTab({ data, formatCurrency }: { data: ReportData; formatCurrency: (n: number) => string }) {
  return (
    <div className="space-y-4">
      {/* COGS Summary */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🧮</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">Cost of Goods Sold</h2>
            <p className="text-xs opacity-75">Inventory consumption</p>
          </div>
        </div>
        <p className="text-4xl font-bold mb-2">{formatCurrency(data.totalCostOfSale)}</p>
        <p className="text-sm opacity-90">₹{data.avgCostPerPerson.toFixed(2)}/person average</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">This Month</p>
            <p className="text-lg font-bold">{formatCurrency(data.monthCostOfSale)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">This Week</p>
            <p className="text-lg font-bold">{formatCurrency(data.weekCostOfSale)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">Total PAX</p>
            <p className="text-lg font-bold">{data.totalPax}</p>
          </div>
        </div>
      </div>

      {/* COGS Breakdown */}
      {data.costOfSaleByItem.length > 0 ? (
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cost Breakdown by Item</h3>
          <div className="space-y-3">
            {data.costOfSaleByItem.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.quantityPerPerson} {item.unit}/person × ₹{item.costPerUnit.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-600">{formatCurrency(item.totalCost)}</p>
                    <p className="text-xs text-gray-600">total</p>
                  </div>
                </div>
                
                {/* Details */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-orange-200">
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-600">Total Quantity</p>
                    <p className="text-sm font-bold text-gray-900">
                      {item.totalQuantity.toFixed(1)} {item.unit}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-600">This Month</p>
                    <p className="text-sm font-bold text-orange-600">{formatCurrency(item.monthCost)}</p>
                  </div>
                </div>
                <div className="mt-2 bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-600">Month Quantity</p>
                  <p className="text-sm font-bold text-gray-900">
                    {item.monthQuantity.toFixed(1)} {item.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🧮</div>
            <p className="text-gray-600 mb-4">No Cost of Sale items configured</p>
            <Link 
              href="/dashboard/settings/cost-of-sale"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Configure COGS →
            </Link>
          </div>
        </div>
      )}

      {/* COGS Analysis */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">COGS Analysis</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
            <span className="font-semibold text-gray-700">Cost per Person</span>
            <span className="font-bold text-orange-600">₹{data.avgCostPerPerson.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
            <span className="font-semibold text-gray-700">% of Revenue</span>
            <span className="font-bold text-red-600">
              {data.totalRevenue > 0 ? ((data.totalCostOfSale / data.totalRevenue) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
            <span className="font-semibold text-gray-700">This Month %</span>
            <span className="font-bold text-yellow-600">
              {data.monthRevenue > 0 ? ((data.monthCostOfSale / data.monthRevenue) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Inventory Tab
function InventoryTab({ data, formatCurrency }: { data: ReportData; formatCurrency: (n: number) => string }) {
  return (
    <div className="space-y-4">
      {/* Inventory Summary */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">Stock Value</h2>
            <p className="text-xs opacity-75">Current inventory worth</p>
          </div>
        </div>
        <p className="text-4xl font-bold mb-2">{formatCurrency(data.totalInventoryValue)}</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">Items</p>
            <p className="text-lg font-bold">{data.inventoryItems}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">Low Stock</p>
            <p className="text-lg font-bold">{data.lowStockCount}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">Avg Value</p>
            <p className="text-lg font-bold">
              {formatCurrency(data.inventoryItems > 0 ? data.totalInventoryValue / data.inventoryItems : 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Stock Report */}
      {data.stockReport.length > 0 ? (
        <div className="space-y-3">
          {/* Low Stock Alert */}
          {data.lowStockCount > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <p className="font-bold text-red-900">Low Stock Alert</p>
              </div>
              <p className="text-sm text-red-700">{data.lowStockCount} items need reordering</p>
            </div>
          )}

          {/* Stock Items */}
          {data.stockReport.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl p-4 shadow-lg border-2 ${
                item.isLowStock
                  ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300'
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-lg font-bold text-gray-900">{item.name}</p>
                    {item.isLowStock && (
                      <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full font-bold">
                        LOW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    Cost: ₹{item.currentCost.toFixed(2)}/{item.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">
                    {item.currentStock.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600">{item.unit}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                <div className="bg-indigo-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Total Value</p>
                  <p className="text-sm font-bold text-indigo-600">{formatCurrency(item.value)}</p>
                </div>
                {item.reorderLevel && (
                  <div className="bg-orange-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600">Reorder At</p>
                    <p className="text-sm font-bold text-orange-600">
                      {item.reorderLevel} {item.unit}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600">No inventory items</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Expenses Tab
function ExpensesTab({ data, formatCurrency }: { data: ReportData; formatCurrency: (n: number) => string }) {
  return (
    <div className="space-y-4">
      {/* Expenses Summary */}
      <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-2xl">💸</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">Total Expenses</h2>
            <p className="text-xs opacity-75">All business costs</p>
          </div>
        </div>
        <p className="text-4xl font-bold mb-2">{formatCurrency(data.totalExpenses)}</p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">This Month</p>
            <p className="text-lg font-bold">{formatCurrency(data.monthExpenses)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">This Week</p>
            <p className="text-lg font-bold">{formatCurrency(data.weekExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Expenses by Category */}
      {data.expensesByCategory.length > 0 ? (
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">By Category</h3>
          <div className="space-y-3">
            {data.expensesByCategory.map((item, index) => {
              const percentage = data.totalExpenses > 0 ? (item.amount / data.totalExpenses) * 100 : 0
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{item.category}</p>
                      <p className="text-xs text-gray-500">{item.count} expenses</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💸</div>
            <p className="text-gray-600">No expenses recorded</p>
          </div>
        </div>
      )}

      {/* Monthly Comparison */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Expense Analysis</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
            <span className="font-semibold text-gray-700">% of Revenue</span>
            <span className="font-bold text-red-600">
              {data.totalRevenue > 0 ? ((data.totalExpenses / data.totalRevenue) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-pink-50 rounded-xl">
            <span className="font-semibold text-gray-700">This Month %</span>
            <span className="font-bold text-pink-600">
              {data.monthRevenue > 0 ? ((data.monthExpenses / data.monthRevenue) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
            <span className="font-semibold text-gray-700">Avg/Expense</span>
            <span className="font-bold text-purple-600">
              {formatCurrency(
                data.expensesByCategory.reduce((sum, cat) => sum + cat.count, 0) > 0
                  ? data.totalExpenses / data.expensesByCategory.reduce((sum, cat) => sum + cat.count, 0)
                  : 0
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Profit Tab
function ProfitTab({ data, formatCurrency }: { data: ReportData; formatCurrency: (n: number) => string }) {
  return (
    <div className="space-y-4">
      {/* Profit Summary */}
      <div className={`rounded-3xl p-5 text-white shadow-xl ${
        data.grossProfit >= 0 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
          : 'bg-gradient-to-br from-red-500 to-pink-600'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-2xl">📈</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">Gross Profit</h2>
            <p className="text-xs opacity-75">Revenue - COGS - Expenses</p>
          </div>
        </div>
        <p className="text-4xl font-bold mb-2">{formatCurrency(data.grossProfit)}</p>
        <p className="text-sm opacity-90">{data.profitMargin.toFixed(1)}% profit margin</p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">This Month</p>
            <p className="text-lg font-bold">{formatCurrency(data.monthGrossProfit)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <p className="text-xs opacity-75">Month Margin</p>
            <p className="text-lg font-bold">{data.monthProfitMargin.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Profit Breakdown - All Time */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">All Time Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
            <span className="font-semibold text-gray-700">Revenue</span>
            <span className="font-bold text-green-600">{formatCurrency(data.totalRevenue)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
            <span className="font-semibold text-gray-700">COGS</span>
            <span className="font-bold text-orange-600">-{formatCurrency(data.totalCostOfSale)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
            <span className="font-semibold text-gray-700">Expenses</span>
            <span className="font-bold text-red-600">-{formatCurrency(data.totalExpenses)}</span>
          </div>
          <div className={`flex justify-between items-center p-4 rounded-xl border-2 ${
            data.grossProfit >= 0 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
              : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
          }`}>
            <span className="font-bold text-gray-900 text-lg">Gross Profit</span>
            <span className={`font-bold text-xl ${data.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.grossProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Profit Breakdown - This Month */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">This Month</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
            <span className="font-semibold text-gray-700">Revenue</span>
            <span className="font-bold text-green-600">{formatCurrency(data.monthRevenue)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
            <span className="font-semibold text-gray-700">COGS</span>
            <span className="font-bold text-orange-600">-{formatCurrency(data.monthCostOfSale)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
            <span className="font-semibold text-gray-700">Expenses</span>
            <span className="font-bold text-red-600">-{formatCurrency(data.monthExpenses)}</span>
          </div>
          <div className={`flex justify-between items-center p-4 rounded-xl border-2 ${
            data.monthGrossProfit >= 0 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
              : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
          }`}>
            <span className="font-bold text-gray-900 text-lg">Gross Profit</span>
            <span className={`font-bold text-xl ${data.monthGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.monthGrossProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Profit Metrics */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Profit Metrics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
            <span className="font-semibold text-gray-700">Profit Margin</span>
            <span className="font-bold text-blue-600">{data.profitMargin.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
            <span className="font-semibold text-gray-700">Month Margin</span>
            <span className="font-bold text-purple-600">{data.monthProfitMargin.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl">
            <span className="font-semibold text-gray-700">Profit/Booking</span>
            <span className="font-bold text-indigo-600">
              {formatCurrency(data.totalBookings > 0 ? data.grossProfit / data.totalBookings : 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
