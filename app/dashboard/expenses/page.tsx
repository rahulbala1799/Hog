'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ExpenseModal from '@/app/components/ExpenseModal'
import ExpenseDetailModal from '@/app/components/ExpenseDetailModal'

interface Expense {
  id: string
  description: string
  amount: number
  date: string
  receiptUrl: string | null
  notes: string | null
  category: {
    id: string
    name: string
  }
  createdBy: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/expense-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchExpenses()
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const filteredExpenses = filterCategory === 'All'
    ? expenses
    : expenses.filter(e => e.category.name === filterCategory)

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const monthlyAmount = filteredExpenses
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Expenses</h1>
            <p className="text-emerald-100 text-sm">Track and manage your business expenses</p>
          </div>
          <Link
            href="/dashboard"
            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-emerald-100 text-xs font-medium mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-white">
              ₹{totalAmount > 999 ? `${(totalAmount / 1000).toFixed(1)}k` : totalAmount.toFixed(0)}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-emerald-100 text-xs font-medium mb-1">This Month</p>
            <p className="text-2xl font-bold text-white">
              ₹{monthlyAmount > 999 ? `${(monthlyAmount / 1000).toFixed(1)}k` : monthlyAmount.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilterCategory('All')}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
              filterCategory === 'All'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({expenses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.name)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                filterCategory === cat.name
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name} ({expenses.filter(e => e.category.name === cat.name).length})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading expenses...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">💰</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No expenses yet</h3>
            <p className="text-sm text-gray-600 mb-6">Start tracking your business expenses</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              + Add First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense, index) => (
              <div
                key={expense.id}
                onClick={() => setSelectedExpense(expense)}
                className="bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{expense.description}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-bold rounded-lg">
                        {expense.category.name}
                      </span>
                      {expense.receiptUrl && (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          Receipt
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ₹{expense.amount > 999 ? `${(expense.amount / 1000).toFixed(1)}k` : expense.amount.toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(expense.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    by {expense.createdBy.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center z-40"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modals */}
      {showAddModal && (
        <ExpenseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchExpenses()
            setShowAddModal(false)
          }}
        />
      )}

      {editExpense && (
        <ExpenseModal
          isOpen={!!editExpense}
          onClose={() => setEditExpense(null)}
          onSuccess={() => {
            fetchExpenses()
            setEditExpense(null)
          }}
          expense={editExpense}
        />
      )}

      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          isOpen={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onEdit={(expense) => {
            setSelectedExpense(null)
            setEditExpense(expense)
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
