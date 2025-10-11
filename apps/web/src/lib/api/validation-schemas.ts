import { z } from 'zod'

// Common validation schemas
const IdSchema = z.string().uuid('Invalid ID format')
const EmailSchema = z.string().email('Invalid email address')
const PasswordSchema = z.string().min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase and number')

const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

const CoordinatesSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180)
})

const DateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Start date must be before end date'
})

// Auth validation schemas
export const authSchemas = {
  login: z.object({
    email: EmailSchema,
    password: z.string().min(1, 'Password is required')
  }),
  
  register: z.object({
    email: EmailSchema,
    password: PasswordSchema,
    name: z.string().min(2, 'Name must be at least 2 characters'),
    farmName: z.string().min(2, 'Farm name is required').optional(),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional()
  }),
  
  forgotPassword: z.object({
    email: EmailSchema
  }),
  
  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: PasswordSchema
  }),
  
  updateProfile: z.object({
    name: z.string().min(2).optional(),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
    timezone: z.string().optional()
  })
}

// Farm validation schemas
export const farmSchemas = {
  create: z.object({
    name: z.string().min(2, 'Farm name must be at least 2 characters').max(100),
    location: z.string().min(2).max(200),
    totalArea: z.number().positive('Total area must be positive'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    description: z.string().max(500).optional(),
    farmType: z.enum(['CROP', 'LIVESTOCK', 'MIXED', 'ORGANIC']).optional()
  }),
  
  update: z.object({
    name: z.string().min(2).max(100).optional(),
    location: z.string().min(2).max(200).optional(),
    totalArea: z.number().positive().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    description: z.string().max(500).optional(),
    farmType: z.enum(['CROP', 'LIVESTOCK', 'MIXED', 'ORGANIC']).optional(),
    isActive: z.boolean().optional()
  }),
  
  list: PaginationSchema.extend({
    search: z.string().optional(),
    isActive: z.boolean().optional(),
    farmType: z.enum(['CROP', 'LIVESTOCK', 'MIXED', 'ORGANIC']).optional()
  })
}

// Field validation schemas
export const fieldSchemas = {
  create: z.object({
    farmId: IdSchema,
    name: z.string().min(2).max(100),
    area: z.number().positive('Area must be positive'),
    cropType: z.string().min(2).max(50),
    soilType: z.enum(['CLAY', 'SANDY', 'LOAM', 'SILT', 'PEAT', 'CHALK']).optional(),
    boundaries: z.array(CoordinatesSchema).min(3, 'Field must have at least 3 boundary points'),
    plantingDate: z.string().datetime().optional(),
    expectedHarvestDate: z.string().datetime().optional()
  }),
  
  update: z.object({
    name: z.string().min(2).max(100).optional(),
    area: z.number().positive().optional(),
    cropType: z.string().min(2).max(50).optional(),
    soilType: z.enum(['CLAY', 'SANDY', 'LOAM', 'SILT', 'PEAT', 'CHALK']).optional(),
    boundaries: z.array(CoordinatesSchema).min(3).optional(),
    plantingDate: z.string().datetime().optional(),
    expectedHarvestDate: z.string().datetime().optional(),
    isActive: z.boolean().optional()
  }),
  
  list: PaginationSchema.extend({
    farmId: IdSchema.optional(),
    cropType: z.string().optional(),
    isActive: z.boolean().optional()
  })
}

// Task validation schemas
export const taskSchemas = {
  create: z.object({
    title: z.string().min(2).max(200),
    description: z.string().max(1000).optional(),
    dueDate: z.string().datetime(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    category: z.enum(['PLANTING', 'WATERING', 'FERTILIZING', 'PEST_CONTROL', 'HARVESTING', 'MAINTENANCE', 'OTHER']),
    farmId: IdSchema.optional(),
    fieldId: IdSchema.optional(),
    assignedToId: IdSchema.optional(),
    recurring: z.boolean().default(false),
    recurrencePattern: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional()
  }),
  
  update: z.object({
    title: z.string().min(2).max(200).optional(),
    description: z.string().max(1000).optional(),
    dueDate: z.string().datetime().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    category: z.enum(['PLANTING', 'WATERING', 'FERTILIZING', 'PEST_CONTROL', 'HARVESTING', 'MAINTENANCE', 'OTHER']).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    completedAt: z.string().datetime().optional()
  }),
  
  list: PaginationSchema.extend({
    farmId: IdSchema.optional(),
    fieldId: IdSchema.optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    category: z.enum(['PLANTING', 'WATERING', 'FERTILIZING', 'PEST_CONTROL', 'HARVESTING', 'MAINTENANCE', 'OTHER']).optional(),
    dateRange: DateRangeSchema.optional()
  })
}

// Crop validation schemas
export const cropSchemas = {
  create: z.object({
    farmId: IdSchema,
    fieldId: IdSchema,
    cropType: z.string().min(2).max(50),
    variety: z.string().min(2).max(100).optional(),
    plantingDate: z.string().datetime(),
    expectedHarvestDate: z.string().datetime(),
    plantingDensity: z.number().positive().optional(),
    estimatedYield: z.number().positive().optional(),
    yieldUnit: z.string().max(20).optional()
  }),
  
  update: z.object({
    status: z.enum(['PLANNED', 'PLANTED', 'GROWING', 'HARVESTED', 'FAILED']).optional(),
    actualHarvestDate: z.string().datetime().optional(),
    actualYield: z.number().positive().optional(),
    notes: z.string().max(1000).optional()
  }),
  
  list: PaginationSchema.extend({
    farmId: IdSchema.optional(),
    fieldId: IdSchema.optional(),
    cropType: z.string().optional(),
    status: z.enum(['PLANNED', 'PLANTED', 'GROWING', 'HARVESTED', 'FAILED']).optional(),
    season: z.string().optional()
  })
}

// Financial validation schemas
export const financialSchemas = {
  createTransaction: z.object({
    farmId: IdSchema,
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(2).max(50),
    amount: z.number().positive('Amount must be positive'),
    transactionDate: z.string().datetime(),
    description: z.string().max(500),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'OTHER']).optional(),
    receiptUrl: z.string().url().optional(),
    tags: z.array(z.string()).max(10).optional()
  }),
  
  updateTransaction: z.object({
    category: z.string().min(2).max(50).optional(),
    amount: z.number().positive().optional(),
    transactionDate: z.string().datetime().optional(),
    description: z.string().max(500).optional(),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'OTHER']).optional(),
    receiptUrl: z.string().url().optional(),
    tags: z.array(z.string()).max(10).optional()
  }),
  
  listTransactions: PaginationSchema.extend({
    farmId: IdSchema.optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().optional(),
    dateRange: DateRangeSchema.optional(),
    minAmount: z.number().positive().optional(),
    maxAmount: z.number().positive().optional()
  })
}

