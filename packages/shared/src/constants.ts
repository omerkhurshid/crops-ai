// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  FARMS: '/api/farms',
  FIELDS: '/api/fields',
  CROPS: '/api/crops',
  WEATHER: '/api/weather',
  SATELLITE: '/api/satellite',
  RECOMMENDATIONS: '/api/recommendations'
} as const

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
} as const

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 13,
  MAX_ZOOM: 20,
  MIN_ZOOM: 5,
  DEFAULT_CENTER: {
    lat: 40.7128,
    lng: -74.0060
  }
} as const

// Crop types
export const CROP_TYPES = [
  'Wheat',
  'Corn',
  'Soybeans',
  'Rice',
  'Cotton',
  'Barley',
  'Sugarcane',
  'Potatoes',
  'Tomatoes',
  'Other'
] as const

// Units
export const UNITS = {
  AREA: {
    HECTARE: 'ha',
    ACRE: 'ac',
    SQUARE_METER: 'm²'
  },
  TEMPERATURE: {
    CELSIUS: '°C',
    FAHRENHEIT: '°F'
  },
  PRECIPITATION: {
    MILLIMETER: 'mm',
    INCH: 'in'
  },
  YIELD: {
    KG_PER_HECTARE: 'kg/ha',
    BUSHEL_PER_ACRE: 'bu/ac'
  }
} as const