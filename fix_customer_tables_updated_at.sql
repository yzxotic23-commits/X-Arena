-- Fix: Add updated_at column to customer tables if missing
-- This fixes the error: "record "new" has no field "updated_at""
-- 
-- Instructions:
-- 1. Run this script in Supabase SQL Editor
-- 2. This will add updated_at column to all customer tables if missing
-- 3. It will also create/update triggers to automatically update updated_at on row update

-- First, create the function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check and add updated_at column to customer_reactivation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_reactivation' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE customer_reactivation ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        CREATE TRIGGER update_customer_reactivation_updated_at
            BEFORE UPDATE ON customer_reactivation
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Check and add updated_at column to customer_retention
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_retention' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE customer_retention ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        CREATE TRIGGER update_customer_retention_updated_at
            BEFORE UPDATE ON customer_retention
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Check and add updated_at column to customer_recommend
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_recommend' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE customer_recommend ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        CREATE TRIGGER update_customer_recommend_updated_at
            BEFORE UPDATE ON customer_recommend
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Check and add updated_at column to customer_extra
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_extra' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE customer_extra ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        CREATE TRIGGER update_customer_extra_updated_at
            BEFORE UPDATE ON customer_extra
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Note: If update_updated_at_column() function doesn't exist, create it first:
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
