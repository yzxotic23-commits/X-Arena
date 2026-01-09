-- Create brand_mapping table for Brand Mapping page
-- This table stores mapping between brands and squads

CREATE TABLE IF NOT EXISTS brand_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  squad VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_brand_mapping_brand ON brand_mapping(brand);
CREATE INDEX IF NOT EXISTS idx_brand_mapping_squad ON brand_mapping(squad);
CREATE INDEX IF NOT EXISTS idx_brand_mapping_status ON brand_mapping(status);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brand_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_brand_mapping_updated_at
  BEFORE UPDATE ON brand_mapping
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_mapping_updated_at();

-- Add comments for documentation
COMMENT ON TABLE brand_mapping IS 'Stores mapping between brands and squads';
COMMENT ON COLUMN brand_mapping.brand IS 'Brand name';
COMMENT ON COLUMN brand_mapping.squad IS 'Squad name (e.g., Squad A, Squad B)';
COMMENT ON COLUMN brand_mapping.status IS 'Status of the mapping (active or inactive)';

