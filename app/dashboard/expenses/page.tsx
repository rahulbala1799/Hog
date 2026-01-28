'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
}

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [totalThisMonth, setTotalThisMonth] = useState(0)

  useEffect(() => {
    // TODO: Fetch expenses from API
    setLoading(false)
  }, [])

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      ART_SUPPLIES: '🎨',
      RENT: '🏠',
      MARKETING: '📢',
      UTILITIES: '💡',
      STAFF: '👥',
      EQUIPMENT: '🔧',
      OTHER: '📦',
    }
    return icons[category] || '💰'
  }

  const getCategoryName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
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
              <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
              <p className="text-xs text-gray-600">Track business expenses</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        {/* Monthly Total */}
        <div className="card p-5 mb-6">
          <div className="text-sm text-gray-600 mb-1">Total This Month</div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(totalThisMonth)}
          </div>
        </div>

        {/* Add New Expense Card */}
        <Link href="/dashboard/expenses/new" className="block mb-6">
          <div className="card-interactive bg-gradient-to-br from-orange-500 to-orange-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-white">+</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Add New Expense
                  </h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    Record a business expense
                  </p>
                </div>
              </div>
              <svg
                className="w-6 h-6 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['All', 'Art Supplies', 'Rent', 'Marketing', 'Other'].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'All'
                  ? 'bg-[#8B7355] text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Expenses List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355] mx-auto"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No expenses yet
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Start tracking your business expenses
            </p>
            <Link
              href="/dashboard/expenses/new"
              className="inline-block btn-primary"
            >
              Add Expense
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="card-interactive p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {expense.description}
                      </h3>
                      <span className="font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{getCategoryName(expense.category)}</span>
                      <span>•</span>
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
