-- Crops.AI Database Schema for Supabase (Fixed with lowercase table names)
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Drop existing tables if they exist (from previous attempt)
DROP TABLE IF EXISTS "ProcessingQueue" CASCADE;
DROP TABLE IF EXISTS "FarmMembership" CASCADE;
DROP TABLE IF EXISTS "YieldPrediction" CASCADE;
DROP TABLE IF EXISTS "WeatherData" CASCADE;
DROP TABLE IF EXISTS "StressDetection" CASCADE;
DROP TABLE IF EXISTS "NDVIAnalysis" CASCADE;
DROP TABLE IF EXISTS "SatelliteImage" CASCADE;
DROP TABLE IF EXISTS "Crop" CASCADE;
DROP TABLE IF EXISTS "Field" CASCADE;
DROP TABLE IF EXISTS "Farm" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop existing enums if they exist
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "CropStatus" CASCADE;
DROP TYPE IF EXISTS "StressLevel" CASCADE;

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('FARM_OWNER', 'FARM_MANAGER', 'AGRONOMIST', 'ADMIN');
CREATE TYPE "CropStatus" AS ENUM ('PLANNED', 'PLANTED', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED', 'FAILED');
CREATE TYPE "StressLevel" AS ENUM ('NONE', 'LOW', 'MODERATE', 'HIGH', 'SEVERE');

-- Create users table (lowercase as expected by Prisma)
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    "passwordHash" TEXT,
    role "UserRole" NOT NULL DEFAULT 'FARM_OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create farms table
CREATE TABLE farms (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    coordinates GEOMETRY(POINT, 4326),
    "totalArea" DOUBLE PRECISION NOT NULL,
    description TEXT,
    "ownerId" TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create fields table
CREATE TABLE fields (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    "farmId" TEXT NOT NULL REFERENCES farms(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    boundary GEOMETRY(POLYGON, 4326) NOT NULL,
    area DOUBLE PRECISION NOT NULL,
    "soilType" TEXT,
    elevation DOUBLE PRECISION,
    slope DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create crops table
CREATE TABLE crops (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    variety TEXT,
    "fieldId" TEXT NOT NULL REFERENCES fields(id) ON DELETE RESTRICT ON UPDATE CASCADE,
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

-- Create satellite_images table
CREATE TABLE satellite_images (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "fieldId" TEXT NOT NULL REFERENCES fields(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "imageUrl" TEXT NOT NULL,
    "captureDate" TIMESTAMP(3) NOT NULL,
    "cloudCoverage" DOUBLE PRECISION,
    resolution DOUBLE PRECISION,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create ndvi_analysis table
CREATE TABLE ndvi_analysis (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "satelliteImageId" TEXT NOT NULL REFERENCES satellite_images(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "fieldId" TEXT NOT NULL REFERENCES fields(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "averageNdvi" DOUBLE PRECISION NOT NULL,
    "minNdvi" DOUBLE PRECISION NOT NULL,
    "maxNdvi" DOUBLE PRECISION NOT NULL,
    "ndviMap" TEXT,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create stress_detection table
CREATE TABLE stress_detection (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "fieldId" TEXT NOT NULL REFERENCES fields(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "satelliteImageId" TEXT REFERENCES satellite_images(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "stressLevel" "StressLevel" NOT NULL,
    "stressType" TEXT NOT NULL,
    "affectedArea" DOUBLE PRECISION,
    confidence DOUBLE PRECISION,
    recommendations TEXT,
    "detectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create weather_data table
CREATE TABLE weather_data (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "farmId" TEXT NOT NULL REFERENCES farms(id) ON DELETE RESTRICT ON UPDATE CASCADE,
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

-- Create yield_prediction table
CREATE TABLE yield_prediction (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "cropId" TEXT NOT NULL REFERENCES crops(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "predictedYield" DOUBLE PRECISION NOT NULL,
    confidence DOUBLE PRECISION,
    "modelVersion" TEXT,
    "inputFeatures" JSONB,
    "predictionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create farm_membership table
CREATE TABLE farm_membership (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "farmId" TEXT NOT NULL REFERENCES farms(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    role "UserRole" NOT NULL DEFAULT 'FARM_MANAGER',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE("userId", "farmId")
);

-- Create processing_queue table
CREATE TABLE processing_queue (
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
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX farms_owner_id_idx ON farms("ownerId");
CREATE INDEX fields_farm_id_idx ON fields("farmId");
CREATE INDEX crops_field_id_idx ON crops("fieldId");
CREATE INDEX satellite_images_field_id_idx ON satellite_images("fieldId");
CREATE INDEX ndvi_analysis_field_id_idx ON ndvi_analysis("fieldId");
CREATE INDEX stress_detection_field_id_idx ON stress_detection("fieldId");
CREATE INDEX weather_data_farm_id_idx ON weather_data("farmId");
CREATE INDEX yield_prediction_crop_id_idx ON yield_prediction("cropId");
CREATE INDEX farm_membership_user_id_idx ON farm_membership("userId");
CREATE INDEX farm_membership_farm_id_idx ON farm_membership("farmId");
CREATE INDEX processing_queue_status_idx ON processing_queue(status);

-- Create spatial indexes for geometry columns
CREATE INDEX farms_coordinates_idx ON farms USING GIST(coordinates);
CREATE INDEX fields_boundary_idx ON fields USING GIST(boundary);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_satellite_images_updated_at BEFORE UPDATE ON satellite_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ndvi_analysis_updated_at BEFORE UPDATE ON ndvi_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stress_detection_updated_at BEFORE UPDATE ON stress_detection FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weather_data_updated_at BEFORE UPDATE ON weather_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_yield_prediction_updated_at BEFORE UPDATE ON yield_prediction FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_membership_updated_at BEFORE UPDATE ON farm_membership FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_queue_updated_at BEFORE UPDATE ON processing_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();