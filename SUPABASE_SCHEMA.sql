-- Crops.AI Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('FARM_OWNER', 'FARM_MANAGER', 'AGRONOMIST', 'ADMIN');
CREATE TYPE "CropStatus" AS ENUM ('PLANNED', 'PLANTED', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED', 'FAILED');
CREATE TYPE "StressLevel" AS ENUM ('NONE', 'LOW', 'MODERATE', 'HIGH', 'SEVERE');

-- Create User table
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    "passwordHash" TEXT,
    role "UserRole" NOT NULL DEFAULT 'FARM_OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Farm table
CREATE TABLE "Farm" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    coordinates GEOMETRY(POINT, 4326),
    "totalArea" DOUBLE PRECISION NOT NULL,
    description TEXT,
    "ownerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Field table
CREATE TABLE "Field" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    "farmId" TEXT NOT NULL REFERENCES "Farm"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    boundary GEOMETRY(POLYGON, 4326) NOT NULL,
    area DOUBLE PRECISION NOT NULL,
    "soilType" TEXT,
    elevation DOUBLE PRECISION,
    slope DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Crop table
CREATE TABLE "Crop" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    variety TEXT,
    "fieldId" TEXT NOT NULL REFERENCES "Field"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    status "CropStatus" NOT NULL DEFAULT 'PLANNED',
    "plantingDate" TIMESTAMP(3),
    "expectedHarvestDate" TIMESTAMP(3),
    "actualHarvestDate" TIMESTAMP(3),
    "expectedYield" DOUBLE PRECISION,
    "actualYield" DOUBLE PRECISION,
    notes TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create SatelliteImage table
CREATE TABLE "SatelliteImage" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "fieldId" TEXT NOT NULL REFERENCES "Field"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "imageUrl" TEXT NOT NULL,
    "captureDate" TIMESTAMP(3) NOT NULL,
    "cloudCoverage" DOUBLE PRECISION,
    resolution DOUBLE PRECISION,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create NDVIAnalysis table
CREATE TABLE "NDVIAnalysis" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "satelliteImageId" TEXT NOT NULL REFERENCES "SatelliteImage"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "fieldId" TEXT NOT NULL REFERENCES "Field"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "averageNdvi" DOUBLE PRECISION NOT NULL,
    "minNdvi" DOUBLE PRECISION NOT NULL,
    "maxNdvi" DOUBLE PRECISION NOT NULL,
    "ndviMap" TEXT,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create StressDetection table
CREATE TABLE "StressDetection" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "fieldId" TEXT NOT NULL REFERENCES "Field"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "satelliteImageId" TEXT REFERENCES "SatelliteImage"(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "stressLevel" "StressLevel" NOT NULL,
    "stressType" TEXT NOT NULL,
    "affectedArea" DOUBLE PRECISION,
    confidence DOUBLE PRECISION,
    recommendations TEXT,
    "detectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create WeatherData table
CREATE TABLE "WeatherData" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "farmId" TEXT NOT NULL REFERENCES "Farm"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    timestamp TIMESTAMP(3) NOT NULL,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    precipitation DOUBLE PRECISION,
    "windSpeed" DOUBLE PRECISION,
    "windDirection" DOUBLE PRECISION,
    pressure DOUBLE PRECISION,
    "solarRadiation" DOUBLE PRECISION,
    "soilTemperature" DOUBLE PRECISION,
    "soilMoisture" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create YieldPrediction table
CREATE TABLE "YieldPrediction" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "cropId" TEXT NOT NULL REFERENCES "Crop"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "predictedYield" DOUBLE PRECISION NOT NULL,
    confidence DOUBLE PRECISION,
    "modelVersion" TEXT,
    "inputFeatures" JSONB,
    "predictionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create FarmMembership table (for sharing farms with other users)
CREATE TABLE "FarmMembership" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "farmId" TEXT NOT NULL REFERENCES "Farm"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    role "UserRole" NOT NULL DEFAULT 'FARM_MANAGER',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE("userId", "farmId")
);

-- Create ProcessingQueue table
CREATE TABLE "ProcessingQueue" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "jobType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    priority INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "errorMessage" TEXT,
    "inputData" JSONB,
    "outputData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3)
);

-- Create indexes for better performance
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "Farm_ownerId_idx" ON "Farm"("ownerId");
CREATE INDEX "Field_farmId_idx" ON "Field"("farmId");
CREATE INDEX "Crop_fieldId_idx" ON "Crop"("fieldId");
CREATE INDEX "SatelliteImage_fieldId_idx" ON "SatelliteImage"("fieldId");
CREATE INDEX "NDVIAnalysis_fieldId_idx" ON "NDVIAnalysis"("fieldId");
CREATE INDEX "StressDetection_fieldId_idx" ON "StressDetection"("fieldId");
CREATE INDEX "WeatherData_farmId_idx" ON "WeatherData"("farmId");
CREATE INDEX "YieldPrediction_cropId_idx" ON "YieldPrediction"("cropId");
CREATE INDEX "FarmMembership_userId_idx" ON "FarmMembership"("userId");
CREATE INDEX "FarmMembership_farmId_idx" ON "FarmMembership"("farmId");
CREATE INDEX "ProcessingQueue_status_idx" ON "ProcessingQueue"("status");

-- Create spatial indexes for geometry columns
CREATE INDEX "Farm_coordinates_idx" ON "Farm" USING GIST("coordinates");
CREATE INDEX "Field_boundary_idx" ON "Field" USING GIST("boundary");

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_updated_at BEFORE UPDATE ON "Farm" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_field_updated_at BEFORE UPDATE ON "Field" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crop_updated_at BEFORE UPDATE ON "Crop" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_satellite_image_updated_at BEFORE UPDATE ON "SatelliteImage" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ndvi_analysis_updated_at BEFORE UPDATE ON "NDVIAnalysis" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stress_detection_updated_at BEFORE UPDATE ON "StressDetection" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weather_data_updated_at BEFORE UPDATE ON "WeatherData" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_yield_prediction_updated_at BEFORE UPDATE ON "YieldPrediction" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_membership_updated_at BEFORE UPDATE ON "FarmMembership" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_queue_updated_at BEFORE UPDATE ON "ProcessingQueue" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();