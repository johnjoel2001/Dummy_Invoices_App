import { InvoiceData } from '../types/invoice'

interface InvoicePreviewProps {
  invoiceData: InvoiceData
}

const InvoicePreview = ({ invoiceData }: InvoicePreviewProps) => {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h1>
          <p className="text-gray-600">#{invoiceData.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Invoice Date</p>
          <p className="font-semibold">{new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
          <p className="text-sm text-gray-600 mt-2">Due Date</p>
          <p className="font-semibold">{new Date(invoiceData.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Seller and Buyer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">FROM</h3>
          <div className="text-gray-800">
            <p className="font-bold text-lg">{invoiceData.sellerName}</p>
            <p>{invoiceData.sellerAddress}</p>
            <p>{invoiceData.sellerCity}, {invoiceData.sellerState} {invoiceData.sellerZip}</p>
            <p className="mt-2">{invoiceData.sellerPhone}</p>
            <p>{invoiceData.sellerEmail}</p>
            {invoiceData.sellerGST && <p className="mt-1 text-sm">GST: {invoiceData.sellerGST}</p>}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">BILL TO</h3>
          <div className="text-gray-800">
            <p className="font-bold text-lg">{invoiceData.buyerName}</p>
            <p>{invoiceData.buyerAddress}</p>
            <p>{invoiceData.buyerCity}, {invoiceData.buyerState} {invoiceData.buyerZip}</p>
            <p className="mt-2">{invoiceData.buyerPhone}</p>
            <p>{invoiceData.buyerEmail}</p>
            {invoiceData.buyerGST && <p className="mt-1 text-sm">GST: {invoiceData.buyerGST}</p>}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">DESCRIPTION</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">QTY</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">RATE</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3 px-2 text-gray-800">{item.description}</td>
                <td className="py-3 px-2 text-right text-gray-800">{item.quantity}</td>
                <td className="py-3 px-2 text-right text-gray-800">₹{item.rate.toFixed(2)}</td>
                <td className="py-3 px-2 text-right text-gray-800 font-semibold">₹{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-semibold">₹{invoiceData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700">Tax ({invoiceData.taxRate}%):</span>
            <span className="font-semibold">₹{invoiceData.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-gray-300">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-lg font-bold text-indigo-600">₹{invoiceData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {(invoiceData.notes || invoiceData.terms) && (
        <div className="border-t-2 border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {invoiceData.notes && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{invoiceData.notes}</p>
            </div>
          )}
          {invoiceData.terms && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Terms & Conditions</h4>
              <p className="text-sm text-gray-600">{invoiceData.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InvoicePreview
