'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface InventoryItem {
  id: string
  name: string
  currentStock: number
  unit: string
}

interface CostOfSaleItem {
  id: string
  itemId: string
  quantityPerPerson: number
  item: InventoryItem
}

export default function CostOfSalePage() {
  const [costOfSaleItems, setCostOfSaleItems] = useState<CostOfSaleItem[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cosResponse, invResponse] = await Promise.all([
        fetch('/api/cost-of-sale'),
        fetch('/api/inventory'),
      ])

      if (cosResponse.ok) {
        const cosData = await cosResponse.json()
        setCostOfSaleItems(cosData)
      }

      if (invResponse.ok) {
        const invData = await invResponse.json()
        setInventoryItems(invData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId || !quantity) return

    setAdding(true)
    try {
      const response = await fetch('/api/cost-of-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItemId,
          quantityPerPerson: parseFloat(quantity),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to add item')
        return
      }

      setSelectedItemId('')
      setQuantity('')
      fetchData()
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item')
    } finally {
      setAdding(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editQuantity) return

    try {
      const response = await fetch(`/api/cost-of-sale/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantityPerPerson: parseFloat(editQuantity),
        }),
      })

      if (!response.ok) {
        alert('Failed to update item')
        return
      }

      setEditingId(null)
      setEditQuantity('')
      fetchData()
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this item from cost of sale?')) {
      return
    }

    try {
      const response = await fetch(`/api/cost-of-sale/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        alert('Failed to delete item')
        return
      }

      fetchData()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const availableItems = inventoryItems.filter(
    (item) => !costOfSaleItems.some((cos) => cos.itemId === item.id)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-6 py-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Settings
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Cost of Sale Configuration</h1>
            <p className="text-purple-100 text-sm">
              Configure inventory items consumed per person in each booking
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">How it works</p>
              <p className="text-purple-100 text-sm">
                When a booking is created, the system automatically deducts the configured quantity of each item multiplied by the number of people. All changes are logged for audit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="px-6 py-6 max-w-4xl mx-auto">
        {/* Add Item Form */}
        {availableItems.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Item to Cost of Sale</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Inventory Item *
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select an item...</option>
                    {availableItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (Stock: {item.currentStock} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity per Person *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 1 or 42"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={adding}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : 'Add Item'}
              </button>
            </form>
          </div>
        )}

        {/* Configured Items List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading configuration...</p>
          </div>
        ) : costOfSaleItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">📋</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No items configured yet</h3>
            <p className="text-sm text-gray-600">
              Add inventory items that should be automatically consumed with each booking
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Configured Items</h2>
            {costOfSaleItems.map((cosItem, index) => (
              <div
                key={cosItem.id}
                className="bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{cosItem.item.name}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Per Person</p>
                        {editingId === cosItem.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <p className="text-lg font-bold text-purple-600">
                            {cosItem.quantityPerPerson} {cosItem.item.unit}
                          </p>
                        )}
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Current Stock</p>
                        <p className="text-lg font-bold text-blue-600">
                          {cosItem.item.currentStock} {cosItem.item.unit}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Example</p>
                      <p className="text-sm text-gray-700">
                        A booking with <span className="font-bold">4 people</span> will consume{' '}
                        <span className="font-bold text-purple-600">
                          {(cosItem.quantityPerPerson * 4).toFixed(2)} {cosItem.item.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  {editingId === cosItem.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(cosItem.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditQuantity('')
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(cosItem.id)
                          setEditQuantity(cosItem.quantityPerPerson.toString())
                        }}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Edit Quantity
                      </button>
                      <button
                        onClick={() => handleDelete(cosItem.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
