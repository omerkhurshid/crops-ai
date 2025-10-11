-- Performance indexes for Crops.AI production deployment

-- Task indexes for user queries and status filtering
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_farm_status ON tasks(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_field_status ON tasks(field_id, status);

-- Field indexes for farm queries and active field lookups
CREATE INDEX IF NOT EXISTS idx_fields_farm_active ON fields(farm_id, is_active);
CREATE INDEX IF NOT EXISTS idx_fields_farm_status ON fields(farm_id, status);
CREATE INDEX IF NOT EXISTS idx_fields_location ON fields USING GIST (ST_MakePoint(longitude, latitude));

-- Farm indexes for user lookups
CREATE INDEX IF NOT EXISTS idx_farms_user_active ON farms(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_farms_location ON farms USING GIST (ST_MakePoint(longitude, latitude));

-- Financial transaction indexes for reporting
CREATE INDEX IF NOT EXISTS idx_financial_transactions_farm_date ON financial_transactions(farm_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_date ON financial_transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON financial_transactions(category, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type, transaction_date DESC);

-- Weather data indexes for location and time-based queries
CREATE INDEX IF NOT EXISTS idx_weather_data_location_time ON weather_data(latitude, longitude, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weather_data_farm_time ON weather_data(farm_id, timestamp DESC);

-- Weather alerts indexes for active alerts
CREATE INDEX IF NOT EXISTS idx_weather_alerts_farm_active ON weather_alerts(farm_id, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_severity_active ON weather_alerts(severity, is_active);

-- Crop indexes for farm and field queries
CREATE INDEX IF NOT EXISTS idx_crops_farm ON crops(farm_id, planting_date DESC);
CREATE INDEX IF NOT EXISTS idx_crops_field ON crops(field_id, planting_date DESC);
CREATE INDEX IF NOT EXISTS idx_crops_type_status ON crops(crop_type, status);

-- Produce indexes for harvest tracking
CREATE INDEX IF NOT EXISTS idx_produce_crop ON produce(crop_id, harvest_date DESC);
CREATE INDEX IF NOT EXISTS idx_produce_farm_date ON produce(farm_id, harvest_date DESC);

-- Livestock indexes if livestock module is active
CREATE INDEX IF NOT EXISTS idx_livestock_farm_active ON livestock(farm_id, is_active);
CREATE INDEX IF NOT EXISTS idx_livestock_type_farm ON livestock(type, farm_id);

-- Health records indexes
CREATE INDEX IF NOT EXISTS idx_health_records_livestock ON health_records(livestock_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type, record_date DESC);

-- User session indexes for authentication
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);

-- Analytics and reporting composite indexes
CREATE INDEX IF NOT EXISTS idx_analytics_farm_date_metric ON analytics_events(farm_id, created_at DESC, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date_metric ON analytics_events(user_id, created_at DESC, event_type);

-- Notification indexes for user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type_user ON notifications(type, user_id, created_at DESC);

-- Add partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_pending ON tasks(user_id, due_date) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_fields_active ON fields(farm_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_weather_alerts_unread ON weather_alerts(farm_id, created_at DESC) WHERE is_active = true;

-- Analyze tables after index creation for optimal query planning
ANALYZE tasks;
ANALYZE fields;
ANALYZE farms;
ANALYZE financial_transactions;
ANALYZE weather_data;
ANALYZE weather_alerts;
ANALYZE crops;
ANALYZE produce;
ANALYZE livestock;
ANALYZE health_records;
ANALYZE sessions;
ANALYZE analytics_events;
ANALYZE notifications;