import { useState, useEffect } from 'react'
import { InvoiceData, Payment } from '../types/invoice'
import { getInvoices, getInvoicesSync, saveInvoice } from '../utils/invoiceStorage'
import { DollarSign, Plus, FileText, Calendar, User, Image, Edit2, Trash2 } from 'lucide-react'
import PaymentModal from './PaymentModal'

const PaymentsSection = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [allInvoices, setAllInvoices] = useState<InvoiceData[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAllPayments, setShowAllPayments] = useState(false)
  const [editingPayment, setEditingPayment] = useState<(Payment & { invoice: InvoiceData }) | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    const invoicesList = await getInvoices()
    setAllInvoices(invoicesList)
    // Only show unpaid and partially paid invoices for payment recording
    const unpaidInvoices = invoicesList.filter(inv => inv.paymentStatus !== 'Paid')
    setInvoices(unpaidInvoices)
  }

  // Get all payments from all invoices
  const getAllPayments = () => {
    const paymentsWithInvoice: Array<Payment & { invoice: InvoiceData }> = []
    allInvoices.forEach(invoice => {
      if (invoice.payments && invoice.payments.length > 0) {
        invoice.payments.forEach(payment => {
          paymentsWithInvoice.push({ ...payment, invoice })
        })
      }
    })
    // Sort by date, newest first
    return paymentsWithInvoice.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  const handleInvoiceSelect = (invoiceNumber: string) => {
    const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber)
    setSelectedInvoice(invoice || null)
  }

  const handleAddPayment = async (payment: Payment) => {
    if (!selectedInvoice) return

    const updatedPayment = { ...payment, invoiceNumber: selectedInvoice.invoiceNumber }
    const payments = [...(selectedInvoice.payments || []), updatedPayment]
    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const balance = selectedInvoice.total - amountPaid
    const paymentStatus: 'Unpaid' | 'Partial' | 'Paid' = 
      amountPaid === 0 ? 'Unpaid' : amountPaid >= selectedInvoice.total ? 'Paid' : 'Partial'

    const updatedInvoice = {
      ...selectedInvoice,
      payments,
      amountPaid,
      balance,
      paymentStatus
    }

    await saveInvoice(updatedInvoice)
    await loadInvoices()
    setSelectedInvoice(null)
  }

  const handleEditPayment = (payment: Payment & { invoice: InvoiceData }) => {
    setEditingPayment(payment)
    setShowPaymentModal(true)
  }

  const handleUpdatePayment = async (updatedPayment: Payment) => {
    if (!editingPayment) return

    const invoice = editingPayment.invoice
    const payments = (invoice.payments || []).map(p => 
      p.id === editingPayment.id ? { ...updatedPayment, id: editingPayment.id } : p
    )
    
    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const balance = invoice.total - amountPaid
    const paymentStatus: 'Unpaid' | 'Partial' | 'Paid' = 
      amountPaid === 0 ? 'Unpaid' : amountPaid >= invoice.total ? 'Paid' : 'Partial'

    const updatedInvoice = {
      ...invoice,
      payments,
      amountPaid,
      balance,
      paymentStatus
    }

    await saveInvoice(updatedInvoice)
    await loadInvoices()
    setEditingPayment(null)
  }

  const handleDeletePayment = async (payment: Payment & { invoice: InvoiceData }) => {
    if (!confirm('Are you sure you want to delete this payment?')) return

    const invoice = payment.invoice
    const payments = (invoice.payments || []).filter(p => p.id !== payment.id)
    
    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const balance = invoice.total - amountPaid
    const paymentStatus: 'Unpaid' | 'Partial' | 'Paid' = 
      amountPaid === 0 ? 'Unpaid' : amountPaid >= invoice.total ? 'Paid' : 'Partial'

    const updatedInvoice = {
      ...invoice,
      payments,
      amountPaid,
      balance,
      paymentStatus
    }

    await saveInvoice(updatedInvoice)
    await loadInvoices()
  }

  const allPayments = getAllPayments()

  const handleScreenshotClick = (screenshot: string, paymentId: string) => {
    // Create a link to download the image
    const link = document.createElement('a')
    link.href = screenshot
    link.download = `payment-screenshot-${paymentId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleScreenshotView = (screenshot: string) => {
    // Open in modal or new window
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Payment Screenshot</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000; }
              img { max-width: 100%; max-height: 100vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${screenshot}" alt="Payment Screenshot" />
          </body>
        </html>
      `)
      newWindow.document.close()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
        </div>
        <button
          onClick={() => setShowAllPayments(!showAllPayments)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            showAllPayments
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showAllPayments ? 'Record New Payment' : 'View All Payments'}
        </button>
      </div>

      {showAllPayments ? (
        /* All Payments View */
        <div>
          {allPayments.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Payments Recorded</h3>
              <p className="text-gray-500">Record your first payment to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                All Payment Records ({allPayments.length})
              </h3>
              {allPayments.map((payment) => (
                <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-green-600">₹{payment.amount.toFixed(2)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.method === 'GPay' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.method}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>Invoice: {payment.invoice.invoiceNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{payment.invoice.buyerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(payment.date).toLocaleDateString()}</span>
                        </div>
                        {payment.reference && (
                          <div className="text-gray-600">
                            <span className="text-xs">Ref: {payment.reference}</span>
                          </div>
                        )}
                      </div>
                      {payment.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">{payment.notes}</p>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPayment(payment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit payment"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete payment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Screenshot Display */}
                  {payment.screenshot && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Image className="w-4 h-4 text-gray-600" />
                        <p className="text-sm font-medium text-gray-700">Payment Screenshot:</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <img
                          src={payment.screenshot}
                          alt="Payment screenshot"
                          className="w-full max-w-md h-48 object-contain border border-gray-300 rounded cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleScreenshotView(payment.screenshot!)}
                          title="Click to view full size"
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleScreenshotView(payment.screenshot!)}
                            className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                          >
                            View Full Size
                          </button>
                          <button
                            onClick={() => handleScreenshotClick(payment.screenshot!, payment.id)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Pending Invoices</h3>
          <p className="text-gray-500">All invoices are fully paid!</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Invoice to Record Payment
            </label>
            <select
              value={selectedInvoice?.invoiceNumber || ''}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
            >
              <option value="">-- Select an invoice --</option>
              {invoices.map((invoice) => (
                <option key={invoice.invoiceNumber} value={invoice.invoiceNumber}>
                  {invoice.invoiceNumber} - {invoice.buyerName} - ₹{invoice.total.toFixed(2)} (Balance: ₹{(invoice.balance || invoice.total).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {selectedInvoice && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Selected Invoice Details</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-md p-3 border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Invoice Number</p>
                  <p className="font-bold text-gray-800">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div className="bg-white rounded-md p-3 border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Customer</p>
                  <p className="font-bold text-gray-800">{selectedInvoice.buyerName}</p>
                </div>
                <div className="bg-white rounded-md p-3 border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                  <p className="font-bold text-gray-800">₹{selectedInvoice.total.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-md p-3 border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Balance Due</p>
                  <p className="font-bold text-orange-600">₹{(selectedInvoice.balance || selectedInvoice.total).toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">Items:</p>
                <div className="bg-white rounded-md p-3 border border-green-200">
                  {selectedInvoice.items.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      • {item.description} - Qty: {item.quantity} - ₹{item.amount.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Record Payment for this Invoice
              </button>
            </div>
          )}
        </>
      )}

      {(selectedInvoice || editingPayment) && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setEditingPayment(null)
          }}
          onSave={editingPayment ? handleUpdatePayment : handleAddPayment}
          maxAmount={editingPayment 
            ? editingPayment.invoice.total 
            : (selectedInvoice?.balance || selectedInvoice?.total || 0)
          }
          initialData={editingPayment || undefined}
          isEditing={!!editingPayment}
        />
      )}
    </div>
  )
}

export default PaymentsSection
