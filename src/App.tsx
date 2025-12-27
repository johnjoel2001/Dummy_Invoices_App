import InvoiceGenerator from './components/InvoiceGenerator'
import { FileText } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Dummy Invoice Generator</h1>
          </div>
        </div>
        
        <InvoiceGenerator />
      </div>
    </div>
  )
}

export default App
