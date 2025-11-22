-- Add missing isActive column to fields table
-- This fixes the farm creation error where field creation fails

ALTER TABLE fields ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

-- Update any existing fields to be active by default
UPDATE fields SET "isActive" = true WHERE "isActive" IS NULL;