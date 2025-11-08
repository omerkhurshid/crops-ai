// Demo data service for new user exploration
export class DemoDataService {
  static isDemoMode(): boolean {
    // Demo mode disabled in production
    if (process.env.NODE_ENV === 'production') return false
    if (typeof window === 'undefined') return false
    return localStorage.getItem('demoMode') === 'true'
  }
  static enableDemoMode(): void {
    // Demo mode disabled in production
    if (process.env.NODE_ENV === 'production') {return
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('demoMode', 'true')
    }
  }
  static disableDemoMode(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demoMode')
    }
  }
  static getDemoFarmData() {
    return {
      id: 'demo-farm-1',
      name: 'Prairie View Demo Farm',
      totalArea: 285,
      location: 'Nebraska, USA',
      latitude: 41.4925,
      longitude: -99.9018,
      fields: [
        {
          id: 'demo-field-1',
          name: 'North Field',
          area: 95,
          cropType: 'Corn',
          healthScore: 85,
          stressLevel: 'low',
          lastSatelliteUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'demo-field-2',
          name: 'South Field',
          area: 120,
          cropType: 'Soybeans',
          healthScore: 78,
          stressLevel: 'moderate',
          lastSatelliteUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'demo-field-3',
          name: 'East Pasture',
          area: 70,
          cropType: 'Wheat',
          healthScore: 92,
          stressLevel: 'low',
          lastSatelliteUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    }
  }
  static getDemoWeatherData() {
    return {
      current: {
        temperature: 78,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 8,
        precipitation: 0.1
      },
      forecast: [
        { day: 'Today', high: 82, low: 61, condition: 'Sunny', precipitation: 0 },
        { day: 'Tomorrow', high: 79, low: 58, condition: 'Partly Cloudy', precipitation: 0.2 },
        { day: 'Wednesday', high: 75, low: 55, condition: 'Light Rain', precipitation: 0.8 },
        { day: 'Thursday', high: 73, low: 52, condition: 'Cloudy', precipitation: 0.3 },
        { day: 'Friday', high: 76, low: 54, condition: 'Sunny', precipitation: 0 }
      ],
      alerts: [
        {
          type: 'Frost Warning',
          severity: 'moderate',
          description: 'Potential frost conditions expected Friday night',
          action: 'Consider protective measures for sensitive crops'
        }
      ]
    }
  }
  static getDemoFinancialData() {
    return {
      ytdProfit: 45250,
      ytdRevenue: 187500,
      ytdExpenses: 142250,
      profitMargin: 24.1,
      topExpenses: [
        { category: 'Seeds', amount: 32400, percentage: 23 },
        { category: 'Fertilizer', amount: 28700, percentage: 20 },
        { category: 'Fuel', amount: 18600, percentage: 13 },
        { category: 'Equipment', amount: 15200, percentage: 11 }
      ],
      monthlyTrend: [
        { month: 'Jan', profit: 2500 },
        { month: 'Feb', profit: 3200 },
        { month: 'Mar', profit: 8900 },
        { month: 'Apr', profit: 12400 },
        { month: 'May', profit: 18300 }
      ]
    }
  }
  static getDemoRecommendations() {
    return [
      {
        id: 'demo-rec-1',
        title: 'Optimize Corn Planting Window',
        description: 'Soil temperature and moisture conditions are ideal for corn planting in North Field',
        priority: 'high',
        category: 'planting',
        impact: 'Potential 8-12% yield increase',
        timeframe: 'Next 5 days'
      },
      {
        id: 'demo-rec-2',
        title: 'Monitor Soybean Field for Aphids',
        description: 'Weather conditions favor aphid development. Scout South Field this week',
        priority: 'medium',
        category: 'pest-management',
        impact: 'Prevent 5-15% yield loss',
        timeframe: 'This week'
      },
      {
        id: 'demo-rec-3',
        title: 'Harvest Timing for Wheat',
        description: 'East Pasture wheat approaching optimal harvest moisture content',
        priority: 'high',
        category: 'harvest',
        impact: 'Maximize grain quality premium',
        timeframe: '7-10 days'
      }
    ]
  }
  static getDemoLivestockData() {
    return {
      totalAnimals: 48,
      cattle: 35,
      healthStatus: 'good',
      recentEvents: [
        { type: 'Vaccination', date: '2 days ago', animal: 'Cattle Group A' },
        { type: 'Health Check', date: '1 week ago', animal: 'Bull #247' }
      ],
      upcomingTasks: [
        { task: 'Pregnancy Check', due: 'Next week', group: 'Breeding Cows' },
        { task: 'Pasture Rotation', due: '3 days', group: 'All Cattle' }
      ]
    }
  }
  static getDemoMarketData() {
    return {
      corn: { price: 4.85, change: +0.12, trend: 'up' },
      soybeans: { price: 12.45, change: -0.08, trend: 'down' },
      wheat: { price: 6.22, change: +0.05, trend: 'up' },
      lastUpdated: new Date()
    }
  }
  static getDemoTasks() {
    return [
      {
        id: 'demo-task-1',
        title: 'Scout North Field for Pest Activity',
        priority: 'high',
        category: 'field-work',
        dueDate: 'Today',
        estimatedTime: '2 hours',
        weather: 'Good conditions (75°F, calm winds)'
      },
      {
        id: 'demo-task-2',
        title: 'Apply Nitrogen to South Field',
        priority: 'medium',
        category: 'fertilization',
        dueDate: 'Tomorrow',
        estimatedTime: '4 hours',
        weather: 'Ideal (no rain forecast for 24hrs)'
      },
      {
        id: 'demo-task-3',
        title: 'Equipment Maintenance - Combine',
        priority: 'low',
        category: 'maintenance',
        dueDate: 'This week',
        estimatedTime: '6 hours',
        weather: 'Any conditions (indoor work)'
      }
    ]
  }
}