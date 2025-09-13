-- Enhanced satellite data with ML features
CREATE TABLE satellite_analytics (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    capture_date DATE NOT NULL,
    ndvi_avg DECIMAL(5,3),
    ndvi_std DECIMAL(5,3),
    ndvi_trend DECIMAL(5,3), -- 30-day trend
    stress_zones JSON, -- GeoJSON of stress areas
    biomass_estimate DECIMAL(8,2),
    growth_stage_detected VARCHAR(50),
    anomaly_score DECIMAL(5,3), -- ML-detected anomalies
    confidence_score DECIMAL(3,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
);

-- Comprehensive soil analysis
CREATE TABLE soil_analysis (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    sample_date DATE NOT NULL,
    sample_lat DECIMAL(10,6),
    sample_lng DECIMAL(10,6), 
    ph_level DECIMAL(3,1),
    nitrogen_ppm DECIMAL(8,2),
    phosphorus_ppm DECIMAL(8,2), 
    potassium_ppm DECIMAL(8,2),
    organic_matter_pct DECIMAL(5,2),
    cec DECIMAL(5,2), -- Cation exchange capacity
    soil_type VARCHAR(100),
    drainage_class VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
);

-- Enhanced weather data
CREATE TABLE weather_comprehensive (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    recorded_at DATETIME NOT NULL,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    precipitation DECIMAL(6,2),
    wind_speed DECIMAL(5,2),
    solar_radiation DECIMAL(8,2),
    evapotranspiration DECIMAL(6,2),
    growing_degree_days DECIMAL(8,2),
    stress_degree_days DECIMAL(8,2),
    soil_temperature DECIMAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
);

-- ML model predictions and recommendations
CREATE TABLE analytics_predictions (
    id TEXT PRIMARY KEY,
    field_id TEXT NOT NULL,
    model_name VARCHAR(100) NOT NULL, -- 'yield_prediction', 'pest_risk', etc.
    model_version VARCHAR(20) NOT NULL,
    prediction_date DATE NOT NULL,
    prediction_value JSON, -- Flexible JSON for different prediction types
    confidence_score DECIMAL(3,2),
    feature_importance JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
);

-- Regional benchmarking data
CREATE TABLE regional_benchmarks (
    id TEXT PRIMARY KEY,
    region VARCHAR(100) NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL, -- 'yield_per_acre', 'cost_per_acre', etc.
    percentile_25 DECIMAL(10,2),
    percentile_50 DECIMAL(10,2),
    percentile_75 DECIMAL(10,2),
    percentile_90 DECIMAL(10,2),
    sample_size INTEGER,
    year INTEGER NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Actionable recommendations
CREATE TABLE recommendations (
    id TEXT PRIMARY KEY,
    farm_id TEXT,
    field_id TEXT,
    recommendation_type VARCHAR(100) NOT NULL, -- 'fertilizer', 'irrigation', 'pest_control', etc.
    priority VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'urgent'
    title VARCHAR(200) NOT NULL,
    description TEXT,
    action_required TEXT,
    potential_impact VARCHAR(500), -- e.g., "Could increase yield by 8-12%"
    confidence_level VARCHAR(20), -- 'low', 'medium', 'high'
    estimated_cost DECIMAL(10,2),
    estimated_roi DECIMAL(5,2), -- ROI percentage
    optimal_timing DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'dismissed', 'expired'
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
);

-- Performance indexes for analytics queries
CREATE INDEX idx_satellite_field_date ON satellite_analytics(field_id, capture_date DESC);
CREATE INDEX idx_weather_field_time ON weather_comprehensive(field_id, recorded_at DESC);
CREATE INDEX idx_predictions_field_model ON analytics_predictions(field_id, model_name, prediction_date DESC);
CREATE INDEX idx_benchmarks_region_crop ON regional_benchmarks(region, crop_type, year);
CREATE INDEX idx_recommendations_farm_status ON recommendations(farm_id, status, created_at DESC);
CREATE INDEX idx_recommendations_field_priority ON recommendations(field_id, priority, optimal_timing);