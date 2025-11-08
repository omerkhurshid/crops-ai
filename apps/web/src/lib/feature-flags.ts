/**
 * Feature Flags Configuration
 * 
 * Centralized feature flag management for the application.
 * Used primarily for the authentication migration from NextAuth to Supabase.
 */
// Auth system feature flag
export const FEATURE_FLAGS = {
  // Authentication system selection
  USE_SUPABASE_AUTH: process.env.NEXT_PUBLIC_USE_SUPABASE_AUTH === 'true',
  // Migration-related flags
  ENABLE_AUTH_MIGRATION_LOGGING: process.env.NODE_ENV === 'development',
  SHOW_AUTH_SYSTEM_INDICATOR: process.env.NODE_ENV === 'development',
  // Other feature flags can be added here
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_NEW_DASHBOARD: process.env.NEXT_PUBLIC_ENABLE_NEW_DASHBOARD === 'true',
} as const
// Helper functions for feature flag checks
export const featureFlags = {
  isSupabaseAuthEnabled: () => FEATURE_FLAGS.USE_SUPABASE_AUTH,
  isNextAuthEnabled: () => !FEATURE_FLAGS.USE_SUPABASE_AUTH,
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  // Auth system helpers
  getAuthSystemName: () => FEATURE_FLAGS.USE_SUPABASE_AUTH ? 'Supabase' : 'NextAuth',
  shouldShowAuthIndicator: () => FEATURE_FLAGS.SHOW_AUTH_SYSTEM_INDICATOR,
  shouldLogAuthMigration: () => FEATURE_FLAGS.ENABLE_AUTH_MIGRATION_LOGGING,
}
// Migration phase tracking
export const MIGRATION_PHASES = {
  PHASE_1_NEXTAUTH_ONLY: 'nextauth-only',
  PHASE_2_PARALLEL_TESTING: 'parallel-testing', 
  PHASE_3_SUPABASE_GRADUAL: 'supabase-gradual',
  PHASE_4_SUPABASE_FULL: 'supabase-full',
  PHASE_5_CLEANUP: 'cleanup'
} as const
export type MigrationPhase = typeof MIGRATION_PHASES[keyof typeof MIGRATION_PHASES]
// Current migration phase (can be controlled via environment)
export const getCurrentMigrationPhase = (): MigrationPhase => {
  const phase = process.env.NEXT_PUBLIC_MIGRATION_PHASE as MigrationPhase
  if (Object.values(MIGRATION_PHASES).includes(phase)) {
    return phase
  }
  // Default based on Supabase auth flag
  return FEATURE_FLAGS.USE_SUPABASE_AUTH 
    ? MIGRATION_PHASES.PHASE_3_SUPABASE_GRADUAL 
    : MIGRATION_PHASES.PHASE_1_NEXTAUTH_ONLY
}
// Log feature flag status (for debugging)
if (typeof window !== 'undefined' && featureFlags.shouldLogAuthMigration()) {
  console.log('Auth Migration Status:', {
    migrationPhase: getCurrentMigrationPhase(),
    isDevelopment: featureFlags.isDevelopment(),
    flags: FEATURE_FLAGS
  })
}