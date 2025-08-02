// Date utilities
export function formatDate(date: Date | string, format?: string): string {
  const d = new Date(date)
  return d.toLocaleDateString()
}

// Area conversion utilities
export function hectaresToAcres(hectares: number): number {
  return hectares * 2.47105
}

export function acresToHectares(acres: number): number {
  return acres / 2.47105
}

// Temperature conversion utilities
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// NDVI utilities
export function calculateNDVIHealth(ndvi: number): string {
  if (ndvi < 0.1) return 'Bare soil'
  if (ndvi < 0.2) return 'Poor'
  if (ndvi < 0.3) return 'Fair'
  if (ndvi < 0.6) return 'Good'
  if (ndvi < 0.8) return 'Very Good'
  return 'Excellent'
}

// Error handling
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}