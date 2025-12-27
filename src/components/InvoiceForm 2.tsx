import { InvoiceData, InvoiceItem } from '../types/invoice'
import { Plus, Trash2 } from 'lucide-react'

interface InvoiceFormProps {
  invoiceData: InvoiceData
  setInvoiceData: (data: InvoiceData) => void
}

const InvoiceForm = ({ invoiceData, setInvoiceData }: InvoiceFormProps) => {
  const updateField = (field: keyof InvoiceData, value: any) => {
    setInvoiceData({ ...invoiceData, [field]: value })
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }
    const items = [...invoiceData.items, newItem]
    updateField('items', items)
    calculateTotals(items)
  }

  const removeItem = (id: string) => {
    const items = invoiceData.items.filter(item => item.id !== id)
    updateField('items', items)
    calculateTotals(items)
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const items = invoiceData.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate
        }
        return updatedItem
      }
      return item
    })
    updateField('items', items)
    calculateTotals(items)
  }

  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = (subtotal * invoiceData.taxRate) / 100
    const total = subtotal + taxAmount
    
    setInvoiceData({
      ...invoiceData,
      items,
      subtotal,
      taxAmount,
      total
    })
  }

  const updateTaxRate = (rate: number) => {
    const taxAmount = (invoiceData.subtotal * rate) / 100
    const total = invoiceData.subtotal + taxAmount
    
    setInvoiceData({
      ...invoiceData,
      taxRate: rate,
      taxAmount,
      total
    })
  }

  return (
    <div className="space-y-8">
      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
          <input
            type="text"
            value={invoiceData.invoiceNumber}
            onChange={(e) => updateField('invoiceNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
          <input
            type="date"
            value={invoiceData.invoiceDate}
            onChange={(e) => updateField('invoiceDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={invoiceData.dueDate}
            onChange={(e) => updateField('dueDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Seller Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Seller Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Company Name"
            value={invoiceData.sellerName}
            onChange={(e) => updateField('sellerName', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Address"
            value={invoiceData.sellerAddress}
            onChange={(e) => updateField('sellerAddress', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="City"
            value={invoiceData.sellerCity}
            onChange={(e) => updateField('sellerCity', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="State"
            value={invoiceData.sellerState}
            onChange={(e) => updateField('sellerState', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={invoiceData.sellerZip}
            onChange={(e) => updateField('sellerZip', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Phone"
            value={invoiceData.sellerPhone}
            onChange={(e) => updateField('sellerPhone', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Email"
            value={invoiceData.sellerEmail}
            onChange={(e) => updateField('sellerEmail', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="GST Number (Optional)"
            value={invoiceData.sellerGST || ''}
            onChange={(e) => updateField('sellerGST', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Buyer Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Buyer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Company Name"
            value={invoiceData.buyerName}
            onChange={(e) => updateField('buyerName', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Address"
            value={invoiceData.buyerAddress}
            onChange={(e) => updateField('buyerAddress', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="City"
            value={invoiceData.buyerCity}
            onChange={(e) => updateField('buyerCity', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="State"
            value={invoiceData.buyerState}
            onChange={(e) => updateField('buyerState', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={invoiceData.buyerZip}
            onChange={(e) => updateField('buyerZip', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Phone"
            value={invoiceData.buyerPhone}
            onChange={(e) => updateField('buyerPhone', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Email"
            value={invoiceData.buyerEmail}
            onChange={(e) => updateField('buyerEmail', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="GST Number (Optional)"
            value={invoiceData.buyerGST || ''}
            onChange={(e) => updateField('buyerGST', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Items</h3>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
        
        <div className="space-y-3">
          {invoiceData.items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-md">
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                className="col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="col-span-2 px-3 py-2 bg-gray-100 rounded-md text-right font-semibold">
                ₹{item.amount.toFixed(2)}
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/2 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-semibold">₹{invoiceData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <label className="text-gray-700">Tax Rate (%):</label>
            <input
              type="number"
              value={invoiceData.taxRate}
              onChange={(e) => updateTaxRate(parseFloat(e.target.value) || 0)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Tax Amount:</span>
            <span className="font-semibold">₹{invoiceData.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-lg font-bold text-indigo-600">₹{invoiceData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={invoiceData.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Additional notes..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
          <textarea
            value={invoiceData.terms || ''}
            onChange={(e) => updateField('terms', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Payment terms..."
          />
        </div>
      </div>
    </div>
  )
}

export default InvoiceForm
