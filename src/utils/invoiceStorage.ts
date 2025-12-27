import { InvoiceData } from '../types/invoice'
import { 
  getInvoicesFromSupabase, 
  saveInvoiceToSupabase, 
  deleteInvoiceFromSupabase 
} from './supabaseStorage'

const STORAGE_KEY = 'safetex_invoices'

// Synchronous version for compatibility
export const getInvoicesSync = (): InvoiceData[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

// Get invoices from Supabase (with localStorage fallback)
export const getInvoices = async (): Promise<InvoiceData[]> => {
  try {
    const invoices = await getInvoicesFromSupabase()
    // Also save to localStorage as cache
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
    return invoices
  } catch (error) {
    console.error('Supabase error, using localStorage:', error)
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }
}

// Save invoice to Supabase
export const saveInvoice = async (invoice: InvoiceData): Promise<void> => {
  try {
    await saveInvoiceToSupabase(invoice)
    // Also update localStorage
    const invoices = getInvoicesSync()
    const existingIndex = invoices.findIndex(inv => inv.invoiceNumber === invoice.invoiceNumber)
    
    if (existingIndex >= 0) {
      invoices[existingIndex] = invoice
    } else {
      invoices.push(invoice)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
  } catch (error) {
    console.error('Supabase error, saving to localStorage only:', error)
    const invoices = getInvoicesSync()
    const existingIndex = invoices.findIndex(inv => inv.invoiceNumber === invoice.invoiceNumber)
    
    if (existingIndex >= 0) {
      invoices[existingIndex] = invoice
    } else {
      invoices.push(invoice)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
  }
}

// Delete invoice from Supabase
export const deleteInvoice = async (invoiceNumber: string): Promise<void> => {
  try {
    await deleteInvoiceFromSupabase(invoiceNumber)
    // Also update localStorage
    const invoices = getInvoicesSync().filter(inv => inv.invoiceNumber !== invoiceNumber)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
  } catch (error) {
    console.error('Supabase error, deleting from localStorage only:', error)
    const invoices = getInvoicesSync().filter(inv => inv.invoiceNumber !== invoiceNumber)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
  }
}

export const getInvoiceByNumber = (invoiceNumber: string): InvoiceData | undefined => {
  return getInvoicesSync().find(inv => inv.invoiceNumber === invoiceNumber)
}
