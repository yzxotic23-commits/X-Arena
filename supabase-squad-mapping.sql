-- Create squad_mapping table for Squad Mapping page
-- This table stores mapping between users, squads, brands, and shifts

CREATE TABLE IF NOT EXISTS squad_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  squad VARCHAR(50) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  shift VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_squad_mapping_username ON squad_mapping(username);
CREATE INDEX IF NOT EXISTS idx_squad_mapping_squad ON squad_mapping(squad);
CREATE INDEX IF NOT EXISTS idx_squad_mapping_brand ON squad_mapping(brand);
CREATE INDEX IF NOT EXISTS idx_squad_mapping_status ON squad_mapping(status);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_squad_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_squad_mapping_updated_at
  BEFORE UPDATE ON squad_mapping
  FOR EACH ROW
  EXECUTE FUNCTION update_squad_mapping_updated_at();

-- Add comments for documentation
COMMENT ON TABLE squad_mapping IS 'Stores mapping between users, squads, brands, and shifts';
COMMENT ON COLUMN squad_mapping.username IS 'Username of the user';
COMMENT ON COLUMN squad_mapping.squad IS 'Squad name (e.g., Squad A, Squad B)';
COMMENT ON COLUMN squad_mapping.brand IS 'Brand associated with the user';
COMMENT ON COLUMN squad_mapping.shift IS 'Shift time (e.g., Morning, Afternoon, Night)';
COMMENT ON COLUMN squad_mapping.status IS 'Status of the mapping (active or inactive)';

