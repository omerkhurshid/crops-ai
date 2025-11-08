/**
 * Financial Impact Calculator for NBA Decision Engine
 * Calculates ROI, cost-benefit analysis, and financial risk assessment
 */
export interface FinancialImpact {
  totalCost: number
  estimatedRevenue: number
  netBenefit: number
  roi: number // Return on Investment percentage
  paybackPeriod: number // days
  riskScore: number // 0-100 (lower is better)
  confidenceLevel: number // 0-100
  breakdownCosts: CostBreakdown
  revenueBreakdown: RevenueBreakdown
}
export interface CostBreakdown {
  materials: number
  labor: number
  equipment: number
  fuel: number
  overhead: number
  opportunity: number // opportunity cost
}
export interface RevenueBreakdown {
  yieldIncrease: number
  qualityPremium: number
  lossAvoidance: number
  timeValue: number
}
export interface CropPricing {
  currentPrice: number // per ton
  historicalAverage: number
  priceVolatility: number // standard deviation
  seasonalTrend: 'RISING' | 'STABLE' | 'FALLING'
  marketOutlook: 'BULLISH' | 'NEUTRAL' | 'BEARISH'
}
export interface FieldEconomics {
  fieldArea: number // hectares
  cropType: string
  averageYield: number // tons/hectare
  productionCostPerHa: number
  insuranceValue: number
  landValue: number
}
export class FinancialCalculator {
  private cropPrices: Map<string, CropPricing> = new Map()
  private laborRates: Map<string, number> = new Map()
  private equipmentCosts: Map<string, number> = new Map()
  constructor() {
    this.initializeDefaultPrices()
    this.initializeLaborRates()
    this.initializeEquipmentCosts()
  }
  /**
   * Calculate financial impact of spray decision
   */
  calculateSprayImpact(
    field: FieldEconomics,
    sprayType: 'fungicide' | 'insecticide' | 'herbicide',
    applicationRate: number,
    expectedEfficacy: number // 0-100%
  ): FinancialImpact {
    const costs = this.calculateSprayCosts(field, sprayType, applicationRate)
    const benefits = this.calculateSprayBenefits(field, sprayType, expectedEfficacy)
    return this.buildFinancialImpact(costs, benefits, field, 'SPRAY')
  }
  /**
   * Calculate financial impact of harvest decision
   */
  calculateHarvestImpact(
    field: FieldEconomics,
    currentMoisture: number,
    marketTiming: 'IMMEDIATE' | 'STORAGE' | 'CONTRACT',
    weatherRisk: number // 0-100
  ): FinancialImpact {
    const costs = this.calculateHarvestCosts(field, currentMoisture, marketTiming)
    const benefits = this.calculateHarvestBenefits(field, marketTiming, weatherRisk)
    return this.buildFinancialImpact(costs, benefits, field, 'HARVEST')
  }
  /**
   * Calculate financial impact of irrigation decision
   */
  calculateIrrigationImpact(
    field: FieldEconomics,
    waterAmount: number, // mm
    waterCostPerMm: number,
    stressLevel: number, // 0-100
    yieldResponseCurve: number // yield increase per mm
  ): FinancialImpact {
    const costs = this.calculateIrrigationCosts(field, waterAmount, waterCostPerMm)
    const benefits = this.calculateIrrigationBenefits(field, waterAmount, yieldResponseCurve, stressLevel)
    return this.buildFinancialImpact(costs, benefits, field, 'IRRIGATION')
  }
  /**
   * Calculate financial impact of livestock management decision
   */
  calculateLivestockImpact(
    animalCount: number,
    treatmentType: 'vaccination' | 'treatment' | 'breeding',
    costPerAnimal: number,
    effectivenessRate: number, // 0-100%
    preventedLossValue: number // value of prevented losses per animal
  ): FinancialImpact {
    const totalCost = animalCount * costPerAnimal
    const totalBenefit = animalCount * preventedLossValue * (effectivenessRate / 100)
    const costs: CostBreakdown = {
      materials: totalCost * 0.7, // vaccines/medicines
      labor: totalCost * 0.2,
      equipment: totalCost * 0.05,
      fuel: totalCost * 0.03,
      overhead: totalCost * 0.02,
      opportunity: 0
    }
    const benefits: RevenueBreakdown = {
      yieldIncrease: 0,
      qualityPremium: 0,
      lossAvoidance: totalBenefit,
      timeValue: 0
    }
    return {
      totalCost,
      estimatedRevenue: totalBenefit,
      netBenefit: totalBenefit - totalCost,
      roi: totalCost > 0 ? ((totalBenefit - totalCost) / totalCost) * 100 : 0,
      paybackPeriod: totalBenefit > 0 ? (totalCost / totalBenefit) * 365 : 999,
      riskScore: this.calculateRiskScore(totalCost, totalBenefit, effectivenessRate),
      confidenceLevel: effectivenessRate,
      breakdownCosts: costs,
      revenueBreakdown: benefits
    }
  }
  /**
   * Calculate spray application costs
   */
  private calculateSprayCosts(
    field: FieldEconomics,
    sprayType: 'fungicide' | 'insecticide' | 'herbicide',
    applicationRate: number
  ): CostBreakdown {
    const productCosts = {
      fungicide: 35, // per hectare
      insecticide: 25,
      herbicide: 20
    }
    const materialCost = field.fieldArea * productCosts[sprayType] * (applicationRate / 100)
    const laborCost = field.fieldArea * (this.laborRates.get('spraying') || 15)
    const equipmentCost = field.fieldArea * (this.equipmentCosts.get('sprayer') || 8)
    const fuelCost = field.fieldArea * 3 // fuel per hectare
    const overheadCost = (materialCost + laborCost + equipmentCost) * 0.1
    return {
      materials: materialCost,
      labor: laborCost,
      equipment: equipmentCost,
      fuel: fuelCost,
      overhead: overheadCost,
      opportunity: 0
    }
  }
  /**
   * Calculate spray application benefits
   */
  private calculateSprayBenefits(
    field: FieldEconomics,
    sprayType: 'fungicide' | 'insecticide' | 'herbicide',
    expectedEfficacy: number
  ): RevenueBreakdown {
    const yieldProtection = {
      fungicide: 0.15, // 15% yield protection
      insecticide: 0.10, // 10% yield protection
      herbicide: 0.08   // 8% yield protection
    }
    const cropPrice = this.cropPrices.get(field.cropType.toLowerCase())?.currentPrice || 250
    const protectedYield = field.fieldArea * field.averageYield * yieldProtection[sprayType] * (expectedEfficacy / 100)
    const lossAvoidance = protectedYield * cropPrice
    return {
      yieldIncrease: 0,
      qualityPremium: lossAvoidance * 0.1, // 10% quality bonus
      lossAvoidance: lossAvoidance,
      timeValue: 0
    }
  }
  /**
   * Calculate harvest costs
   */
  private calculateHarvestCosts(
    field: FieldEconomics,
    currentMoisture: number,
    marketTiming: 'IMMEDIATE' | 'STORAGE' | 'CONTRACT'
  ): CostBreakdown {
    const baseLaborCost = field.fieldArea * (this.laborRates.get('harvest') || 25)
    const baseEquipmentCost = field.fieldArea * (this.equipmentCosts.get('combine') || 40)
    const fuelCost = field.fieldArea * 8
    // Drying costs if moisture is high
    const dryingCost = currentMoisture > 16 ? field.fieldArea * field.averageYield * 2 : 0
    // Storage costs for delayed marketing
    const storageCost = marketTiming === 'STORAGE' ? field.fieldArea * field.averageYield * 5 : 0
    return {
      materials: dryingCost,
      labor: baseLaborCost,
      equipment: baseEquipmentCost,
      fuel: fuelCost,
      overhead: storageCost,
      opportunity: marketTiming === 'STORAGE' ? field.fieldArea * field.averageYield * 10 : 0 // opportunity cost of storage
    }
  }
  /**
   * Calculate harvest benefits
   */
  private calculateHarvestBenefits(
    field: FieldEconomics,
    marketTiming: 'IMMEDIATE' | 'STORAGE' | 'CONTRACT',
    weatherRisk: number
  ): RevenueBreakdown {
    const cropPrice = this.cropPrices.get(field.cropType.toLowerCase())?.currentPrice || 250
    const totalYield = field.fieldArea * field.averageYield
    const baseRevenue = totalYield * cropPrice
    // Quality premium for optimal timing
    const qualityPremium = marketTiming === 'IMMEDIATE' ? baseRevenue * 0.02 : 0
    // Price benefit from storage (if markets are rising)
    const pricingData = this.cropPrices.get(field.cropType.toLowerCase())
    const storagePremium = marketTiming === 'STORAGE' && pricingData?.seasonalTrend === 'RISING' 
      ? baseRevenue * 0.05 : 0
    // Weather risk avoidance
    const weatherProtection = baseRevenue * (weatherRisk / 100) * 0.1 // 10% of weather risk value
    return {
      yieldIncrease: baseRevenue,
      qualityPremium: qualityPremium,
      lossAvoidance: weatherProtection,
      timeValue: storagePremium
    }
  }
  /**
   * Calculate irrigation costs
   */
  private calculateIrrigationCosts(
    field: FieldEconomics,
    waterAmount: number,
    waterCostPerMm: number
  ): CostBreakdown {
    const waterCost = field.fieldArea * waterAmount * waterCostPerMm
    const laborCost = field.fieldArea * (this.laborRates.get('irrigation') || 12)
    const equipmentCost = field.fieldArea * (this.equipmentCosts.get('irrigation') || 5)
    const energyCost = waterCost * 0.3 // pumping energy
    return {
      materials: waterCost,
      labor: laborCost,
      equipment: equipmentCost,
      fuel: energyCost,
      overhead: (waterCost + laborCost) * 0.05,
      opportunity: 0
    }
  }
  /**
   * Calculate irrigation benefits
   */
  private calculateIrrigationBenefits(
    field: FieldEconomics,
    waterAmount: number,
    yieldResponseCurve: number,
    stressLevel: number
  ): RevenueBreakdown {
    const yieldIncrease = field.fieldArea * waterAmount * yieldResponseCurve * (stressLevel / 100)
    const cropPrice = this.cropPrices.get(field.cropType.toLowerCase())?.currentPrice || 250
    const yieldValue = yieldIncrease * cropPrice
    // Quality benefit from stress relief
    const qualityImprovement = yieldValue * 0.15 // 15% quality improvement
    return {
      yieldIncrease: yieldValue,
      qualityPremium: qualityImprovement,
      lossAvoidance: yieldValue * 0.1, // stress damage avoidance
      timeValue: 0
    }
  }
  /**
   * Build complete financial impact analysis
   */
  private buildFinancialImpact(
    costs: CostBreakdown,
    benefits: RevenueBreakdown,
    field: FieldEconomics,
    decisionType: string
  ): FinancialImpact {
    const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0)
    const totalRevenue = Object.values(benefits).reduce((sum, benefit) => sum + benefit, 0)
    const netBenefit = totalRevenue - totalCost
    return {
      totalCost,
      estimatedRevenue: totalRevenue,
      netBenefit,
      roi: totalCost > 0 ? (netBenefit / totalCost) * 100 : 0,
      paybackPeriod: totalRevenue > 0 ? (totalCost / (totalRevenue * 0.1)) : 999, // assuming 10% monthly return
      riskScore: this.calculateRiskScore(totalCost, totalRevenue, 80),
      confidenceLevel: this.calculateConfidenceLevel(field, decisionType),
      breakdownCosts: costs,
      revenueBreakdown: benefits
    }
  }
  /**
   * Calculate risk score based on cost/benefit ratio
   */
  private calculateRiskScore(totalCost: number, totalBenefit: number, successRate: number): number {
    const costRiskWeight = totalCost / 10000 // Higher costs = higher risk
    const benefitCertainty = (successRate / 100) * (totalBenefit / totalCost || 0)
    const volatilityRisk = 20 // base volatility
    return Math.min(100, costRiskWeight + volatilityRisk - benefitCertainty * 10)
  }
  /**
   * Calculate confidence level based on field data and decision type
   */
  private calculateConfidenceLevel(field: FieldEconomics, decisionType: string): number {
    let baseConfidence = 70
    // Adjust based on field size (larger fields = more predictable)
    if (field.fieldArea > 50) baseConfidence += 10
    else if (field.fieldArea < 10) baseConfidence -= 10
    // Adjust based on decision type complexity
    const complexityAdjustment: Record<string, number> = {
      'SPRAY': 5,
      'HARVEST': 10,
      'IRRIGATION': 0,
      'LIVESTOCK': -5
    }
    baseConfidence += complexityAdjustment[decisionType] || 0
    return Math.min(95, Math.max(50, baseConfidence))
  }
  /**
   * Initialize default crop prices
   */
  private initializeDefaultPrices(): void {
    this.cropPrices.set('wheat', {
      currentPrice: 280,
      historicalAverage: 260,
      priceVolatility: 25,
      seasonalTrend: 'RISING',
      marketOutlook: 'NEUTRAL'
    })
    this.cropPrices.set('corn', {
      currentPrice: 220,
      historicalAverage: 210,
      priceVolatility: 30,
      seasonalTrend: 'STABLE',
      marketOutlook: 'BULLISH'
    })
    this.cropPrices.set('soybeans', {
      currentPrice: 450,
      historicalAverage: 420,
      priceVolatility: 40,
      seasonalTrend: 'RISING',
      marketOutlook: 'BULLISH'
    })
    this.cropPrices.set('barley', {
      currentPrice: 250,
      historicalAverage: 240,
      priceVolatility: 20,
      seasonalTrend: 'STABLE',
      marketOutlook: 'NEUTRAL'
    })
  }
  /**
   * Initialize labor rates per hectare
   */
  private initializeLaborRates(): void {
    this.laborRates.set('spraying', 15)
    this.laborRates.set('harvest', 25)
    this.laborRates.set('irrigation', 12)
    this.laborRates.set('planting', 20)
  }
  /**
   * Initialize equipment costs per hectare
   */
  private initializeEquipmentCosts(): void {
    this.equipmentCosts.set('sprayer', 8)
    this.equipmentCosts.set('combine', 40)
    this.equipmentCosts.set('irrigation', 5)
    this.equipmentCosts.set('planter', 15)
  }
  /**
   * Update crop pricing data
   */
  updateCropPrice(cropType: string, pricing: CropPricing): void {
    this.cropPrices.set(cropType.toLowerCase(), pricing)
  }
  /**
   * Get current crop pricing
   */
  getCropPrice(cropType: string): CropPricing | undefined {
    return this.cropPrices.get(cropType.toLowerCase())
  }
}