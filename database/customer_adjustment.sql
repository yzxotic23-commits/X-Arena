-- Create customer_adjustment table for score adjustments
-- This table is used to add bonus scores to staff for Leaderboard and Battle Arena

CREATE TABLE IF NOT EXISTS customer_adjustment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('X-Arena', 'PK-Tracking')),
  employee_name TEXT, -- Only for X-Arena, NULL for PK-Tracking
  squad TEXT NOT NULL, -- Squad A or Squad B (for both X-Arena and PK-Tracking)
  score NUMERIC(10, 2) NOT NULL DEFAULT 0, -- Score to add (for both X-Arena and PK-Tracking)
  month TEXT NOT NULL, -- Format: YYYY-MM (e.g., '2026-01')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_customer_adjustment_month ON customer_adjustment(month);
CREATE INDEX IF NOT EXISTS idx_customer_adjustment_type ON customer_adjustment(type);
CREATE INDEX IF NOT EXISTS idx_customer_adjustment_squad ON customer_adjustment(squad);
CREATE INDEX IF NOT EXISTS idx_customer_adjustment_employee_name ON customer_adjustment(employee_name) WHERE employee_name IS NOT NULL;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_adjustment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_adjustment_updated_at
  BEFORE UPDATE ON customer_adjustment
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_adjustment_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE customer_adjustment ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all adjustments
CREATE POLICY "Allow authenticated users to read customer_adjustment"
  ON customer_adjustment
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated users to insert adjustments
CREATE POLICY "Allow authenticated users to insert customer_adjustment"
  ON customer_adjustment
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for authenticated users to update adjustments
CREATE POLICY "Allow authenticated users to update customer_adjustment"
  ON customer_adjustment
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users to delete adjustments
CREATE POLICY "Allow authenticated users to delete customer_adjustment"
  ON customer_adjustment
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comment to table
COMMENT ON TABLE customer_adjustment IS 'Stores score adjustments for staff in X-Arena and PK-Tracking systems';
COMMENT ON COLUMN customer_adjustment.type IS 'Type of adjustment: X-Arena or PK-Tracking';
COMMENT ON COLUMN customer_adjustment.employee_name IS 'Employee name (only for X-Arena, NULL for PK-Tracking)';
COMMENT ON COLUMN customer_adjustment.squad IS 'Squad assignment: Squad A or Squad B';
COMMENT ON COLUMN customer_adjustment.score IS 'Score to add to the staff member';
COMMENT ON COLUMN customer_adjustment.month IS 'Month in format YYYY-MM (e.g., 2026-01)';
