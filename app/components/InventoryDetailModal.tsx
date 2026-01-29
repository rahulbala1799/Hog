'use client'

import { useState, useEffect } from 'react'
import InventoryPurchaseModal from './InventoryPurchaseModal'

interface InventoryDetailModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string | null
  onRefresh?: () => void
}

export default function InventoryDetailModal({ isOpen, onClose, itemId, onRefresh }: InventoryDetailModalProps) {
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'price-history' | 'logs' | 'purchases'>('details')
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>('STAFF')
  const [deletingPurchaseId, setDeletingPurchaseId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && itemId) {
      fetchItemDetails()
      fetchUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, itemId])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.user.role)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

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
  const isAdmin = userRole === 'ADMIN'

  const handlePurchaseSuccess = () => {
    fetchItemDetails()
    if (onRefresh) {
      onRefresh()
    }
  }

  const handleDeletePurchase = async (logId: string) => {
    if (!item || !confirm('Are you sure you want to reverse this purchase? This will restore the inventory to its previous state. You will also need to delete the corresponding expense from the Expenses page.')) {
      return
    }

    setDeletingPurchaseId(logId)
    try {
      const response = await fetch(`/api/inventory/${item.id}/purchase/${logId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to reverse purchase')
        return
      }

      // Success - refresh item details
      fetchItemDetails()
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error reversing purchase:', error)
      alert('Failed to reverse purchase')
    } finally {
      setDeletingPurchaseId(null)
    }
  }

  // Filter purchase logs (STOCK_ADJUSTED with positive quantity and "Purchase:" in notes)
  const purchaseLogs = item?.logs?.filter((log: any) => 
    log.action === 'STOCK_ADJUSTED' && 
    log.quantity > 0 && 
    log.notes && 
    log.notes.includes('Purchase:')
  ) || []

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
                onClick={() => setActiveTab('purchases')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'purchases'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Purchases
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
              {/* Add Purchase Button for Admins */}
              {activeTab === 'details' && isAdmin && (
                <div className="mb-6">
                  <button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-base font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Purchase
                  </button>
                </div>
              )}

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

              {activeTab === 'purchases' && (
                <div className="space-y-3">
                  {purchaseLogs.length > 0 ? (
                    purchaseLogs.map((log: any) => {
                      // Parse purchase details from notes
                      const notesMatch = log.notes?.match(/Purchase: ([\d.]+) ([\w]+) @ ₹([\d.]+)\/([\w]+)(?: from (.+))?/)
                      const quantity = log.quantity
                      const unit = item.unit
                      const perUnitCost = notesMatch ? parseFloat(notesMatch[3]) : 0
                      const supplier = notesMatch?.[5] || null
                      const totalCost = quantity * perUnitCost

                      return (
                        <div key={log.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                  Purchase
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                  +{quantity} {unit}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">Quantity:</span> {quantity} {unit}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">Cost:</span> ₹{perUnitCost.toFixed(2)}/{unit}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">Total:</span> ₹{totalCost.toFixed(2)}
                                </p>
                                {supplier && (
                                  <p className="text-sm text-gray-700">
                                    <span className="font-semibold">Supplier:</span> {supplier}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeletePurchase(log.id)}
                                disabled={deletingPurchaseId === log.id}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {deletingPurchaseId === log.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    Reversing...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Reverse
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="pt-3 border-t border-green-200 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              By: <span className="font-semibold">{log.performedBy.name}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {isAdmin && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-xs text-amber-600 font-semibold">
                                ⚠️ Note: After reversing, delete the corresponding expense from the Expenses page
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📦</span>
                      </div>
                      <p className="text-gray-600 font-medium mb-2">No purchases yet</p>
                      <p className="text-sm text-gray-500">Purchases will appear here once you add them</p>
                    </div>
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

      {/* Purchase Modal */}
      {item && (
        <InventoryPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          onSuccess={handlePurchaseSuccess}
          inventoryItem={{
            id: item.id,
            name: item.name,
            unit: item.unit,
            currentStock: item.currentStock,
            currentCost: item.currentCost,
          }}
        />
      )}
    </div>
  )
}
