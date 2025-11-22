-- Migration to add missing fields to Field table
-- Run this manually in Supabase SQL Editor

ALTER TABLE fields 
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS "cropType" TEXT,
ADD COLUMN IF NOT EXISTS status TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fields_crop_type ON fields("cropType");
CREATE INDEX IF NOT EXISTS idx_fields_status ON fields(status);

-- Update existing fields with default values
UPDATE fields 
SET 
  color = '#7A8F78',
  "cropType" = 'unknown',
  status = 'crop'
WHERE color IS NULL OR "cropType" IS NULL OR status IS NULL;