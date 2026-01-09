import { useState } from 'react'
import { InvoiceData, InvoiceItem } from '../types/invoice'
import InvoiceForm from './InvoiceForm'
import InvoicePreview from './InvoicePreview'
import InvoicesList from './InvoicesList'
import PaymentsSection from './PaymentsSection'
import { Download, Eye, Edit, Save, CheckCircle, FileText, DollarSign, PlusCircle, Plus } from 'lucide-react'
import { generatePDF } from '../utils/pdfGenerator'
import { saveInvoice } from '../utils/invoiceStorage'

const InvoiceGenerator = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'invoices' | 'payments'>('create')
  const [showPreview, setShowPreview] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  const createNewInvoice = (): InvoiceData => ({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    buyerName: '',
    buyerAddress: '',
    buyerPhone: '',
    buyerEmail: '',
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ],
    shippingFee: undefined,
    total: 0,
    payments: [],
    amountPaid: 0,
    balance: 0,
    paymentStatus: 'Unpaid',
    notes: 'Thank you for your business!',
    terms: 'Payment due within 30 days'
  })

  const [invoiceData, setInvoiceData] = useState<InvoiceData>(createNewInvoice())

  const handleDownloadPDF = () => {
    // Validate mandatory fields before generating PDF
    if (!invoiceData.invoiceNumber || !invoiceData.invoiceNumber.trim()) {
      alert('⚠️ Invoice Number is required to generate PDF!')
      return
    }
    if (!invoiceData.invoiceDate) {
      alert('⚠️ Invoice Date is required to generate PDF!')
      return
    }
    if (!invoiceData.dueDate) {
      alert('⚠️ Due Date is required to generate PDF!')
      return
    }
    generatePDF(invoiceData)
  }

  const handleSaveInvoice = async () => {
    // Validate mandatory fields
    if (!invoiceData.invoiceNumber || !invoiceData.invoiceNumber.trim()) {
      alert('⚠️ Invoice Number is required!')
      return
    }
    if (!invoiceData.invoiceDate) {
      alert('⚠️ Invoice Date is required!')
      return
    }
    if (!invoiceData.dueDate) {
      alert('⚠️ Due Date is required!')
      return
    }
    if (!invoiceData.buyerName || invoiceData.items.length === 0) {
      alert('Please add customer and at least one item before saving')
      return
    }
    await saveInvoice(invoiceData)
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      // Automatically create new invoice and stay in edit mode
      setInvoiceData(createNewInvoice())
      setShowPreview(false)
    }, 1500)
  }

  const handleNewInvoice = () => {
    setInvoiceData(createNewInvoice())
    setShowPreview(false)
    setActiveTab('create')
  }

  const handleViewInvoice = (invoice: InvoiceData) => {
    setInvoiceData(invoice)
    setShowPreview(true)
    setActiveTab('create')
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="bg-white rounded-t-lg shadow-lg">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
              activeTab === 'create'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            Create Invoice
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
              activeTab === 'invoices'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText className="w-5 h-5" />
            All Invoices
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
              activeTab === 'payments'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Record Payment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-b-lg shadow-lg p-6 mb-6">
        {activeTab === 'create' && (
          <>
            <div className="flex gap-3 justify-center mb-6 flex-wrap">
          <button
            onClick={handleNewInvoice}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Invoice
          </button>
          <button
            onClick={() => setShowPreview(false)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              !showPreview
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Edit className="w-5 h-5" />
            Edit
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              showPreview
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Eye className="w-5 h-5" />
            Preview
          </button>
          <button
            onClick={handleSaveInvoice}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-md ${
              isSaved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved! Creating New...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Invoice
              </>
            )}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>

            {!showPreview ? (
              <InvoiceForm invoiceData={invoiceData} setInvoiceData={setInvoiceData} />
            ) : (
              <InvoicePreview invoiceData={invoiceData} />
            )}
          </>
        )}

        {activeTab === 'invoices' && (
          <InvoicesList onViewInvoice={handleViewInvoice} />
        )}

        {activeTab === 'payments' && (
          <PaymentsSection />
        )}
      </div>
    </div>
  )
}

export default InvoiceGenerator
