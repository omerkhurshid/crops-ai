-- Migration to remove duplicate users table and consolidate to Supabase Auth
-- Run this manually in Supabase SQL Editor

-- Remove foreign key constraints first
ALTER TABLE farms DROP CONSTRAINT IF EXISTS farms_ownerId_fkey;
ALTER TABLE farm_managers DROP CONSTRAINT IF EXISTS farm_managers_userId_fkey; 
ALTER TABLE weather_alerts DROP CONSTRAINT IF EXISTS weather_alerts_userId_fkey;
ALTER TABLE verification_tokens DROP CONSTRAINT IF EXISTS verification_tokens_userId_fkey;

-- Drop the users table (data will be managed in Supabase auth.users)
DROP TABLE IF EXISTS users CASCADE;

-- Note: ownerId, userId fields will now reference auth.users.id directly
-- No foreign key constraints needed as they reference Supabase's auth schema