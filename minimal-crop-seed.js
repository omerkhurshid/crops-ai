#!/usr/bin/env node

/**
 * Minimal crop seeding using direct SQL to avoid Prisma schema mismatches
 */

const { PrismaClient } = require('@prisma/client')

process.env.DATABASE_URL = "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

const prisma = new PrismaClient()

async function seedCrops() {
  try {
    console.log('🌱 Starting minimal crop seeding...')
    
    await prisma.$connect()
    console.log('✅ Database connection established')
    
    // Check what columns exist in the Crop table
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Crop' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    
    console.log('📋 Crop table columns:')
    columns.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`))
    
    // Check existing crop count
    const existingCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Crop"`
    console.log(`📊 Existing crops: ${existingCount[0].count}`)
    
    // Get sample farm IDs if they exist
    const farms = await prisma.$queryRaw`SELECT id FROM "Farm" LIMIT 3`
    console.log(`🚜 Found ${farms.length} farms`)
    
    // Insert sample crops using direct SQL to match exact schema
    const sampleCrops = [
      {
        id: 'crop_001',
        cropType: 'Corn',
        variety: 'Sweet Corn',
        plantingDate: '2024-03-15',
        expectedHarvestDate: '2024-07-15',
        status: 'GROWING',
        acreage: 25.5,
        farmId: farms.length > 0 ? farms[0].id : null
      },
      {
        id: 'crop_002', 
        cropType: 'Tomatoes',
        variety: 'Roma',
        plantingDate: '2024-04-01',
        expectedHarvestDate: '2024-08-01',
        status: 'GROWING',
        acreage: 10.0,
        farmId: farms.length > 1 ? farms[1].id : null
      },
      {
        id: 'crop_003',
        cropType: 'Wheat',
        variety: 'Hard Red Winter',
        plantingDate: '2023-10-15',
        expectedHarvestDate: '2024-06-15',
        status: 'READY_TO_HARVEST',
        acreage: 100.0,
        farmId: farms.length > 2 ? farms[2].id : null
      }
    ]
    
    let created = 0
    for (const crop of sampleCrops) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "Crop" (id, "cropType", variety, "plantingDate", "expectedHarvestDate", status, acreage, "farmId", "createdAt", "updatedAt")
          VALUES (${crop.id}, ${crop.cropType}, ${crop.variety}, ${crop.plantingDate}::date, ${crop.expectedHarvestDate}::date, 
                  ${crop.status}::"CropStatus", ${crop.acreage}, ${crop.farmId}, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `
        console.log(`✅ Created crop: ${crop.cropType} - ${crop.variety}`)
        created++
      } catch (error) {
        console.log(`⚠️  Failed to create ${crop.cropType}: ${error.message}`)
      }
    }
    
    // Verify final count
    const finalCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Crop"`
    console.log(`🌾 Total crops in database: ${finalCount[0].count}`)
    console.log(`🆕 New crops added: ${created}`)
    
    console.log('✅ Minimal crop seeding completed!')
    
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