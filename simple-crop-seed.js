#!/usr/bin/env node

/**
 * Simple crop seeding script for existing tables
 */

const { PrismaClient } = require('@prisma/client')

process.env.DATABASE_URL = "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

const prisma = new PrismaClient()

async function seedCrops() {
  try {
    console.log('🌱 Starting crop seeding with existing tables...')
    
    await prisma.$connect()
    console.log('✅ Database connection established')
    
    // Check existing crop count
    const existingCrops = await prisma.crop.count()
    console.log(`📊 Existing crops in database: ${existingCrops}`)
    
    // Get sample farms and fields to associate crops with
    const farms = await prisma.farm.findMany({ take: 5 })
    const fields = await prisma.field.findMany({ take: 5 })
    
    if (farms.length === 0) {
      console.log('⚠️  No farms found - crops will be created without farm association')
    }
    
    const sampleCrops = [
      {
        cropType: 'Corn',
        variety: 'Sweet Corn',
        plantingDate: new Date('2024-03-15'),
        expectedHarvestDate: new Date('2024-07-15'),
        status: 'GROWING',
        acreage: 25.5,
        seedsUsed: 50000,
        expectedYield: 150,
        actualYield: null,
        notes: 'High-yielding variety suitable for fresh market'
      },
      {
        cropType: 'Tomatoes',
        variety: 'Roma',
        plantingDate: new Date('2024-04-01'),
        expectedHarvestDate: new Date('2024-08-01'),
        status: 'GROWING',
        acreage: 10.0,
        seedsUsed: 5000,
        expectedYield: 40,
        actualYield: null,
        notes: 'Processing tomatoes for sauce production'
      },
      {
        cropType: 'Wheat',
        variety: 'Hard Red Winter',
        plantingDate: new Date('2023-10-15'),
        expectedHarvestDate: new Date('2024-06-15'),
        status: 'READY_TO_HARVEST',
        acreage: 100.0,
        seedsUsed: 150000,
        expectedYield: 50,
        actualYield: 48,
        notes: 'Excellent quality grain, ready for harvest'
      },
      {
        cropType: 'Soybeans',
        variety: 'Early Maturity',
        plantingDate: new Date('2024-05-01'),
        expectedHarvestDate: new Date('2024-09-15'),
        status: 'PLANTED',
        acreage: 75.0,
        seedsUsed: 225000,
        expectedYield: 45,
        actualYield: null,
        notes: 'High protein content variety'
      }
    ]
    
    // Create crops, associating with farms/fields if available
    for (let i = 0; i < sampleCrops.length; i++) {
      const cropData = sampleCrops[i]
      
      // Add farm/field association if available
      if (farms.length > 0) {
        cropData.farmId = farms[i % farms.length].id
      }
      if (fields.length > 0) {
        cropData.fieldId = fields[i % fields.length].id
      }
      
      const created = await prisma.crop.create({
        data: cropData
      })
      console.log(`✅ Created crop: ${created.cropType} - ${created.variety}`)
    }
    
    // Verify seeding
    const totalCrops = await prisma.crop.count()
    console.log(`🌾 Total crops in database: ${totalCrops}`)
    console.log(`🆕 New crops added: ${totalCrops - existingCrops}`)
    
    console.log('✅ Crop seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Crop seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  seedCrops()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

module.exports = { seedCrops }