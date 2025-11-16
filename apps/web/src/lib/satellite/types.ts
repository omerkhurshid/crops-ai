/**
 * Shared types for satellite monitoring system
 */
// export * from './sentinel-hub'; // Removed - using Google Earth Engine
import type { VegetationIndices } from './ndvi-analysis';
export interface BoundingBox {
  west: number;
  east: number;
  north: number;
  south: number;
}
export interface SatelliteAnalysisResult {
  id: string;
  fieldId: string;
  analysisDate: string;
  satelliteData: {
    imageId: string;
    acquisitionDate: string;
    cloudCoverage: number;
    resolution: number;
  };
  vegetationHealth: {
    ndvi: number;
    evi: number;
    healthScore: number;
    stressLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    vegetationCoverage: number;
  };
  stressIndicators: {
    water: { level: string; confidence: number };
    nitrogen: { level: string; confidence: number };
    disease: { level: string; confidence: number };
    pest: { level: string; confidence: number };
  };
  recommendations: string[];
  trends?: {
    direction: 'improving' | 'stable' | 'declining';
    confidence: number;
  };
}
export interface FieldBoundary {
  id: string;
  fieldId: string;
  type: 'detected' | 'manual' | 'imported';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  properties: {
    area: number; // hectares
    perimeter: number; // meters
    centroid: [number, number]; // [longitude, latitude]
    bbox: BoundingBox;
  };
  confidence?: number; // For detected boundaries
  source?: string; // Source of boundary data
  createdAt: Date;
  updatedAt: Date;
}
export interface CropStressDetection {
  id: string;
  fieldId: string;
  detectionDate: string;
  overallStress: {
    level: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    confidence: number;
  };
  stressTypes: {
    water: StressDetails;
    nutrient: StressDetails;
    disease: StressDetails;
    pest: StressDetails;
    temperature: StressDetails;
  };
  affectedArea: {
    percentage: number;
    hectares: number;
    zones: StressZone[];
  };
  recommendations: ActionRecommendation[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}
export interface StressDetails {
  detected: boolean;
  severity: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  confidence: number;
  indicators: string[];
  affectedPercentage: number;
}
export interface StressZone {
  id: string;
  type: string;
  severity: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  area: number; // hectares
  centerPoint: [number, number];
}
export interface ActionRecommendation {
  id: string;
  type: 'immediate' | 'short-term' | 'preventive';
  category: 'irrigation' | 'fertilization' | 'pest-control' | 'monitoring' | 'harvest';
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: string;
  resources: string[];
  deadline?: Date;
}
export interface SatelliteImageMetadata {
  id: string;
  satellite: string;
  sensor: string;
  acquisitionDate: Date;
  cloudCoverage: number;
  sunElevation: number;
  sunAzimuth: number;
  viewAngle: number;
  pixelResolution: number;
  bands: string[];
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  processingLevel: string;
}
export interface TimeSeriesData {
  fieldId: string;
  metric: 'ndvi' | 'evi' | 'savi' | 'ndre' | 'gndvi';
  dataPoints: {
    date: string;
    value: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    cloudCoverage: number;
    anomaly?: boolean;
  }[];
  statistics: {
    mean: number;
    median: number;
    stdDev: number;
    trend: {
      direction: 'increasing' | 'decreasing' | 'stable';
      slope: number;
      significance: number;
    };
  };
  seasonality?: {
    detected: boolean;
    peakMonth: number;
    troughMonth: number;
    amplitude: number;
  };
}
export interface AnalysisPreset {
  id: string;
  name: string;
  description: string;
  cropType: string;
  region?: string;
  analysisTypes: string[];
  parameters: {
    indices: string[];
    thresholds: Record<string, number>;
    alertLevels: Record<string, number>;
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    preferredDays?: number[];
    timeWindow?: { start: number; end: number };
  };
}
export interface ProcessingJob {
  id: string;
  fieldId: string;
  userId: string;
  type: 'single' | 'batch' | 'time-series';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high';
  bbox?: BoundingBox;
  dateRange?: {
    start: string;
    end: string;
  };
  options: {
    analysisTypes: ('ndvi' | 'evi' | 'health' | 'stress' | 'boundaries')[];
    resolution: number;
    cloudCoverageMax: number;
    enhanceQuality: boolean;
    generateReport: boolean;
  };
  results?: {
    images: ProcessedImage[];
    analysis: any;
    reportUrl?: string;
  };
  error?: string;
  retryCount?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  processingTime?: number;
}
export interface ProcessedImage {
  id: string;
  originalId: string;
  fieldId: string;
  type: 'true-color' | 'ndvi' | 'evi' | 'processed';
  url: string;
  thumbnailUrl: string;
  metadata: {
    acquisitionDate: string;
    cloudCoverage: number;
    resolution: number;
    bbox: BoundingBox;
    indices?: VegetationIndices;
    enhancements?: string[];
  };
  analysis?: {
    healthScore: number;
    stressLevel: string;
    vegetationCoverage: number;
    anomalies: any[];
  };
}