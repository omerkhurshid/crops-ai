/**
 * Additional Jest setup for Crops.AI tests
 */
// Global test utilities and additional mocks
// Mock ResizeObserver for components that use it
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
// Mock Google Maps API
global.google = {
  maps: {
    Map: jest.fn().mockImplementation(() => ({
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
    Marker: jest.fn().mockImplementation(() => ({
      setPosition: jest.fn(),
      setMap: jest.fn(),
      addListener: jest.fn(),
    })),
    InfoWindow: jest.fn().mockImplementation(() => ({
      open: jest.fn(),
      close: jest.fn(),
      setContent: jest.fn(),
    })),
    Polygon: jest.fn().mockImplementation(() => ({
      setMap: jest.fn(),
      setPath: jest.fn(),
      setOptions: jest.fn(),
    })),
    MapTypeId: {
      ROADMAP: 'roadmap',
      SATELLITE: 'satellite',
      HYBRID: 'hybrid',
      TERRAIN: 'terrain',
    },
    event: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      trigger: jest.fn(),
    },
    LatLng: jest.fn().mockImplementation((lat, lng) => ({ lat: () => lat, lng: () => lng })),
    places: {
      PlacesService: jest.fn().mockImplementation(() => ({
        findPlaceFromQuery: jest.fn(),
        getDetails: jest.fn(),
        nearbySearch: jest.fn(),
      })),
      Autocomplete: jest.fn(),
    },
  },
} as any
// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})
// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})
// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-url')
})
// Mock document.elementFromPoint
Object.defineProperty(document, 'elementFromPoint', {
  writable: true,
  value: jest.fn(() => null)
})
// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn()
})
// Helper function to create mock user session
export const createMockSession = (overrides = {}) => ({
  user: {
    id: 'test-user-id',
    email: 'test@crops-ai.com',
    name: 'Test User',
    role: 'FARM_OWNER',
    ...overrides
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
})
// Helper function to create mock farm data
export const createMockFarm = (overrides = {}) => ({
  id: 'test-farm-id',
  name: 'Test Farm',
  location: 'Test Location',
  latitude: 41.305150,
  longitude: -98.161795,
  size: 160,
  type: 'CROP',
  ownerId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})
// Helper function to create mock field data
export const createMockField = (overrides = {}) => ({
  id: 'test-field-id',
  name: 'Test Field',
  farmId: 'test-farm-id',
  area: 40,
  soilType: 'Loam',
  latitude: 41.305150,
  longitude: -98.161795,
  boundaries: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})
// Helper function to create mock weather data
export const createMockWeatherData = (overrides = {}) => ({
  temperature: 25,
  humidity: 60,
  windSpeed: 5,
  pressure: 1013,
  visibility: 10,
  uvIndex: 5,
  condition: 'sunny',
  location: 'Test Location',
  timestamp: new Date(),
  forecast: [
    {
      date: new Date().toISOString(),
      temperature: { min: 18, max: 28 },
      condition: 'sunny',
      precipitationProbability: 10,
      windSpeed: 5,
      humidity: 60
    }
  ],
  ...overrides
})
// Helper function to create mock NDVI data
export const createMockNDVIData = (overrides = {}) => ({
  fieldId: 'test-field-id',
  date: new Date().toISOString(),
  ndvi: 0.8,
  confidence: 0.95,
  imageUrl: 'https://crops-ai.com/image.jpg',
  ...overrides
})
// Test utility to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))
// Export common testing utilities
export {
  localStorageMock,
  sessionStorageMock,
}