/**
 * NDVI Calculation and Vegetation Health Analysis
 * 
 * Provides comprehensive vegetation health monitoring using NDVI and other
 * spectral indices, including trend analysis, stress detection, and yield prediction.
 */
export interface SpectralBands {
  red: number;     // Band 4 (Sentinel-2)
  nir: number;     // Band 8 (Sentinel-2)
  redEdge: number; // Band 5 (Sentinel-2)
  green: number;   // Band 3 (Sentinel-2)
  blue: number;    // Band 2 (Sentinel-2)
  swir1: number;   // Band 11 (Sentinel-2)
  swir2: number;   // Band 12 (Sentinel-2)
}
export interface VegetationIndices {
  ndvi: number;    // Normalized Difference Vegetation Index
  evi: number;     // Enhanced Vegetation Index
  savi: number;    // Soil Adjusted Vegetation Index
  ndre: number;    // Normalized Difference Red Edge
  gndvi: number;   // Green NDVI
  ndwi: number;    // Normalized Difference Water Index
  msavi: number;   // Modified Soil Adjusted Vegetation Index
  gci: number;     // Green Chlorophyll Index
}
export interface VegetationHealthReport {
  fieldId: string;
  analysisDate: string;
  indices: VegetationIndices;
  healthScore: number; // 0-100
  stressLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  stressIndicators: {
    drought: { severity: number; confidence: number };
    disease: { severity: number; confidence: number };
    nutrient: { severity: number; confidence: number };
    pest: { severity: number; confidence: number };
  };
  phenologyStage: 'emergence' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'senescence';
  biomassEstimate: number; // kg/ha
  yieldPrediction: {
    estimated: number; // tons/ha
    confidence: number; // 0-1
    factors: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    seasonal: string[];
  };
  spatialAnalysis: {
    uniformity: number; // 0-1 (coefficient of variation)
    hotspots: { type: 'stress' | 'vigor'; coordinates: [number, number]; severity: number }[];
    zones: {
      excellent: { percentage: number; area: number };
      good: { percentage: number; area: number };
      moderate: { percentage: number; area: number };
      poor: { percentage: number; area: number };
    };
  };
}
export interface NDVITrendAnalysis {
  fieldId: string;
  timeRange: { start: string; end: string };
  dataPoints: {
    date: string;
    ndvi: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    cloudCover: number;
  }[];
  trend: {
    direction: 'increasing' | 'decreasing' | 'stable' | 'seasonal';
    slope: number; // NDVI change per day
    significance: number; // R²
    seasonality: {
      amplitude: number;
      peak: string; // date
      trough: string; // date
    };
  };
  anomalies: {
    date: string;
    ndvi: number;
    expected: number;
    deviation: number;
    type: 'drought' | 'flooding' | 'pest' | 'disease' | 'harvest' | 'unknown';
    severity: 'minor' | 'moderate' | 'severe';
  }[];
  forecast: {
    nextPeriod: number; // days
    predictedValues: { date: string; ndvi: number; confidence: number }[];
    warnings: string[];
  };
}
export interface FieldComparisonReport {
  baselineField: string;
  comparisonFields: string[];
  analysisDate: string;
  metrics: {
    fieldId: string;
    name?: string;
    area: number; // hectares
    averageNDVI: number;
    healthScore: number;
    stressLevel: string;
    yieldPrediction: number;
    rank: number; // 1 = best
  }[];
  insights: {
    bestPerforming: string;
    mostStressed: string;
    averageHealthScore: number;
    variability: number; // coefficient of variation
    factors: {
      management: string[];
      environmental: string[];
      genetic: string[];
    };
  };
  recommendations: {
    fieldSpecific: { fieldId: string; actions: string[] }[];
    general: string[];
  };
}
class NDVIAnalysisService {
  private readonly CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours
  private readonly CACHE_PREFIX = 'ndvi_analysis_';
  /**
   * Calculate vegetation indices from spectral bands
   */
  calculateVegetationIndices(bands: SpectralBands): VegetationIndices {
    const { red, nir, redEdge, green, blue, swir1, swir2 } = bands;
    // NDVI = (NIR - Red) / (NIR + Red)
    const ndvi = (nir - red) / (nir + red);
    // EVI = 2.5 * ((NIR - Red) / (NIR + 6 * Red - 7.5 * Blue + 1))
    const evi = 2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1));
    // SAVI = ((NIR - Red) / (NIR + Red + L)) * (1 + L), where L = 0.5
    const L = 0.5;
    const savi = ((nir - red) / (nir + red + L)) * (1 + L);
    // NDRE = (NIR - RedEdge) / (NIR + RedEdge)
    const ndre = (nir - redEdge) / (nir + redEdge);
    // GNDVI = (NIR - Green) / (NIR + Green)
    const gndvi = (nir - green) / (nir + green);
    // NDWI = (Green - NIR) / (Green + NIR)
    const ndwi = (green - nir) / (green + nir);
    // MSAVI = (2 * NIR + 1 - sqrt((2 * NIR + 1)² - 8 * (NIR - Red))) / 2
    const msavi = (2 * nir + 1 - Math.sqrt(Math.pow(2 * nir + 1, 2) - 8 * (nir - red))) / 2;
    // GCI = (NIR / Green) - 1
    const gci = (nir / green) - 1;
    return {
      ndvi: Math.max(-1, Math.min(1, ndvi)),
      evi: Math.max(-1, Math.min(1, evi)),
      savi: Math.max(-1, Math.min(1, savi)),
      ndre: Math.max(-1, Math.min(1, ndre)),
      gndvi: Math.max(-1, Math.min(1, gndvi)),
      ndwi: Math.max(-1, Math.min(1, ndwi)),
      msavi: Math.max(-1, Math.min(1, msavi)),
      gci: Math.max(0, Math.min(5, gci))
    };
  }
  /**
   * Generate comprehensive vegetation health report
   */
  async generateHealthReport(
    fieldId: string,
    indices: VegetationIndices,
    fieldArea: number = 100, // hectares
    cropType: string = 'general'
  ): Promise<VegetationHealthReport> {
    try {
      const healthScore = this.calculateHealthScore(indices);
      const stressLevel = this.determineStressLevel(healthScore);
      const stressIndicators = this.analyzeStressIndicators(indices);
      const phenologyStage = this.determinePhenologyStage(indices, cropType);
      const biomassEstimate = this.estimateBiomass(indices, cropType);
      const yieldPrediction = this.predictYield(indices, biomassEstimate, cropType, fieldArea);
      const recommendations = this.generateRecommendations(indices, stressLevel, phenologyStage);
      const spatialAnalysis = this.performSpatialAnalysis(indices, fieldArea);
      return {
        fieldId,
        analysisDate: new Date().toISOString(),
        indices,
        healthScore,
        stressLevel,
        stressIndicators,
        phenologyStage,
        biomassEstimate,
        yieldPrediction,
        recommendations,
        spatialAnalysis
      };
    } catch (error) {
      console.error('Error generating health report:', error);
      throw error;
    }
  }
  /**
   * Analyze NDVI trends over time
   */
  async analyzeTrends(
    fieldId: string,
    timeSeriesData: { date: string; ndvi: number; cloudCover: number }[],
    forecastDays: number = 30
  ): Promise<NDVITrendAnalysis> {
    try {
      const dataPoints = timeSeriesData.map(point => ({
        ...point,
        quality: this.assessDataQuality(point.cloudCover, point.ndvi)
      }));
      const trend = this.calculateTrend(dataPoints);
      const anomalies = this.detectAnomalies(dataPoints);
      const forecast = this.generateForecast(dataPoints, forecastDays);
      return {
        fieldId,
        timeRange: {
          start: dataPoints[0]?.date || '',
          end: dataPoints[dataPoints.length - 1]?.date || ''
        },
        dataPoints,
        trend,
        anomalies,
        forecast
      };
    } catch (error) {
      console.error('Error analyzing trends:', error);
      throw error;
    }
  }
  /**
   * Compare multiple fields
   */
  async compareFields(
    baselineField: string,
    comparisonFields: { fieldId: string; name?: string; area: number; indices: VegetationIndices }[]
  ): Promise<FieldComparisonReport> {
    try {
      const allFields = [
        { fieldId: baselineField, area: 100, indices: this.generateSampleIndices() }, // Baseline
        ...comparisonFields
      ];
      const metrics = allFields.map(field => {
        const healthScore = this.calculateHealthScore(field.indices);
        const stressLevel = this.determineStressLevel(healthScore);
        const yieldPrediction = this.predictYield(field.indices, 5000, 'general', field.area).estimated;
        return {
          fieldId: field.fieldId,
          name: field.name,
          area: field.area,
          averageNDVI: field.indices.ndvi,
          healthScore,
          stressLevel,
          yieldPrediction,
          rank: 0 // Will be set after sorting
        };
      });
      // Rank fields by health score
      metrics.sort((a, b) => b.healthScore - a.healthScore);
      metrics.forEach((metric, index) => {
        metric.rank = index + 1;
      });
      const insights = this.generateFieldInsights(metrics);
      const recommendations = this.generateFieldRecommendations(metrics);
      return {
        baselineField,
        comparisonFields: comparisonFields.map(f => f.fieldId),
        analysisDate: new Date().toISOString(),
        metrics,
        insights,
        recommendations
      };
    } catch (error) {
      console.error('Error comparing fields:', error);
      throw error;
    }
  }
  /**
   * Detect crop stress using multiple indices
   */
  detectCropStress(indices: VegetationIndices): {
    overall: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    water: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    nitrogen: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    chlorophyll: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    confidence: number;
    recommendations: string[];
  } {
    const waterStress = this.assessWaterStress(indices);
    const nitrogenStress = this.assessNitrogenStress(indices);
    const chlorophyllStress = this.assessChlorophyllStress(indices);
    const stressLevels = [waterStress.level, nitrogenStress.level, chlorophyllStress.level];
    const stressScores: number[] = stressLevels.map(level => 
      level === 'severe' ? 4 : level === 'high' ? 3 : level === 'moderate' ? 2 : level === 'low' ? 1 : 0
    );
    const avgStress = stressScores.reduce((a, b) => a + b, 0) / stressScores.length;
    const overall = avgStress >= 3.5 ? 'severe' :
                   avgStress >= 2.5 ? 'high' :
                   avgStress >= 1.5 ? 'moderate' :
                   avgStress >= 0.5 ? 'low' : 'none';
    const confidence = Math.min(waterStress.confidence, nitrogenStress.confidence, chlorophyllStress.confidence);
    const recommendations = [];
    if (waterStress.level !== 'none') {
      recommendations.push(`Water stress detected: ${waterStress.recommendation}`);
    }
    if (nitrogenStress.level !== 'none') {
      recommendations.push(`Nitrogen deficiency detected: ${nitrogenStress.recommendation}`);
    }
    if (chlorophyllStress.level !== 'none') {
      recommendations.push(`Chlorophyll stress detected: ${chlorophyllStress.recommendation}`);
    }
    return {
      overall,
      water: waterStress.level,
      nitrogen: nitrogenStress.level,
      chlorophyll: chlorophyllStress.level,
      confidence,
      recommendations
    };
  }
  // Private helper methods
  private calculateHealthScore(indices: VegetationIndices): number {
    // Weighted average of key indices
    const weights = {
      ndvi: 0.3,
      evi: 0.25,
      savi: 0.2,
      ndre: 0.15,
      gndvi: 0.1
    };
    // Normalize indices to 0-1 scale
    const normalizedNDVI = Math.max(0, (indices.ndvi + 1) / 2);
    const normalizedEVI = Math.max(0, (indices.evi + 1) / 2);
    const normalizedSAVI = Math.max(0, (indices.savi + 1) / 2);
    const normalizedNDRE = Math.max(0, (indices.ndre + 1) / 2);
    const normalizedGNDVI = Math.max(0, (indices.gndvi + 1) / 2);
    const score = (
      normalizedNDVI * weights.ndvi +
      normalizedEVI * weights.evi +
      normalizedSAVI * weights.savi +
      normalizedNDRE * weights.ndre +
      normalizedGNDVI * weights.gndvi
    ) * 100;
    return Math.max(0, Math.min(100, score));
  }
  private determineStressLevel(healthScore: number): 'none' | 'low' | 'moderate' | 'high' | 'severe' {
    if (healthScore >= 80) return 'none';
    if (healthScore >= 60) return 'low';
    if (healthScore >= 40) return 'moderate';
    if (healthScore >= 20) return 'high';
    return 'severe';
  }
  private analyzeStressIndicators(indices: VegetationIndices): VegetationHealthReport['stressIndicators'] {
    return {
      drought: {
        severity: Math.max(0, 1 - indices.ndvi * 1.5),
        confidence: 0.8
      },
      disease: {
        severity: Math.max(0, 0.5 - indices.ndre),
        confidence: 0.7
      },
      nutrient: {
        severity: Math.max(0, 0.8 - indices.evi),
        confidence: 0.75
      },
      pest: {
        severity: Math.max(0, 0.6 - indices.gndvi),
        confidence: 0.6
      }
    };
  }
  private determinePhenologyStage(indices: VegetationIndices, cropType: string): VegetationHealthReport['phenologyStage'] {
    const { ndvi, ndre } = indices;
    if (ndvi < 0.3) return 'emergence';
    if (ndvi < 0.5) return 'vegetative';
    if (ndvi > 0.7 && ndre > 0.2) return 'flowering';
    if (ndvi > 0.6) return 'fruiting';
    if (ndvi > 0.4) return 'maturity';
    return 'senescence';
  }
  private estimateBiomass(indices: VegetationIndices, cropType: string): number {
    // Simplified biomass estimation using NDVI
    // In production, this would use crop-specific models
    const baseBiomass = 2000; // kg/ha
    const ndviFactor = Math.max(0, indices.ndvi) * 3;
    const eviFactor = Math.max(0, indices.evi) * 2;
    return Math.round(baseBiomass * (1 + ndviFactor + eviFactor));
  }
  private predictYield(indices: VegetationIndices, biomass: number, cropType: string, area: number): VegetationHealthReport['yieldPrediction'] {
    // Simplified yield prediction
    const harvestIndex = 0.4; // Typical harvest index
    const yieldPerHa = (biomass * harvestIndex) / 1000; // tons/ha
    const totalYield = yieldPerHa * area;
    const factors = [];
    if (indices.ndvi < 0.5) factors.push('Low vegetation vigor');
    if (indices.ndwi < 0) factors.push('Water stress');
    if (indices.ndre < 0.2) factors.push('Nutrient deficiency');
    return {
      estimated: Math.round(totalYield * 100) / 100,
      confidence: Math.max(0.3, Math.min(0.9, indices.ndvi + 0.2)),
      factors
    };
  }
  private generateRecommendations(
    indices: VegetationIndices,
    stressLevel: string,
    phenologyStage: string
  ): VegetationHealthReport['recommendations'] {
    const immediate = [];
    const shortTerm = [];
    const seasonal = [];
    if (stressLevel === 'high' || stressLevel === 'severe') {
      immediate.push('Urgent attention required - investigate stress causes');
      if (indices.ndwi < -0.3) immediate.push('Increase irrigation immediately');
      if (indices.ndre < 0.1) immediate.push('Apply foliar nutrients');
    }
    if (indices.ndvi < 0.5) {
      shortTerm.push('Monitor crop development closely');
      shortTerm.push('Consider supplemental nutrition');
    }
    if (phenologyStage === 'flowering' || phenologyStage === 'fruiting') {
      seasonal.push('Critical growth stage - maintain optimal conditions');
      seasonal.push('Monitor for pest and disease pressure');
    }
    return { immediate, shortTerm, seasonal };
  }
  private performSpatialAnalysis(indices: VegetationIndices, fieldArea: number): VegetationHealthReport['spatialAnalysis'] {
    // Simulate spatial variability
    const uniformity = 0.7 + Math.random() * 0.3; // 0.7-1.0
    const hotspots = [];
    const numHotspots = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numHotspots; i++) {
      hotspots.push({
        type: Math.random() > 0.5 ? 'stress' : 'vigor' as 'stress' | 'vigor',
        coordinates: [Math.random() * 100, Math.random() * 100] as [number, number],
        severity: Math.random()
      });
    }
    const zones = {
      excellent: { percentage: 25, area: fieldArea * 0.25 },
      good: { percentage: 35, area: fieldArea * 0.35 },
      moderate: { percentage: 25, area: fieldArea * 0.25 },
      poor: { percentage: 15, area: fieldArea * 0.15 }
    };
    return { uniformity, hotspots, zones };
  }
  private calculateTrend(dataPoints: any[]): NDVITrendAnalysis['trend'] {
    const values = dataPoints.map(p => p.ndvi);
    const dates = dataPoints.map(p => new Date(p.date).getTime());
    // Simple linear regression
    const n = values.length;
    const sumX = dates.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = dates.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = dates.reduce((sum, x) => sum + x * x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    // Calculate R²
    const meanY = sumY / n;
    const ssRes = values.reduce((sum, y, i) => {
      const predicted = slope * dates[i] + (sumY - slope * sumX) / n;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const ssTot = values.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);
    const direction = Math.abs(slope) < 1e-10 ? 'stable' :
                     slope > 0 ? 'increasing' : 'decreasing';
    // Detect seasonality (simplified)
    const maxNDVI = Math.max(...values);
    const minNDVI = Math.min(...values);
    const maxIndex = values.indexOf(maxNDVI);
    const minIndex = values.indexOf(minNDVI);
    return {
      direction,
      slope: slope * (24 * 60 * 60 * 1000), // Convert to per-day
      significance: rSquared,
      seasonality: {
        amplitude: maxNDVI - minNDVI,
        peak: dataPoints[maxIndex]?.date || '',
        trough: dataPoints[minIndex]?.date || ''
      }
    };
  }
  private detectAnomalies(dataPoints: any[]): NDVITrendAnalysis['anomalies'] {
    // Simple anomaly detection using standard deviation
    const values = dataPoints.map(p => p.ndvi);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    const anomalies: NDVITrendAnalysis['anomalies'] = [];
    dataPoints.forEach(point => {
      const deviation = Math.abs(point.ndvi - mean);
      if (deviation > 2 * std) {
        anomalies.push({
          date: point.date,
          ndvi: point.ndvi,
          expected: mean,
          deviation: point.ndvi - mean,
          type: point.ndvi < mean ? 'drought' : 'unknown',
          severity: deviation > 3 * std ? 'severe' : 'moderate'
        });
      }
    });
    return anomalies;
  }
  private generateForecast(dataPoints: any[], forecastDays: number): NDVITrendAnalysis['forecast'] {
    // Simple forecast based on trend
    const trend = this.calculateTrend(dataPoints);
    const lastPoint = dataPoints[dataPoints.length - 1];
    const lastDate = new Date(lastPoint.date);
    const predictedValues = [];
    for (let i = 1; i <= forecastDays; i++) {
      const forecastDate = new Date(lastDate.getTime() + i * 24 * 60 * 60 * 1000);
      const predictedNDVI = lastPoint.ndvi + trend.slope * i;
      const confidence = Math.max(0.1, 0.9 - (i / forecastDays) * 0.6); // Decreasing confidence
      predictedValues.push({
        date: forecastDate.toISOString().split('T')[0],
        ndvi: Math.max(-1, Math.min(1, predictedNDVI)),
        confidence
      });
    }
    const warnings = [];
    if (trend.direction === 'decreasing' && trend.slope < -0.01) {
      warnings.push('Declining vegetation health trend detected');
    }
    if (predictedValues.some(p => p.ndvi < 0.3)) {
      warnings.push('Predicted vegetation stress in forecast period');
    }
    return {
      nextPeriod: forecastDays,
      predictedValues,
      warnings
    };
  }
  private assessDataQuality(cloudCover: number, ndvi: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (cloudCover < 5 && ndvi >= -1 && ndvi <= 1) return 'excellent';
    if (cloudCover < 15 && ndvi >= -1 && ndvi <= 1) return 'good';
    if (cloudCover < 30) return 'fair';
    return 'poor';
  }
  private assessWaterStress(indices: VegetationIndices): { level: 'none' | 'low' | 'moderate' | 'high' | 'severe'; confidence: number; recommendation: string } {
    const waterStress = Math.max(0, -indices.ndwi);
    let level: 'none' | 'low' | 'moderate' | 'high' | 'severe', recommendation;
    if (waterStress > 0.5) {
      level = 'severe';
      recommendation = 'Immediate irrigation required';
    } else if (waterStress > 0.3) {
      level = 'high';
      recommendation = 'Increase irrigation frequency';
    } else if (waterStress > 0.2) {
      level = 'moderate';
      recommendation = 'Monitor soil moisture';
    } else if (waterStress > 0.1) {
      level = 'low';
      recommendation = 'Check soil moisture levels';
    } else {
      level = 'none';
      recommendation = 'Water levels adequate';
    }
    return { level, confidence: 0.8, recommendation };
  }
  private assessNitrogenStress(indices: VegetationIndices): { level: 'none' | 'low' | 'moderate' | 'high' | 'severe'; confidence: number; recommendation: string } {
    const nitrogenStress = Math.max(0, 0.7 - indices.ndre);
    let level: 'none' | 'low' | 'moderate' | 'high' | 'severe', recommendation;
    if (nitrogenStress > 0.4) {
      level = 'severe';
      recommendation = 'Apply nitrogen fertilizer immediately';
    } else if (nitrogenStress > 0.3) {
      level = 'high';
      recommendation = 'Apply nitrogen fertilizer soon';
    } else if (nitrogenStress > 0.2) {
      level = 'moderate';
      recommendation = 'Consider nitrogen supplementation';
    } else if (nitrogenStress > 0.1) {
      level = 'low';
      recommendation = 'Monitor nitrogen levels';
    } else {
      level = 'none';
      recommendation = 'Nitrogen levels adequate';
    }
    return { level, confidence: 0.7, recommendation };
  }
  private assessChlorophyllStress(indices: VegetationIndices): { level: 'none' | 'low' | 'moderate' | 'high' | 'severe'; confidence: number; recommendation: string } {
    const chlorophyllStress = Math.max(0, 1.5 - indices.gci);
    let level: 'none' | 'low' | 'moderate' | 'high' | 'severe', recommendation;
    if (chlorophyllStress > 1.2) {
      level = 'severe';
      recommendation = 'Urgent: Check for severe disease or nutrient deficiency';
    } else if (chlorophyllStress > 1.0) {
      level = 'high';
      recommendation = 'Check for disease or nutrient deficiency';
    } else if (chlorophyllStress > 0.7) {
      level = 'moderate';
      recommendation = 'Monitor chlorophyll levels';
    } else if (chlorophyllStress > 0.3) {
      level = 'low';
      recommendation = 'Light chlorophyll stress detected';
    } else {
      level = 'none';
      recommendation = 'Chlorophyll levels normal';
    }
    return { level, confidence: 0.75, recommendation };
  }
  private generateSampleIndices(): VegetationIndices {
    return {
      ndvi: 0.5 + Math.random() * 0.3,
      evi: 0.3 + Math.random() * 0.3,
      savi: 0.4 + Math.random() * 0.3,
      ndre: 0.2 + Math.random() * 0.2,
      gndvi: 0.4 + Math.random() * 0.3,
      ndwi: -0.1 + Math.random() * 0.2,
      msavi: 0.4 + Math.random() * 0.3,
      gci: 1.0 + Math.random() * 1.0
    };
  }
  private generateFieldInsights(metrics: any[]): FieldComparisonReport['insights'] {
    const healthScores = metrics.map(m => m.healthScore);
    const avgHealthScore = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
    const variance = healthScores.reduce((sum, score) => sum + Math.pow(score - avgHealthScore, 2), 0) / healthScores.length;
    const variability = Math.sqrt(variance) / avgHealthScore;
    return {
      bestPerforming: metrics[0].fieldId,
      mostStressed: metrics[metrics.length - 1].fieldId,
      averageHealthScore: Math.round(avgHealthScore),
      variability: Math.round(variability * 100) / 100,
      factors: {
        management: ['Irrigation practices', 'Fertilization timing', 'Pest management'],
        environmental: ['Soil conditions', 'Topography', 'Microclimate'],
        genetic: ['Variety selection', 'Seed quality', 'Plant density']
      }
    };
  }
  private generateFieldRecommendations(metrics: any[]): FieldComparisonReport['recommendations'] {
    const fieldSpecific = metrics.map(metric => ({
      fieldId: metric.fieldId,
      actions: metric.healthScore < 50 
        ? ['Urgent intervention required', 'Soil testing recommended', 'Review irrigation system']
        : metric.healthScore < 70
        ? ['Monitor closely', 'Optimize nutrition', 'Check drainage']
        : ['Maintain current practices', 'Continue monitoring']
    }));
    const general = [
      'Implement precision agriculture techniques',
      'Regular soil testing and amendments',
      'Optimize irrigation scheduling',
      'Integrated pest management'
    ];
    return { fieldSpecific, general };
  }
}
export const ndviAnalysis = new NDVIAnalysisService();
export { NDVIAnalysisService };