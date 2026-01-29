'use client'

import { useState, useEffect } from 'react'

interface InventoryDetailModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string | null
}

export default function InventoryDetailModal({ isOpen, onClose, itemId }: InventoryDetailModalProps) {
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'price-history' | 'logs'>('details')

  useEffect(() => {
    if (isOpen && itemId) {
      fetchItemDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, itemId])

  const fetchItemDetails = async () => {
    if (!itemId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/inventory/${itemId}`)
      if (response.ok) {
        const data = await response.json()
        setItem(data)
      }
    } catch (error) {
      console.error('Error fetching item details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const isLowStock = item && item.reorderLevel && item.currentStock <= item.reorderLevel

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Item Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading details...</p>
          </div>
        ) : !item ? (
          <div className="p-6 text-center text-gray-600">Item not found</div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'details'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('price-history')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'price-history'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Price History
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'logs'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Logs
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Name and Description */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-600">{item.description}</p>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Current Stock</p>
                      <p className={`text-3xl font-bold ${isLowStock ? 'text-red-600' : 'text-indigo-600'}`}>
                        {item.currentStock} {item.unit}
                      </p>
                      {isLowStock && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">⚠️ Low Stock</p>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Cost per Unit</p>
                      <p className="text-3xl font-bold text-green-600">
                        ₹{item.currentCost.toFixed(2)}
                      </p>
                    </div>

                    {item.reorderLevel && (
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Reorder Level</p>
                        <p className="text-3xl font-bold text-orange-600">
                          {item.reorderLevel} {item.unit}
                        </p>
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Total Value</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ₹{(item.currentStock * item.currentCost).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Created By */}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Created By</p>
                    <p className="text-gray-900 font-medium">{item.createdBy.name}</p>
                    <p className="text-sm text-gray-600">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {activeTab === 'price-history' && (
                <div className="space-y-3">
                  {item.priceHistory && item.priceHistory.length > 0 ? (
                    item.priceHistory.map((history: any, index: number) => (
                      <div key={history.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {history.oldPrice !== null ? (
                              <>
                                <span className="text-lg font-bold text-red-600 line-through">
                                  ₹{history.oldPrice.toFixed(2)}
                                </span>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <span className="text-lg font-bold text-green-600">
                                  ₹{history.newPrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-indigo-600">
                                ₹{history.newPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {index === 0 && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Changed by: <span className="font-semibold">{history.changedBy}</span>
                        </p>
                        {history.reason && (
                          <p className="text-sm text-gray-600 mb-1">
                            Reason: <span className="font-semibold">{history.reason}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(history.effectiveDate).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No price history available</p>
                  )}
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="space-y-3">
                  {item.logs && item.logs.length > 0 ? (
                    item.logs.map((log: any) => (
                      <div key={log.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            log.action === 'CREATED' ? 'bg-green-100 text-green-700' :
                            log.action === 'STOCK_ADJUSTED' ? 'bg-blue-100 text-blue-700' :
                            log.action === 'PRICE_CHANGED' ? 'bg-purple-100 text-purple-700' :
                            log.action === 'UPDATED' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {log.action.replace('_', ' ')}
                          </span>
                          {log.quantity && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              log.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {log.quantity > 0 ? '+' : ''}{log.quantity} {item.unit}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          By: <span className="font-semibold">{log.performedBy.name}</span>
                        </p>
                        {log.notes && (
                          <p className="text-sm text-gray-600 mb-1">
                            Notes: <span className="font-semibold">{log.notes}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No logs available</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
