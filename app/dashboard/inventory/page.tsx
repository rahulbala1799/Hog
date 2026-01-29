'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import InventoryModal from '@/app/components/InventoryModal'
import InventoryDetailModal from '@/app/components/InventoryDetailModal'

interface InventoryItem {
  id: string
  name: string
  description: string | null
  currentStock: number
  currentCost: number
  reorderLevel: number | null
  unit: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
  _count?: {
    logs: number
  }
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    setSelectedItem(null)
    setIsModalOpen(true)
  }

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleViewDetails = (itemId: string) => {
    setSelectedItemId(itemId)
    setIsDetailModalOpen(true)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchItems()
      } else {
        alert('Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.currentCost), 0)
  const lowStockItems = items.filter(item => item.reorderLevel && item.currentStock <= item.reorderLevel)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-indigo-100 hover:text-white mb-4 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Inventory</h1>
            <p className="text-indigo-100 text-sm">Manage your inventory and track stock levels</p>
          </div>
          <button
            onClick={handleAddItem}
            className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-indigo-100 text-sm font-semibold mb-1">Total Items</p>
            <p className="text-3xl font-bold text-white">{items.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-indigo-100 text-sm font-semibold mb-1">Total Value</p>
            <p className="text-3xl font-bold text-white">₹{totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-indigo-100 text-sm font-semibold mb-1">Low Stock</p>
            <p className="text-3xl font-bold text-white">{lowStockItems.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <main className="px-6 pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading inventory...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">📦</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No items found' : 'No inventory items yet'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {searchQuery ? 'Try a different search term' : 'Add your first inventory item to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddItem}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Add First Item
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, index) => {
              const isLowStock = item.reorderLevel && item.currentStock <= item.reorderLevel
              const totalValue = item.currentStock * item.currentCost

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                        {isLowStock && (
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                            Low Stock
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Stock</p>
                      <p className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-indigo-600'}`}>
                        {item.currentStock} {item.unit}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Cost</p>
                      <p className="text-lg font-bold text-green-600">₹{item.currentCost.toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Value</p>
                      <p className="text-lg font-bold text-blue-600">₹{totalValue.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(item.id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleEditItem(item)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedItem(null)
        }}
        onSuccess={fetchItems}
        item={selectedItem}
      />

      <InventoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedItemId(null)
        }}
        itemId={selectedItemId}
      />
    </div>
  )
}
