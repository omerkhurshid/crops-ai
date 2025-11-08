// Server-side user preferences utilities
import { prisma } from './prisma'
export interface UserPreferences {
  currency: string
  landUnit: string
  temperatureUnit: string
  timezone: string
  language: string
}
export const DEFAULT_PREFERENCES: UserPreferences = {
  currency: 'USD',
  landUnit: 'hectares',
  temperatureUnit: 'celsius',
  timezone: 'UTC',
  language: 'en'
}
// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥', INR: '₹', BRL: 'R$',
  CNY: '¥', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč',
  HUF: 'Ft', RUB: '₽', ZAR: 'R', KRW: '₩', SGD: 'S$', HKD: 'HK$', NZD: 'NZ$',
  MXN: '$', ARS: '$', CLP: '$', COP: '$', PEN: 'S/', TRY: '₺', EGP: 'E£',
  NGN: '₦', KES: 'KSh', GHS: '₵', MAD: 'MAD', THB: '฿', VND: '₫', IDR: 'Rp',
  MYR: 'RM', PHP: '₱'
}
/**
 * Get user preferences from database or defaults
 */
export async function getUserPreferences(userId?: string): Promise<UserPreferences> {
  try {
    if (!userId) return DEFAULT_PREFERENCES
    const userWithPrefs = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currency: true,
        landUnit: true,
        temperatureUnit: true,
        timezone: true,
        language: true
      }
    })
    if (!userWithPrefs) return DEFAULT_PREFERENCES
    return {
      currency: userWithPrefs.currency || DEFAULT_PREFERENCES.currency,
      landUnit: userWithPrefs.landUnit || DEFAULT_PREFERENCES.landUnit,
      temperatureUnit: userWithPrefs.temperatureUnit || DEFAULT_PREFERENCES.temperatureUnit,
      timezone: userWithPrefs.timezone || DEFAULT_PREFERENCES.timezone,
      language: userWithPrefs.language || DEFAULT_PREFERENCES.language
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return DEFAULT_PREFERENCES
  }
}
/**
 * Format currency amount based on user preferences
 */
export function formatCurrency(amount: number, preferences: UserPreferences): string {
  const symbol = CURRENCY_SYMBOLS[preferences.currency] || preferences.currency
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: preferences.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  } catch (error) {
    // Fallback if currency is not supported by Intl
    return `${symbol}${amount.toLocaleString()}`
  }
}
/**
 * Convert temperature based on user preferences
 */
export function formatTemperature(celsius: number, preferences: UserPreferences): string {
  if (preferences.temperatureUnit === 'fahrenheit') {
    const fahrenheit = (celsius * 9/5) + 32
    return `${Math.round(fahrenheit)}°F`
  }
  return `${Math.round(celsius)}°C`
}
/**
 * Convert area based on user preferences
 */
export function formatArea(hectares: number, preferences: UserPreferences): string {
  switch (preferences.landUnit) {
    case 'acres':
      const acres = hectares * 2.47105
      return `${acres.toFixed(1)} ac`
    case 'square_meters':
      const sqm = hectares * 10000
      return `${sqm.toLocaleString()} m²`
    default: // hectares
      return `${hectares.toFixed(1)} ha`
  }
}
/**
 * Convert area value to hectares (base unit for storage)
 */
export function convertToHectares(value: number, unit: string): number {
  switch (unit) {
    case 'acres':
      return value / 2.47105
    case 'square_meters':
      return value / 10000
    default: // hectares
      return value
  }
}
/**
 * Convert temperature to celsius (base unit for storage)
 */
export function convertToCelsius(value: number, unit: string): number {
  if (unit === 'fahrenheit') {
    return (value - 32) * 5/9
  }
  return value
}
/**
 * Client-side preferences hook (for use in React components)
 */
export function useUserPreferences() {
  // This would typically use React context or SWR
  // For now, we'll create a simple fetch function
  const fetchPreferences = async (): Promise<UserPreferences> => {
    try {
      const response = await fetch('/api/users/preferences')
      if (response.ok) {
        const data = await response.json()
        return data.data?.preferences || DEFAULT_PREFERENCES
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
    return DEFAULT_PREFERENCES
  }
  return { fetchPreferences }
}