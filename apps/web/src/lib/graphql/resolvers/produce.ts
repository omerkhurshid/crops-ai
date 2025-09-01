import { PrismaClient } from '@crops-ai/database'

const prisma = new PrismaClient()

export const produceResolvers = {
  Query: {
    // Get a single produce type by ID
    produceType: async (_: any, { id }: { id: string }) => {
      return await prisma.produceType.findUnique({
        where: { id },
        include: {
          varieties: true,
          nutritionalData: true,
        },
      })
    },

    // Get all produce types with optional filtering
    produceTypes: async (
      _: any,
      { category, search }: { category?: string; search?: string }
    ) => {
      const where: any = {}

      if (category) {
        where.category = category
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { scientificName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      return await prisma.produceType.findMany({
        where,
        include: {
          varieties: true,
          nutritionalData: true,
        },
        orderBy: { name: 'asc' },
      })
    },

    // Get varieties for a specific produce type
    produceVarieties: async (_: any, { produceTypeId }: { produceTypeId: string }) => {
      return await prisma.produceVariety.findMany({
        where: { produceTypeId },
        include: { produceType: true },
        orderBy: { name: 'asc' },
      })
    },

    // Get nutritional data for a produce type
    nutritionalData: async (_: any, { produceTypeId }: { produceTypeId: string }) => {
      return await prisma.nutritionalData.findUnique({
        where: { produceTypeId },
        include: { produceType: true },
      })
    },

    // Get planting calendar for a produce type and region
    plantingCalendar: async (
      _: any,
      { produceTypeId, region }: { produceTypeId: string; region: string }
    ) => {
      return await prisma.plantingCalendar.findFirst({
        where: {
          produceTypeId,
          region: { contains: region, mode: 'insensitive' },
        },
      })
    },

    // Get recommended crops based on location and season
    recommendedCrops: async (
      _: any,
      { latitude, longitude, season }: { latitude: number; longitude: number; season: string }
    ) => {
      // Determine climate zone based on latitude (simplified)
      let climateZones: string[] = []
      
      if (latitude >= 23.5) {
        climateZones = ['TEMPERATE', 'CONTINENTAL']
      } else if (latitude >= 0) {
        climateZones = ['SUBTROPICAL', 'TROPICAL']
      } else if (latitude >= -23.5) {
        climateZones = ['SUBTROPICAL', 'TROPICAL']
      } else {
        climateZones = ['TEMPERATE', 'CONTINENTAL']
      }

      // Add Mediterranean for specific longitude ranges
      if (latitude >= 30 && latitude <= 45) {
        climateZones.push('MEDITERRANEAN')
      }

      const currentMonth = new Date().getMonth() + 1
      let seasonalFilter: any = {}

      // Filter based on season and current month for planting recommendations
      if (season.toLowerCase() === 'spring') {
        seasonalFilter = {
          OR: [
            { daysToMaturity: { lte: 120 } }, // Fast-growing crops for spring
            { growthHabit: 'ANNUAL' },
          ]
        }
      } else if (season.toLowerCase() === 'fall') {
        seasonalFilter = {
          OR: [
            { daysToMaturity: { lte: 90 } }, // Quick crops for fall
            { coldTolerant: true },
          ]
        }
      }

      return await prisma.produceType.findMany({
        where: {
          climateZones: {
            hasSome: climateZones,
          },
          ...seasonalFilter,
        },
        include: {
          varieties: {
            where: seasonalFilter,
            take: 3, // Limit varieties per type
          },
          nutritionalData: true,
        },
        take: 20, // Limit total recommendations
        orderBy: { name: 'asc' },
      })
    },
  },

  // Resolvers for nested fields
  ProduceType: {
    varieties: async (parent: any) => {
      return await prisma.produceVariety.findMany({
        where: { produceTypeId: parent.id },
        orderBy: { name: 'asc' },
      })
    },

    nutritionalData: async (parent: any) => {
      return await prisma.nutritionalData.findUnique({
        where: { produceTypeId: parent.id },
      })
    },
  },

  ProduceVariety: {
    produceType: async (parent: any) => {
      return await prisma.produceType.findUnique({
        where: { id: parent.produceTypeId },
      })
    },
  },

  NutritionalData: {
    produceType: async (parent: any) => {
      return await prisma.produceType.findUnique({
        where: { id: parent.produceTypeId },
      })
    },
  },

  Mutation: {
    // Create a new produce type (admin only)
    createProduceType: async (_: any, { input }: { input: any }, context: any) => {
      // Add authentication/authorization check here
      // if (!context.user || context.user.role !== 'ADMIN') {
      //   throw new Error('Unauthorized')
      // }

      return await prisma.produceType.create({
        data: {
          ...input,
          varieties: input.varieties ? {
            create: input.varieties
          } : undefined,
          nutritionalData: input.nutritionalData ? {
            create: input.nutritionalData
          } : undefined,
        },
        include: {
          varieties: true,
          nutritionalData: true,
        },
      })
    },

    // Update a produce type
    updateProduceType: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
      // Add authentication/authorization check here
      
      return await prisma.produceType.update({
        where: { id },
        data: input,
        include: {
          varieties: true,
          nutritionalData: true,
        },
      })
    },

    // Delete a produce type
    deleteProduceType: async (_: any, { id }: { id: string }, context: any) => {
      // Add authentication/authorization check here
      
      await prisma.produceType.delete({
        where: { id },
      })
      
      return true
    },

    // Create a new variety for a produce type
    createProduceVariety: async (_: any, { input }: { input: any }, context: any) => {
      return await prisma.produceVariety.create({
        data: input,
        include: { produceType: true },
      })
    },

    // Update nutritional data
    updateNutritionalData: async (_: any, { produceTypeId, input }: { produceTypeId: string; input: any }, context: any) => {
      return await prisma.nutritionalData.upsert({
        where: { produceTypeId },
        create: {
          produceTypeId,
          ...input,
        },
        update: input,
        include: { produceType: true },
      })
    },

    // Create or update planting calendar
    updatePlantingCalendar: async (_: any, { input }: { input: any }, context: any) => {
      const { produceTypeId, region, ...calendarData } = input
      
      return await prisma.plantingCalendar.upsert({
        where: {
          produceTypeId_region: {
            produceTypeId,
            region,
          }
        },
        create: {
          produceTypeId,
          region,
          ...calendarData,
        },
        update: calendarData,
      })
    },
  },
}