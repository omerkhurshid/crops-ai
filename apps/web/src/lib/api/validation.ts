import { z } from 'zod'
import { ValidationError } from './errors'
// Common validation schemas
export const emailSchema = z.string().email('Invalid email format')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
})
// User validation schemas
export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['FARM_OWNER', 'FARM_MANAGER', 'AGRONOMIST', 'ADMIN']).optional()
})
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  role: z.enum(['FARM_OWNER', 'FARM_MANAGER', 'AGRONOMIST', 'ADMIN']).optional()
})
// Field schema for farm creation
export const farmFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  area: z.number().min(0, 'Area must be non-negative'),
  color: z.string().optional(),
  cropType: z.string().optional(),
  fieldType: z.string().optional(), // Maps to status in database
  soilType: z.string().optional()
})

// Farm validation schemas
export const createFarmSchema = z.object({
  name: z.string().min(1, 'Farm name is required'),
  // Remove farmType - not in database schema, stored in metadata or primaryProduct instead
  primaryProduct: z.string().optional(),
  metadata: z.any().optional(), // For storing secondary products and other flexible data
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  region: z.string().optional(),
  country: z.string().min(2, 'Country code is required'),
  totalArea: z.number().min(0, 'Total area must be non-negative'),
  fields: z.array(farmFieldSchema).optional()
})
export const updateFarmSchema = z.object({
  name: z.string().min(1, 'Farm name is required').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  country: z.string().min(2, 'Country code is required').optional(),
  totalArea: z.number().positive('Total area must be positive').optional()
})
// Field validation schemas
export const createFieldSchema = z.object({
  farmId: z.string().cuid('Invalid farm ID'),
  name: z.string().min(1, 'Field name is required'),
  area: z.number().positive('Area must be positive'),
  color: z.string().optional(),
  cropType: z.string().optional(),
  status: z.string().optional(),
  soilType: z.string().optional(),
  boundary: z.string().optional() // JSON string representation of geometry
})
export const updateFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required').optional(),
  area: z.number().positive('Area must be positive').optional(),
  soilType: z.string().optional(),
  boundary: z.string().optional() // JSON string representation of geometry
})
// Crop validation schemas
export const createCropSchema = z.object({
  fieldId: z.string().cuid('Invalid field ID'),
  cropType: z.string().min(1, 'Crop type is required'),
  variety: z.string().optional(),
  plantingDate: z.string().datetime('Invalid planting date'),
  expectedHarvestDate: z.string().datetime('Invalid expected harvest date'),
  status: z.enum(['PLANNED', 'PLANTED', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED', 'FAILED']).optional()
})
export const updateCropSchema = z.object({
  cropType: z.string().min(1, 'Crop type is required').optional(),
  variety: z.string().optional(),
  plantingDate: z.string().datetime('Invalid planting date').optional(),
  expectedHarvestDate: z.string().datetime('Invalid expected harvest date').optional(),
  actualHarvestDate: z.string().datetime('Invalid actual harvest date').optional(),
  status: z.enum(['PLANNED', 'PLANTED', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED', 'FAILED']).optional(),
  yield: z.number().positive('Yield must be positive').optional()
})
// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})
// Helper function to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      throw new ValidationError(
        firstError.message,
        firstError.path.join('.')
      )
    }
    throw new ValidationError('Invalid request data')
  }
}
// Helper function to validate query parameters
export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: Record<string, string | string[] | undefined>): T {
  try {
    return schema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      throw new ValidationError(
        `Invalid query parameter: ${firstError.message}`,
        firstError.path.join('.')
      )
    }
    throw new ValidationError('Invalid query parameters')
  }
}
// Helper function to validate path parameters
export function validatePathParam(value: string | undefined, paramName: string): string {
  if (!value) {
    throw new ValidationError(`Missing required parameter: ${paramName}`)
  }
  return value
}