'use client'

import { useState, useEffect } from 'react'

interface ExpenseCategory {
  id: string
  name: string
}

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  expense?: any
}

export default function ExpenseModal({ isOpen, onClose, onSuccess, expense }: ExpenseModalProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [formData, setFormData] = useState({
    description: '',
    categoryId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: '',
    notes: '',
  })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      if (expense) {
        setFormData({
          description: expense.description || '',
          categoryId: expense.categoryId || '',
          amount: expense.amount?.toString() || '',
          date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          receiptUrl: expense.receiptUrl || '',
          notes: expense.notes || '',
        })
        setReceiptPreview(expense.receiptUrl || '')
      } else {
        resetForm()
      }
    }
  }, [isOpen, expense])

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

  const resetForm = () => {
    setFormData({
      description: '',
      categoryId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      receiptUrl: '',
      notes: '',
    })
    setReceiptFile(null)
    setReceiptPreview('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setReceiptPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setReceiptPreview('')
      }
    }
  }

  const uploadReceipt = async () => {
    if (!receiptFile) return formData.receiptUrl

    setUploading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('file', receiptFile)

      const response = await fetch('/api/expenses/upload-receipt', {
        method: 'POST',
        body: formDataObj,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Error uploading receipt:', error)
      alert('Failed to upload receipt')
      return formData.receiptUrl
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description || !formData.categoryId || !formData.amount) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Upload receipt if new file selected
      const receiptUrl = receiptFile ? await uploadReceipt() : formData.receiptUrl

      const url = expense ? `/api/expenses/${expense.id}` : '/api/expenses'
      const method = expense ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          receiptUrl,
        }),
      })

      if (!response.ok) throw new Error('Failed to save expense')

      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error saving expense:', error)
      alert('Failed to save expense')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {expense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., Office supplies"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Upload Receipt */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Receipt (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600">
                  {receiptFile ? receiptFile.name : formData.receiptUrl ? 'Change receipt' : 'Choose file'}
                </span>
              </label>
            </div>
            {receiptPreview && (
              <div className="mt-3">
                <img src={receiptPreview} alt="Receipt preview" className="w-full h-32 object-cover rounded-xl" />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || uploading ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
