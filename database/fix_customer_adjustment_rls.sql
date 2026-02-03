-- Fix RLS policies for customer_adjustment table
-- This script will drop existing policies and recreate them to ensure proper access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read customer_adjustment" ON customer_adjustment;
DROP POLICY IF EXISTS "Allow authenticated users to insert customer_adjustment" ON customer_adjustment;
DROP POLICY IF EXISTS "Allow authenticated users to update customer_adjustment" ON customer_adjustment;
DROP POLICY IF EXISTS "Allow authenticated users to delete customer_adjustment" ON customer_adjustment;

-- Ensure RLS is enabled
ALTER TABLE customer_adjustment ENABLE ROW LEVEL SECURITY;

-- Recreate policy for authenticated users to read all adjustments
CREATE POLICY "Allow authenticated users to read customer_adjustment"
  ON customer_adjustment
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate policy for authenticated users to insert adjustments
-- Using WITH CHECK (true) to allow all authenticated users to insert
CREATE POLICY "Allow authenticated users to insert customer_adjustment"
  ON customer_adjustment
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Recreate policy for authenticated users to update adjustments
CREATE POLICY "Allow authenticated users to update customer_adjustment"
  ON customer_adjustment
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Recreate policy for authenticated users to delete adjustments
CREATE POLICY "Allow authenticated users to delete customer_adjustment"
  ON customer_adjustment
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'customer_adjustment'
ORDER BY policyname;
