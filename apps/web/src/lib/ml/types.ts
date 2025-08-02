/**
 * Machine Learning Types and Interfaces
 * 
 * Defines data structures for ML models, predictions, and training data
 * used across the agricultural AI system.
 */

export interface MLModelConfig {
  id: string;
  name: string;
  version: string;
  type: 'yield_prediction' | 'disease_detection' | 'recommendation' | 'risk_assessment';
  status: 'training' | 'ready' | 'deployed' | 'deprecated';
  accuracy: number;
  lastTrained: Date;
  features: string[];
  hyperparameters: Record<string, any>;
  metadata: {
    cropTypes: string[];
    regions: string[];
    seasonality: boolean;
    dataRequirements: string[];
  };
}

export interface TrainingData {
  id: string;
  farmId: string;
  fieldId: string;
  season: string;
  cropType: string;
  features: {
    // Environmental factors
    weather: WeatherFeatures;
    soil: SoilFeatures;
    satellite: SatelliteFeatures;
    
    // Management practices
    planting: PlantingFeatures;
    irrigation: IrrigationFeatures;
    fertilization: FertilizationFeatures;
    pestControl: PestControlFeatures;
    
    // Historical data
    historical: HistoricalFeatures;
  };
  target: {
    yield: number; // tons per hectare
    quality: QualityMetrics;
    profitability: number;
    sustainability: SustainabilityMetrics;
  };
  metadata: {
    collectedAt: Date;
    source: 'manual' | 'sensor' | 'satellite' | 'api';
    reliability: number; // 0-1
    verified: boolean;
  };
}

export interface WeatherFeatures {
  avgTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  totalRainfall: number;
  humidity: number;
  windSpeed: number;
  solarRadiation: number;
  growingDegreeDays: number;
  frostDays: number;
  heatStressDays: number;
  droughtStressDays: number;
}

export interface SoilFeatures {
  ph: number;
  organicMatter: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  temperature: number;
  bulk_density: number;
  cec: number; // Cation Exchange Capacity
  texture: 'clay' | 'loam' | 'sand' | 'silt';
  drainage: 'poor' | 'moderate' | 'good' | 'excessive';
}

export interface SatelliteFeatures {
  avgNDVI: number;
  maxNDVI: number;
  minNDVI: number;
  ndviVariability: number;
  avgEVI: number;
  avgSAVI: number;
  vegetationCover: number;
  healthTrend: 'improving' | 'stable' | 'declining';
  stressEvents: number;
  greenupDate: string;
  maturityDate: string;
}

export interface PlantingFeatures {
  plantingDate: Date;
  variety: string;
  seedRate: number;
  plantingMethod: 'direct_seed' | 'transplant' | 'broadcast';
  rowSpacing: number;
  depth: number;
  population: number;
}

export interface IrrigationFeatures {
  totalWater: number;
  irrigationEvents: number;
  method: 'sprinkler' | 'drip' | 'flood' | 'pivot' | 'furrow';
  efficiency: number;
  timing: 'scheduled' | 'sensor_based' | 'manual';
  waterQuality: QualityMetrics;
}

export interface FertilizationFeatures {
  totalNitrogen: number;
  totalPhosphorus: number;
  totalPotassium: number;
  applications: number;
  organicMatter: number;
  method: 'broadcast' | 'banded' | 'foliar' | 'fertigation';
  timing: string[];
  cost: number;
}

export interface PestControlFeatures {
  pesticide_applications: number;
  herbicide_applications: number;
  fungicide_applications: number;
  biological_control: boolean;
  integrated_pest_management: boolean;
  pest_pressure: 'low' | 'moderate' | 'high' | 'severe';
  disease_incidents: number;
  weed_pressure: 'low' | 'moderate' | 'high' | 'severe';
}

export interface HistoricalFeatures {
  previous_yields: number[];
  yield_trend: 'increasing' | 'stable' | 'decreasing';
  crop_rotation: string[];
  soil_amendments: string[];
  management_changes: string[];
  field_age: number;
  previous_issues: string[];
}

