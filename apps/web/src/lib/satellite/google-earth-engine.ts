/**
 * Google Earth Engine Integration Service
 * 
 * Provides satellite imagery and NDVI analysis using Google Earth Engine API
 * Replaces Sentinel Hub with Google's comprehensive Earth observation data
 */

export interface BoundingBox {
  west: number;
  east: number;
  south: number;
  north: number;
}

export interface SatelliteImage {
  id: string;
  url: string;
  bounds: BoundingBox;
  date: string;
  cloudCover: number;
  source: 'landsat8' | 'landsat9' | 'sentinel2';
}

export interface NDVIAnalysisResult {
  fieldId: string;
  date: string;
  zones: {
    healthy: { percentage: number; area: number };
    stressed: { percentage: number; area: number };
    bare: { percentage: number; area: number };
  };
  averageNDVI: number;
  trends: {
    trend: 'improving' | 'declining' | 'stable';
    changeRate: number;
  };
}

class GoogleEarthEngineService {
  private readonly LANDSAT_COLLECTION = 'LANDSAT/LC08/C02/T1_L2';
  private readonly SENTINEL2_COLLECTION = 'COPERNICUS/S2_SR_HARMONIZED';
  
  /**
   * Search for satellite images in the specified area and date range
   */
  async searchImages(
    bbox: BoundingBox,
    startDate: string,
    endDate: string,
    maxCloudCover: number = 20
  ): Promise<SatelliteImage[]> {
    try {
      // For now, return mock data until GEE API is properly set up
      // In production, this would use the Earth Engine Python API or REST API
      const mockImages: SatelliteImage[] = [
        {
          id: `landsat8_${Date.now()}`,
          url: this.generateMockImageUrl(bbox, 'truecolor'),
          bounds: bbox,
          date: startDate,
          cloudCover: Math.random() * maxCloudCover,
          source: 'landsat8'
        },
        {
          id: `sentinel2_${Date.now()}`,
          url: this.generateMockImageUrl(bbox, 'truecolor'),
          bounds: bbox,
          date: startDate,
          cloudCover: Math.random() * maxCloudCover,
          source: 'sentinel2'
        }
      ];
      
      return mockImages.filter(img => img.cloudCover <= maxCloudCover);
    } catch (error) {
      console.error('Error searching satellite images:', error);
      throw error;
    }
  }

  /**
   * Get true color satellite image for the specified area
   */
  async getTrueColorImage(
    bbox: BoundingBox,
    date: string,
    width: number = 1024,
    height: number = 1024
  ): Promise<Blob> {
    try {
      // Generate a mock image blob for now
      // In production, this would call GEE API to get actual satellite imagery
      return this.generateMockImageBlob(width, height, 'truecolor');
    } catch (error) {
      console.error('Error getting true color image:', error);
      throw error;
    }
  }

  /**
   * Get NDVI image for the specified area
   */
  async getNDVIImage(
    bbox: BoundingBox,
    date: string,
    width: number = 1024,
    height: number = 1024
  ): Promise<Blob> {
    try {
      // Generate a mock NDVI image blob for now
      // In production, this would calculate NDVI from NIR and Red bands
      return this.generateMockImageBlob(width, height, 'ndvi');
    } catch (error) {
      console.error('Error getting NDVI image:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive NDVI analysis for a field
   */
  async calculateNDVIAnalysis(
    fieldId: string,
    bbox: BoundingBox,
    date: string
  ): Promise<NDVIAnalysisResult> {
    try {
      // In production, this would:
      // 1. Query Earth Engine for Landsat/Sentinel-2 data
      // 2. Calculate NDVI from NIR and Red bands
      // 3. Classify vegetation health zones
      // 4. Analyze temporal trends
      
      // Mock analysis results for now
      const healthyPercentage = 70 + Math.random() * 20;
      const stressedPercentage = Math.random() * 15;
      const barePercentage = 100 - healthyPercentage - stressedPercentage;
      
      return {
        fieldId,
        date,
        zones: {
          healthy: { 
            percentage: healthyPercentage, 
            area: healthyPercentage * 0.01 // Assuming 1 hectare field 
          },
          stressed: { 
            percentage: stressedPercentage, 
            area: stressedPercentage * 0.01 
          },
          bare: { 
            percentage: barePercentage, 
            area: barePercentage * 0.01 
          }
        },
        averageNDVI: 0.3 + Math.random() * 0.5, // NDVI range 0.3-0.8
        trends: {
          trend: Math.random() > 0.6 ? 'improving' : Math.random() > 0.3 ? 'stable' : 'declining',
          changeRate: (Math.random() - 0.5) * 0.1 // -5% to +5% change
        }
      };
    } catch (error) {
      console.error('Error calculating NDVI analysis:', error);
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
    interval: 'weekly' | 'monthly' = 'weekly'
  ): Promise<Array<{ date: string; ndvi: number; cloudCover: number }>> {
    try {
      // Mock time series data
      const series = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const intervalDays = interval === 'weekly' ? 7 : 30;
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + intervalDays)) {
        series.push({
          date: date.toISOString().split('T')[0],
          ndvi: 0.3 + Math.random() * 0.5,
          cloudCover: Math.random() * 30
        });
      }
      
      return series;
    } catch (error) {
      console.error('Error getting NDVI time series:', error);
      throw error;
    }
  }

  /**
   * Generate mock image URL for testing
   */
  private generateMockImageUrl(bbox: BoundingBox, type: 'truecolor' | 'ndvi'): string {
    const { west, east, south, north } = bbox;
    const center = {
      lat: (south + north) / 2,
      lon: (west + east) / 2
    };
    
    // Generate a placeholder image URL
    const baseUrl = 'https://picsum.photos';
    const width = 512;
    const height = 512;
    const seed = Math.floor(center.lat * 1000 + center.lon * 1000);
    
    return `${baseUrl}/${width}/${height}?random=${seed}&blur=${type === 'ndvi' ? 2 : 0}`;
  }

  /**
   * Generate mock image blob for testing
   */
  private async generateMockImageBlob(width: number, height: number, type: 'truecolor' | 'ndvi'): Promise<Blob> {
    // Create a simple canvas-based mock image
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      
      if (type === 'ndvi') {
        // Generate NDVI-like gradient (red to green)
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#ff0000'); // Red (low NDVI)
        gradient.addColorStop(0.5, '#ffff00'); // Yellow (medium NDVI)
        gradient.addColorStop(1, '#00ff00'); // Green (high NDVI)
        ctx.fillStyle = gradient;
      } else {
        // Generate earth-like colors for true color
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, '#8FBF7F'); // Light green
        gradient.addColorStop(0.7, '#7A8F78'); // Sage green
        gradient.addColorStop(1, '#5E6F5A'); // Dark sage
        ctx.fillStyle = gradient;
      }
      
      ctx.fillRect(0, 0, width, height);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.8);
      });
    }
    
    // Server-side fallback: create a minimal valid JPEG blob
    const mockImageData = new Uint8Array([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xC0, 0x00, 0x11,
      0x08, 0x00, 0x64, 0x00, 0x64, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01,
      0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF,
      0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F,
      0x00, 0xAA, 0xFF, 0xD9
    ]);
    
    return new Blob([mockImageData], { type: 'image/jpeg' });
  }
}

export const googleEarthEngine = new GoogleEarthEngineService();