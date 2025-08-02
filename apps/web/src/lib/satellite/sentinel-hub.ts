/**
 * Sentinel Hub API Integration
 * 
 * Provides access to Copernicus Sentinel satellite imagery for agricultural
 * monitoring, including NDVI calculation, vegetation health analysis, and
 * field monitoring capabilities.
 */

export interface SentinelHubConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface SatelliteImageRequest {
  bbox: BoundingBox;
  fromTime: string;
  toTime: string;
  width: number;
  height: number;
  format: 'image/jpeg' | 'image/png' | 'image/tiff';
  evalscript: string;
  dataFilter?: {
    maxCloudCoverage: number;
  };
}

export interface SatelliteImage {
  id: string;
  acquisitionDate: string;
  cloudCoverage: number;
  resolution: number; // meters per pixel
  bbox: BoundingBox;
  imageUrl: string;
  thumbnailUrl?: string;
  metadata: {
    satellite: string;
    orbit: string;
    tileId: string;
    productId: string;
  };
}

export interface NDVIAnalysis {
  fieldId: string;
  imageId: string;
  acquisitionDate: string;
  statistics: {
    mean: number;
    median: number;
    min: number;
    max: number;
    standardDeviation: number;
    histogram: { value: number; count: number }[];
  };
  zones: {
    healthy: { percentage: number; area: number }; // NDVI > 0.6
    moderate: { percentage: number; area: number }; // NDVI 0.3-0.6
    stressed: { percentage: number; area: number }; // NDVI < 0.3
  };
  recommendations: string[];
  comparisonToPrevious?: {
    change: number;
    trend: 'improving' | 'stable' | 'declining';
    significance: 'high' | 'moderate' | 'low';
  };
}

export interface VegetationHealthIndex {
  ndvi: number;
  ndre: number; // Normalized Difference Red Edge
  evi: number; // Enhanced Vegetation Index
  savi: number; // Soil Adjusted Vegetation Index
  healthScore: number; // 0-100
  stressIndicators: {
    drought: number; // 0-1
    disease: number; // 0-1
    nutrient: number; // 0-1
  };
}

class SentinelHubService {
  private config: SentinelHubConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  constructor() {
    this.config = {
      clientId: process.env.SENTINEL_HUB_CLIENT_ID || '',
      clientSecret: process.env.SENTINEL_HUB_CLIENT_SECRET || '',
      baseUrl: 'https://services.sentinel-hub.com'
    };
  }

