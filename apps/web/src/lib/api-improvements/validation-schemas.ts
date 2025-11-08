// Common Validation Schemas
import { z } from 'zod'
// Common field types
export const idSchema = z.string().cuid()
export const emailSchema = z.string().email()
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
export const urlSchema = z.string().url()
// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})
// Common response schemas
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
  timestamp: z.string().datetime()
})
export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.any().optional(),
  timestamp: z.string().datetime()
})
// Farm-related schemas
export const createFarmSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(200),
  size: z.number().positive(),
  type: z.enum(['CROP', 'LIVESTOCK', 'MIXED']),
  description: z.string().max(500).optional()
})
export const updateFarmSchema = createFarmSchema.partial()
// Field-related schemas
export const createFieldSchema = z.object({
  farmId: idSchema,
  name: z.string().min(1).max(100),
  area: z.number().positive(),
  soilType: z.string().min(1).max(50),
  coordinates: z.array(z.object({
    lat: z.number(),
    lng: z.number()
  })).min(3)
})
// Task-related schemas
export const createTaskSchema = z.object({
  farmId: idSchema,
  fieldId: idSchema.optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
  category: z.string().max(50).optional()
})
// Helper function to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  return schema.parse(body)
}
// Helper function to validate query parameters
export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: Record<string, string>): T {
  return schema.parse(params)
}
// Usage example:
/*
import { validateRequestBody, createFarmSchema } from '@/lib/api-improvements/validation-schemas'
export async function POST(request: NextRequest) {
  const body = await request.json()
  const validatedData = validateRequestBody(createFarmSchema, body)
  // ... rest of your logic
}
*/