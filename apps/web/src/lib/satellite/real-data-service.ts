/**
 * Service to fetch and integrate real Google Earth Engine satellite data
 * with the existing Cropple.ai dashboard
 */

interface FieldData {
  id: string
  name: string
  boundaries: number[][][]
  cropType: string
  acres: number
}

interface SatelliteAnalysis {
  satelliteData: {
    ndvi: {
      mean: number
      date: string
    }
    satellite: string
    resolution: string
    cloudCover: string
  }
  healthAssessment: {
    score: number
    status: string
    stressLevel: string
    trend: string
  }
  yieldForecast: {
    predicted: number
    confidence: string
    unit: string
  }
  recommendations: string[]
}

export class RealSatelliteService {
  /**
   * Get real satellite data for farm dashboard
   */
  async getFarmDashboardData(farmId: string): Promise<{
    overallHealth: number
    healthTrend: number
    stressedAreas: number
    stressTrend: number
    yieldForecast: {
      current: number
      potential: number
      unit: string
      cropType: string
    }
    todayHighlights: string[]
    satelliteDataAvailable: boolean
  }> {
    try {
      // Get farm fields (mock data for now - replace with actual database query)
      const fields = await this.getFarmFields(farmId)
      
      // Get satellite analysis for each field
      const analyses = await Promise.all(
        fields.map(field => this.analyzeField(field))
      )

      // Calculate farm-wide metrics from real satellite data
      const overallHealth = this.calculateOverallHealth(analyses, fields)
      const stressedAreas = this.calculateStressedAreas(analyses, fields)
      const yieldForecast = this.calculateYieldForecast(analyses, fields)
      const highlights = this.generateHighlights(analyses, fields)

      return {
        overallHealth: Math.round(overallHealth),
        healthTrend: 2, // Mock trend - would calculate from historical data
        stressedAreas: Math.round(stressedAreas * 10) / 10,
        stressTrend: -1, // Mock trend
        yieldForecast,
        todayHighlights: highlights,
        satelliteDataAvailable: true
      }
    } catch (error) {
      console.error('Error fetching real satellite data:', error)
      
      // Fallback to mock data if satellite service fails
      return this.getFallbackData()
    }
  }

  private async analyzeField(field: FieldData): Promise<SatelliteAnalysis> {
    const response = await fetch('/api/satellite/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fieldId: field.id,
        geometry: {
          type: 'Polygon',
          coordinates: field.boundaries
        },
        startDate: this.getAnalysisStartDate(),
        endDate: new Date().toISOString().split('T')[0],
        cropType: field.cropType
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to analyze field ${field.id}: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || 'Analysis failed')
    }

    return result
  }

  private calculateOverallHealth(analyses: SatelliteAnalysis[], fields: FieldData[]): number {
    let totalWeightedHealth = 0
    let totalWeight = 0

    analyses.forEach((analysis, index) => {
      const fieldAcres = fields[index].acres
      const fieldHealth = analysis.healthAssessment.score
      
      totalWeightedHealth += fieldHealth * fieldAcres
      totalWeight += fieldAcres
    })

    return totalWeight > 0 ? totalWeightedHealth / totalWeight : 75
  }

  private calculateStressedAreas(analyses: SatelliteAnalysis[], fields: FieldData[]): number {
    let totalStressedAcres = 0
    let totalAcres = 0

    analyses.forEach((analysis, index) => {
      const fieldAcres = fields[index].acres
      const stressLevel = analysis.healthAssessment.stressLevel
      
      // Map stress levels to percentages
      const stressMultipliers = {
        'none': 0,
        'low': 0.2,
        'moderate': 0.6,
        'high': 0.9,
        'severe': 1.0
      }
      
      const stressMultiplier = stressMultipliers[stressLevel as keyof typeof stressMultipliers] || 0
      
      totalStressedAcres += fieldAcres * stressMultiplier
      totalAcres += fieldAcres
    })

    return totalAcres > 0 ? (totalStressedAcres / totalAcres) * 100 : 5
  }

  private calculateYieldForecast(analyses: SatelliteAnalysis[], fields: FieldData[]) {
    // Calculate area-weighted average yield
    let totalWeightedYield = 0
    let totalWeight = 0
    let dominantCrop = 'Corn'

    analyses.forEach((analysis, index) => {
      const fieldAcres = fields[index].acres
      const fieldYield = analysis.yieldForecast.predicted
      
      totalWeightedYield += fieldYield * fieldAcres
      totalWeight += fieldAcres
    })

    const avgYield = totalWeight > 0 ? totalWeightedYield / totalWeight : 185

    return {
      current: Math.round(avgYield),
      potential: Math.round(avgYield * 1.2), // 20% potential improvement
      unit: 'bu/acre',
      cropType: dominantCrop
    }
  }

  private generateHighlights(analyses: SatelliteAnalysis[], fields: FieldData[]): string[] {
    const highlights: string[] = []

    // Find best performing field
    let bestField = null
    let bestScore = 0
    analyses.forEach((analysis, index) => {
      if (analysis.healthAssessment.score > bestScore) {
        bestScore = analysis.healthAssessment.score
        bestField = fields[index].name
      }
    })

    if (bestField) {
      highlights.push(`${bestField} showing excellent satellite readings`)
    }

    // Count stressed fields
    const stressedCount = analyses.filter(a => 
      ['high', 'severe'].includes(a.healthAssessment.stressLevel)
    ).length

    if (stressedCount > 0) {
      highlights.push(`${stressedCount} field${stressedCount > 1 ? 's require' : ' requires'} attention`)
    }

    // Recent satellite data available
    const latestDate = analyses[0]?.satelliteData?.ndvi?.date
    if (latestDate) {
      highlights.push(`Latest satellite data from ${new Date(latestDate).toLocaleDateString()}`)
    }

    return highlights.slice(0, 3) // Limit to 3 highlights
  }

  private async getFarmFields(farmId: string): Promise<FieldData[]> {
    // Mock farm fields - replace with actual database query
    return [
      {
        id: 'field-1',
        name: 'North Field',
        boundaries: [[[-93.5, 42.0], [-93.4, 42.0], [-93.4, 42.1], [-93.5, 42.1], [-93.5, 42.0]]],
        cropType: 'Corn',
        acres: 45
      },
      {
        id: 'field-2', 
        name: 'South Field',
        boundaries: [[[-93.5, 41.9], [-93.4, 41.9], [-93.4, 42.0], [-93.5, 42.0], [-93.5, 41.9]]],
        cropType: 'Soybeans',
        acres: 33
      }
    ]
  }

  private getAnalysisStartDate(): string {
    const date = new Date()
    date.setDate(date.getDate() - 30) // 30 days ago
    return date.toISOString().split('T')[0]
  }

  private getFallbackData() {
    return {
      overallHealth: 82,
      healthTrend: 3,
      stressedAreas: 8.5,
      stressTrend: -2,
      yieldForecast: {
        current: 185,
        potential: 220,
        unit: 'bu/acre',
        cropType: 'Corn'
      },
      todayHighlights: [
        'Using simulated data - satellite service unavailable',
        'North field showing good growth patterns',
        'Weather conditions favorable for next 7 days'
      ],
      satelliteDataAvailable: false
    }
  }
}