import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

const CREATE_FINANCIAL_TABLES_SQL = `
-- Create missing financial tables
-- Run this SQL on your Supabase database to enable financial features

-- Create TransactionType enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionType') THEN
        CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');
    END IF;
END
$$;

-- Create FinancialCategory enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FinancialCategory') THEN
        CREATE TYPE "FinancialCategory" AS ENUM (
            'CROP_SALES', 'LIVESTOCK_SALES', 'SUBSIDIES', 'LEASE_INCOME', 'OTHER_INCOME',
            'SEEDS', 'FERTILIZER', 'PESTICIDES', 'LABOR', 'MACHINERY', 'FUEL', 
            'IRRIGATION', 'STORAGE', 'INSURANCE', 'OVERHEAD', 'OTHER_EXPENSE'
        );
    END IF;
END
$$;

-- Create farm_managers table
CREATE TABLE IF NOT EXISTS "public"."farm_managers" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    
    CONSTRAINT "farm_managers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "farm_managers_farmId_userId_key" UNIQUE("farmId", "userId"),
    CONSTRAINT "farm_managers_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "public"."farms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "farm_managers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create financial_transactions table
CREATE TABLE IF NOT EXISTS "public"."financial_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "fieldId" TEXT,
    "cropId" TEXT,
    "type" "TransactionType" NOT NULL,
    "category" "FinancialCategory" NOT NULL,
    "subcategory" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "quantity" DECIMAL(10,2),
    "unitPrice" DECIMAL(10,2),
    "transactionDate" DATE NOT NULL,
    "paymentDate" DATE,
    "operationId" TEXT,
    "marketPriceId" TEXT,
    "notes" TEXT,
    "attachments" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    
    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "financial_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "financial_transactions_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "public"."farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "financial_transactions_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "public"."fields"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "financial_transactions_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "public"."crops"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "financial_transactions_marketPriceId_fkey" FOREIGN KEY ("marketPriceId") REFERENCES "public"."market_prices"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "financial_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create financial_budgets table
CREATE TABLE IF NOT EXISTS "public"."financial_budgets" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "seasonId" TEXT,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "category" "FinancialCategory" NOT NULL,
    "plannedAmount" DECIMAL(12,2) NOT NULL,
    "actualAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "financial_budgets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "financial_budgets_farmId_year_month_category_key" UNIQUE("farmId", "year", "month", "category"),
    CONSTRAINT "financial_budgets_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "public"."farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create financial_forecasts table
CREATE TABLE IF NOT EXISTS "public"."financial_forecasts" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "fieldId" TEXT,
    "cropId" TEXT,
    "forecastDate" DATE NOT NULL,
    "forecastType" TEXT NOT NULL,
    "predictedYield" DECIMAL(10,2),
    "predictedPrice" DECIMAL(10,2),
    "predictedRevenue" DECIMAL(12,2),
    "predictedCost" DECIMAL(12,2),
    "confidenceScore" DECIMAL(5,2) NOT NULL,
    "modelId" TEXT,
    "modelVersion" TEXT,
    "assumptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "financial_forecasts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "financial_forecasts_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "public"."farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "financial_forecasts_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "public"."fields"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "financial_forecasts_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "public"."crops"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create market_prices table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "public"."market_prices" (
    "id" TEXT NOT NULL,
    "commodity" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "unit" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "market_prices_pkey" PRIMARY KEY ("id")
);
`;

const CREATE_INDEXES_SQL = `
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "financial_transactions_farmId_transactionDate_idx" ON "public"."financial_transactions"("farmId", "transactionDate");
CREATE INDEX IF NOT EXISTS "financial_transactions_type_category_idx" ON "public"."financial_transactions"("type", "category");
CREATE INDEX IF NOT EXISTS "financial_transactions_fieldId_idx" ON "public"."financial_transactions"("fieldId");
CREATE INDEX IF NOT EXISTS "financial_budgets_farmId_year_idx" ON "public"."financial_budgets"("farmId", "year");
CREATE INDEX IF NOT EXISTS "financial_forecasts_farmId_forecastDate_idx" ON "public"."financial_forecasts"("farmId", "forecastDate");
CREATE INDEX IF NOT EXISTS "market_prices_commodity_date_idx" ON "public"."market_prices"("commodity", "date");
`;

const CREATE_TRIGGERS_SQL = `
-- Create trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updatedAt trigger to financial_transactions
DROP TRIGGER IF EXISTS update_financial_transactions_updated_at ON "public"."financial_transactions";
CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON "public"."financial_transactions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updatedAt trigger to financial_budgets
DROP TRIGGER IF EXISTS update_financial_budgets_updated_at ON "public"."financial_budgets";
CREATE TRIGGER update_financial_budgets_updated_at
    BEFORE UPDATE ON "public"."financial_budgets"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users to run migrations
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Starting financial tables migration...');

    // Run the migration in steps
    const results = [];
    
    console.log('Step 1: Creating enums and tables...');
    await prisma.$executeRawUnsafe(CREATE_FINANCIAL_TABLES_SQL);
    results.push('✅ Tables created successfully');

    console.log('Step 2: Creating indexes...');
    await prisma.$executeRawUnsafe(CREATE_INDEXES_SQL);
    results.push('✅ Indexes created successfully');

    console.log('Step 3: Creating triggers...');
    await prisma.$executeRawUnsafe(CREATE_TRIGGERS_SQL);
    results.push('✅ Triggers created successfully');

    console.log('Migration completed successfully!');

    // Test that the tables work by doing a simple query
    console.log('Testing table creation...');
    const tableTest = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('financial_transactions', 'financial_budgets', 'financial_forecasts', 'farm_managers', 'market_prices')
      ORDER BY table_name;
    `;

    results.push(`✅ Verified ${(tableTest as any[]).length} tables created`);

    return NextResponse.json({
      success: true,
      message: 'Financial tables migration completed successfully!',
      results,
      tables_created: tableTest,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// GET endpoint to check migration status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check which financial tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name, 
             CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('financial_transactions', 'financial_budgets', 'financial_forecasts', 'farm_managers', 'market_prices')
      ORDER BY table_name;
    `;

    const allTables = ['financial_transactions', 'financial_budgets', 'financial_forecasts', 'farm_managers', 'market_prices'];
    const existingTables = (tables as any[]).map(t => t.table_name);
    const missingTables = allTables.filter(t => !existingTables.includes(t));

    return NextResponse.json({
      migration_needed: missingTables.length > 0,
      existing_tables: existingTables,
      missing_tables: missingTables,
      total_financial_tables: allTables.length,
      ready_for_financial_features: missingTables.length === 0,
    });

  } catch (error: any) {
    console.error('Migration status check error:', error);
    
    return NextResponse.json({
      error: 'Failed to check migration status',
      details: error.message,
    }, { status: 500 });
  }
}