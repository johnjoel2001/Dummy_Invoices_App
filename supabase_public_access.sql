-- Run this SQL in Supabase SQL Editor to enable public access
-- This allows the app to work with the anon key

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON invoices;

-- Create policies for anonymous (public) access
-- CUSTOMERS TABLE
CREATE POLICY "Allow public all operations" ON customers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- INVOICES TABLE
CREATE POLICY "Allow public all operations" ON invoices
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Also allow authenticated users (if you add auth later)
CREATE POLICY "Allow authenticated all operations" ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated all operations" ON invoices
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
