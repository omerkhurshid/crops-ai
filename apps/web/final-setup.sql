-- Final Database Setup for Crops.AI - Safe version
-- This version checks for table existence before creating indexes

-- Enable extensions safely
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create performance indexes only for tables that exist
DO $$
BEGIN
    -- Task indexes (if Task table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Task') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON "Task"("userId", status);
        CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON "Task"("userId", "dueDate");
        CREATE INDEX IF NOT EXISTS idx_tasks_farm_status ON "Task"("farmId", status);
        CREATE INDEX IF NOT EXISTS idx_tasks_field_status ON "Task"("fieldId", status) WHERE "fieldId" IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_tasks_pending ON "Task"("userId", "dueDate") WHERE status = 'pending';
        CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON "Task"("createdAt" DESC);
        CREATE INDEX IF NOT EXISTS idx_tasks_title_search ON "Task" USING gin(to_tsvector('english', title));
        RAISE NOTICE 'Created Task indexes';
    ELSE
        RAISE NOTICE 'Task table does not exist - skipping Task indexes';
    END IF;

    -- Field indexes (if Field table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Field') THEN
        CREATE INDEX IF NOT EXISTS idx_fields_farm_active ON "Field"("farmId", "isActive");
        CREATE INDEX IF NOT EXISTS idx_fields_farm_status ON "Field"("farmId", status);
        CREATE INDEX IF NOT EXISTS idx_fields_active ON "Field"("farmId") WHERE "isActive" = true;
        RAISE NOTICE 'Created Field indexes';
    ELSE
        RAISE NOTICE 'Field table does not exist - skipping Field indexes';
    END IF;

    -- Farm indexes (if Farm table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Farm') THEN
        CREATE INDEX IF NOT EXISTS idx_farms_user_active ON "Farm"("ownerId", "isActive");
        CREATE INDEX IF NOT EXISTS idx_farms_created_at ON "Farm"("createdAt" DESC);
        CREATE INDEX IF NOT EXISTS idx_farms_name_search ON "Farm" USING gin(to_tsvector('english', name));
        RAISE NOTICE 'Created Farm indexes';
    ELSE
        RAISE NOTICE 'Farm table does not exist - skipping Farm indexes';
    END IF;

    -- FinancialTransaction indexes (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'FinancialTransaction') THEN
        CREATE INDEX IF NOT EXISTS idx_financial_transactions_farm_date ON "FinancialTransaction"("farmId", "transactionDate" DESC);
        CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_date ON "FinancialTransaction"("userId", "transactionDate" DESC);
        CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON "FinancialTransaction"(category, "transactionDate" DESC);
        CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON "FinancialTransaction"(type, "transactionDate" DESC);
        CREATE INDEX IF NOT EXISTS idx_financial_created_at ON "FinancialTransaction"("createdAt" DESC);
        RAISE NOTICE 'Created FinancialTransaction indexes';
    ELSE
        RAISE NOTICE 'FinancialTransaction table does not exist - skipping its indexes';
    END IF;

    -- WeatherData indexes (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'WeatherData') THEN
        CREATE INDEX IF NOT EXISTS idx_weather_data_farm_time ON "WeatherData"("farmId", timestamp DESC) WHERE "farmId" IS NOT NULL;
        RAISE NOTICE 'Created WeatherData indexes';
    ELSE
        RAISE NOTICE 'WeatherData table does not exist - skipping its indexes';
    END IF;

    -- WeatherAlert indexes (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'WeatherAlert') THEN
        CREATE INDEX IF NOT EXISTS idx_weather_alerts_farm_active ON "WeatherAlert"("farmId", "isActive", "createdAt" DESC);
        CREATE INDEX IF NOT EXISTS idx_weather_alerts_severity_active ON "WeatherAlert"(severity, "isActive");
        CREATE INDEX IF NOT EXISTS idx_weather_alerts_unread ON "WeatherAlert"("farmId", "createdAt" DESC) WHERE "isActive" = true;
        RAISE NOTICE 'Created WeatherAlert indexes';
    ELSE
        RAISE NOTICE 'WeatherAlert table does not exist - skipping its indexes';
    END IF;

    -- Crop indexes (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Crop') THEN
        CREATE INDEX IF NOT EXISTS idx_crops_farm ON "Crop"("farmId", "plantingDate" DESC);
        CREATE INDEX IF NOT EXISTS idx_crops_field ON "Crop"("fieldId", "plantingDate" DESC);
        CREATE INDEX IF NOT EXISTS idx_crops_type_status ON "Crop"("cropType", status);
        CREATE INDEX IF NOT EXISTS idx_crops_created_at ON "Crop"("createdAt" DESC);
        CREATE INDEX IF NOT EXISTS idx_crops_type_search ON "Crop" USING gin(to_tsvector('english', "cropType"));
        RAISE NOTICE 'Created Crop indexes';
    ELSE
        RAISE NOTICE 'Crop table does not exist - skipping its indexes';
    END IF;

    -- Session indexes (if table exists) - this was causing the error
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Session') THEN
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON "Session"("userId");
        CREATE INDEX IF NOT EXISTS idx_sessions_expires ON "Session"(expires);
        RAISE NOTICE 'Created Session indexes';
    ELSE
        RAISE NOTICE 'Session table does not exist - skipping Session indexes (normal for some NextAuth setups)';
    END IF;

    -- Account indexes (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Account') THEN
        CREATE INDEX IF NOT EXISTS idx_accounts_user ON "Account"("userId");
        CREATE INDEX IF NOT EXISTS idx_accounts_provider ON "Account"(provider, "providerAccountId");
        RAISE NOTICE 'Created Account indexes';
    ELSE
        RAISE NOTICE 'Account table does not exist - skipping Account indexes';
    END IF;

    -- User indexes (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User') THEN
        CREATE INDEX IF NOT EXISTS idx_users_email ON "User"(email);
        CREATE INDEX IF NOT EXISTS idx_users_created_at ON "User"("createdAt" DESC);
        RAISE NOTICE 'Created User indexes';
    ELSE
        RAISE NOTICE 'User table does not exist - skipping User indexes';
    END IF;

END $$;

-- Analyze existing tables for optimal query planning
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Task') THEN
        ANALYZE "Task";
        RAISE NOTICE 'Analyzed Task table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Field') THEN
        ANALYZE "Field";
        RAISE NOTICE 'Analyzed Field table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Farm') THEN
        ANALYZE "Farm";
        RAISE NOTICE 'Analyzed Farm table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'FinancialTransaction') THEN
        ANALYZE "FinancialTransaction";
        RAISE NOTICE 'Analyzed FinancialTransaction table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'WeatherData') THEN
        ANALYZE "WeatherData";
        RAISE NOTICE 'Analyzed WeatherData table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'WeatherAlert') THEN
        ANALYZE "WeatherAlert";
        RAISE NOTICE 'Analyzed WeatherAlert table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Crop') THEN
        ANALYZE "Crop";
        RAISE NOTICE 'Analyzed Crop table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User') THEN
        ANALYZE "User";
        RAISE NOTICE 'Analyzed User table';
    END IF;
END $$;

-- Final summary
SELECT 
    'Database optimization completed!' as message,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes;