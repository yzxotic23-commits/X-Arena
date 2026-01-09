-- Remove username column from customer_reactivation and customer_retention tables
-- Username is only needed for customer_recommend table

-- Remove username column from customer_reactivation
ALTER TABLE customer_reactivation DROP COLUMN IF EXISTS username;

-- Remove username column from customer_retention
ALTER TABLE customer_retention DROP COLUMN IF EXISTS username;

-- Note: customer_recommend table still has username column

