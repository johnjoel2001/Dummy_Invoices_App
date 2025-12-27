import { useState, useEffect } from 'react'
import { Payment } from '../types/invoice'
import { X, DollarSign } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payment: Payment) => void
  maxAmount: number
  initialData?: Payment
  isEditing?: boolean
}

const PaymentModal = ({ isOpen, onClose, onSave, maxAmount, initialData, isEditing = false }: PaymentModalProps) => {
  const [formData, setFormData] = useState({
    amount: initialData?.amount.toString() || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    method: (initialData?.method || 'GPay') as Payment['method'],
    reference: initialData?.reference || '',
    notes: initialData?.notes || ''
  })

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount.toString(),
        date: initialData.date,
        method: initialData.method,
        reference: initialData.reference || '',
        notes: initialData.notes || ''
      })
    }
  }, [initialData])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseFloat(formData.amount)
    if (amount <= 0 || amount > maxAmount) {
      alert(`Please enter a valid amount between ₹1 and ₹${maxAmount.toFixed(2)}`)
      return
    }

    const payment: Payment = {
      id: Date.now().toString(),
      amount,
      date: formData.date,
      method: formData.method,
      reference: formData.reference || undefined,
      notes: formData.notes || undefined
    }
    
    onSave(payment)
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'GPay',
      reference: '',
      notes: ''
    })
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-green-50">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Edit Payment' : 'Record Payment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Received * (Max: ₹{maxAmount.toFixed(2)})
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              max={maxAmount}
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              required
              value={formData.method}
              onChange={(e) => handleChange('method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="GPay">GPay</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number (Optional)
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Transaction ID, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal
