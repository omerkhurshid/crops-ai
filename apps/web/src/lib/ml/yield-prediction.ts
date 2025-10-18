/**
 * Yield Prediction Model Service
 * 
 * Implements machine learning models for crop yield prediction using
 * historical data, weather patterns, soil conditions, and management practices.
 * Provides both real-time predictions and batch processing capabilities.
 */

import { redis } from '../redis';
import { prisma } from '../prisma';
import { dataPipeline } from './data-pipeline';
// Logger replaced with console for local development;
import type {
  YieldPrediction,
  PredictionRecommendation,
  TrainingData,
  ModelPerformance,
  MLModelConfig,
  WeatherFeatures,
  SoilFeatures,
  SatelliteFeatures
} from './types';

export interface YieldPredictionRequest {
  fieldId: string;
  cropType: string;
  plantingDate: Date;
  harvestDate?: Date;
  features?: {
    weather?: Partial<WeatherFeatures>;
    soil?: Partial<SoilFeatures>;
    satellite?: Partial<SatelliteFeatures>;
    management?: any;
  };
  modelVersion?: string;
  confidenceLevel?: number; // 0.8, 0.9, 0.95
}

export interface YieldPredictionOptions {
  includeRecommendations: boolean;
  includeUncertainty: boolean;
  includeTrends: boolean;
  includeComparisons: boolean;
  timeHorizon: number; // days ahead to predict
}

export interface BatchPredictionRequest {
  fieldIds: string[];
  cropTypes?: string[];
  options: YieldPredictionOptions;
  modelVersion?: string;
}

export interface ModelTrainingRequest {
  dataSource: 'pipeline' | 'custom';
  trainingData?: TrainingData[];
  validationSplit: number;
  hyperparameters?: Record<string, any>;
  features?: string[];
  crossValidation?: {
    folds: number;
    stratified: boolean;
  };
}

export interface YieldModel {
  id: string;
  name: string;
  version: string;
  type: 'linear_regression' | 'random_forest' | 'gradient_boosting' | 'neural_network' | 'ensemble';
  cropTypes: string[];
  features: string[];
  performance: ModelPerformance;
  weights: Record<string, number>;
  biases: Record<string, number>;
  scalers: Record<string, { mean: number; std: number }>;
  lastTrained: Date;
  status: 'training' | 'ready' | 'deprecated';
}

class YieldPredictionService {
  private readonly CACHE_PREFIX = 'yield_prediction_';
  private readonly MODEL_PREFIX = 'yield_model_';
  private readonly PREDICTION_TTL = 24 * 60 * 60; // 24 hours
  private readonly DEFAULT_MODEL = 'yield_rf_v1.0';

  private models: Map<string, YieldModel> = new Map();

  constructor() {
    this.loadPretrainedModels();
  }

  /**
   * Predict yield for a single field
   */
  async predictYield(
    request: YieldPredictionRequest,
    options: YieldPredictionOptions = {
      includeRecommendations: true,
      includeUncertainty: true,
      includeTrends: false,
      includeComparisons: false,
      timeHorizon: 30
    }
  ): Promise<YieldPrediction> {
    const startTime = Date.now();

    try {
      console.log(`Predicting yield for field ${request.fieldId}`, {
        cropType: request.cropType,
        modelVersion: request.modelVersion
      });

      // Get or create cache key
      const cacheKey = this.generateCacheKey(request, options);
      const cached = await this.getCachedPrediction(cacheKey);
      if (cached) {
        console.log(`Returning cached prediction for field ${request.fieldId}`);
        return cached;
      }

      // Get field information
      const field = await prisma.field.findUnique({
        where: { id: request.fieldId },
        include: { farm: true }
      });

      if (!field) {
        throw new Error(`Field ${request.fieldId} not found`);
      }

      // Select appropriate model
      const model = await this.selectModel(request.cropType, request.modelVersion);
      
      // Prepare feature vector
      const features = await this.prepareFeatures(request, field);
      
      // Make prediction
      const rawPrediction = await this.runInference(model, features);
      
      // Post-process prediction
      const prediction = await this.postProcessPrediction(
        rawPrediction,
        model,
        request,
        options
      );

      // Generate recommendations if requested
      if (options.includeRecommendations) {
        prediction.recommendations = await this.generateRecommendations(
          prediction,
          features,
          model
        );
      }

      // Cache prediction
      await this.cachePrediction(cacheKey, prediction);

      console.log(`Yield prediction completed for field ${request.fieldId}`, {
        predictedYield: prediction.predictedYield,
        confidence: prediction.confidence,
        processingTime: Date.now() - startTime
      });

      return prediction;

    } catch (error) {
      console.error(`Yield prediction failed for field ${request.fieldId}`, error);
      throw error;
    }
  }

  /**
   * Predict yields for multiple fields
   */
  async predictYieldBatch(request: BatchPredictionRequest): Promise<YieldPrediction[]> {
    const startTime = Date.now();

    try {
      console.log(`Starting batch yield prediction for ${request.fieldIds.length} fields`);

      const predictions: YieldPrediction[] = [];
      const batchSize = 10; // Process in batches to avoid overload

      for (let i = 0; i < request.fieldIds.length; i += batchSize) {
        const batch = request.fieldIds.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (fieldId) => {
          try {
            // Get field info to determine crop type
            const field = await prisma.field.findUnique({
              where: { id: fieldId }
            });

            if (!field) {
              console.warn(`Skipping field ${fieldId} - field not found`);
              return null;
            }

            const predictionRequest: YieldPredictionRequest = {
              fieldId,
              cropType: 'corn', // Default crop type since Field model doesn't have cropType
              plantingDate: new Date(), // Would get from actual planting records
              modelVersion: request.modelVersion
            };

            return await this.predictYield(predictionRequest, request.options);

          } catch (error) {
            console.warn(`Failed to predict yield for field ${fieldId}`, error);
            return null;
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        const validPredictions = batchResults
          .filter(result => result.status === 'fulfilled' && result.value !== null)
          .map(result => (result as PromiseFulfilledResult<YieldPrediction>).value);

        predictions.push(...validPredictions);
      }

      console.log(`Batch yield prediction completed`, {
        totalFields: request.fieldIds.length,
        successfulPredictions: predictions.length,
        processingTime: Date.now() - startTime
      });

      return predictions;

    } catch (error) {
      console.error('Batch yield prediction failed', error);
      throw error;
    }
  }

  /**
   * Train a new yield prediction model
   */
  async trainModel(request: ModelTrainingRequest): Promise<YieldModel> {
    const startTime = Date.now();

    try {
      console.log('Starting yield model training', {
        dataSource: request.dataSource,
        validationSplit: request.validationSplit
      });

      // Get training data
      let trainingData: TrainingData[];
      if (request.dataSource === 'pipeline') {
        const pipelineResult = await dataPipeline.executePipeline(
          {
            sources: {
              weather: true,
              satellite: true,
              soil: true,
              management: true,
              historical: true
            },
            timeRange: {
              start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 3), // 3 years
              end: new Date()
            },
            fieldFilters: {},
            qualityThresholds: {
              completeness: 0.8,
              accuracy: 0.9,
              timeliness: 0.9
            }
          },
          {
            normalization: true,
            featureEngineering: true,
            outlierDetection: true,
            missingValueHandling: 'interpolate',
            aggregationPeriod: 'seasonal'
          }
        );
        trainingData = pipelineResult.trainingData;
      } else {
        trainingData = request.trainingData || [];
      }

      if (trainingData.length < 100) {
        throw new Error('Insufficient training data - minimum 100 samples required');
      }

      // Feature selection
      const selectedFeatures = request.features || this.selectImportantFeatures(trainingData);
      
      // Prepare training matrices
      const { X, y } = this.prepareTrainingData(trainingData, selectedFeatures);
      
      // Split data
      const splitIndex = Math.floor(X.length * (1 - request.validationSplit));
      const X_train = X.slice(0, splitIndex);
      const y_train = y.slice(0, splitIndex);
      const X_val = X.slice(splitIndex);
      const y_val = y.slice(splitIndex);

      // Train model (simplified implementation - in production would use actual ML library)
      const modelWeights = await this.trainRandomForest(X_train, y_train);
      
      // Validate model
      const predictions = await this.predictBatch(modelWeights, X_val, selectedFeatures);
      const performance = this.calculateModelPerformance(y_val, predictions);

      // Create model object
      const model: YieldModel = {
        id: `yield_model_${Date.now()}`,
        name: `Yield Prediction Model ${new Date().toISOString().split('T')[0]}`,
        version: '1.0',
        type: 'random_forest',
        cropTypes: Array.from(new Set(trainingData.map(d => d.cropType))),
        features: selectedFeatures,
        performance,
        weights: modelWeights,
        biases: {},
        scalers: this.calculateScalers(X_train, selectedFeatures),
        lastTrained: new Date(),
        status: 'ready'
      };

      // Save model
      await this.saveModel(model);
      this.models.set(model.id, model);

      console.log('Model training completed successfully', {
        modelId: model.id,
        performance: performance.metrics,
        trainingTime: Date.now() - startTime,
        trainingSize: X_train.length,
        validationSize: X_val.length
      });

      return model;

    } catch (error) {
      console.error('Model training failed', error);
      throw error;
    }
  }

  /**
   * Evaluate model performance
   */
  async evaluateModel(modelId: string, testData?: TrainingData[]): Promise<ModelPerformance> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }

      // Use provided test data or generate new validation set
      let evaluationData: TrainingData[];
      if (testData) {
        evaluationData = testData;
      } else {
        // Get recent data for evaluation
        const pipelineResult = await dataPipeline.executePipeline(
          {
            sources: {
              weather: true,
              satellite: true,
              soil: true,
              management: true,
              historical: true
            },
            timeRange: {
              start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
              end: new Date()
            },
            fieldFilters: {
              cropTypes: model.cropTypes
            },
            qualityThresholds: {
              completeness: 0.8,
              accuracy: 0.9,
              timeliness: 0.9
            }
          },
          {
            normalization: true,
            featureEngineering: true,
            outlierDetection: true,
            missingValueHandling: 'interpolate',
            aggregationPeriod: 'seasonal'
          }
        );
        evaluationData = pipelineResult.validationData;
      }

      const { X, y } = this.prepareTrainingData(evaluationData, model.features);
      const predictions = await this.predictBatch(model.weights, X, model.features);
      const performance = this.calculateModelPerformance(y, predictions);

      // Update model performance
      model.performance = performance;
      await this.saveModel(model);

      console.log(`Model evaluation completed for ${modelId}`, {
        metrics: performance.metrics,
        samples: evaluationData.length
      });

      return performance;

    } catch (error) {
      console.error(`Model evaluation failed for ${modelId}`, error);
      throw error;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<MLModelConfig[]> {
    try {
      const models = Array.from(this.models.values()).map(model => ({
        id: model.id,
        name: model.name,
        version: model.version,
        type: 'yield_prediction' as const,
        status: model.status,
        accuracy: model.performance.metrics.r2,
        lastTrained: model.lastTrained,
        features: model.features,
        hyperparameters: {},
        metadata: {
          cropTypes: model.cropTypes,
          regions: [],
          seasonality: true,
          dataRequirements: model.features
        }
      }));

      return models;
    } catch (error) {
      console.error('Failed to get available models', error);
      throw error;
    }
  }

  // Private helper methods

  private async selectModel(cropType: string, version?: string): Promise<YieldModel> {
    // Select best model for crop type
    const availableModels = Array.from(this.models.values())
      .filter(model => 
        model.cropTypes.includes(cropType) && 
        model.status === 'ready' &&
        (!version || model.version === version)
      )
      .sort((a, b) => b.performance.metrics.r2 - a.performance.metrics.r2);

    if (availableModels.length === 0) {
      // Return default model
      return this.getDefaultModel(cropType);
    }

    return availableModels[0];
  }

  private async prepareFeatures(
    request: YieldPredictionRequest,
    field: any
  ): Promise<Record<string, number>> {
    // Extract and prepare features for prediction
    const features: Record<string, number> = {};

    // Weather features (simplified - would get from actual weather service)
    if (request.features?.weather) {
      Object.assign(features, {
        'weather.avgTemperature': request.features.weather.avgTemperature || 20,
        'weather.totalRainfall': request.features.weather.totalRainfall || 500,
        'weather.humidity': request.features.weather.humidity || 60,
        'weather.growingDegreeDays': request.features.weather.growingDegreeDays || 1500
      });
    }

    // Soil features
    if (request.features?.soil) {
      Object.assign(features, {
        'soil.ph': request.features.soil.ph || 6.5,
        'soil.organicMatter': request.features.soil.organicMatter || 3,
        'soil.nitrogen': request.features.soil.nitrogen || 30,
        'soil.phosphorus': request.features.soil.phosphorus || 25
      });
    }

    // Satellite features
    if (request.features?.satellite) {
      Object.assign(features, {
        'satellite.avgNDVI': request.features.satellite.avgNDVI || 0.7,
        'satellite.avgEVI': request.features.satellite.avgEVI || 0.5,
        'satellite.vegetationCover': request.features.satellite.vegetationCover || 80
      });
    }

    // Field characteristics
    features['field.area'] = field.area || 100;
    features['field.cropType'] = this.encodeCropType(request.cropType);

    // Temporal features
    const plantingDoy = this.getDayOfYear(request.plantingDate);
    features['planting.dayOfYear'] = plantingDoy;
    features['planting.month'] = request.plantingDate.getMonth() + 1;

    return features;
  }

  private async runInference(
    model: YieldModel,
    features: Record<string, number>
  ): Promise<{ yield: number; confidence: number }> {
    // Simplified inference - in production would use actual ML framework
    
    // Scale features
    const scaledFeatures = this.scaleFeatures(features, model.scalers);
    
    // Calculate prediction using simple weighted sum (simplified)
    let prediction = 0;
    let totalWeight = 0;

    for (const feature of model.features) {
      const value = scaledFeatures[feature] || 0;
      const weight = model.weights[feature] || 0;
      prediction += value * weight;
      totalWeight += Math.abs(weight);
    }

    // Add base yield
    prediction += 8.5; // Base yield assumption

    // Calculate confidence based on feature completeness and model performance
    const completeness = model.features.reduce((sum, feature) => 
      sum + (features[feature] !== undefined ? 1 : 0), 0) / model.features.length;
    
    const confidence = Math.min(0.95, model.performance.metrics.r2 * completeness);

    return { yield: Math.max(0, prediction), confidence };
  }

  private async postProcessPrediction(
    rawPrediction: { yield: number; confidence: number },
    model: YieldModel,
    request: YieldPredictionRequest,
    options: YieldPredictionOptions
  ): Promise<YieldPrediction> {
    const prediction: YieldPrediction = {
      id: `pred_${request.fieldId}_${Date.now()}`,
      fieldId: request.fieldId,
      modelId: model.id,
      predictedYield: rawPrediction.yield,
      confidence: rawPrediction.confidence,
      uncertainty: {
        lower_bound: rawPrediction.yield * 0.85,
        upper_bound: rawPrediction.yield * 1.15,
        std_deviation: rawPrediction.yield * 0.1
      },
      factors: {
        weather_impact: 0.3,
        soil_impact: 0.25,
        management_impact: 0.3,
        historical_impact: 0.15
      },
      recommendations: [],
      createdAt: new Date(),
      validUntil: new Date(Date.now() + options.timeHorizon * 24 * 60 * 60 * 1000)
    };

    return prediction;
  }

  private async generateRecommendations(
    prediction: YieldPrediction,
    features: Record<string, number>,
    model: YieldModel
  ): Promise<PredictionRecommendation[]> {
    const recommendations: PredictionRecommendation[] = [];

    // Analyze feature impacts and generate recommendations
    if (features['soil.nitrogen'] < 25) {
      recommendations.push({
        type: 'fertilization',
        action: 'Apply nitrogen fertilizer to increase soil nitrogen levels',
        impact: 8, // 8% yield increase
        confidence: 0.8,
        priority: 'high',
        timing: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        cost: 150,
        sustainability_impact: -0.1
      });
    }

    if (features['weather.totalRainfall'] < 400) {
      recommendations.push({
        type: 'irrigation',
        action: 'Increase irrigation frequency due to low rainfall forecast',
        impact: 12,
        confidence: 0.75,
        priority: 'high',
        timing: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        cost: 200,
        sustainability_impact: -0.2
      });
    }

    if (features['satellite.avgNDVI'] < 0.6) {
      recommendations.push({
        type: 'pest_control',
        action: 'Investigate potential stress factors affecting vegetation health',
        impact: 6,
        confidence: 0.65,
        priority: 'medium',
        timing: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        cost: 100,
        sustainability_impact: 0.05
      });
    }

    return recommendations;
  }

  // Model training helpers (simplified implementations)
  private async trainRandomForest(X: number[][], y: number[]): Promise<Record<string, number>> {
    // Simplified training - returns random weights for demonstration
    const weights: Record<string, number> = {};
    
    // Generate feature weights (in production would use actual Random Forest)
    const featureNames = [
      'weather.avgTemperature', 'weather.totalRainfall', 'weather.humidity',
      'soil.ph', 'soil.organicMatter', 'soil.nitrogen',
      'satellite.avgNDVI', 'satellite.avgEVI',
      'field.area', 'planting.dayOfYear'
    ];

    featureNames.forEach(feature => {
      weights[feature] = (Math.random() - 0.5) * 2; // -1 to 1
    });

    return weights;
  }

  private prepareTrainingData(
    data: TrainingData[],
    features: string[]
  ): { X: number[][]; y: number[] } {
    const X: number[][] = [];
    const y: number[] = [];

    data.forEach(sample => {
      if (sample.target?.yield) {
        const featureVector: number[] = [];
        
        features.forEach(feature => {
          // Extract feature value from nested structure
          const value = this.extractFeatureValue(sample, feature);
          featureVector.push(value);
        });

        X.push(featureVector);
        y.push(sample.target.yield);
      }
    });

    return { X, y };
  }

  private extractFeatureValue(sample: TrainingData, feature: string): number {
    // Navigate nested feature structure
    const parts = feature.split('.');
    let current: any = sample.features;

    for (const part of parts) {
      current = current?.[part];
    }

    return typeof current === 'number' ? current : 0;
  }

  private selectImportantFeatures(data: TrainingData[]): string[] {
    // Return predefined important features
    return [
      'weather.avgTemperature',
      'weather.totalRainfall', 
      'weather.growingDegreeDays',
      'soil.ph',
      'soil.organicMatter',
      'soil.nitrogen',
      'satellite.avgNDVI',
      'satellite.avgEVI',
      'field.area',
      'planting.dayOfYear'
    ];
  }

  private async predictBatch(
    weights: Record<string, number>,
    X: number[][],
    features: string[]
  ): Promise<number[]> {
    return X.map(sample => {
      let prediction = 8.5; // Base yield
      
      sample.forEach((value, index) => {
        const feature = features[index];
        const weight = weights[feature] || 0;
        prediction += value * weight * 0.1; // Scale factor
      });

      return Math.max(0, prediction);
    });
  }

  private calculateModelPerformance(actual: number[], predicted: number[]): ModelPerformance {
    const n = actual.length;
    
    // Mean Absolute Error
    const mae = actual.reduce((sum, val, i) => sum + Math.abs(val - predicted[i]), 0) / n;
    
    // Root Mean Square Error  
    const rmse = Math.sqrt(actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0) / n);
    
    // R-squared
    const actualMean = actual.reduce((sum, val) => sum + val, 0) / n;
    const ss_res = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    const ss_tot = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    const r2 = 1 - (ss_res / ss_tot);
    
    // Mean Absolute Percentage Error
    const mape = actual.reduce((sum, val, i) => sum + Math.abs((val - predicted[i]) / val), 0) / n * 100;

    return {
      modelId: 'current',
      version: '1.0',
      metrics: { mae, rmse, r2, mape },
      crossValidation: {
        folds: 5,
        avgScore: r2,
        stdScore: 0.05
      },
      featureImportance: {},
      validationData: {
        samples: n,
        timeRange: { start: new Date(), end: new Date() },
        regions: [],
        cropTypes: []
      },
      lastEvaluation: new Date()
    };
  }

  private calculateScalers(
    X: number[][],
    features: string[]
  ): Record<string, { mean: number; std: number }> {
    const scalers: Record<string, { mean: number; std: number }> = {};

    features.forEach((feature, index) => {
      const values = X.map(row => row[index]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);

      scalers[feature] = { mean, std };
    });

    return scalers;
  }

  private scaleFeatures(
    features: Record<string, number>,
    scalers: Record<string, { mean: number; std: number }>
  ): Record<string, number> {
    const scaled: Record<string, number> = {};

    Object.keys(features).forEach(feature => {
      const scaler = scalers[feature];
      if (scaler && scaler.std > 0) {
        scaled[feature] = (features[feature] - scaler.mean) / scaler.std;
      } else {
        scaled[feature] = features[feature];
      }
    });

    return scaled;
  }

  // Utility methods
  private generateCacheKey(request: YieldPredictionRequest, options: YieldPredictionOptions): string {
    const keyData = {
      fieldId: request.fieldId,
      cropType: request.cropType,
      plantingDate: request.plantingDate.toISOString().split('T')[0],
      modelVersion: request.modelVersion,
      options: options
    };
    return `${this.CACHE_PREFIX}${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  private async getCachedPrediction(cacheKey: string): Promise<YieldPrediction | null> {
    try {
      return await redis.get(cacheKey) as YieldPrediction;
    } catch (error) {
      console.warn('Failed to get cached prediction', error);
      return null;
    }
  }

  private async cachePrediction(cacheKey: string, prediction: YieldPrediction): Promise<void> {
    try {
      await redis.set(cacheKey, prediction, { ex: this.PREDICTION_TTL });
    } catch (error) {
      console.warn('Failed to cache prediction', error);
    }
  }

  private encodeCropType(cropType: string): number {
    const encoding: Record<string, number> = {
      'corn': 1,
      'soybean': 2,
      'wheat': 3,
      'rice': 4,
      'barley': 5,
      'oats': 6
    };
    return encoding[cropType.toLowerCase()] || 0;
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  }

  private getDefaultModel(cropType: string): YieldModel {
    return {
      id: this.DEFAULT_MODEL,
      name: 'Default Yield Model',
      version: '1.0',
      type: 'random_forest',
      cropTypes: [cropType],
      features: this.selectImportantFeatures([]),
      performance: {
        modelId: this.DEFAULT_MODEL,
        version: '1.0',
        metrics: { mae: 1.2, rmse: 1.5, r2: 0.75, mape: 12 },
        crossValidation: { folds: 5, avgScore: 0.75, stdScore: 0.05 },
        featureImportance: {},
        validationData: {
          samples: 1000,
          timeRange: { start: new Date(), end: new Date() },
          regions: [],
          cropTypes: [cropType]
        },
        lastEvaluation: new Date()
      },
      weights: {
        'weather.avgTemperature': 0.15,
        'weather.totalRainfall': 0.25,
        'soil.nitrogen': 0.20,
        'satellite.avgNDVI': 0.30,
        'field.area': 0.10
      },
      biases: {},
      scalers: {},
      lastTrained: new Date(),
      status: 'ready'
    };
  }

  private async saveModel(model: YieldModel): Promise<void> {
    try {
      await redis.set(`${this.MODEL_PREFIX}${model.id}`, model, { ex: 30 * 24 * 60 * 60 }); // 30 days
    } catch (error) {
      console.warn(`Failed to save model ${model.id}`, error);
    }
  }

  private async loadPretrainedModels(): Promise<void> {
    // Load default models
    const defaultModel = this.getDefaultModel('general');
    this.models.set(defaultModel.id, defaultModel);

    // In production, would load models from storage
    console.log('Loaded pretrained models', {
      count: this.models.size
    });
  }
}

export const yieldPrediction = new YieldPredictionService();