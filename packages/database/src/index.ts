import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Create a single Prisma client instance with serverless configuration
const createPrismaClient = () => new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Use global instance in development, new instance in serverless
export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export * from '@prisma/client'
export { createSupabaseClient } from './supabase'