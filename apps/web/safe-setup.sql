-- Safe database setup - only creates what's missing
-- Run this in Supabase SQL Editor

-- Check what tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ Exists'
        ELSE '❌ Missing'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('User', 'Farm', 'Task', 'Field', 'Crop', 'FinancialTransaction', 'WeatherData', 'WeatherAlert')
ORDER BY table_name;

-- Create missing tables only
DO $$
BEGIN
    -- Create User table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User') THEN
        CREATE TABLE "User" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "passwordHash" TEXT,
            "role" TEXT NOT NULL DEFAULT 'FARM_OWNER',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        );
        CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
        RAISE NOTICE 'Created User table';
    ELSE
        RAISE NOTICE 'User table already exists';
    END IF;

    -- Create Farm table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Farm') THEN
        CREATE TABLE "Farm" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "location" TEXT NOT NULL,
            "totalArea" DOUBLE PRECISION NOT NULL,
            "ownerId" TEXT NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
        );
        RAISE NOTICE 'Created Farm table';
    ELSE
        RAISE NOTICE 'Farm table already exists';
    END IF;

    -- Create Task table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Task') THEN
        CREATE TABLE "Task" (
            "id" TEXT NOT NULL,
            "farmId" TEXT NOT NULL,
            "fieldId" TEXT,
            "userId" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "priority" TEXT NOT NULL DEFAULT 'medium',
            "dueDate" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
        );
        RAISE NOTICE 'Created Task table';
    ELSE
        RAISE NOTICE 'Task table already exists';
    END IF;

    -- Create Field table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Field') THEN
        CREATE TABLE "Field" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "area" DOUBLE PRECISION NOT NULL,
            "farmId" TEXT NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "status" TEXT DEFAULT 'active',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
        );
        RAISE NOTICE 'Created Field table';
    ELSE
        RAISE NOTICE 'Field table already exists';
    END IF;

    -- Create FinancialTransaction table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'FinancialTransaction') THEN
        CREATE TABLE "FinancialTransaction" (
            "id" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "category" TEXT NOT NULL,
            "amount" DECIMAL(65,30) NOT NULL,
            "transactionDate" TIMESTAMP(3) NOT NULL,
            "description" TEXT NOT NULL,
            "farmId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
        );
        RAISE NOTICE 'Created FinancialTransaction table';
    ELSE
        RAISE NOTICE 'FinancialTransaction table already exists';
    END IF;

    -- Add foreign key constraints only if they don't exist
    IF NOT EXISTS (
        SELECT constraint_name FROM information_schema.table_constraints 
        WHERE table_name = 'Farm' AND constraint_name = 'Farm_ownerId_fkey'
    ) THEN
        ALTER TABLE "Farm" ADD CONSTRAINT "Farm_ownerId_fkey" 
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        RAISE NOTICE 'Added Farm_ownerId_fkey constraint';
    ELSE
        RAISE NOTICE 'Farm_ownerId_fkey constraint already exists';
    END IF;

    IF NOT EXISTS (
        SELECT constraint_name FROM information_schema.table_constraints 
        WHERE table_name = 'Task' AND constraint_name = 'Task_farmId_fkey'
    ) THEN
        ALTER TABLE "Task" ADD CONSTRAINT "Task_farmId_fkey" 
        FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        RAISE NOTICE 'Added Task_farmId_fkey constraint';
    ELSE
        RAISE NOTICE 'Task_farmId_fkey constraint already exists';
    END IF;

    IF NOT EXISTS (
        SELECT constraint_name FROM information_schema.table_constraints 
        WHERE table_name = 'Task' AND constraint_name = 'Task_userId_fkey'
    ) THEN
        ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        RAISE NOTICE 'Added Task_userId_fkey constraint';
    ELSE
        RAISE NOTICE 'Task_userId_fkey constraint already exists';
    END IF;

END $$;

-- Now create the performance indexes safely
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON "Task"("userId", status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON "Task"("userId", "dueDate");
CREATE INDEX IF NOT EXISTS idx_tasks_farm_status ON "Task"("farmId", status);
CREATE INDEX IF NOT EXISTS idx_fields_farm_active ON "Field"("farmId", "isActive");
CREATE INDEX IF NOT EXISTS idx_farms_user_active ON "Farm"("ownerId", "isActive");
CREATE INDEX IF NOT EXISTS idx_financial_transactions_farm_date ON "FinancialTransaction"("farmId", "transactionDate" DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_pending ON "Task"("userId", "dueDate") WHERE status = 'pending';

-- Final status check
SELECT 
    'Database setup completed!' as message,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes;