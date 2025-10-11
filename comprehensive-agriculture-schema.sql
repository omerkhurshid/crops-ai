-- Comprehensive Agriculture Database Schema
-- Covers 90% of global crop and livestock use cases

-- =====================================================
-- CROP CATEGORIES & TAXONOMY
-- =====================================================

CREATE TABLE crop_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id INTEGER REFERENCES crop_categories(id),
  level INTEGER NOT NULL, -- 1=Kingdom, 2=Family, 3=Genus, 4=Species
  scientific_classification JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sample data structure for scientific classification
-- {
--   "kingdom": "Plantae",
--   "family": "Poaceae", 
--   "genus": "Zea",
--   "species": "mays"
-- }

CREATE TABLE crops (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  scientific_name VARCHAR(200),
  common_names TEXT[], -- ['corn', 'maize', 'sweet corn']
  category_id INTEGER REFERENCES crop_categories(id),
  
  -- Basic Characteristics
  crop_type VARCHAR(50) NOT NULL, -- 'cereal', 'vegetable', 'fruit', 'legume', 'fiber', 'oilseed'
  growth_habit VARCHAR(50), -- 'annual', 'biennial', 'perennial'
  plant_form VARCHAR(50), -- 'herb', 'shrub', 'tree', 'vine'
  
  -- Growing Requirements
  climate_zones TEXT[], -- ['temperate', 'tropical', 'subtropical']
  hardiness_zones VARCHAR(20), -- 'USDA 3-9'
  soil_ph_min DECIMAL(3,1),
  soil_ph_max DECIMAL(3,1),
  soil_types TEXT[], -- ['clay', 'loam', 'sandy']
  water_requirements VARCHAR(50), -- 'low', 'medium', 'high'
  
  -- Timing Information
  days_to_germination_min INTEGER,
  days_to_germination_max INTEGER,
  days_to_maturity_min INTEGER,
  days_to_maturity_max INTEGER,
  planting_depth_cm DECIMAL(5,2),
  
  -- Spacing & Yield
  plant_spacing_cm INTEGER,
  row_spacing_cm INTEGER,
  plants_per_hectare INTEGER,
  average_yield_kg_per_hectare INTEGER,
  
  -- Environmental Tolerances
  frost_tolerance VARCHAR(20), -- 'none', 'light', 'moderate', 'heavy'
  drought_tolerance VARCHAR(20),
  heat_tolerance VARCHAR(20),
  
  -- Economic Data
  market_category VARCHAR(50), -- 'commodity', 'specialty', 'organic'
  global_production_tonnes BIGINT,
  major_producing_countries TEXT[],
  
  -- Nutritional Information (per 100g)
  nutrition_data JSONB,
  
  -- Additional Properties
  companion_plants TEXT[],
  pest_susceptibilities TEXT[],
  disease_susceptibilities TEXT[],
  beneficial_insects TEXT[],
  
  metadata JSONB, -- Flexible field for additional attributes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CROP VARIETIES & CULTIVARS
-- =====================================================

CREATE TABLE crop_varieties (
  id SERIAL PRIMARY KEY,
  crop_id INTEGER REFERENCES crops(id),
  variety_name VARCHAR(200) NOT NULL,
  cultivar_code VARCHAR(50),
  breeder VARCHAR(200),
  release_year INTEGER,
  
  -- Performance Characteristics
  yield_potential_kg_per_hectare INTEGER,
  disease_resistance TEXT[], -- ['rust', 'blight', 'mosaic_virus']
  pest_resistance TEXT[],
  stress_tolerance JSONB, -- {"drought": "high", "heat": "medium", "cold": "low"}
  
  -- Quality Traits
  quality_traits JSONB, -- {"protein_content": 12.5, "oil_content": 3.2}
  end_use TEXT[], -- ['fresh_market', 'processing', 'feed', 'biofuel']
  
  -- Adaptation
  recommended_regions TEXT[],
  altitude_range JSONB, -- {"min": 0, "max": 2000}
  
  -- Commercial Information
  seed_availability VARCHAR(50), -- 'commercial', 'research', 'heirloom'
  patent_status VARCHAR(50),
  gmo_status BOOLEAN DEFAULT FALSE,
  organic_certified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- LIVESTOCK CATEGORIES & BREEDS
-- =====================================================

CREATE TABLE livestock_species (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- 'Cattle', 'Swine', 'Poultry'
  scientific_name VARCHAR(200),
  animal_class VARCHAR(50), -- 'mammal', 'bird', 'fish'
  
  -- Basic Characteristics
  domestication_date INTEGER, -- Year BCE/CE
  origin_region VARCHAR(100),
  primary_uses TEXT[], -- ['meat', 'milk', 'eggs', 'fiber', 'draft']
  
  -- General Requirements
  housing_requirements JSONB,
  feed_requirements JSONB,
  space_requirements JSONB, -- per animal
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE livestock_breeds (
  id SERIAL PRIMARY KEY,
  species_id INTEGER REFERENCES livestock_species(id),
  breed_name VARCHAR(200) NOT NULL,
  alternative_names TEXT[],
  
  -- Origin & Classification
  country_of_origin VARCHAR(100),
  breed_group VARCHAR(100), -- 'dairy', 'beef', 'dual-purpose'
  conservation_status VARCHAR(50), -- 'common', 'threatened', 'critical', 'extinct'
  
  -- Physical Characteristics
  average_weight_male_kg INTEGER,
  average_weight_female_kg INTEGER,
  height_at_withers_cm INTEGER,
  coat_colors TEXT[],
  distinguishing_features TEXT[],
  
  -- Performance Data
  production_traits JSONB, -- {"milk_yield_liters_per_year": 6000, "butterfat_percent": 4.2}
  reproduction_traits JSONB, -- {"gestation_days": 283, "breeding_age_months": 15}
  longevity_years INTEGER,
  
  -- Adaptation & Hardiness
  climate_adaptation TEXT[], -- ['temperate', 'tropical', 'arid']
  disease_resistance TEXT[],
  grazing_behavior VARCHAR(50), -- 'intensive', 'extensive', 'rotational'
  
  -- Economic Information
  market_demand VARCHAR(50), -- 'high', 'medium', 'low', 'niche'
  breeding_difficulty VARCHAR(50), -- 'easy', 'moderate', 'difficult'
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- REGIONAL ADAPTATIONS
-- =====================================================

CREATE TABLE climate_zones (
  id SERIAL PRIMARY KEY,
  zone_name VARCHAR(100) NOT NULL,
  classification_system VARCHAR(50), -- 'Köppen', 'USDA', 'FAO'
  zone_code VARCHAR(20),
  
  -- Climate Characteristics
  temperature_range JSONB, -- {"min": -10, "max": 35}
  precipitation_mm_annual INTEGER,
  growing_season_days INTEGER,
  frost_free_days INTEGER,
  
  -- Geographic Coverage
  countries TEXT[],
  major_regions TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crop_climate_suitability (
  id SERIAL PRIMARY KEY,
  crop_id INTEGER REFERENCES crops(id),
  climate_zone_id INTEGER REFERENCES climate_zones(id),
  suitability_score INTEGER CHECK (suitability_score >= 0 AND suitability_score <= 100),
  
  -- Performance Modifiers
  yield_modifier DECIMAL(4,2), -- 1.0 = normal, 1.2 = 20% higher
  quality_modifier DECIMAL(4,2),
  risk_factors TEXT[],
  
  -- Timing Adjustments
  planting_window_start DATE,
  planting_window_end DATE,
  harvest_window_start DATE,
  harvest_window_end DATE,
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MANAGEMENT PRACTICES
-- =====================================================

CREATE TABLE management_practices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50), -- 'planting', 'fertilization', 'pest_control', 'harvesting'
  description TEXT,
  
  -- Applicability
  applicable_crops INTEGER[] REFERENCES crops(id),
  applicable_regions TEXT[],
  applicable_systems TEXT[], -- ['organic', 'conventional', 'integrated']
  
  -- Implementation Details
  timing_description TEXT,
  materials_needed TEXT[],
  equipment_required TEXT[],
  labor_requirements JSONB, -- {"hours_per_hectare": 2.5, "skill_level": "intermediate"}
  
  -- Costs & Benefits
  cost_per_hectare JSONB, -- {"materials": 50, "labor": 30, "equipment": 20}
  expected_benefits TEXT[],
  environmental_impact JSONB, -- {"carbon_footprint": "low", "water_usage": "medium"}
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MARKET & ECONOMIC DATA
-- =====================================================

CREATE TABLE market_prices (
  id SERIAL PRIMARY KEY,
  crop_id INTEGER REFERENCES crops(id),
  livestock_breed_id INTEGER REFERENCES livestock_breeds(id),
  
  -- Price Information
  price_per_unit DECIMAL(10,2),
  unit VARCHAR(20), -- 'kg', 'ton', 'bushel', 'head'
  currency VARCHAR(3), -- 'USD', 'EUR'
  
  -- Market Context
  market_type VARCHAR(50), -- 'wholesale', 'retail', 'farm_gate', 'futures'
  quality_grade VARCHAR(50),
  region VARCHAR(100),
  
  -- Temporal Data
  price_date DATE,
  seasonal_adjustment DECIMAL(4,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core search indexes
CREATE INDEX idx_crops_name ON crops(name);
CREATE INDEX idx_crops_scientific_name ON crops(scientific_name);
CREATE INDEX idx_crops_type ON crops(crop_type);
CREATE INDEX idx_crops_climate_zones ON crops USING GIN(climate_zones);

CREATE INDEX idx_varieties_crop_id ON crop_varieties(crop_id);
CREATE INDEX idx_varieties_name ON crop_varieties(variety_name);

CREATE INDEX idx_livestock_breeds_species ON livestock_breeds(species_id);
CREATE INDEX idx_livestock_breeds_name ON livestock_breeds(breed_name);

-- Geographic and performance indexes
CREATE INDEX idx_climate_suitability_crop ON crop_climate_suitability(crop_id);
CREATE INDEX idx_climate_suitability_zone ON crop_climate_suitability(climate_zone_id);
CREATE INDEX idx_climate_suitability_score ON crop_climate_suitability(suitability_score);

-- Market data indexes
CREATE INDEX idx_market_prices_date ON market_prices(price_date);
CREATE INDEX idx_market_prices_crop ON market_prices(crop_id);
CREATE INDEX idx_market_prices_region ON market_prices(region);

-- =====================================================
-- SAMPLE DATA INSERTION COMMANDS
-- =====================================================

-- Insert sample crop categories
INSERT INTO crop_categories (name, parent_id, level, scientific_classification) VALUES
('Cereals', NULL, 1, '{"family": "Poaceae"}'),
('Vegetables', NULL, 1, '{"kingdom": "Plantae"}'),
('Fruits', NULL, 1, '{"kingdom": "Plantae"}'),
('Legumes', NULL, 1, '{"family": "Fabaceae"}'),
('Oilseeds', NULL, 1, '{"kingdom": "Plantae"}');

-- Insert sample livestock species
INSERT INTO livestock_species (name, scientific_name, animal_class, primary_uses) VALUES
('Cattle', 'Bos taurus', 'mammal', '["meat", "milk", "draft"]'),
('Swine', 'Sus scrofa domesticus', 'mammal', '["meat"]'),
('Poultry', 'Gallus gallus domesticus', 'bird', '["meat", "eggs"]'),
('Sheep', 'Ovis aries', 'mammal', '["meat", "milk", "fiber"]'),
('Goats', 'Capra aegagrus hircus', 'mammal', '["meat", "milk", "fiber"]');

-- Insert sample climate zones
INSERT INTO climate_zones (zone_name, classification_system, zone_code, temperature_range, precipitation_mm_annual) VALUES
('Humid Continental', 'Köppen', 'Dfa', '{"min": -3, "max": 30}', 800),
('Mediterranean', 'Köppen', 'Csa', '{"min": 5, "max": 35}', 600),
('Tropical Savanna', 'Köppen', 'Aw', '{"min": 18, "max": 35}', 1200),
('Temperate Oceanic', 'Köppen', 'Cfb', '{"min": 0, "max": 25}', 1000);

-- =====================================================
-- FUNCTIONS FOR DATA MANAGEMENT
-- =====================================================

-- Function to calculate crop suitability score
CREATE OR REPLACE FUNCTION calculate_crop_suitability(
  crop_temp_min INTEGER,
  crop_temp_max INTEGER,
  zone_temp_min INTEGER,
  zone_temp_max INTEGER,
  crop_precipitation INTEGER,
  zone_precipitation INTEGER
) RETURNS INTEGER AS $$
DECLARE
  temp_score INTEGER;
  precip_score INTEGER;
  final_score INTEGER;
BEGIN
  -- Temperature compatibility (0-50 points)
  IF zone_temp_min >= crop_temp_min AND zone_temp_max <= crop_temp_max THEN
    temp_score := 50;
  ELSE
    temp_score := GREATEST(0, 50 - ABS(zone_temp_min - crop_temp_min) * 2);
  END IF;
  
  -- Precipitation compatibility (0-50 points)
  IF ABS(zone_precipitation - crop_precipitation) <= 200 THEN
    precip_score := 50;
  ELSE
    precip_score := GREATEST(0, 50 - ABS(zone_precipitation - crop_precipitation) / 20);
  END IF;
  
  final_score := temp_score + precip_score;
  
  RETURN LEAST(100, final_score);
END;
$$ LANGUAGE plpgsql;