import { supabase } from '../lib/supabase'
import { Customer, InvoiceData } from '../types/invoice'

// ============ CUSTOMERS ============

export const getCustomersFromSupabase = async (): Promise<Customer[]> => {
  try {
    console.log('Fetching customers from Supabase...')
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Supabase error fetching customers:', error)
      throw error
    }
    
    console.log('Customers fetched successfully:', data?.length || 0)
    return data.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address || undefined,
      phone: row.phone || undefined,
      email: row.email || undefined
    }))
  } catch (error) {
    console.error('Error fetching customers:', error)
    return []
  }
}

export const saveCustomerToSupabase = async (customer: Customer): Promise<boolean> => {
  try {
    console.log('Saving customer to Supabase:', customer)
    const { data, error } = await supabase
      .from('customers')
      .upsert({
        id: customer.id,
        name: customer.name,
        address: customer.address || null,
        phone: customer.phone || null,
        email: customer.email || null
      })
      .select()

    if (error) {
      console.error('Supabase error saving customer:', error)
      throw error
    }
    console.log('Customer saved successfully:', data)
    return true
  } catch (error) {
    console.error('Error saving customer:', error)
    return false
  }
}

export const deleteCustomerFromSupabase = async (customerId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting customer:', error)
    return false
  }
}

// ============ INVOICES ============

export const getInvoicesFromSupabase = async (): Promise<InvoiceData[]> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return data.map(row => ({
      invoiceNumber: row.invoice_number,
      invoiceDate: row.invoice_date,
      dueDate: row.due_date,
      customerId: row.customer_id || undefined,
      buyerName: row.buyer_name,
      buyerAddress: row.buyer_address,
      buyerPhone: row.buyer_phone,
      buyerEmail: row.buyer_email || undefined,
      items: row.items,
      total: row.total,
      payments: row.payments || [],
      amountPaid: row.amount_paid,
      balance: row.balance,
      paymentStatus: row.payment_status as 'Unpaid' | 'Partial' | 'Paid',
      notes: row.notes || undefined,
      terms: row.terms || undefined
    }))
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return []
  }
}

export const saveInvoiceToSupabase = async (invoice: InvoiceData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('invoices')
      .upsert({
        invoice_number: invoice.invoiceNumber,
        invoice_date: invoice.invoiceDate,
        due_date: invoice.dueDate,
        customer_id: invoice.customerId || null,
        buyer_name: invoice.buyerName,
        buyer_address: invoice.buyerAddress,
        buyer_phone: invoice.buyerPhone,
        buyer_email: invoice.buyerEmail || null,
        items: invoice.items,
        total: invoice.total,
        payments: invoice.payments || [],
        amount_paid: invoice.amountPaid || 0,
        balance: invoice.balance || invoice.total,
        payment_status: invoice.paymentStatus || 'Unpaid',
        notes: invoice.notes || null,
        terms: invoice.terms || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'invoice_number'
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error saving invoice:', error)
    return false
  }
}

export const deleteInvoiceFromSupabase = async (invoiceNumber: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('invoice_number', invoiceNumber)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return false
  }
}
