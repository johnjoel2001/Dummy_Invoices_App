-- Supabase Database Schema for Invoice App
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payments JSONB DEFAULT '[]',
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) DEFAULT 0,
  payment_status TEXT DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid')),
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust based on your needs)
CREATE POLICY "Allow all for authenticated users" ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON invoices
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- For public access (if needed - be careful with this!)
-- Uncomment if you want public read access
-- CREATE POLICY "Allow public read" ON customers
--   FOR SELECT
--   TO anon
--   USING (true);

-- CREATE POLICY "Allow public read" ON invoices
--   FOR SELECT
--   TO anon
--   USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment to insert sample data

-- INSERT INTO customers (id, name, address, phone, email) VALUES
--   ('550e8400-e29b-41d4-a716-446655440001', 'John Doe', '123 Main St, City', '1234567890', 'john@example.com'),
--   ('550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', '456 Oak Ave, Town', '0987654321', 'jane@example.com');

-- INSERT INTO invoices (invoice_number, invoice_date, due_date, customer_id, buyer_name, buyer_address, buyer_phone, items, total, payment_status) VALUES
--   ('INV-001', '2025-01-01', '2025-01-31', '550e8400-e29b-41d4-a716-446655440001', 'John Doe', '123 Main St', '1234567890', 
--    '[{"id":"1","description":"60 GMS BLUE","quantity":100,"rate":50,"amount":5000}]', 5000, 'Unpaid');
