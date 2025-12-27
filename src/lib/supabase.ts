import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          invoice_date: string
          due_date: string
          customer_id: string | null
          buyer_name: string
          buyer_address: string
          buyer_phone: string
          buyer_email: string | null
          items: any
          total: number
          payments: any
          amount_paid: number
          balance: number
          payment_status: string
          notes: string | null
          terms: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          invoice_date: string
          due_date: string
          customer_id?: string | null
          buyer_name: string
          buyer_address: string
          buyer_phone: string
          buyer_email?: string | null
          items: any
          total: number
          payments?: any
          amount_paid?: number
          balance?: number
          payment_status?: string
          notes?: string | null
          terms?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          invoice_date?: string
          due_date?: string
          customer_id?: string | null
          buyer_name?: string
          buyer_address?: string
          buyer_phone?: string
          buyer_email?: string | null
          items?: any
          total?: number
          payments?: any
          amount_paid?: number
          balance?: number
          payment_status?: string
          notes?: string | null
          terms?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
