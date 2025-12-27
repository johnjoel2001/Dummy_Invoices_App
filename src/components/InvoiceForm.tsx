import { useState, useEffect } from 'react'
import { InvoiceData, InvoiceItem, Customer, Payment } from '../types/invoice'
import { Plus, Trash2, UserPlus, Users, DollarSign, Trash, Edit2 } from 'lucide-react'
import { getCustomers, saveCustomer, deleteCustomer } from '../utils/customerStorage'
import { getInvoicesSync } from '../utils/invoiceStorage'
import CustomerModal from './CustomerModal'
import PaymentModal from './PaymentModal'

interface InvoiceFormProps {
  invoiceData: InvoiceData
  setInvoiceData: (data: InvoiceData) => void
}

const InvoiceForm = ({ invoiceData, setInvoiceData }: InvoiceFormProps) => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  // Predefined product options
  const productOptions = [
    '40 GMS BLUE',
    '40 GMS GREY',
    '50 GMS BLUE',
    '50 GMS GREY',
    '60 GMS BLUE',
    '60 GMS GREY',
    '70 GMS BLUE',
    '70 GMS GREY',
    '80 GMS BLUE',
    '80 GMS GREY',
    '90 GMS BLUE',
    '90 GMS GREY'
  ]

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    const customersList = await getCustomers()
    setCustomers(customersList)
  }

  // Recalculate payment totals whenever payments or total changes
  useEffect(() => {
    if (invoiceData.payments && invoiceData.payments.length > 0) {
      const amountPaid = invoiceData.payments.reduce((sum, p) => sum + p.amount, 0)
      const balance = invoiceData.total - amountPaid
      const paymentStatus: 'Unpaid' | 'Partial' | 'Paid' = 
        amountPaid === 0 ? 'Unpaid' : amountPaid >= invoiceData.total ? 'Paid' : 'Partial'
      
      // Only update if values have changed
      if (invoiceData.amountPaid !== amountPaid || invoiceData.balance !== balance || invoiceData.paymentStatus !== paymentStatus) {
        setInvoiceData({
          ...invoiceData,
          amountPaid,
          balance,
          paymentStatus
        })
      }
    } else if (invoiceData.total > 0) {
      // No payments - ensure correct initial state
      if (invoiceData.amountPaid !== 0 || invoiceData.balance !== invoiceData.total || invoiceData.paymentStatus !== 'Unpaid') {
        setInvoiceData({
          ...invoiceData,
          amountPaid: 0,
          balance: invoiceData.total,
          paymentStatus: 'Unpaid'
        })
      }
    }
  }, [invoiceData.payments, invoiceData.total])

  const updateField = (field: keyof InvoiceData, value: any) => {
    setInvoiceData({ ...invoiceData, [field]: value })
  }

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId)
    if (customerId) {
      const customer = customers.find(c => c.id === customerId)
      if (customer) {
        setInvoiceData({
          ...invoiceData,
          customerId: customer.id,
          buyerName: customer.name,
          buyerAddress: customer.address || '',
          buyerPhone: customer.phone || '',
          buyerEmail: customer.email || ''
        })
      }
    } else {
      setInvoiceData({
        ...invoiceData,
        customerId: undefined,
        buyerName: '',
        buyerAddress: '',
        buyerPhone: '',
        buyerEmail: ''
      })
    }
  }

  const handleSaveCustomer = async (customer: Customer) => {
    await saveCustomer(customer)
    await loadCustomers()
    setShowCustomerModal(false)
    setEditingCustomer(null)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowCustomerModal(true)
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(customerId)
      await loadCustomers()
      if (selectedCustomerId === customerId) {
        setSelectedCustomerId('')
        setInvoiceData({
          ...invoiceData,
          customerId: undefined,
          buyerName: '',
          buyerAddress: '',
          buyerPhone: '',
          buyerEmail: ''
        })
      }
    }
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
    const total = items.reduce((sum, item) => sum + item.amount, 0)
    const amountPaid = invoiceData.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    const balance = total - amountPaid
    const paymentStatus: 'Unpaid' | 'Partial' | 'Paid' = 
      amountPaid === 0 ? 'Unpaid' : amountPaid >= total ? 'Paid' : 'Partial'
    
    setInvoiceData({
      ...invoiceData,
      items,
      total,
      amountPaid,
      balance,
      paymentStatus
    })
  }

  const handleAddPayment = (payment: Payment) => {
    const payments = [...(invoiceData.payments || []), payment]
    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const balance = invoiceData.total - amountPaid
    const paymentStatus: 'Unpaid' | 'Partial' | 'Paid' = 
      amountPaid === 0 ? 'Unpaid' : amountPaid >= invoiceData.total ? 'Paid' : 'Partial'
    
    setInvoiceData({
      ...invoiceData,
      payments,
      amountPaid,
      balance,
      paymentStatus
    })
  }

  const handleDeletePayment = (paymentId: string) => {
    const payments = invoiceData.payments.filter(p => p.id !== paymentId)
    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const balance = invoiceData.total - amountPaid
    const paymentStatus: 'Unpaid' | 'Partial' | 'Paid' = 
      amountPaid === 0 ? 'Unpaid' : amountPaid >= invoiceData.total ? 'Paid' : 'Partial'
    
    setInvoiceData({
      ...invoiceData,
      payments,
      amountPaid,
      balance,
      paymentStatus
    })
  }

  return (
    <div className="space-y-8">
      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={invoiceData.invoiceNumber}
            onChange={(e) => updateField('invoiceNumber', e.target.value)}
            placeholder="Enter invoice number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold text-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={invoiceData.invoiceDate}
            onChange={(e) => updateField('invoiceDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={invoiceData.dueDate}
            onChange={(e) => updateField('dueDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Safetex Seller Information (Left-aligned, Clean Design) */}
      <div className="border-l-4 border-indigo-600 bg-gray-50 rounded-r-lg p-5">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-800">Safetex Enterprises</h3>
          <p className="text-xs text-gray-500 uppercase tracking-wide">From (Seller)</p>
        </div>
        <div className="space-y-1 text-sm text-gray-700">
          <p>No. 167, Sri Ram Samaj Nagar, 1st Main Road</p>
          <p>Vellanur, Avadi</p>
          <p>Chennai Tamil Nadu 600062, India</p>
          <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium">9164103412</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">marketing@safetexindia.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Selection */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Bill To (Customer)</h3>
          <button
            onClick={() => setShowCustomerModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add New Customer
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
          <div className="flex gap-2">
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">-- Select a customer --</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer Management Buttons */}
        {customers.length > 0 && (
          <div className="mb-4 bg-gray-50 rounded-md p-3">
            <p className="text-xs text-gray-600 mb-2 font-medium">Manage Customers:</p>
            <div className="flex flex-wrap gap-2">
              {customers.map(customer => (
                <div key={customer.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1">
                  <span className="text-sm text-gray-700">{customer.name}</span>
                  <button
                    onClick={() => handleEditCustomer(customer)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit customer"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete customer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Details - Show only when customer is selected */}
        {selectedCustomerId && invoiceData.buyerName ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Selected Customer:</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium text-base">{invoiceData.buyerName}</p>
              <p className="whitespace-pre-line">{invoiceData.buyerAddress}</p>
              <p>Phone: {invoiceData.buyerPhone}</p>
              {invoiceData.buyerEmail && <p>Email: {invoiceData.buyerEmail}</p>}
            </div>
            <button
              onClick={() => handleCustomerSelect('')}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Change Customer
            </button>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-md">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Please select a customer from the dropdown above</p>
            <p className="text-sm text-gray-500 mt-1">or add a new customer to continue</p>
          </div>
        )}
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
              <div className="col-span-5 relative">
                <input
                  type="text"
                  list={`products-${item.id}`}
                  placeholder="Select or type product..."
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <datalist id={`products-${item.id}`}>
                  {productOptions.map((product) => (
                    <option key={product} value={product} />
                  ))}
                </datalist>
              </div>
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
        <div className="w-full md:w-1/2">
          <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-lg font-bold text-indigo-600">₹{invoiceData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Tracking Section */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Payment Tracking</h3>
        </div>

        {/* Payment Summary - Always show ALL invoices */}
        {(() => {
          const allInvoices = getInvoicesSync()
          const totalAmount = allInvoices.reduce((sum, inv) => sum + inv.total, 0)
          // Recalculate from actual payments, not stored values
          const totalPaid = allInvoices.reduce((sum, inv) => {
            const paid = inv.payments ? inv.payments.reduce((pSum, p) => pSum + p.amount, 0) : 0
            return sum + paid
          }, 0)
          const totalBalance = totalAmount - totalPaid
          // Recalculate unpaid count based on actual balance
          const unpaidCount = allInvoices.filter(inv => {
            const paid = inv.payments ? inv.payments.reduce((pSum, p) => pSum + p.amount, 0) : 0
            return paid < inv.total
          }).length
          
          return (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-md p-3 border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Total Amount (All)</p>
                <p className="text-xl font-bold text-gray-800">₹{totalAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{allInvoices.length} invoice(s)</p>
              </div>
              <div className="bg-white rounded-md p-3 border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Amount Paid (All)</p>
                <p className="text-xl font-bold text-green-600">₹{totalPaid.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-md p-3 border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Balance Due (All)</p>
                <p className="text-xl font-bold text-orange-600">₹{totalBalance.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{unpaidCount} pending</p>
              </div>
            </div>
          )
        })()}

        {/* Payment History */}
        {invoiceData.payments && invoiceData.payments.length > 0 ? (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Payment History</h4>
            <div className="space-y-2">
              {invoiceData.payments.map((payment) => (
                <div key={payment.id} className="bg-white rounded-md p-3 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-green-600">₹{payment.amount.toFixed(2)}</span>
                        <span className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{payment.method}</span>
                      </div>
                      {payment.reference && (
                        <p className="text-xs text-gray-500 mt-1">Ref: {payment.reference}</p>
                      )}
                      {payment.notes && (
                        <p className="text-xs text-gray-600 mt-1">{payment.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete payment"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  {payment.screenshot && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Payment Screenshot:</p>
                      <img
                        src={payment.screenshot}
                        alt="Payment screenshot"
                        className="w-full max-w-xs h-32 object-contain border border-gray-300 rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            No payments recorded yet
          </div>
        )}
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

      {/* Customer Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false)
          setEditingCustomer(null)
        }}
        onSave={handleSaveCustomer}
        editCustomer={editingCustomer}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSave={handleAddPayment}
        maxAmount={invoiceData.balance || invoiceData.total}
      />
    </div>
  )
}

export default InvoiceForm
