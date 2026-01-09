-- Remove unique constraint on unique_code from customer listing tables
-- Allow duplicate unique_code values (same unique_code with different brands, or same unique_code and brand)

-- Remove unique constraint from customer_reactivation
-- First, drop the index if it exists
DROP INDEX IF EXISTS idx_customer_reactivation_unique_code;

-- If there's a unique constraint (not just index), we need to drop it
-- Check if constraint exists and drop it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'customer_reactivation_unique_code_key'
    ) THEN
        ALTER TABLE customer_reactivation DROP CONSTRAINT customer_reactivation_unique_code_key;
    END IF;
END $$;

-- Remove unique constraint from customer_retention
DROP INDEX IF EXISTS idx_customer_retention_unique_code;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'customer_retention_unique_code_key'
    ) THEN
        ALTER TABLE customer_retention DROP CONSTRAINT customer_retention_unique_code_key;
    END IF;
END $$;

-- Remove unique constraint from customer_recommend
DROP INDEX IF EXISTS idx_customer_recommend_unique_code;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'customer_recommend_unique_code_key'
    ) THEN
        ALTER TABLE customer_recommend DROP CONSTRAINT customer_recommend_unique_code_key;
    END IF;
END $$;

-- Recreate non-unique indexes for faster lookups (without unique constraint)
CREATE INDEX IF NOT EXISTS idx_customer_reactivation_unique_code ON customer_reactivation(unique_code);
CREATE INDEX IF NOT EXISTS idx_customer_retention_unique_code ON customer_retention(unique_code);
CREATE INDEX IF NOT EXISTS idx_customer_recommend_unique_code ON customer_recommend(unique_code);

