-- Safe migration to remove users table
-- Only removes constraints/tables that actually exist

-- Remove foreign key constraint from farms table (if exists)
ALTER TABLE farms DROP CONSTRAINT IF EXISTS farms_ownerId_fkey;

-- Remove foreign key constraint from farm_managers table (if exists) 
ALTER TABLE farm_managers DROP CONSTRAINT IF EXISTS farm_managers_userId_fkey;

-- Drop the users table (if exists)
DROP TABLE IF EXISTS users CASCADE;

-- Note: ownerId and userId fields now reference Supabase auth.users.id directly