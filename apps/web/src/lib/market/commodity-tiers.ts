/**
 * Commodity Tier Management
 * 
 * Prioritizes API calls based on commodity importance and user demand
 */

export interface CommodityTier {
  tier: 1 | 2 | 3
  updateFrequency: number // minutes
  cacheDuration: number // minutes
  description: string
}

export const COMMODITY_TIERS: Record<string, CommodityTier> = {
  // Tier 1: Core Commodities - Always Fresh
  'CORN': { tier: 1, updateFrequency: 30, cacheDuration: 30, description: 'Core grain' },
  'WHEAT': { tier: 1, updateFrequency: 30, cacheDuration: 30, description: 'Core grain' },
  'SOYBEANS': { tier: 1, updateFrequency: 30, cacheDuration: 30, description: 'Core grain' },
  
  // Tier 2: Secondary Commodities - Updated on Demand
  'RICE': { tier: 2, updateFrequency: 60, cacheDuration: 120, description: 'Secondary grain' },
  'COTTON': { tier: 2, updateFrequency: 60, cacheDuration: 120, description: 'Cash crop' },
  'SUGAR': { tier: 2, updateFrequency: 60, cacheDuration: 120, description: 'Cash crop' },
  'COFFEE': { tier: 2, updateFrequency: 60, cacheDuration: 120, description: 'Cash crop' },
  'CATTLE': { tier: 2, updateFrequency: 60, cacheDuration: 120, description: 'Livestock' },
  'HOGS': { tier: 2, updateFrequency: 60, cacheDuration: 120, description: 'Livestock' },
  'MILK': { tier: 2, updateFrequency: 60, cacheDuration: 120, description: 'Dairy' },
  
  // Tier 3: Specialty Commodities - Cached Aggressively
  'COCOA': { tier: 3, updateFrequency: 240, cacheDuration: 1440, description: 'Specialty' },
  'ORANGEJUICE': { tier: 3, updateFrequency: 240, cacheDuration: 1440, description: 'Specialty' },
  'OATS': { tier: 3, updateFrequency: 240, cacheDuration: 1440, description: 'Minor grain' },
  'BARLEY': { tier: 3, updateFrequency: 240, cacheDuration: 1440, description: 'Minor grain' },
  'CANOLA': { tier: 3, updateFrequency: 240, cacheDuration: 1440, description: 'Oilseed' },
}

// User preferences storage
export interface UserCommodityPreferences {
  userId: string
  primaryCommodities: string[] // Up to 5
  watchlist: string[] // Additional commodities
  lastUpdated: Date
}

// Smart commodity selection based on user's farm profile
export function getRecommendedCommodities(farmProfile: {
  primaryCrops: string[]
  region: string
  farmType: 'grain' | 'livestock' | 'mixed' | 'specialty'
}): string[] {
  const recommendations: string[] = []
  
  // Always include tier 1
  recommendations.push('CORN', 'WHEAT', 'SOYBEANS')
  
  // Add based on farm type
  switch (farmProfile.farmType) {
    case 'livestock':
      recommendations.push('CATTLE', 'HOGS', 'CORN') // Corn for feed
      break
    case 'specialty':
      if (farmProfile.region === 'South') {
        recommendations.push('COTTON', 'RICE')
      }
      break
  }
  
  // Regional additions
  const regionalCommodities: Record<string, string[]> = {
    'Midwest': ['CORN', 'SOYBEANS'],
    'Plains': ['WHEAT', 'CATTLE'],
    'South': ['COTTON', 'RICE', 'SUGAR'],
    'West': ['BARLEY', 'CANOLA'],
    'Southeast': ['COTTON', 'ORANGEJUICE']
  }
  
  const regional = regionalCommodities[farmProfile.region] || []
  recommendations.push(...regional)
  
  // Return unique list, max 6 commodities
  return [...new Set(recommendations)].slice(0, 6)
}