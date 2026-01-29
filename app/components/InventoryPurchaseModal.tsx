'use client'

import { useState, useEffect } from 'react'

interface InventoryPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  inventoryItem: {
    id: string
    name: string
    unit: string
    currentStock: number
    currentCost: number
  } | null
}

export default function InventoryPurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  inventoryItem,
}: InventoryPurchaseModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    supplier: '',
    quantity: '',
    totalCost: '',
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ supplier: '', quantity: '', totalCost: '' })
      setError('')
    }
  }, [isOpen])

  if (!isOpen || !inventoryItem) return null

  const quantity = parseFloat(formData.quantity) || 0
  const totalCost = parseFloat(formData.totalCost) || 0
  const perUnitCost = quantity > 0 ? totalCost / quantity : 0

  // Calculate new stock and cost preview
  const newStock = inventoryItem.currentStock + quantity
  const newCost =
    inventoryItem.currentStock === 0
      ? perUnitCost
      : (inventoryItem.currentStock * inventoryItem.currentCost + totalCost) / newStock

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    if (!formData.totalCost || parseFloat(formData.totalCost) <= 0) {
      setError('Please enter a valid total cost')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/inventory/${inventoryItem.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseFloat(formData.quantity),
          totalCost: parseFloat(formData.totalCost),
          supplier: formData.supplier.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to record purchase')
        return
      }

      // Success
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error recording purchase:', err)
      setError('Failed to record purchase')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Purchase</h2>
            <p className="text-sm text-green-100 mt-0.5">{inventoryItem.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Current Stock Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Current Stock</p>
                <p className="text-lg font-bold text-gray-900">
                  {inventoryItem.currentStock} {inventoryItem.unit}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Current Cost</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{inventoryItem.currentCost.toFixed(2)}/{inventoryItem.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Supplier (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supplier <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-base"
              placeholder="Supplier name"
              disabled={loading}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-base pr-20"
                placeholder="0"
                required
                disabled={loading}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                {inventoryItem.unit}
              </span>
            </div>
          </div>

          {/* Total Cost */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total Cost <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.totalCost}
                onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-base"
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Per Unit Cost (Calculated) */}
          {quantity > 0 && totalCost > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200">
              <p className="text-xs font-semibold text-gray-600 mb-1">Per Unit Cost</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{perUnitCost.toFixed(2)}/{inventoryItem.unit}
              </p>
            </div>
          )}

          {/* New Stock Preview */}
          {quantity > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">After Purchase</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">New Stock</p>
                  <p className="text-lg font-bold text-purple-600">
                    {newStock.toFixed(2)} {inventoryItem.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Avg Cost</p>
                  <p className="text-lg font-bold text-pink-600">
                    ₹{newCost.toFixed(2)}/{inventoryItem.unit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-base font-semibold hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-base font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !formData.quantity || !formData.totalCost}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Recording...
                </span>
              ) : (
                'Record Purchase'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
