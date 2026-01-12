-- Create customer_extra table
-- This table has the same structure as customer_retention and customer_reactivation
-- Columns: id, unique_code, brand, handler, label, month, created_at, updated_at

CREATE TABLE IF NOT EXISTS customer_extra (
  id BIGSERIAL PRIMARY KEY,
  unique_code TEXT NOT NULL,
  brand TEXT NOT NULL,
  handler TEXT NOT NULL CHECK (handler IN ('Shift A', 'Shift B')),
  label TEXT DEFAULT 'non active',
  month TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_extra_unique_code ON customer_extra(unique_code);
CREATE INDEX IF NOT EXISTS idx_customer_extra_brand ON customer_extra(brand);
CREATE INDEX IF NOT EXISTS idx_customer_extra_handler ON customer_extra(handler);
CREATE INDEX IF NOT EXISTS idx_customer_extra_month ON customer_extra(month);
CREATE INDEX IF NOT EXISTS idx_customer_extra_brand_handler ON customer_extra(brand, handler);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_customer_extra_updated_at
  BEFORE UPDATE ON customer_extra
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE customer_extra IS 'Customer Extra listing table - same structure as customer_retention and customer_reactivation';
COMMENT ON COLUMN customer_extra.unique_code IS 'Unique customer code';
COMMENT ON COLUMN customer_extra.brand IS 'Brand name';
COMMENT ON COLUMN customer_extra.handler IS 'Handler shift (Shift A or Shift B)';
COMMENT ON COLUMN customer_extra.label IS 'Customer label (active or non active)';
COMMENT ON COLUMN customer_extra.month IS 'Month in format YYYY-MM';
