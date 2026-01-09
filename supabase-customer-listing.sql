-- Create customer listing tables for Customer Listing page
-- Three separate tables: reactivation, retention, and recommend

-- ============================================
-- 1. Customer Reactivation Table
-- ============================================
CREATE TABLE IF NOT EXISTS customer_reactivation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unique_code VARCHAR(50) NOT NULL,
  username VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  handler VARCHAR(100) NOT NULL,
  label VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on unique_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_customer_reactivation_unique_code ON customer_reactivation(unique_code);
CREATE INDEX IF NOT EXISTS idx_customer_reactivation_username ON customer_reactivation(username);
CREATE INDEX IF NOT EXISTS idx_customer_reactivation_brand ON customer_reactivation(brand);

-- ============================================
-- 2. Customer Retention Table
-- ============================================
CREATE TABLE IF NOT EXISTS customer_retention (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unique_code VARCHAR(50) NOT NULL,
  username VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  handler VARCHAR(100) NOT NULL,
  label VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on unique_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_customer_retention_unique_code ON customer_retention(unique_code);
CREATE INDEX IF NOT EXISTS idx_customer_retention_username ON customer_retention(username);
CREATE INDEX IF NOT EXISTS idx_customer_retention_brand ON customer_retention(brand);

-- ============================================
-- 3. Customer Recommend Table
-- ============================================
CREATE TABLE IF NOT EXISTS customer_recommend (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unique_code VARCHAR(50) NOT NULL,
  username VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  handler VARCHAR(100) NOT NULL,
  label VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on unique_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_customer_recommend_unique_code ON customer_recommend(unique_code);
CREATE INDEX IF NOT EXISTS idx_customer_recommend_username ON customer_recommend(username);
CREATE INDEX IF NOT EXISTS idx_customer_recommend_brand ON customer_recommend(brand);

-- ============================================
-- Functions to automatically update updated_at
-- ============================================

-- Function for customer_reactivation
CREATE OR REPLACE FUNCTION update_customer_reactivation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for customer_retention
CREATE OR REPLACE FUNCTION update_customer_retention_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for customer_recommend
CREATE OR REPLACE FUNCTION update_customer_recommend_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers to automatically update updated_at
-- ============================================

-- Trigger for customer_reactivation
CREATE TRIGGER trigger_update_customer_reactivation_updated_at
  BEFORE UPDATE ON customer_reactivation
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_reactivation_updated_at();

-- Trigger for customer_retention
CREATE TRIGGER trigger_update_customer_retention_updated_at
  BEFORE UPDATE ON customer_retention
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_retention_updated_at();

-- Trigger for customer_recommend
CREATE TRIGGER trigger_update_customer_recommend_updated_at
  BEFORE UPDATE ON customer_recommend
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_recommend_updated_at();

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE customer_reactivation IS 'Stores customer data for reactivation tab - customers who need to be reactivated';
COMMENT ON TABLE customer_retention IS 'Stores customer data for retention tab - active customers to be retained';
COMMENT ON TABLE customer_recommend IS 'Stores customer data for recommend tab - new customers from recommendations';

COMMENT ON COLUMN customer_reactivation.unique_code IS 'Unique identifier code for the customer (e.g., UC001)';
COMMENT ON COLUMN customer_reactivation.username IS 'Customer username';
COMMENT ON COLUMN customer_reactivation.brand IS 'Brand associated with the customer';
COMMENT ON COLUMN customer_reactivation.handler IS 'Handler/agent assigned to the customer';
COMMENT ON COLUMN customer_reactivation.label IS 'Customer label/status (e.g., Dormant, VIP, Premium, Active, New)';

COMMENT ON COLUMN customer_retention.unique_code IS 'Unique identifier code for the customer (e.g., UC001)';
COMMENT ON COLUMN customer_retention.username IS 'Customer username';
COMMENT ON COLUMN customer_retention.brand IS 'Brand associated with the customer';
COMMENT ON COLUMN customer_retention.handler IS 'Handler/agent assigned to the customer';
COMMENT ON COLUMN customer_retention.label IS 'Customer label/status (e.g., Dormant, VIP, Premium, Active, New)';

COMMENT ON COLUMN customer_recommend.unique_code IS 'Unique identifier code for the customer (e.g., UC001)';
COMMENT ON COLUMN customer_recommend.username IS 'Customer username';
COMMENT ON COLUMN customer_recommend.brand IS 'Brand associated with the customer';
COMMENT ON COLUMN customer_recommend.handler IS 'Handler/agent assigned to the customer';
COMMENT ON COLUMN customer_recommend.label IS 'Customer label/status (e.g., Dormant, VIP, Premium, Active, New)';

