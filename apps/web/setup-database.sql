-- Complete Database Setup for Crops.AI
-- Run this after creating the database but before applying indexes

-- First, ensure extensions are enabled
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: Tables should be created by running: npx prisma db push
-- This file contains additional setup and the performance indexes

-- Create performance indexes (only run AFTER tables exist)
-- Task indexes for user queries and status filtering
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON "Task"("userId", status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON "Task"("userId", "dueDate");
CREATE INDEX IF NOT EXISTS idx_tasks_farm_status ON "Task"("farmId", status);
CREATE INDEX IF NOT EXISTS idx_tasks_field_status ON "Task"("fieldId", status) WHERE "fieldId" IS NOT NULL;

-- Field indexes for farm queries and active field lookups  
CREATE INDEX IF NOT EXISTS idx_fields_farm_active ON "Field"("farmId", "isActive");
CREATE INDEX IF NOT EXISTS idx_fields_farm_status ON "Field"("farmId", status);

-- Farm indexes for user lookups
CREATE INDEX IF NOT EXISTS idx_farms_user_active ON "Farm"("ownerId", "isActive");

-- Financial transaction indexes for reporting
CREATE INDEX IF NOT EXISTS idx_financial_transactions_farm_date ON "FinancialTransaction"("farmId", "transactionDate" DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_date ON "FinancialTransaction"("userId", "transactionDate" DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON "FinancialTransaction"(category, "transactionDate" DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON "FinancialTransaction"(type, "transactionDate" DESC);

-- Weather data indexes for location and time-based queries
CREATE INDEX IF NOT EXISTS idx_weather_data_farm_time ON "WeatherData"("farmId", timestamp DESC) WHERE "farmId" IS NOT NULL;

-- Weather alerts indexes for active alerts
CREATE INDEX IF NOT EXISTS idx_weather_alerts_farm_active ON "WeatherAlert"("farmId", "isActive", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_severity_active ON "WeatherAlert"(severity, "isActive");

-- Crop indexes for farm and field queries
CREATE INDEX IF NOT EXISTS idx_crops_farm ON "Crop"("farmId", "plantingDate" DESC);
CREATE INDEX IF NOT EXISTS idx_crops_field ON "Crop"("fieldId", "plantingDate" DESC);
CREATE INDEX IF NOT EXISTS idx_crops_type_status ON "Crop"("cropType", status);

-- User session indexes for authentication
CREATE INDEX IF NOT EXISTS idx_sessions_user ON "Session"("userId") WHERE "Session" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON "Session"(expires) WHERE "Session" IS NOT NULL;

-- Add partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_pending ON "Task"("userId", "dueDate") WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_fields_active ON "Field"("farmId") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_weather_alerts_unread ON "WeatherAlert"("farmId", "createdAt" DESC) WHERE "isActive" = true;

-- Create indexes for commonly queried timestamp fields
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON "Task"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_farms_created_at ON "Farm"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_crops_created_at ON "Crop"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_financial_created_at ON "FinancialTransaction"("createdAt" DESC);

-- Text search indexes for common search fields
CREATE INDEX IF NOT EXISTS idx_farms_name_search ON "Farm" USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_crops_type_search ON "Crop" USING gin(to_tsvector('english', "cropType"));
CREATE INDEX IF NOT EXISTS idx_tasks_title_search ON "Task" USING gin(to_tsvector('english', title));

-- Analyze tables after index creation for optimal query planning
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Task') THEN
    ANALYZE "Task";
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Field') THEN
    ANALYZE "Field";
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Farm') THEN
    ANALYZE "Farm";
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'FinancialTransaction') THEN
    ANALYZE "FinancialTransaction";
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'WeatherData') THEN
    ANALYZE "WeatherData";
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'WeatherAlert') THEN
    ANALYZE "WeatherAlert";
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Crop') THEN
    ANALYZE "Crop";
  END IF;
END $$;