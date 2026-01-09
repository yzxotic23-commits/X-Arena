-- Add month column to customer listing tables
-- Format: YYYY-MM (e.g., "2024-01")

-- Add month column to customer_reactivation
ALTER TABLE customer_reactivation 
ADD COLUMN IF NOT EXISTS month VARCHAR(7);

-- Add month column to customer_retention
ALTER TABLE customer_retention 
ADD COLUMN IF NOT EXISTS month VARCHAR(7);

-- Add month column to customer_recommend
ALTER TABLE customer_recommend 
ADD COLUMN IF NOT EXISTS month VARCHAR(7);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_customer_reactivation_month ON customer_reactivation(month);
CREATE INDEX IF NOT EXISTS idx_customer_retention_month ON customer_retention(month);
CREATE INDEX IF NOT EXISTS idx_customer_recommend_month ON customer_recommend(month);

-- Add comments
COMMENT ON COLUMN customer_reactivation.month IS 'Month for which this listing is used (format: YYYY-MM)';
COMMENT ON COLUMN customer_retention.month IS 'Month for which this listing is used (format: YYYY-MM)';
COMMENT ON COLUMN customer_recommend.month IS 'Month for which this listing is used (format: YYYY-MM)';

