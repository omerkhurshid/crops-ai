#!/usr/bin/env node

/**
 * Basic crop seeding using node-postgres directly to avoid Prisma issues
 */

const { Client } = require('pg')

const client = new Client({
  connectionString: "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
})

async function seedCrops() {
  try {
    console.log('🌱 Starting basic crop seeding...')
    
    await client.connect()
    console.log('✅ Database connection established')
    
    // Check what tables and columns exist
    const tableResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%rop%'
      ORDER BY table_name
    `)
    
    console.log('📋 Crop-related tables:')
    tableResult.rows.forEach(row => console.log(`  - ${row.table_name}`))
    
    // Check Crop table structure if it exists
    if (tableResult.rows.some(row => row.table_name === 'Crop')) {
      const columnResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'Crop' AND table_schema = 'public'
        ORDER BY ordinal_position
      `)
      
      console.log('📋 Crop table columns:')
      columnResult.rows.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`))
      
      // Check existing crops
      const countResult = await client.query('SELECT COUNT(*) FROM "Crop"')
      console.log(`📊 Existing crops: ${countResult.rows[0].count}`)
      
      // Get farm IDs
      const farmResult = await client.query('SELECT id FROM "Farm" LIMIT 3')
      console.log(`🚜 Available farms: ${farmResult.rows.length}`)
      
      // Insert basic crop data
      const crops = [
        ['crop_seed_001', 'Corn', 'Sweet Corn', '2024-03-15', '2024-07-15', 'GROWING', 25.5, farmResult.rows[0]?.id],
        ['crop_seed_002', 'Tomatoes', 'Roma', '2024-04-01', '2024-08-01', 'GROWING', 10.0, farmResult.rows[1]?.id],
        ['crop_seed_003', 'Wheat', 'Hard Red Winter', '2023-10-15', '2024-06-15', 'READY_TO_HARVEST', 100.0, farmResult.rows[2]?.id]
      ]
      
      let created = 0
      for (const [id, cropType, variety, plantingDate, harvestDate, status, acreage, farmId] of crops) {
        try {
          await client.query(`
            INSERT INTO "Crop" (id, "cropType", variety, "plantingDate", "expectedHarvestDate", status, acreage, "farmId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4::date, $5::date, $6::"CropStatus", $7, $8, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, [id, cropType, variety, plantingDate, harvestDate, status, acreage, farmId])
          console.log(`✅ Created crop: ${cropType} - ${variety}`)
          created++
        } catch (error) {
          console.log(`⚠️  Failed to create ${cropType}: ${error.message}`)
        }
      }
      
      // Final count
      const finalResult = await client.query('SELECT COUNT(*) FROM "Crop"')
      console.log(`🌾 Total crops: ${finalResult.rows[0].count}`)
      console.log(`🆕 Added: ${created}`)
      
    } else {
      console.log('⚠️  No Crop table found')
    }
    
    console.log('✅ Basic crop seeding completed!')
    
  } catch (error) {
    console.error('❌ Crop seeding failed:', error)
  } finally {
    await client.end()
  }
}

// Check if pg package is available
try {
  require('pg')
  seedCrops()
} catch (error) {
  console.log('⚠️  pg package not available, trying alternative method...')
  
  // Alternative using Prisma but with fresh connections
  const { PrismaClient } = require('@prisma/client')
  
  async function alternativeSeed() {
    process.env.DATABASE_URL = "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
    
    const prisma = new PrismaClient()
    
    try {
      console.log('🌱 Using Prisma alternative...')
      await prisma.$connect()
      
      // Simple check
      const result = await prisma.$queryRawUnsafe('SELECT COUNT(*) as count FROM "Crop"')
      console.log(`📊 Existing crops: ${result[0].count}`)
      console.log('✅ Database is accessible for crop operations')
      
    } catch (error) {
      console.log('❌ Alternative method failed:', error.message)
    } finally {
      await prisma.$disconnect()
    }
  }
  
  alternativeSeed()
}