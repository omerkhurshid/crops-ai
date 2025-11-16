#!/usr/bin/env node

/**
 * Complete final seeding that creates all required dependencies
 */

const { Client } = require('pg')

const client = new Client({
  connectionString: "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
})

async function seedDatabase() {
  try {
    console.log('🌱 Starting complete final seeding...')
    
    await client.connect()
    console.log('✅ Database connection established')
    
    // Check existing users
    const userResult = await client.query('SELECT id, name FROM "User" LIMIT 5')
    console.log(`👥 Existing users: ${userResult.rows.length}`)
    
    let userId
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id
      console.log(`🎯 Using existing user: ${userResult.rows[0].name} (${userId})`)
    } else {
      console.log('👤 Creating demo user...')
      userId = 'demo_user_001'
      
      // Create a demo user first
      await client.query(`
        INSERT INTO "User" (
          id, name, email, role, "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [userId, 'Demo Farmer', 'demo@crops.ai', 'FARM_OWNER'])
      console.log('✅ Created demo user')
    }
    
    // Now create farm with valid owner
    const farmResult = await client.query('SELECT id FROM "Farm" LIMIT 1')
    let farmId
    
    if (farmResult.rows.length > 0) {
      farmId = farmResult.rows[0].id
      console.log(`🎯 Using existing farm: ${farmId}`)
    } else {
      console.log('🚜 Creating demo farm...')
      farmId = 'demo_farm_001'
      
      await client.query(`
        INSERT INTO "Farm" (
          id, name, location, "totalArea", "isActive", "ownerId", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO NOTHING
      `, [farmId, 'Demo Agricultural Farm', 'Sample Location, USA', 250.0, true, userId])
      console.log('✅ Created demo farm')
    }
    
    // Create field
    const fieldResult = await client.query('SELECT id FROM "Field" WHERE "farmId" = $1 LIMIT 1', [farmId])
    let fieldId
    
    if (fieldResult.rows.length > 0) {
      fieldId = fieldResult.rows[0].id
      console.log(`🎯 Using existing field: ${fieldId}`)
    } else {
      console.log('🏞️ Creating demo field...')
      fieldId = 'demo_field_001'
      
      await client.query(`
        INSERT INTO "Field" (
          id, name, size, "farmId", "isActive", status, "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [fieldId, 'North Field', 75.0, farmId, true, 'ACTIVE'])
      console.log('✅ Created demo field')
    }
    
    // Create crops
    console.log('🌾 Creating demo crops...')
    
    const crops = [
      {
        id: 'demo_crop_001',
        cropType: 'Corn',
        variety: 'Pioneer P1234',
        plantingDate: '2024-04-15',
        expectedHarvestDate: '2024-09-15', 
        status: 'GROWING',
        plantingDensity: 32000,
        estimatedYield: 175,
        yieldUnit: 'bushels/acre',
        notes: 'High-yield hybrid corn, excellent for grain production'
      },
      {
        id: 'demo_crop_002',
        cropType: 'Soybeans', 
        variety: 'Asgrow AG2632',
        plantingDate: '2024-05-10',
        expectedHarvestDate: '2024-10-01',
        status: 'GROWING',
        plantingDensity: 140000,
        estimatedYield: 52,
        yieldUnit: 'bushels/acre', 
        notes: 'High-protein variety, ideal for livestock feed'
      },
      {
        id: 'demo_crop_003',
        cropType: 'Wheat',
        variety: 'WB-Cedar',
        plantingDate: '2023-09-20',
        expectedHarvestDate: '2024-06-15',
        status: 'HARVESTED',
        plantingDensity: 1800000,
        estimatedYield: 65,
        actualYield: 62,
        yieldUnit: 'bushels/acre',
        notes: 'Winter wheat, harvested successfully with good quality'
      }
    ]
    
    let created = 0
    for (const crop of crops) {
      try {
        await client.query(`
          INSERT INTO "Crop" (
            id, "cropType", variety, "plantingDate", "expectedHarvestDate", 
            status, "plantingDensity", "estimatedYield", "actualYield", "yieldUnit",
            notes, "farmId", "fieldId", "createdAt", "updatedAt"
          )
          VALUES ($1, $2, $3, $4::timestamp, $5::timestamp, $6::"CropStatus", $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, [
          crop.id, crop.cropType, crop.variety, crop.plantingDate, crop.expectedHarvestDate,
          crop.status, crop.plantingDensity, crop.estimatedYield, crop.actualYield, crop.yieldUnit,
          crop.notes, farmId, fieldId
        ])
        console.log(`✅ Created: ${crop.cropType} - ${crop.variety} (${crop.status})`)
        created++
      } catch (error) {
        console.log(`⚠️  Failed to create ${crop.cropType}: ${error.message}`)
      }
    }
    
    // Final verification
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM "User"'),
      client.query('SELECT COUNT(*) FROM "Farm"'),
      client.query('SELECT COUNT(*) FROM "Field"'),
      client.query('SELECT COUNT(*) FROM "Crop"')
    ])
    
    console.log('\n📊 Final database state:')
    console.log(`  👥 Users: ${counts[0].rows[0].count}`)
    console.log(`  🚜 Farms: ${counts[1].rows[0].count}`)
    console.log(`  🏞️ Fields: ${counts[2].rows[0].count}`)
    console.log(`  🌾 Crops: ${counts[3].rows[0].count}`)
    console.log(`  🆕 Added ${created} new crops`)
    
    console.log('\n✅ Database seeding completed successfully!')
    console.log('🌟 The Crops.AI platform now has demo agricultural data')
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
  } finally {
    await client.end()
  }
}

seedDatabase()