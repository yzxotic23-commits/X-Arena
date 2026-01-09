-- Remove squad column from squad_mapping table
-- This script removes the squad column as it's no longer needed in the UI

-- Drop the index on squad column first
DROP INDEX IF EXISTS idx_squad_mapping_squad;

-- Remove the squad column from the table
ALTER TABLE squad_mapping DROP COLUMN IF EXISTS squad;

-- Update the table comment
COMMENT ON TABLE squad_mapping IS 'Stores mapping between users, brands, and shifts';

