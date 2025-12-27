import { useState, useEffect } from 'react'
import { InvoiceData } from '../types/invoice'
import { getInvoices, deleteInvoice } from '../utils/invoiceStorage'
import { FileText, Trash2, Eye, Calendar, User, DollarSign, Filter } from 'lucide-react'

interface InvoicesListProps {
  onViewInvoice: (invoice: InvoiceData) => void
}

const InvoicesList = ({ onViewInvoice }: InvoicesListProps) => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [customerFilter, setCustomerFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Unpaid'>('All')

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    const invoicesList = await getInvoices()
    // Sort by date, newest first
    invoicesList.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
    setInvoices(invoicesList)
  }

  const handleDelete = async (invoiceNumber: string) => {
    if (window.confirm(`Delete invoice ${invoiceNumber}?`)) {
      await deleteInvoice(invoiceNumber)
      await loadInvoices()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800'
      case 'Partial': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  // Get unique customer names
  const uniqueCustomers = Array.from(new Set(invoices.map(inv => inv.buyerName))).sort()

  // Filter invoices based on customer and status
  const filteredInvoices = invoices.filter((invoice) => {
    // Recalculate payment status for filtering
    const amountPaid = invoice.payments ? invoice.payments.reduce((sum, p) => sum + p.amount, 0) : 0
    const paymentStatus: 'Unpaid' | 'Partial' | 'Paid' = 
      amountPaid === 0 ? 'Unpaid' : amountPaid >= invoice.total ? 'Paid' : 'Partial'

    // Filter by customer name
    const matchesCustomer = customerFilter === 'All' || invoice.buyerName === customerFilter
    
    // Filter by payment status
    const matchesStatus = statusFilter === 'All' || paymentStatus === statusFilter

    return matchesCustomer && matchesStatus
  })

  if (invoices.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Invoices Yet</h3>
        <p className="text-gray-500">Create your first invoice to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          All Invoices ({filteredInvoices.length}{filteredInvoices.length !== invoices.length ? ` of ${invoices.length}` : ''})
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Filter by customer name */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white w-full sm:w-48"
            >
              <option value="All">All Customers</option>
              {uniqueCustomers.map((customer) => (
                <option key={customer} value={customer}>
                  {customer}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by payment status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Paid' | 'Partial' | 'Unpaid')}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white w-full sm:w-40"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Invoices Found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => {
          // Recalculate balance from actual payments
          const amountPaid = invoice.payments ? invoice.payments.reduce((sum, p) => sum + p.amount, 0) : 0
          const balance = invoice.total - amountPaid
          const paymentStatus: 'Unpaid' | 'Partial' | 'Paid' = 
            amountPaid === 0 ? 'Unpaid' : amountPaid >= invoice.total ? 'Paid' : 'Partial'

          return (
            <div key={invoice.invoiceNumber} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-indigo-600">
                      {invoice.invoiceNumber}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(paymentStatus)}`}>
                      {paymentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{invoice.buyerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">₹{invoice.total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-xs">Balance:</span>
                      <span className="font-semibold text-orange-600">
                        ₹{balance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {invoice.items.length > 0 && (
                    <div className="mt-3 text-xs text-gray-500">
                      {invoice.items.length} item{invoice.items.length > 1 ? 's' : ''}: {invoice.items.map(i => i.description).join(', ').substring(0, 60)}...
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onViewInvoice(invoice)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="View Invoice"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(invoice.invoiceNumber)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Invoice"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        </div>
      )}
    </div>
  )
}

export default InvoicesList
