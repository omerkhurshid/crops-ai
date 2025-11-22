-- Check and fix boundary field constraint issues
-- Make sure boundary field allows NULL values

-- Check current constraint
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'fields' AND column_name = 'boundary';

-- If boundary field exists but doesn't allow NULL, drop the NOT NULL constraint
ALTER TABLE fields ALTER COLUMN boundary DROP NOT NULL;