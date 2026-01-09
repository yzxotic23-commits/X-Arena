-- Create target_personal table for Target Personal settings
-- This table stores personal targets for different deposit amounts and categories

CREATE TABLE IF NOT EXISTS target_personal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM (e.g., "2024-01")
  deposit_amount NUMERIC(15, 6) NOT NULL, -- Support up to 6 decimal places (e.g., 0.001)
  retention NUMERIC(15, 6) NOT NULL DEFAULT 0,
  reactivation NUMERIC(15, 6) NOT NULL DEFAULT 0,
  recommend NUMERIC(15, 6) NOT NULL DEFAULT 0,
  days_4_7 NUMERIC(15, 6) NOT NULL DEFAULT 0,
  days_8_11 NUMERIC(15, 6) NOT NULL DEFAULT 0,
  days_12_15 NUMERIC(15, 6) NOT NULL DEFAULT 0,
  days_16_19 NUMERIC(15, 6) NOT NULL DEFAULT 0,
  days_20_more NUMERIC(15, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month) -- Only one record per month
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_target_personal_month ON target_personal(month);
CREATE INDEX IF NOT EXISTS idx_target_personal_deposit_amount ON target_personal(deposit_amount);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_target_personal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_target_personal_updated_at
  BEFORE UPDATE ON target_personal
  FOR EACH ROW
  EXECUTE FUNCTION update_target_personal_updated_at();

-- Add comments for documentation
COMMENT ON TABLE target_personal IS 'Stores personal targets for different deposit amounts and categories';
COMMENT ON COLUMN target_personal.month IS 'Month in format YYYY-MM';
COMMENT ON COLUMN target_personal.deposit_amount IS 'Deposit amount threshold';
COMMENT ON COLUMN target_personal.retention IS 'Retention target value';
COMMENT ON COLUMN target_personal.reactivation IS 'Reactivation target value';
COMMENT ON COLUMN target_personal.recommend IS 'Recommend target value';
COMMENT ON COLUMN target_personal.days_4_7 IS 'Target for 4-7 days';
COMMENT ON COLUMN target_personal.days_8_11 IS 'Target for 8-11 days';
COMMENT ON COLUMN target_personal.days_12_15 IS 'Target for 12-15 days';
COMMENT ON COLUMN target_personal.days_16_19 IS 'Target for 16-19 days';
COMMENT ON COLUMN target_personal.days_20_more IS 'Target for 20 days or more';