export interface QualityMetrics {
  protein_content?: number;
  moisture_content: number;
  test_weight?: number;
  grade: string;
  defects: number;
  marketability: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface SustainabilityMetrics {
  carbon_sequestration: number;
  water_use_efficiency: number;
  energy_efficiency: number;
  biodiversity_index: number;
  soil_health_score: number;
  environmental_impact: number;
}

export interface YieldPrediction {
  id: string;
  fieldId: string;
  modelId: string;
  predictedYield: number;
  confidence: number;
  uncertainty: {
    lower_bound: number;
    upper_bound: number;
    std_deviation: number;
  };
  factors: {
    weather_impact: number;
    soil_impact: number;
    management_impact: number;
    historical_impact: number;
  };
  recommendations: PredictionRecommendation[];
  createdAt: Date;
  validUntil: Date;
}

export interface PredictionRecommendation {
  type: 'irrigation' | 'fertilization' | 'pest_control' | 'harvest_timing' | 'variety_selection';
  action: string;
  impact: number; // Expected yield impact percentage
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timing: Date;
  cost: number;
  sustainability_impact: number;
}

export interface ModelPerformance {
  modelId: string;
  version: string;
  metrics: {
    mae: number; // Mean Absolute Error
    rmse: number; // Root Mean Square Error
    r2: number; // R-squared
    mape: number; // Mean Absolute Percentage Error
  };
  crossValidation: {
    folds: number;
    avgScore: number;
    stdScore: number;
  };
  featureImportance: Record<string, number>;
  validationData: {
    samples: number;
    timeRange: { start: Date; end: Date };
    regions: string[];
    cropTypes: string[];
  };
  lastEvaluation: Date;
}

export interface MLPipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'seasonal';
    nextRun: Date;
    timezone: string;
  };
  dataSource: {
    type: 'database' | 'api' | 'file' | 'stream';
    connection: string;
    filters: Record<string, any>;
  };
  output: {
    destination: 'database' | 'api' | 'file' | 'cache';
    format: 'json' | 'csv' | 'parquet' | 'avro';
    retention: number; // days
  };
  monitoring: {
    alerts: AlertConfig[];
    metrics: string[];
    dashboard: string;
  };
}

export interface PipelineStage {
  id: string;
  name: string;
  type: 'extract' | 'transform' | 'load' | 'validate' | 'model' | 'deploy';
  dependencies: string[];
  config: Record<string, any>;
  timeout: number; // seconds
  retries: number;
  resources: {
    cpu: number;
    memory: number;
    gpu?: boolean;
  };
}

export interface AlertConfig {
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'ne';
  severity: 'info' | 'warning' | 'error' | 'critical';
  channels: ('email' | 'slack' | 'webhook')[];
}

export interface DataQuality {
  completeness: number; // 0-1
  accuracy: number; // 0-1
  consistency: number; // 0-1
  timeliness: number; // 0-1
  validity: number; // 0-1
  uniqueness: number; // 0-1
  issues: DataQualityIssue[];
  score: number; // overall score 0-100
}

export interface DataQualityIssue {
  type: 'missing' | 'invalid' | 'duplicate' | 'outlier' | 'stale';
  field: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedRecords: number;
  suggestedFix: string;
}

export interface FeatureEngineering {
  transformations: FeatureTransformation[];
  selections: FeatureSelection[];
  encodings: FeatureEncoding[];
  scalings: FeatureScaling[];
}

export interface FeatureTransformation {
  name: string;
  type: 'polynomial' | 'log' | 'sqrt' | 'interaction' | 'temporal' | 'spatial';
  inputFeatures: string[];
  outputFeature: string;
  parameters: Record<string, any>;
}

export interface FeatureSelection {
  method: 'correlation' | 'mutual_info' | 'chi2' | 'f_test' | 'rfe' | 'lasso';
  threshold: number;
  maxFeatures: number;
  selectedFeatures: string[];
}

export interface FeatureEncoding {
  feature: string;
  method: 'one_hot' | 'label' | 'target' | 'ordinal' | 'frequency';
  categories: string[];
  parameters: Record<string, any>;
}

export interface FeatureScaling {
  features: string[];
  method: 'standard' | 'minmax' | 'robust' | 'quantile' | 'power';
  parameters: Record<string, any>;
}

export interface ModelExperiment {
  id: string;
  name: string;
  description: string;
  modelType: string;
  hyperparameters: Record<string, any>;
  features: string[];
  target: string;
  performance: ModelPerformance;
  artifacts: {
    model: string; // Path or URL to saved model
    weights: string;
    config: string;
    plots: string[];
  };
  tags: string[];
  createdAt: Date;
  createdBy: string;
}