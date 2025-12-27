import { Customer } from '../types/invoice'
import { 
  getCustomersFromSupabase, 
  saveCustomerToSupabase, 
  deleteCustomerFromSupabase 
} from './supabaseStorage'

const STORAGE_KEY = 'safetex_customers'

// Get customers from Supabase (with localStorage fallback)
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const customers = await getCustomersFromSupabase()
    // Also save to localStorage as cache
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
    return customers
  } catch (error) {
    console.error('Supabase error, using localStorage:', error)
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }
}

// Synchronous version for compatibility
export const getCustomersSync = (): Customer[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

// Save customer to Supabase
export const saveCustomer = async (customer: Customer): Promise<void> => {
  try {
    await saveCustomerToSupabase(customer)
    // Also update localStorage
    const customers = getCustomersSync()
    const existingIndex = customers.findIndex(c => c.id === customer.id)
    
    if (existingIndex >= 0) {
      customers[existingIndex] = customer
    } else {
      customers.push(customer)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
  } catch (error) {
    console.error('Supabase error, saving to localStorage only:', error)
    const customers = getCustomersSync()
    const existingIndex = customers.findIndex(c => c.id === customer.id)
    
    if (existingIndex >= 0) {
      customers[existingIndex] = customer
    } else {
      customers.push(customer)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
  }
}

// Delete customer from Supabase
export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    await deleteCustomerFromSupabase(id)
    // Also update localStorage
    const customers = getCustomersSync().filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
  } catch (error) {
    console.error('Supabase error, deleting from localStorage only:', error)
    const customers = getCustomersSync().filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
  }
}

export const getCustomerById = (id: string): Customer | undefined => {
  return getCustomersSync().find(c => c.id === id)
}