  /**
   * Get authentication token for Sentinel Hub API
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('Sentinel Hub credentials not configured');
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer

      if (!this.accessToken) {
        throw new Error('Failed to obtain access token from Sentinel Hub');
      }

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Sentinel Hub access token:', error);
      throw error;
    }
  }

  /**
   * Search for available satellite images
   */
  async searchImages(
    bbox: BoundingBox,
    fromTime: string,
    toTime: string,
    maxCloudCoverage: number = 20
  ): Promise<SatelliteImage[]> {
    try {
      const token = await this.getAccessToken();

      const searchRequest = {
        clipping: {
          type: 'Polygon',
          coordinates: [[
            [bbox.west, bbox.south],
            [bbox.east, bbox.south],
            [bbox.east, bbox.north],
            [bbox.west, bbox.north],
            [bbox.west, bbox.south]
          ]]
        },
        data: [{
          dataFilter: {
            timeRange: {
              from: fromTime,
              to: toTime
            },
            maxCloudCoverage,
            mosaickingOrder: 'mostRecent'
          },
          type: 'S2L2A'
        }]
      };

      const response = await fetch(`${this.config.baseUrl}/api/v1/catalog/1.0.0/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchRequest),
      });

      if (!response.ok) {
        throw new Error(`Catalog search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.features?.map((feature: any) => ({
        id: feature.id,
        acquisitionDate: feature.properties.datetime,
        cloudCoverage: feature.properties['eo:cloud_cover'],
        resolution: 10, // Sentinel-2 L2A resolution
        bbox,
        imageUrl: '', // Will be generated when requesting specific image
        metadata: {
          satellite: 'Sentinel-2',
          orbit: feature.properties['sat:orbit_state'],
          tileId: feature.properties['s2:mgrs_tile'],
          productId: feature.properties['s2:product_id']
        }
      })) || [];

    } catch (error) {
      console.error('Error searching satellite images:', error);
      throw error;
    }
  }

  /**
   * Request satellite image with custom evalscript
   */
  async requestImage(imageRequest: SatelliteImageRequest): Promise<Blob> {
    try {
      const token = await this.getAccessToken();

      const processRequest = {
        input: {
          bounds: {
            bbox: [
              imageRequest.bbox.west,
              imageRequest.bbox.south,
              imageRequest.bbox.east,
              imageRequest.bbox.north
            ],
            properties: {
              crs: 'http://www.opengis.net/def/crs/EPSG/0/4326'
            }
          },
          data: [{
            dataFilter: {
              timeRange: {
                from: imageRequest.fromTime,
                to: imageRequest.toTime
              },
              ...(imageRequest.dataFilter && { maxCloudCoverage: imageRequest.dataFilter.maxCloudCoverage })
            },
            type: 'S2L2A'
          }]
        },
        output: {
          width: imageRequest.width,
          height: imageRequest.height,
          responses: [{
            identifier: 'default',
            format: {
              type: imageRequest.format
            }
          }]
        },
        evalscript: imageRequest.evalscript
      };

      const response = await fetch(`${this.config.baseUrl}/api/v1/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processRequest),
      });

      if (!response.ok) {
        throw new Error(`Image request failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error requesting satellite image:', error);
      throw error;
    }
  }

  /**
   * Get true color image for field visualization
   */
  async getTrueColorImage(
    bbox: BoundingBox,
    date: string,
    width: number = 512,
    height: number = 512
  ): Promise<Blob> {
    const evalscript = `
      //VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        return [sample.B04, sample.B03, sample.B02];
      }
    `;

    const imageRequest: SatelliteImageRequest = {
      bbox,
      fromTime: date,
      toTime: date,
      width,
      height,
      format: 'image/jpeg',
      evalscript,
      dataFilter: {
        maxCloudCoverage: 30
      }
    };

    return this.requestImage(imageRequest);
  }

  /**
   * Get NDVI image for vegetation analysis
   */
  async getNDVIImage(
    bbox: BoundingBox,
    date: string,
    width: number = 512,
    height: number = 512
  ): Promise<Blob> {
    const evalscript = `
      //VERSION=3
      function setup() {
        return {
          input: ["B04", "B08"],
          output: { bands: 3 }
        };
      }

      function evaluatePixel(sample) {
        let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
        
        // Color coding for NDVI visualization
        if (ndvi < 0.2) return [0.8, 0.8, 0.8]; // Gray for non-vegetation
        if (ndvi < 0.3) return [1.0, 0.0, 0.0]; // Red for stressed vegetation
        if (ndvi < 0.5) return [1.0, 1.0, 0.0]; // Yellow for moderate vegetation
        return [0.0, 1.0, 0.0]; // Green for healthy vegetation
      }
    `;

    const imageRequest: SatelliteImageRequest = {
      bbox,
      fromTime: date,
      toTime: date,
      width,
      height,
      format: 'image/jpeg',
      evalscript,
      dataFilter: {
        maxCloudCoverage: 20
      }
    };

    return this.requestImage(imageRequest);
  }

  /**
   * Calculate NDVI statistics for a field
   */
  async calculateNDVIAnalysis(
    fieldId: string,
    bbox: BoundingBox,
    date: string
  ): Promise<NDVIAnalysis> {
    try {
      // For demonstration, simulate NDVI analysis
      // In production, this would process actual satellite imagery
      const ndviValues = this.simulateNDVIData();
      
      const statistics = this.calculateNDVIStatistics(ndviValues);
      const zones = this.calculateVegetationZones(ndviValues);
      const recommendations = this.generateNDVIRecommendations(statistics, zones);

      return {
        fieldId,
        imageId: `satellite_${Date.now()}`,
        acquisitionDate: date,
        statistics,
        zones,
        recommendations
      };
    } catch (error) {
      console.error('Error calculating NDVI analysis:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive vegetation health index
   */
  async calculateVegetationHealth(
    bbox: BoundingBox,
    date: string
  ): Promise<VegetationHealthIndex> {
    try {
      // Simulate vegetation indices calculation
      // In production, this would use actual satellite data
      const ndvi = 0.6 + (Math.random() - 0.5) * 0.4; // 0.4 - 0.8
      const ndre = 0.3 + (Math.random() - 0.5) * 0.2; // 0.2 - 0.4
      const evi = ndvi * 0.8; // EVI is typically lower than NDVI
      const savi = ndvi * 0.9; // SAVI adjusts for soil background

      // Calculate overall health score
      const healthScore = Math.min(100, Math.max(0, 
        (ndvi * 40) + (ndre * 30) + (evi * 20) + (savi * 10)
      ));

      // Calculate stress indicators
      const stressIndicators = {
        drought: Math.max(0, 1 - ndvi * 1.5),
        disease: Math.max(0, 0.5 - ndre),
        nutrient: Math.max(0, 0.8 - evi)
      };

      return {
        ndvi,
        ndre,
        evi,
        savi,
        healthScore,
        stressIndicators
      };
    } catch (error) {
      console.error('Error calculating vegetation health:', error);
      throw error;
    }
  }

  /**
   * Get time series NDVI data for trend analysis
   */
  async getNDVITimeSeries(
    bbox: BoundingBox,
    startDate: string,
    endDate: string,
    interval: number = 16 // days
  ): Promise<{
    date: string;
    ndvi: number;
    cloudCoverage: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  }[]> {
    try {
      const timeSeries = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + interval)) {
        const dateStr = date.toISOString().split('T')[0];
        
        // Simulate NDVI values with seasonal variation
        const dayOfYear = this.getDayOfYear(date);
        const seasonalNDVI = 0.4 + 0.3 * Math.sin((dayOfYear - 100) * 2 * Math.PI / 365);
        const noise = (Math.random() - 0.5) * 0.2;
        const ndvi = Math.max(0, Math.min(1, seasonalNDVI + noise));
        
        const cloudCoverage = Math.random() * 30;
        const quality: 'excellent' | 'good' | 'fair' | 'poor' = cloudCoverage < 10 ? 'excellent' :
                       cloudCoverage < 20 ? 'good' :
                       cloudCoverage < 30 ? 'fair' : 'poor';

        timeSeries.push({
          date: dateStr,
          ndvi,
          cloudCoverage,
          quality
        });
      }

      return timeSeries;
    } catch (error) {
      console.error('Error getting NDVI time series:', error);
      throw error;
    }
  }

  /**
   * Compare NDVI between two dates
   */
  async compareNDVI(
    bbox: BoundingBox,
    date1: string,
    date2: string
  ): Promise<{
    date1Analysis: NDVIAnalysis;
    date2Analysis: NDVIAnalysis;
    comparison: {
      averageChange: number;
      changePercentage: number;
      trend: 'improvement' | 'decline' | 'stable';
      significantChange: boolean;
      changeMap: {
        improvement: { percentage: number; area: number };
        decline: { percentage: number; area: number };
        stable: { percentage: number; area: number };
      };
    };
  }> {
    try {
      const [analysis1, analysis2] = await Promise.all([
        this.calculateNDVIAnalysis('field', bbox, date1),
        this.calculateNDVIAnalysis('field', bbox, date2)
      ]);

      const averageChange = analysis2.statistics.mean - analysis1.statistics.mean;
      const changePercentage = (averageChange / analysis1.statistics.mean) * 100;
      
      const trend = Math.abs(changePercentage) < 5 ? 'stable' :
                   changePercentage > 0 ? 'improvement' : 'decline';
      
      const significantChange = Math.abs(changePercentage) > 10;

      // Simulate change map
      const changeMap = {
        improvement: { percentage: 40, area: 40 },
        decline: { percentage: 25, area: 25 },
        stable: { percentage: 35, area: 35 }
      };

      return {
        date1Analysis: analysis1,
        date2Analysis: analysis2,
        comparison: {
          averageChange,
          changePercentage,
          trend,
          significantChange,
          changeMap
        }
      };
    } catch (error) {
      console.error('Error comparing NDVI:', error);
      throw error;
    }
  }

  // Helper methods
  private simulateNDVIData(): number[] {
    const data = [];
    for (let i = 0; i < 10000; i++) {
      // Simulate realistic NDVI distribution
      const ndvi = Math.max(-1, Math.min(1, 
        0.5 + (Math.random() - 0.5) * 0.6 + 
        (Math.random() - 0.5) * 0.2
      ));
      data.push(ndvi);
    }
    return data;
  }

  private calculateNDVIStatistics(values: number[]): NDVIAnalysis['statistics'] {
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;

    // Create histogram
    const bins = 20;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;
    const histogram = Array.from({ length: bins }, (_, i) => ({
      value: min + (i + 0.5) * binSize,
      count: 0
    }));

    values.forEach(value => {
      const binIndex = Math.min(bins - 1, Math.floor((value - min) / binSize));
      histogram[binIndex].count++;
    });

    return {
      mean,
      median: sorted[Math.floor(n / 2)],
      min: Math.min(...values),
      max: Math.max(...values),
      standardDeviation: Math.sqrt(variance),
      histogram
    };
  }

  private calculateVegetationZones(values: number[]): NDVIAnalysis['zones'] {
    const total = values.length;
    const healthy = values.filter(v => v > 0.6).length;
    const moderate = values.filter(v => v >= 0.3 && v <= 0.6).length;
    const stressed = values.filter(v => v < 0.3).length;

    const pixelArea = 100; // 10m x 10m per pixel (Sentinel-2 resolution)

    return {
      healthy: { 
        percentage: (healthy / total) * 100,
        area: healthy * pixelArea
      },
      moderate: { 
        percentage: (moderate / total) * 100,
        area: moderate * pixelArea
      },
      stressed: { 
        percentage: (stressed / total) * 100,
        area: stressed * pixelArea
      }
    };
  }

  private generateNDVIRecommendations(statistics: NDVIAnalysis['statistics'], zones: NDVIAnalysis['zones']): string[] {
    const recommendations: string[] = [];

    if (statistics.mean < 0.4) {
      recommendations.push('Overall vegetation health is poor - consider soil testing and nutrient management');
    } else if (statistics.mean < 0.6) {
      recommendations.push('Vegetation health is moderate - monitor irrigation and nutrient levels');
    } else {
      recommendations.push('Vegetation health is good - maintain current management practices');
    }

    if (zones.stressed.percentage > 20) {
      recommendations.push('High percentage of stressed vegetation - investigate drought stress or disease');
    }

    if (zones.healthy.percentage < 50) {
      recommendations.push('Less than half the field shows healthy vegetation - review crop management strategy');
    }

    if (statistics.standardDeviation > 0.2) {
      recommendations.push('High variability in vegetation - consider precision agriculture techniques');
    }

    return recommendations;
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

export const sentinelHub = new SentinelHubService();