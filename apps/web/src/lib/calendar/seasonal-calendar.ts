/**
 * Seasonal Calendar Service
 * 
 * Provides region-specific seasonal farming calendars with:
 * - Monthly task recommendations
 * - Regional best practices timing
 * - Weather-optimized scheduling
 * - Crop-specific activity calendars
 * - Equipment and resource planning
 */
// Logger replaced with console for local development;
import { redis } from '../redis';
import { usdaService } from '../external/usda-service';
import { weatherPatternAnalysis } from '../weather/pattern-analysis';
export interface SeasonalActivity {
  id: string;
  category: 'planting' | 'cultivation' | 'fertilization' | 'pest_control' | 'irrigation' | 'harvest' | 'soil_management' | 'equipment' | 'planning';
  title: string;
  description: string;
  priority: 'critical' | 'important' | 'recommended' | 'optional';
  timing: {
    month: number; // 1-12
    weekOfMonth?: number; // 1-4
    dayRange?: {
      start: number;
      end: number;
    };
  };
  duration: {
    days: number;
    flexible: boolean;
  };
  conditions: {
    weather: string[];
    soil: string[];
    crop_stage?: string[];
  };
  crops: string[]; // applicable crop types
  region: string[];
  equipment: string[];
  materials: string[];
  labor: {
    hours_per_acre: number;
    skill_level: 'basic' | 'intermediate' | 'advanced';
    crew_size: number;
  };
  cost_per_acre: number;
  alternatives: string[];
  notes: string;
}
export interface MonthlyPlan {
  month: number;
  monthName: string;
  region: string;
  totalActivities: number;
  criticalActivities: SeasonalActivity[];
  importantActivities: SeasonalActivity[];
  recommendedActivities: SeasonalActivity[];
  weatherConsiderations: string[];
  resourceRequirements: {
    totalLaborHours: number;
    peakWorkdays: number;
    equipmentNeeds: string[];
    materialNeeds: string[];
    estimatedCost: number;
  };
  riskFactors: string[];
  opportunities: string[];
}
export interface SeasonalCalendar {
  year: number;
  region: string;
  crop: string;
  farmSize: number;
  calendar: MonthlyPlan[];
  yearlyOverview: {
    keyMilestones: {
      date: Date;
      activity: string;
      importance: string;
    }[];
    totalBudget: number;
    laborRequirements: {
      totalHours: number;
      peakMonth: string;
      seasonalDistribution: number[];
    };
    equipmentSchedule: {
      month: number;
      equipment: string;
      usage_hours: number;
    }[];
    riskCalendar: {
      month: number;
      risks: string[];
      mitigation: string[];
    }[];
  };
  adaptations: {
    climate: string[];
    weather_patterns: string[];
    market_conditions: string[];
  };
}
class SeasonalCalendarService {
  private readonly CACHE_TTL = 24 * 60 * 60; // 24 hours
  // Comprehensive activity database
  private activities: SeasonalActivity[] = [
    // Spring Activities (March-May)
    {
      id: 'spring_soil_prep',
      category: 'soil_management',
      title: 'Spring Soil Preparation',
      description: 'Prepare fields for planting season with tillage and soil amendments',
      priority: 'critical',
      timing: { month: 3, weekOfMonth: 2, dayRange: { start: 8, end: 22 } },
      duration: { days: 5, flexible: true },
      conditions: {
        weather: ['No frost expected', 'Soil workable', 'Field access dry'],
        soil: ['Moisture 18-22%', 'Temperature >45°F', 'Not muddy']
      },
      crops: ['corn', 'soybeans', 'wheat', 'cotton'],
      region: ['midwest', 'southeast', 'great_plains'],
      equipment: ['Field cultivator', 'Disc harrow', 'Planter'],
      materials: ['Lime', 'Fertilizer', 'Organic matter'],
      labor: { hours_per_acre: 0.5, skill_level: 'intermediate', crew_size: 1 },
      cost_per_acre: 35,
      alternatives: ['No-till planting', 'Strip tillage', 'Cover crop termination'],
      notes: 'Critical timing window - monitor soil conditions daily'
    },
    {
      id: 'corn_planting',
      category: 'planting',
      title: 'Corn Planting',
      description: 'Plant corn when soil temperature and conditions are optimal',
      priority: 'critical',
      timing: { month: 4, weekOfMonth: 3, dayRange: { start: 15, end: 30 } },
      duration: { days: 7, flexible: false },
      conditions: {
        weather: ['Soil temp >50°F', 'No rain forecast 3 days', 'Winds <15 mph'],
        soil: ['Good tilth', 'Adequate moisture', 'Well-drained'],
        crop_stage: ['Soil preparation complete']
      },
      crops: ['corn'],
      region: ['midwest', 'southeast', 'great_plains'],
      equipment: ['Planter', 'Tractor', 'GPS guidance'],
      materials: ['Corn seed', 'Starter fertilizer', 'Herbicide'],
      labor: { hours_per_acre: 0.3, skill_level: 'intermediate', crew_size: 1 },
      cost_per_acre: 180,
      alternatives: ['Early planting with protection', 'Delayed planting different variety'],
      notes: 'Monitor 7-day weather forecast - critical timing for emergence'
    },
    {
      id: 'spring_fertilizer',
      category: 'fertilization',
      title: 'Spring Fertilizer Application',
      description: 'Apply pre-plant and starter fertilizers based on soil test results',
      priority: 'important',
      timing: { month: 4, weekOfMonth: 1, dayRange: { start: 1, end: 15 } },
      duration: { days: 3, flexible: true },
      conditions: {
        weather: ['Light winds', 'No rain 24 hours', 'Temperatures >40°F'],
        soil: ['Recent soil test available', 'Good field access']
      },
      crops: ['corn', 'soybeans', 'cotton', 'wheat'],
      region: ['midwest', 'southeast', 'great_plains', 'california_central'],
      equipment: ['Spreader', 'Sprayer', 'Variable rate controller'],
      materials: ['N-P-K fertilizer', 'Micronutrients', 'Soil amendments'],
      labor: { hours_per_acre: 0.2, skill_level: 'basic', crew_size: 1 },
      cost_per_acre: 120,
      alternatives: ['Split application', 'Liquid vs dry', 'Organic sources'],
      notes: 'Adjust rates based on yield goal and soil test recommendations'
    },
    // Summer Activities (June-August)
    {
      id: 'summer_cultivation',
      category: 'cultivation',
      title: 'Crop Cultivation',
      description: 'Cultivate growing crops for weed control and soil management',
      priority: 'important',
      timing: { month: 6, weekOfMonth: 2, dayRange: { start: 8, end: 22 } },
      duration: { days: 4, flexible: true },
      conditions: {
        weather: ['Sunny conditions', 'Light winds', 'No rain forecast'],
        soil: ['Surface dry', 'Good field access'],
        crop_stage: ['V4-V6 growth stage', 'Before canopy closure']
      },
      crops: ['corn', 'soybeans', 'cotton'],
      region: ['midwest', 'southeast', 'great_plains'],
      equipment: ['Cultivator', 'Row crop tractor'],
      materials: ['Fuel', 'Equipment maintenance'],
      labor: { hours_per_acre: 0.4, skill_level: 'basic', crew_size: 1 },
      cost_per_acre: 25,
      alternatives: ['Herbicide application', 'High-residue cultivation', 'Hand hoeing'],
      notes: 'Avoid cultivation when plants are stressed or wet'
    },
    {
      id: 'pest_scouting',
      category: 'pest_control',
      title: 'Intensive Pest Scouting',
      description: 'Weekly scouting for insects, diseases, and weeds during critical growth',
      priority: 'critical',
      timing: { month: 7, weekOfMonth: 0, dayRange: { start: 1, end: 31 } },
      duration: { days: 30, flexible: false },
      conditions: {
        weather: ['All weather conditions'],
        soil: ['Any soil conditions'],
        crop_stage: ['Vegetative to reproductive stages']
      },
      crops: ['corn', 'soybeans', 'cotton', 'wheat'],
      region: ['midwest', 'southeast', 'great_plains', 'california_central'],
      equipment: ['ATV', 'Scouting kit', 'Mobile app'],
      materials: ['IPM guides', 'Sampling bags', 'Camera'],
      labor: { hours_per_acre: 0.1, skill_level: 'advanced', crew_size: 1 },
      cost_per_acre: 8,
      alternatives: ['Drone scouting', 'Satellite monitoring', 'Trap monitoring'],
      notes: 'Document findings with GPS coordinates and photos'
    },
    {
      id: 'irrigation_management',
      category: 'irrigation',
      title: 'Irrigation Scheduling',
      description: 'Monitor soil moisture and schedule irrigation during peak water demand',
      priority: 'critical',
      timing: { month: 7, weekOfMonth: 0, dayRange: { start: 1, end: 31 } },
      duration: { days: 30, flexible: false },
      conditions: {
        weather: ['Monitor daily ET rates', 'Track rainfall'],
        soil: ['Soil moisture monitoring active'],
        crop_stage: ['Pollination and grain fill stages']
      },
      crops: ['corn', 'soybeans', 'cotton'],
      region: ['great_plains', 'california_central', 'southeast'],
      equipment: ['Irrigation system', 'Soil moisture sensors', 'Weather station'],
      materials: ['Water', 'Electricity', 'System maintenance'],
      labor: { hours_per_acre: 0.3, skill_level: 'intermediate', crew_size: 1 },
      cost_per_acre: 45,
      alternatives: ['Deficit irrigation', 'Variable rate irrigation', 'Dryland farming'],
      notes: 'Critical during pollination - monitor stress indicators daily'
    },
    // Fall Activities (September-November)
    {
      id: 'harvest_preparation',
      category: 'equipment',
      title: 'Harvest Equipment Preparation',
      description: 'Service and prepare harvest equipment for efficient field operations',
      priority: 'critical',
      timing: { month: 8, weekOfMonth: 3, dayRange: { start: 15, end: 31 } },
      duration: { days: 7, flexible: true },
      conditions: {
        weather: ['Any conditions for shop work'],
        soil: ['Shop work - soil independent']
      },
      crops: ['corn', 'soybeans', 'wheat', 'cotton'],
      region: ['midwest', 'southeast', 'great_plains', 'california_central'],
      equipment: ['Combine harvester', 'Grain cart', 'Trucks'],
      materials: ['Replacement parts', 'Fluids', 'Belts and chains'],
      labor: { hours_per_acre: 0.2, skill_level: 'advanced', crew_size: 2 },
      cost_per_acre: 15,
      alternatives: ['Custom harvesting', 'Equipment rental', 'Service dealer'],
      notes: 'Schedule maintenance early to avoid harvest delays'
    },
    {
      id: 'corn_harvest',
      category: 'harvest',
      title: 'Corn Harvest',
      description: 'Harvest corn at optimal moisture and quality conditions',
      priority: 'critical',
      timing: { month: 9, weekOfMonth: 3, dayRange: { start: 15, end: 30 } },
      duration: { days: 10, flexible: true },
      conditions: {
        weather: ['Dry conditions', 'Good field access', 'Stable weather'],
        crop_stage: ['20-25% moisture', 'Black layer formation'],
        soil: ['Firm ground conditions']
      },
      crops: ['corn'],
      region: ['midwest', 'southeast', 'great_plains'],
      equipment: ['Combine harvester', 'Grain cart', 'Semi trucks'],
      materials: ['Fuel', 'Grain storage', 'Drying cost'],
      labor: { hours_per_acre: 0.6, skill_level: 'intermediate', crew_size: 3 },
      cost_per_acre: 65,
      alternatives: ['Custom harvest', 'High moisture harvest', 'Field drying'],
      notes: 'Monitor grain moisture hourly - optimal harvest window is narrow'
    },
    {
      id: 'fall_tillage',
      category: 'soil_management',
      title: 'Fall Field Preparation',
      description: 'Fall tillage and residue management for next year preparation',
      priority: 'recommended',
      timing: { month: 10, weekOfMonth: 2, dayRange: { start: 8, end: 31 } },
      duration: { days: 5, flexible: true },
      conditions: {
        weather: ['Good field conditions', 'Before ground freeze'],
        soil: ['Adequate moisture', 'Not too wet'],
        crop_stage: ['Harvest complete']
      },
      crops: ['corn', 'soybeans', 'cotton'],
      region: ['midwest', 'southeast', 'great_plains'],
      equipment: ['Disc harrow', 'Field cultivator', 'Chisel plow'],
      materials: ['Fuel', 'Equipment maintenance'],
      labor: { hours_per_acre: 0.4, skill_level: 'basic', crew_size: 1 },
      cost_per_acre: 28,
      alternatives: ['No-till system', 'Strip tillage', 'Spring preparation only'],
      notes: 'Consider soil compaction and future erosion risk'
    },
    // Winter Activities (December-February)
    {
      id: 'equipment_maintenance',
      category: 'equipment',
      title: 'Winter Equipment Maintenance',
      description: 'Complete annual equipment maintenance and repairs',
      priority: 'important',
      timing: { month: 12, weekOfMonth: 0, dayRange: { start: 1, end: 31 } },
      duration: { days: 15, flexible: true },
      conditions: {
        weather: ['Shop work - weather independent'],
        soil: ['Shop work - soil independent']
      },
      crops: ['all'],
      region: ['midwest', 'southeast', 'great_plains', 'california_central'],
      equipment: ['All farm equipment'],
      materials: ['Parts', 'Fluids', 'Shop supplies'],
      labor: { hours_per_acre: 0.3, skill_level: 'advanced', crew_size: 1 },
      cost_per_acre: 22,
      alternatives: ['Dealer service', 'Equipment replacement', 'Partial maintenance'],
      notes: 'Plan major repairs during off-season to avoid spring delays'
    },
    {
      id: 'crop_planning',
      category: 'planning',
      title: 'Next Year Crop Planning',
      description: 'Plan crop rotations, varieties, and input requirements for next season',
      priority: 'important',
      timing: { month: 1, weekOfMonth: 2, dayRange: { start: 8, end: 31 } },
      duration: { days: 10, flexible: true },
      conditions: {
        weather: ['Office work - weather independent'],
        soil: ['Office work - soil independent'],
        crop_stage: ['Planning phase']
      },
      crops: ['all'],
      region: ['midwest', 'southeast', 'great_plains', 'california_central'],
      equipment: ['Computer', 'Planning software'],
      materials: ['Market data', 'Seed catalogs', 'Planning guides'],
      labor: { hours_per_acre: 0.1, skill_level: 'advanced', crew_size: 1 },
      cost_per_acre: 5,
      alternatives: ['Consultant planning', 'Software tools', 'Extension services'],
      notes: 'Consider market outlook, rotation benefits, and risk management'
    },
    {
      id: 'financial_planning',
      category: 'planning',
      title: 'Financial Planning and Analysis',
      description: 'Analyze previous year results and plan next year budget and financing',
      priority: 'critical',
      timing: { month: 2, weekOfMonth: 1, dayRange: { start: 1, end: 15 } },
      duration: { days: 5, flexible: true },
      conditions: {
        weather: ['Office work - weather independent'],
        soil: ['Office work - soil independent']
      },
      crops: ['all'],
      region: ['midwest', 'southeast', 'great_plains', 'california_central'],
      equipment: ['Computer', 'Financial software'],
      materials: ['Tax records', 'Bank statements', 'Market reports'],
      labor: { hours_per_acre: 0.05, skill_level: 'advanced', crew_size: 1 },
      cost_per_acre: 3,
      alternatives: ['Accountant services', 'Financial advisor', 'Farm management service'],
      notes: 'Essential for tax preparation and operating loan applications'
    }
  ];
  /**
   * Generate a complete seasonal calendar for a farm
   */
  async generateSeasonalCalendar(
    latitude: number,
    longitude: number,
    crop: string,
    farmSize: number,
    year?: number
  ): Promise<SeasonalCalendar> {
    const targetYear = year || new Date().getFullYear();
    const cacheKey = `seasonal_calendar_${latitude}_${longitude}_${crop}_${farmSize}_${targetYear}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;
    try {
      // Get regional information
      const usdaData = await usdaService.getRegionalRecommendations(latitude, longitude);
      const region = usdaData.region.code.toLowerCase();
      // Get weather patterns for adaptation
      const weatherPatterns = await weatherPatternAnalysis.getClimateAdaptation(latitude, longitude);
      // Filter activities by region and crop
      const relevantActivities = this.activities.filter(activity => 
        (activity.region.includes(region) || activity.region.includes('all')) &&
        (activity.crops.includes(crop) || activity.crops.includes('all'))
      );
      // Generate monthly plans
      const monthlyPlans: MonthlyPlan[] = [];
      for (let month = 1; month <= 12; month++) {
        const monthActivities = relevantActivities.filter(activity => activity.timing.month === month);
        const monthlyPlan = this.createMonthlyPlan(month, region, monthActivities, farmSize);
        monthlyPlans.push(monthlyPlan);
      }
      // Create yearly overview
      const yearlyOverview = this.createYearlyOverview(relevantActivities, farmSize, targetYear);
      // Create adaptation recommendations
      const adaptations = this.createAdaptations(weatherPatterns, usdaData);
      const calendar: SeasonalCalendar = {
        year: targetYear,
        region,
        crop,
        farmSize,
        calendar: monthlyPlans,
        yearlyOverview,
        adaptations
      };
      await this.setCached(cacheKey, calendar);
      return calendar;
    } catch (error) {
      console.error('Failed to generate seasonal calendar', error);
      throw error;
    }
  }
  /**
   * Get monthly activity recommendations
   */
  async getMonthlyActivities(
    month: number,
    latitude: number,
    longitude: number,
    crop: string
  ): Promise<MonthlyPlan> {
    const cacheKey = `monthly_activities_${month}_${latitude}_${longitude}_${crop}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;
    try {
      const usdaData = await usdaService.getRegionalRecommendations(latitude, longitude);
      const region = usdaData.region.code.toLowerCase();
      const relevantActivities = this.activities.filter(activity => 
        activity.timing.month === month &&
        (activity.region.includes(region) || activity.region.includes('all')) &&
        (activity.crops.includes(crop) || activity.crops.includes('all'))
      );
      const monthlyPlan = this.createMonthlyPlan(month, region, relevantActivities, 500); // Default farm size
      await this.setCached(cacheKey, monthlyPlan, 12 * 60 * 60); // 12 hour cache
      return monthlyPlan;
    } catch (error) {
      console.error(`Failed to get monthly activities for month ${month}`, error);
      throw error;
    }
  }
  /**
   * Get weather-optimized timing for specific activities
   */
  async getOptimalTiming(
    activityId: string,
    latitude: number,
    longitude: number,
    year?: number
  ): Promise<{
    optimalDates: Date[];
    weatherWindow: {
      start: Date;
      end: Date;
      confidence: number;
    };
    riskFactors: string[];
    alternatives: Date[];
  }> {
    const targetYear = year || new Date().getFullYear();
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) {
      throw new Error(`Activity ${activityId} not found`);
    }
    try {
      // Get weather-based timing optimization
      const optimalTiming = await weatherPatternAnalysis.getOptimalTiming(
        activity.category as any,
        'corn', // Default crop for timing
        latitude,
        longitude
      );
      // Calculate optimal dates based on activity timing and weather
      const optimalDates: Date[] = [];
      const baseDate = new Date(targetYear, activity.timing.month - 1, 1);
      if (activity.timing.dayRange) {
        for (let day = activity.timing.dayRange.start; day <= activity.timing.dayRange.end; day += 3) {
          optimalDates.push(new Date(targetYear, activity.timing.month - 1, day));
        }
      } else if (activity.timing.weekOfMonth) {
        const weekStart = (activity.timing.weekOfMonth - 1) * 7 + 1;
        optimalDates.push(new Date(targetYear, activity.timing.month - 1, weekStart));
      }
      return {
        optimalDates,
        weatherWindow: optimalTiming.optimalWindow,
        riskFactors: optimalTiming.riskFactors,
        alternatives: optimalTiming.alternatives.map(alt => alt.backup)
      };
    } catch (error) {
      console.error(`Failed to get optimal timing for activity ${activityId}`, error);
      throw error;
    }
  }
  // Private helper methods
  private createMonthlyPlan(month: number, region: string, activities: SeasonalActivity[], farmSize: number): MonthlyPlan {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const criticalActivities = activities.filter(a => a.priority === 'critical');
    const importantActivities = activities.filter(a => a.priority === 'important');
    const recommendedActivities = activities.filter(a => a.priority === 'recommended');
    // Calculate resource requirements
    const totalLaborHours = activities.reduce((sum, a) => sum + (a.labor.hours_per_acre * farmSize), 0);
    const peakWorkdays = Math.ceil(totalLaborHours / 8); // 8 hours per day
    const equipmentNeeds = Array.from(new Set(activities.flatMap(a => a.equipment)));
    const materialNeeds = Array.from(new Set(activities.flatMap(a => a.materials)));
    const estimatedCost = activities.reduce((sum, a) => sum + (a.cost_per_acre * farmSize), 0);
    return {
      month,
      monthName: monthNames[month - 1],
      region,
      totalActivities: activities.length,
      criticalActivities,
      importantActivities,
      recommendedActivities,
      weatherConsiderations: this.getWeatherConsiderations(month, region),
      resourceRequirements: {
        totalLaborHours,
        peakWorkdays,
        equipmentNeeds,
        materialNeeds,
        estimatedCost
      },
      riskFactors: this.getRiskFactors(month, region),
      opportunities: this.getOpportunities(month, region)
    };
  }
  private createYearlyOverview(activities: SeasonalActivity[], farmSize: number, year: number): any {
    const keyMilestones = activities
      .filter(a => a.priority === 'critical')
      .map(a => ({
        date: new Date(year, a.timing.month - 1, a.timing.dayRange?.start || 15),
        activity: a.title,
        importance: a.priority
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    const totalBudget = activities.reduce((sum, a) => sum + (a.cost_per_acre * farmSize), 0);
    const laborByMonth = Array(12).fill(0);
    activities.forEach(a => {
      laborByMonth[a.timing.month - 1] += a.labor.hours_per_acre * farmSize;
    });
    const peakMonth = laborByMonth.indexOf(Math.max(...laborByMonth));
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return {
      keyMilestones,
      totalBudget,
      laborRequirements: {
        totalHours: laborByMonth.reduce((sum, hours) => sum + hours, 0),
        peakMonth: monthNames[peakMonth],
        seasonalDistribution: laborByMonth
      },
      equipmentSchedule: this.createEquipmentSchedule(activities),
      riskCalendar: this.createRiskCalendar()
    };
  }
  private createAdaptations(weatherPatterns: any, usdaData: any): any {
    return {
      climate: weatherPatterns.adaptationStrategies.cropSelection.slice(0, 3),
      weather_patterns: [
        'Monitor El Niño/La Niña patterns for seasonal adjustments',
        'Adjust planting dates based on spring onset trends',
        'Implement drought contingency plans'
      ],
      market_conditions: [
        'Diversify crop portfolio for market stability',
        'Consider forward contracting for price risk management',
        'Evaluate specialty crop opportunities'
      ]
    };
  }
  private getWeatherConsiderations(month: number, region: string): string[] {
    const considerations: Record<number, string[]> = {
      1: ['Monitor winter weather patterns', 'Plan for equipment access'],
      2: ['Track spring onset indicators', 'Prepare for field work timing'],
      3: ['Monitor soil temperature and moisture', 'Watch for late frost risks'],
      4: ['Critical planting weather windows', 'Monitor rainfall and field conditions'],
      5: ['Track emergence and early growth conditions', 'Monitor for late frost'],
      6: ['Watch for drought stress development', 'Monitor pollination weather'],
      7: ['Critical reproductive stage weather', 'Peak irrigation period'],
      8: ['Grain filling weather monitoring', 'Heat stress management'],
      9: ['Harvest weather planning', 'Monitor field access conditions'],
      10: ['Fall field work windows', 'Monitor freeze dates'],
      11: ['Winter weather preparation', 'Equipment storage planning'],
      12: ['Year-end weather analysis', 'Plan for next year patterns']
    };
    return considerations[month] || [];
  }
  private getRiskFactors(month: number, region: string): string[] {
    const risks: Record<number, string[]> = {
      3: ['Late frost damage', 'Wet field conditions delay'],
      4: ['Planting delays', 'Uneven emergence', 'Herbicide carryover'],
      5: ['Cutworm damage', 'Damping off disease', 'Compaction from wet conditions'],
      6: ['Drought stress', 'Corn rootworm', 'Nitrogen deficiency'],
      7: ['Heat stress during pollination', 'European corn borer', 'Disease pressure'],
      8: ['Hail damage', 'Late season drought', 'Grain quality issues'],
      9: ['Harvest delays', 'Lodging from storms', 'Grain quality deterioration'],
      10: ['Early freeze damage', 'Equipment breakdowns', 'Market price volatility']
    };
    return risks[month] || ['General weather risks', 'Equipment maintenance needs'];
  }
  private getOpportunities(month: number, region: string): string[] {
    const opportunities: Record<number, string[]> = {
      1: ['Planning optimization', 'Input price negotiations', 'Equipment deals'],
      2: ['Early soil preparation', 'Cover crop benefits assessment'],
      3: ['Soil health improvements', 'Precision agriculture adoption'],
      4: ['Optimal planting conditions', 'Precision application benefits'],
      7: ['Intensive management payoffs', 'Yield potential maximization'],
      9: ['Harvest efficiency gains', 'Quality premiums capture'],
      10: ['Fall management benefits', 'Next year preparation advantages'],
      12: ['Year-end tax planning', 'Equipment depreciation optimization']
    };
    return opportunities[month] || ['Standard farming opportunities'];
  }
  private createEquipmentSchedule(activities: SeasonalActivity[]): any[] {
    const schedule: any[] = [];
    const equipmentUsage = new Map<string, Map<number, number>>();
    activities.forEach(activity => {
      activity.equipment.forEach(equipment => {
        if (!equipmentUsage.has(equipment)) {
          equipmentUsage.set(equipment, new Map());
        }
        const monthUsage = equipmentUsage.get(equipment)!;
        const currentUsage = monthUsage.get(activity.timing.month) || 0;
        monthUsage.set(activity.timing.month, currentUsage + activity.duration.days * 8); // 8 hours per day
      });
    });
    equipmentUsage.forEach((monthlyUsage, equipment) => {
      monthlyUsage.forEach((hours, month) => {
        schedule.push({ month, equipment, usage_hours: hours });
      });
    });
    return schedule.sort((a, b) => a.month - b.month);
  }
  private createRiskCalendar(): any[] {
    return [
      { month: 3, risks: ['Late frost', 'Wet field conditions'], mitigation: ['Monitor weather', 'Field drainage'] },
      { month: 4, risks: ['Planting delays', 'Uneven emergence'], mitigation: ['Flexible scheduling', 'Seed treatment'] },
      { month: 7, risks: ['Heat stress', 'Disease pressure'], mitigation: ['Irrigation scheduling', 'Fungicide application'] },
      { month: 9, risks: ['Harvest delays', 'Quality deterioration'], mitigation: ['Equipment readiness', 'Storage preparation'] }
    ];
  }
  private async getCached(key: string): Promise<any> {
    if (!redis) {
      return null;
    }
    try {
      return await redis.get(key);
    } catch (error) {
      return null;
    }
  }
  private async setCached(key: string, data: any, ttl: number = this.CACHE_TTL): Promise<void> {
    if (!redis) {
      return;
    }
    try {
      await redis.set(key, data, { ex: ttl });
    } catch (error) {
      // Cache miss is not critical
    }
  }
}
export const seasonalCalendar = new SeasonalCalendarService();