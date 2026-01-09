-- Create target_settings table for Target Settings page
-- This table stores GGR (Gross Gaming Revenue) targets for each cycle and option per month

CREATE TABLE IF NOT EXISTS target_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month VARCHAR(7) NOT NULL UNIQUE, -- Format: YYYY-MM (e.g., "2024-01")
  
  -- Cycle 1 GGR Options (3 options per cycle)
  cycle1_ggr_option1 NUMERIC(15, 2) NOT NULL DEFAULT 250000.00,
  cycle1_ggr_option2 NUMERIC(15, 2) NOT NULL DEFAULT 300000.00,
  cycle1_ggr_option3 NUMERIC(15, 2) NOT NULL DEFAULT 360000.00,
  
  -- Cycle 2 GGR Options
  cycle2_ggr_option1 NUMERIC(15, 2) NOT NULL DEFAULT 250000.00,
  cycle2_ggr_option2 NUMERIC(15, 2) NOT NULL DEFAULT 300000.00,
  cycle2_ggr_option3 NUMERIC(15, 2) NOT NULL DEFAULT 360000.00,
  
  -- Cycle 3 GGR Options
  cycle3_ggr_option1 NUMERIC(15, 2) NOT NULL DEFAULT 250000.00,
  cycle3_ggr_option2 NUMERIC(15, 2) NOT NULL DEFAULT 300000.00,
  cycle3_ggr_option3 NUMERIC(15, 2) NOT NULL DEFAULT 360000.00,
  
  -- Cycle 4 GGR Options
  cycle4_ggr_option1 NUMERIC(15, 2) NOT NULL DEFAULT 250000.00,
  cycle4_ggr_option2 NUMERIC(15, 2) NOT NULL DEFAULT 300000.00,
  cycle4_ggr_option3 NUMERIC(15, 2) NOT NULL DEFAULT 360000.00,
  
  -- Squad-level GGR targets (for Squad A and Squad B)
  squad_a_ggr_option1 NUMERIC(15, 2) NOT NULL DEFAULT 250000.00,
  squad_a_ggr_option2 NUMERIC(15, 2) NOT NULL DEFAULT 300000.00,
  squad_a_ggr_option3 NUMERIC(15, 2) NOT NULL DEFAULT 360000.00,
  
  squad_b_ggr_option1 NUMERIC(15, 2) NOT NULL DEFAULT 250000.00,
  squad_b_ggr_option2 NUMERIC(15, 2) NOT NULL DEFAULT 300000.00,
  squad_b_ggr_option3 NUMERIC(15, 2) NOT NULL DEFAULT 360000.00,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on month for faster queries
CREATE INDEX IF NOT EXISTS idx_target_settings_month ON target_settings(month);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_target_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_target_settings_updated_at
  BEFORE UPDATE ON target_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_target_settings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE target_settings IS 'Stores GGR (Gross Gaming Revenue) targets for each cycle and squad per month';
COMMENT ON COLUMN target_settings.month IS 'Month in format YYYY-MM (e.g., 2024-01)';
COMMENT ON COLUMN target_settings.cycle1_ggr_option1 IS 'Cycle 1 (Days 1-7) GGR Target Option 1';
COMMENT ON COLUMN target_settings.cycle1_ggr_option2 IS 'Cycle 1 (Days 1-7) GGR Target Option 2';
COMMENT ON COLUMN target_settings.cycle1_ggr_option3 IS 'Cycle 1 (Days 1-7) GGR Target Option 3';
COMMENT ON COLUMN target_settings.cycle2_ggr_option1 IS 'Cycle 2 (Days 8-14) GGR Target Option 1';
COMMENT ON COLUMN target_settings.cycle2_ggr_option2 IS 'Cycle 2 (Days 8-14) GGR Target Option 2';
COMMENT ON COLUMN target_settings.cycle2_ggr_option3 IS 'Cycle 2 (Days 8-14) GGR Target Option 3';
COMMENT ON COLUMN target_settings.cycle3_ggr_option1 IS 'Cycle 3 (Days 15-21) GGR Target Option 1';
COMMENT ON COLUMN target_settings.cycle3_ggr_option2 IS 'Cycle 3 (Days 15-21) GGR Target Option 2';
COMMENT ON COLUMN target_settings.cycle3_ggr_option3 IS 'Cycle 3 (Days 15-21) GGR Target Option 3';
COMMENT ON COLUMN target_settings.cycle4_ggr_option1 IS 'Cycle 4 (Days 22-28) GGR Target Option 1';
COMMENT ON COLUMN target_settings.cycle4_ggr_option2 IS 'Cycle 4 (Days 22-28) GGR Target Option 2';
COMMENT ON COLUMN target_settings.cycle4_ggr_option3 IS 'Cycle 4 (Days 22-28) GGR Target Option 3';
COMMENT ON COLUMN target_settings.squad_a_ggr_option1 IS 'Squad A GGR Target Option 1';
COMMENT ON COLUMN target_settings.squad_a_ggr_option2 IS 'Squad A GGR Target Option 2';
COMMENT ON COLUMN target_settings.squad_a_ggr_option3 IS 'Squad A GGR Target Option 3';
COMMENT ON COLUMN target_settings.squad_b_ggr_option1 IS 'Squad B GGR Target Option 1';
COMMENT ON COLUMN target_settings.squad_b_ggr_option2 IS 'Squad B GGR Target Option 2';
COMMENT ON COLUMN target_settings.squad_b_ggr_option3 IS 'Squad B GGR Target Option 3';

