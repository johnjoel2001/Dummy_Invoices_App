import { InvoiceData } from '../types/invoice'

interface InvoicePreviewProps {
  invoiceData: InvoiceData
}

const InvoicePreview = ({ invoiceData }: InvoicePreviewProps) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-10 max-w-4xl mx-auto shadow-sm">
      {/* Header - Left aligned */}
      <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-gray-900">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">INVOICE</h1>
          <p className="text-gray-900 font-bold text-base">#{invoiceData.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="mb-3">
            <p className="text-xs text-gray-500 uppercase">Invoice Date</p>
            <p className="font-semibold text-gray-900">{new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Due Date</p>
            <p className="font-semibold text-gray-900">{new Date(invoiceData.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Seller and Buyer Info - Left aligned */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">From</h3>
          <div className="text-gray-900">
            <p className="font-bold text-base mb-1">Safetex Enterprises</p>
            <p className="text-sm leading-relaxed">No. 167, Sri Ram Samaj Nagar, 1st Main Road</p>
            <p className="text-sm leading-relaxed">Vellanur, Avadi</p>
            <p className="text-sm leading-relaxed">Chennai Tamil Nadu 600062</p>
            <p className="text-sm leading-relaxed">India</p>
            <p className="text-sm mt-3">9164103412</p>
            <p className="text-sm">marketing@safetexindia.com</p>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
          <div className="text-gray-900">
            <p className="font-bold text-base mb-1">{invoiceData.buyerName}</p>
            <p className="text-sm leading-relaxed whitespace-pre-line">{invoiceData.buyerAddress}</p>
            <p className="text-sm mt-3">{invoiceData.buyerPhone}</p>
            {invoiceData.buyerEmail && <p className="text-sm">{invoiceData.buyerEmail}</p>}
          </div>
        </div>
      </div>

      {/* Items Table - Clean design */}
      <div className="mb-10">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
              <th className="text-center py-3 text-xs font-bold text-gray-700 uppercase tracking-wider w-20">Qty</th>
              <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase tracking-wider w-28">Rate</th>
              <th className="text-right py-3 text-xs font-bold text-gray-700 uppercase tracking-wider w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-4 text-gray-900">{item.description}</td>
                <td className="py-4 text-center text-gray-900">{item.quantity}</td>
                <td className="py-4 text-right text-gray-900">₹{item.rate.toFixed(2)}</td>
                <td className="py-4 text-right text-gray-900 font-semibold">₹{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Section - Right aligned */}
      <div className="flex justify-end mb-10">
        <div className="w-80">
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-gray-700">Subtotal</span>
              <span className="text-gray-900 font-semibold">₹{invoiceData.total.toFixed(2)}</span>
            </div>
            
            {invoiceData.payments && invoiceData.payments.length > 0 && (
              <>
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-gray-700">Amount Paid</span>
                  <span className="text-gray-900 font-semibold">₹{invoiceData.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-900">
                  <span className="text-lg font-bold text-gray-900">Balance Due</span>
                  <span className="text-lg font-bold text-gray-900">₹{invoiceData.balance.toFixed(2)}</span>
                </div>
                <div className="pt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold ${
                    invoiceData.paymentStatus === 'Paid' ? 'bg-gray-900 text-white' :
                    invoiceData.paymentStatus === 'Partial' ? 'bg-gray-600 text-white' :
                    'bg-gray-400 text-white'
                  }`}>
                    {invoiceData.paymentStatus}
                  </span>
                </div>
              </>
            )}
            
            {(!invoiceData.payments || invoiceData.payments.length === 0) && (
              <div className="flex justify-between py-3 border-t-2 border-gray-900">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-lg font-bold text-gray-900">₹{invoiceData.total.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes and Terms - Left aligned */}
      {(invoiceData.notes || invoiceData.terms) && (
        <div className="border-t border-gray-300 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {invoiceData.notes && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Notes</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{invoiceData.notes}</p>
            </div>
          )}
          {invoiceData.terms && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Terms & Conditions</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{invoiceData.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InvoicePreview
