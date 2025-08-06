import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Configure Prisma for serverless environments
export const prisma = globalThis.__prisma || new PrismaClient({
  // Reduce connection pool size for serverless
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

export * from '@prisma/client'
export { createSupabaseClient } from './supabase'