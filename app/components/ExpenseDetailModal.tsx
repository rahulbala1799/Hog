'use client'

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

interface ExpenseDetailModalProps {
  expense: Expense | null
  isOpen: boolean
  onClose: () => void
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export default function ExpenseDetailModal({ expense, isOpen, onClose, onEdit, onDelete }: ExpenseDetailModalProps) {
  if (!isOpen || !expense) return null

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this expense?')) {
      onDelete(expense.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Expense Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Amount - Large Display */}
          <div className="text-center mb-6 pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Amount</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-1 font-medium">Description</p>
              <p className="text-base text-gray-900 font-semibold">{expense.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1 font-medium">Category</p>
                <p className="text-sm text-gray-900 font-semibold">{expense.category.name}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1 font-medium">Date</p>
                <p className="text-sm text-gray-900 font-semibold">
                  {new Date(expense.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-1 font-medium">Added By</p>
              <p className="text-sm text-gray-900 font-semibold">{expense.createdBy.name}</p>
              <p className="text-xs text-gray-500 mt-1">{expense.createdBy.email}</p>
            </div>

            {expense.notes && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1 font-medium">Notes</p>
                <p className="text-sm text-gray-700">{expense.notes}</p>
              </div>
            )}
          </div>

          {/* Receipt */}
          {expense.receiptUrl && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Receipt</p>
              <div className="bg-gray-100 rounded-2xl overflow-hidden">
                {expense.receiptUrl.endsWith('.pdf') ? (
                  <a
                    href={expense.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 p-8 hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">View PDF Receipt</p>
                      <p className="text-sm text-gray-600">Click to open</p>
                    </div>
                  </a>
                ) : (
                  <img
                    src={expense.receiptUrl}
                    alt="Receipt"
                    className="w-full h-auto cursor-pointer"
                    onClick={() => window.open(expense.receiptUrl!, '_blank')}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => onEdit(expense)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