// Weather validation schemas
export const weatherSchemas = {
  current: CoordinatesSchema.extend({
    farmId: IdSchema.optional()
  }),
  
  forecast: CoordinatesSchema.extend({
    farmId: IdSchema.optional(),
    days: z.coerce.number().int().min(1).max(10).default(7)
  }),
  
  historical: CoordinatesSchema.extend({
    farmId: IdSchema.optional(),
    dateRange: DateRangeSchema
  }),
  
  alerts: z.object({
    farmId: IdSchema.optional(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EXTREME']).optional(),
    active: z.boolean().optional()
  })
}

// Satellite validation schemas
export const satelliteSchemas = {
  ndvi: z.object({
    fieldId: IdSchema,
    dateRange: DateRangeSchema.optional()
  }),
  
  imagery: z.object({
    fieldId: IdSchema,
    date: z.string().datetime().optional(),
    resolution: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM')
  }),
  
  analysis: z.object({
    fieldId: IdSchema,
    analysisType: z.enum(['NDVI', 'MOISTURE', 'STRESS', 'GROWTH']),
    dateRange: DateRangeSchema.optional()
  })
}

// ML/AI validation schemas
export const mlSchemas = {
  yieldPrediction: z.object({
    fieldId: IdSchema,
    cropType: z.string().min(2).max(50),
    plantingDate: z.string().datetime(),
    soilData: z.object({
      ph: z.number().min(0).max(14),
      nitrogen: z.number().min(0),
      phosphorus: z.number().min(0),
      potassium: z.number().min(0)
    }).optional()
  }),
  
  diseaseDetection: z.object({
    fieldId: IdSchema,
    imageUrl: z.string().url(),
    cropType: z.string().min(2).max(50)
  }),
  
  recommendation: z.object({
    farmId: IdSchema,
    recommendationType: z.enum(['PLANTING', 'IRRIGATION', 'FERTILIZATION', 'PEST_CONTROL', 'HARVEST'])
  })
}

// Livestock validation schemas
export const livestockSchemas = {
  create: z.object({
    farmId: IdSchema,
    type: z.enum(['CATTLE', 'SHEEP', 'GOATS', 'PIGS', 'POULTRY', 'OTHER']),
    breed: z.string().min(2).max(50),
    identifier: z.string().min(1).max(50),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    weight: z.number().positive().optional(),
    healthStatus: z.enum(['HEALTHY', 'SICK', 'QUARANTINE', 'DECEASED']).default('HEALTHY')
  }),
  
  updateHealth: z.object({
    healthStatus: z.enum(['HEALTHY', 'SICK', 'QUARANTINE', 'DECEASED']),
    weight: z.number().positive().optional(),
    temperature: z.number().optional(),
    symptoms: z.array(z.string()).optional(),
    treatment: z.string().max(500).optional(),
    veterinarianNotes: z.string().max(1000).optional()
  }),
  
  list: PaginationSchema.extend({
    farmId: IdSchema.optional(),
    type: z.enum(['CATTLE', 'SHEEP', 'GOATS', 'PIGS', 'POULTRY', 'OTHER']).optional(),
    healthStatus: z.enum(['HEALTHY', 'SICK', 'QUARANTINE', 'DECEASED']).optional()
  })
}

// Helper function to validate request data
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      throw new ValidationError('Invalid request data', formattedErrors)
    }
    throw error
  }
}

// Custom validation error class
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}