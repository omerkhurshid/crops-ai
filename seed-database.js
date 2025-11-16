#!/usr/bin/env node

/**
 * Temporary database seeding script for production launch
 */

const { PrismaClient } = require('@prisma/client')
const path = require('path')

// Set the correct path for Prisma
process.env.DATABASE_URL = process.env.DATABASE_URL || 
  "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Check connection first
    await prisma.$connect()
    console.log('✅ Database connection established')
    
    // Simple crop data to seed
    const sampleCrops = [
      {
        name: 'Corn',
        scientificName: 'Zea mays',
        category: 'CROPS',
        description: 'Versatile cereal grain for food and feed',
        climateZones: ['TEMPERATE', 'SUBTROPICAL'],
        soilTypes: ['LOAM', 'SANDY_LOAM'],
        waterRequirement: 'HIGH',
        sunRequirement: 'FULL_SUN',
        growthHabit: 'ANNUAL',
        plantingDepth: 1.5,
        daysToMaturity: 100,
        companionPlants: ['Beans', 'Squash'],
        incompatibleWith: ['Tomato'],
        commonPests: ['Corn Borer', 'Armyworm'],
        commonDiseases: ['Gray Leaf Spot', 'Rust']
      },
      {
        name: 'Tomato',
        scientificName: 'Solanum lycopersicum',
        category: 'VEGETABLES',
        description: 'Popular vegetable for fresh consumption and processing',
        climateZones: ['TEMPERATE', 'SUBTROPICAL'],
        soilTypes: ['LOAM', 'SANDY_LOAM'],
        waterRequirement: 'MODERATE',
        sunRequirement: 'FULL_SUN', 
        growthHabit: 'ANNUAL',
        plantingDepth: 0.25,
        daysToMaturity: 75,
        companionPlants: ['Basil', 'Pepper'],
        incompatibleWith: ['Corn', 'Fennel'],
        commonPests: ['Hornworm', 'Aphids'],
        commonDiseases: ['Blight', 'Wilt']
      }
    ]
    
    // Clear existing data (development only)
    if (process.env.NODE_ENV !== 'production') {
      await prisma.nutritionalData.deleteMany()
      await prisma.produceVariety.deleteMany()  
      await prisma.produceType.deleteMany()
      console.log('🧹 Cleared existing crop data')
    }
    
    // Insert sample crops
    for (const crop of sampleCrops) {
      const created = await prisma.produceType.create({
        data: crop
      })
      console.log(`✅ Created crop: ${created.name}`)
    }
    
    // Verify seeding
    const cropCount = await prisma.produceType.count()
    console.log(`🌾 Total crops in database: ${cropCount}`)
    
    console.log('✅ Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

module.exports = { seedDatabase }