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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "financial_transactions_farmId_transactionDate_idx" ON "public"."financial_transactions"("farmId", "transactionDate");
CREATE INDEX IF NOT EXISTS "financial_transactions_type_category_idx" ON "public"."financial_transactions"("type", "category");
CREATE INDEX IF NOT EXISTS "financial_transactions_fieldId_idx" ON "public"."financial_transactions"("fieldId");
CREATE INDEX IF NOT EXISTS "financial_budgets_farmId_year_idx" ON "public"."financial_budgets"("farmId", "year");
CREATE INDEX IF NOT EXISTS "financial_forecasts_farmId_forecastDate_idx" ON "public"."financial_forecasts"("farmId", "forecastDate");
CREATE INDEX IF NOT EXISTS "market_prices_commodity_date_idx" ON "public"."market_prices"("commodity", "date");

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

COMMENT ON TABLE "public"."financial_transactions" IS 'Financial transactions for farms including income and expenses';
COMMENT ON TABLE "public"."financial_budgets" IS 'Financial budgets and planning for farms';
COMMENT ON TABLE "public"."financial_forecasts" IS 'Financial forecasting and predictions for farms';
COMMENT ON TABLE "public"."farm_managers" IS 'Farm manager relationships for multi-user farm management';
COMMENT ON TABLE "public"."market_prices" IS 'Market pricing data for agricultural commodities';

-- Display success message
SELECT 'Financial tables created successfully! You can now use the financial features.' as status;