/**
 * FieldKit Design System - Color Usage Standards
 * 
 * This file defines the standard color usage patterns for the Crops.AI application.
 * Use these utilities to ensure consistent color application across components.
 */
export const ColorStandards = {
  // Primary Actions & Interactive Elements
  primary: {
    background: 'bg-fk-primary',
    backgroundHover: 'hover:bg-fk-primary-600',
    text: 'text-fk-primary',
    border: 'border-fk-primary',
  },
  // Text Colors
  text: {
    primary: 'text-fk-text',
    secondary: 'text-fk-text-muted',
    accent: 'text-fk-primary',
    light: 'text-white',
  },
  // Background Colors
  background: {
    canvas: 'bg-canvas',
    surface: 'bg-surface',
    sidebar: 'bg-sidebar',
    card: 'bg-white',
    overlay: 'bg-white/80 backdrop-blur-sm',
  },
  // Status & Feedback Colors
  status: {
    success: {
      background: 'bg-fk-success',
      text: 'text-fk-success',
      border: 'border-fk-success',
      light: 'bg-fk-success/10',
    },
    warning: {
      background: 'bg-fk-warning',
      text: 'text-fk-warning',
      border: 'border-fk-warning',
      light: 'bg-fk-warning/10',
    },
    danger: {
      background: 'bg-fk-danger',
      text: 'text-fk-danger',
      border: 'border-fk-danger',
      light: 'bg-fk-danger/10',
    },
    info: {
      background: 'bg-fk-info',
      text: 'text-fk-info',
      border: 'border-fk-info',
      light: 'bg-fk-info/10',
    },
  },
  // Agricultural-Specific Colors
  agricultural: {
    stress: {
      background: 'bg-fk-stress',
      text: 'text-fk-stress',
      border: 'border-fk-stress',
      light: 'bg-fk-stress/10',
    },
    health: {
      good: 'text-fk-success',
      warning: 'text-fk-warning',
      critical: 'text-fk-danger',
    },
    trends: {
      up: 'text-fk-up',
      down: 'text-fk-down',
      neutral: 'text-fk-neutral',
    },
  },
  // Borders
  border: {
    default: 'border-fk-border',
    muted: 'border-fk-border/50',
    accent: 'border-fk-primary',
  },
  // Legacy Color Mappings (for gradual migration)
  legacy: {
    'text-sage-800': 'text-fk-text',
    'text-sage-600': 'text-fk-text-muted',
    'bg-sage-600': 'bg-fk-primary',
    'bg-sage-50': 'bg-fk-primary-200',
    'border-sage-200': 'border-fk-border',
    'text-green-600': 'text-fk-success',
    'text-red-600': 'text-fk-danger',
    'text-yellow-600': 'text-fk-warning',
    'text-blue-600': 'text-fk-info',
  },
} as const
/**
 * Utility function to get standard color classes
 */
export function getColorClasses(variant: keyof typeof ColorStandards) {
  return ColorStandards[variant]
}
/**
 * Utility function to migrate legacy colors to FieldKit colors
 */
export function migrateLegacyColor(legacyColor: string): string {
  const migration = ColorStandards.legacy as any
  return migration[legacyColor] || legacyColor
}
/**
 * Common color combinations for consistent UI patterns
 */
export const ColorCombinations = {
  primaryButton: 'bg-fk-primary text-white hover:bg-fk-primary-600 transition-colors',
  secondaryButton: 'bg-surface text-fk-text border border-fk-border hover:bg-fk-border/20 transition-colors',
  cardDefault: 'bg-white border border-fk-border',
  cardHover: 'bg-white border border-fk-border hover:shadow-lg transition-all duration-200',
  inputDefault: 'bg-white border border-fk-border text-fk-text placeholder:text-fk-text-muted',
  inputFocus: 'focus:border-fk-primary focus:ring-2 focus:ring-fk-primary/20',
  alertSuccess: 'bg-fk-success/10 border border-fk-success text-fk-success',
  alertWarning: 'bg-fk-warning/10 border border-fk-warning text-fk-warning',
  alertDanger: 'bg-fk-danger/10 border border-fk-danger text-fk-danger',
  alertInfo: 'bg-fk-info/10 border border-fk-info text-fk-info',
} as const