// User types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  FARM_OWNER = 'FARM_OWNER',
  FARM_MANAGER = 'FARM_MANAGER',
  AGRONOMIST = 'AGRONOMIST',
  ADMIN = 'ADMIN'
}

// Farm types
export interface Farm {
  id: string
  name: string
  ownerId: string
  location: Location
  totalArea: number // in hectares
  createdAt: Date
  updatedAt: Date
}

export interface Location {
  latitude: number
  longitude: number
  address?: string
  region?: string
  country: string
}

// Field types
export interface Field {
  id: string
  farmId: string
  name: string
  area: number // in hectares
  boundary: GeoJSON
  currentCrop?: Crop
  soilType?: string
  createdAt: Date
  updatedAt: Date
}

export interface GeoJSON {
  type: 'Polygon'
  coordinates: number[][][]
}

// Crop types
export interface Crop {
  id: string
  fieldId: string
  cropType: string
  variety?: string
  plantingDate: Date
  expectedHarvestDate: Date
  actualHarvestDate?: Date
  status: CropStatus
  yield?: number // in kg/hectare
}

export enum CropStatus {
  PLANNED = 'PLANNED',
  PLANTED = 'PLANTED',
  GROWING = 'GROWING',
  READY_TO_HARVEST = 'READY_TO_HARVEST',
  HARVESTED = 'HARVESTED',
  FAILED = 'FAILED'
}

// Weather types
export interface WeatherData {
  timestamp: Date
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  windDirection: number
  pressure: number
  cloudCover: number
}

export interface WeatherForecast {
  date: Date
  minTemp: number
  maxTemp: number
  precipitationProbability: number
  precipitationAmount?: number
  conditions: string
}

// Satellite data types
export interface SatelliteData {
  fieldId: string
  captureDate: Date
  ndvi: number
  ndviChange?: number
  stressLevel?: StressLevel
  imageUrl?: string
}

export enum StressLevel {
  NONE = 'NONE',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  SEVERE = 'SEVERE'
}