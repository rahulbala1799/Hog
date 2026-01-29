'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ExpenseCategory {
  id: string
  name: string
  createdAt: string
  _count?: {
    expenses: number
  }
}

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/expense-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setAdding(true)
    try {
      const response = await fetch('/api/expense-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to add category')
        return
      }

      setNewCategoryName('')
      fetchCategories()
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Expenses using this category will need to be reassigned.')) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/expense-categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to delete category')
        return
      }

      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Settings
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Expense Categories</h1>
            <p className="text-emerald-100 text-sm">Manage expense categories for your business</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="px-6 py-6 max-w-4xl mx-auto">
        {/* Add Category Form */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Category</h2>
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Utilities, Equipment, Travel"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">📁</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No categories yet</h3>
            <p className="text-sm text-gray-600">Add your first expense category above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{category.name}</h3>
                    {category._count && (
                      <p className="text-sm text-gray-500">
                        {category._count.expenses} {category._count.expenses === 1 ? 'expense' : 'expenses'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deleting === category.id || (category._count && category._count.expenses > 0)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title={category._count && category._count.expenses > 0 ? 'Cannot delete category with expenses' : 'Delete category'}
                  >
                    {deleting === category.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
