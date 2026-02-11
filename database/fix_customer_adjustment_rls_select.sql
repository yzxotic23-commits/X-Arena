-- Fix RLS policy for SELECT to allow all users (not just authenticated)
-- This is needed because the app uses custom authentication, not Supabase Auth
-- So users are not authenticated as "authenticated" role in Supabase

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Allow authenticated users to read customer_adjustment" ON customer_adjustment;

-- Create new policy that allows all users to read (for custom auth apps)
-- This allows SELECT without requiring Supabase Auth authentication
CREATE POLICY "Allow all users to read customer_adjustment"
  ON customer_adjustment
  FOR SELECT
  TO public
  USING (true);

-- Verify policy is created
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
