#!/usr/bin/env node

/**
 * Final working database seeding with correct schema
 */

const { Client } = require('pg')

const client = new Client({
  connectionString: "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
})

async function seedDatabase() {
  try {
    console.log('🌱 Starting final working seeding...')
    
    await client.connect()
    console.log('✅ Database connected')
    
    // Check existing data
    const existingCounts = await Promise.all([
      client.query('SELECT COUNT(*) FROM "User"'),
      client.query('SELECT COUNT(*) FROM "Farm"'),
      client.query('SELECT COUNT(*) FROM "Field"'),
      client.query('SELECT COUNT(*) FROM "Crop"')
    ])
    
    console.log(`📊 Current: ${existingCounts[0].rows[0].count} users, ${existingCounts[1].rows[0].count} farms, ${existingCounts[2].rows[0].count} fields, ${existingCounts[3].rows[0].count} crops`)
    
    let userId = 'demo_user_001'
    let farmId = 'demo_farm_001'  
    let fieldId = 'demo_field_001'
    
    // Create user if needed
    if (existingCounts[0].rows[0].count === '0') {
      console.log('👤 Creating demo user...')
      await client.query(`
        INSERT INTO "User" (
          id, name, email, role, "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [userId, 'Demo Farmer', 'demo@crops.ai', 'FARM_OWNER'])
      console.log('✅ Created demo user')
    } else {
      // Use existing user
      const user = await client.query('SELECT id FROM "User" LIMIT 1')
      userId = user.rows[0].id
    }
    
    // Create farm if needed
    if (existingCounts[1].rows[0].count === '0') {
      console.log('🚜 Creating demo farm...')
      await client.query(`
        INSERT INTO "Farm" (
          id, name, location, "totalArea", "isActive", "ownerId", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO NOTHING
      `, [farmId, 'Demo Agricultural Farm', 'Iowa, USA', 250.0, true, userId])
      console.log('✅ Created demo farm')
    } else {
      // Use existing farm
      const farm = await client.query('SELECT id FROM "Farm" LIMIT 1')
      farmId = farm.rows[0].id
    }
    
    // Create field if needed (using correct 'area' column)
    if (existingCounts[2].rows[0].count === '0') {
      console.log('🏞️ Creating demo field...')
      await client.query(`
        INSERT INTO "Field" (
          id, name, area, "isActive", status, "farmId", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [fieldId, 'North Field', 75.0, true, 'ACTIVE', farmId])
      console.log('✅ Created demo field')
    } else {
      // Use existing field
      const field = await client.query('SELECT id FROM "Field" LIMIT 1')
      fieldId = field.rows[0].id
    }
    
    // Now create crops
    console.log('🌾 Creating demo crops...')
    
    const crops = [
      {
        id: 'crop_001',
        cropType: 'Corn',
        variety: 'Pioneer P1151',
        plantingDate: '2024-04-20',
        expectedHarvestDate: '2024-09-20',
        status: 'GROWING',
        plantingDensity: 32000,
        estimatedYield: 180,
        yieldUnit: 'bushels/acre',
        notes: 'High-yield hybrid corn for grain production. Planted with precision planter.'
      },
      {
        id: 'crop_002',
        cropType: 'Soybeans',
        variety: 'Asgrow AG3032',
        plantingDate: '2024-05-15',
        expectedHarvestDate: '2024-10-05',
        status: 'GROWING',
        plantingDensity: 140000,
        estimatedYield: 55,
        yieldUnit: 'bushels/acre',
        notes: 'High-protein soybeans. Good for rotation after corn.'
      },
      {
        id: 'crop_003',
        cropType: 'Winter Wheat',
        variety: 'WB-Cedar',
        plantingDate: '2023-09-25',
        expectedHarvestDate: '2024-06-20',
        status: 'HARVESTED',
        plantingDensity: 1800000,
        estimatedYield: 65,
        actualYield: 68,
        yieldUnit: 'bushels/acre',
        notes: 'Winter wheat crop harvested successfully. Excellent protein content.'
      },
      {
        id: 'crop_004',
        cropType: 'Tomatoes',
        variety: 'Roma VF',
        plantingDate: '2024-05-01',
        expectedHarvestDate: '2024-08-15',
        status: 'GROWING',
        plantingDensity: 8000,
        estimatedYield: 40,
        yieldUnit: 'tons/acre',
        notes: 'Processing tomatoes for local cannery. Irrigated field.'
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
        console.log(`✅ ${crop.cropType} - ${crop.variety} (${crop.status})`)
        created++
      } catch (error) {
        console.log(`⚠️  Failed ${crop.cropType}: ${error.message}`)
      }
    }
    
    // Final verification
    const finalCounts = await Promise.all([
      client.query('SELECT COUNT(*) FROM "User"'),
      client.query('SELECT COUNT(*) FROM "Farm"'),
      client.query('SELECT COUNT(*) FROM "Field"'),
      client.query('SELECT COUNT(*) FROM "Crop"')
    ])
    
    console.log('\n📊 Final results:')
    console.log(`  👥 Users: ${finalCounts[0].rows[0].count}`)
    console.log(`  🚜 Farms: ${finalCounts[1].rows[0].count}`)
    console.log(`  🏞️ Fields: ${finalCounts[2].rows[0].count}`)
    console.log(`  🌾 Crops: ${finalCounts[3].rows[0].count}`)
    console.log(`  ✨ New crops: ${created}`)
    
    if (created > 0) {
      console.log('\n🎉 SUCCESS: Database seeding completed!')
      console.log('🌟 Crops.AI platform now has agricultural demo data')
      console.log('📈 Ready for production use with sample crops')
    } else {
      console.log('\n✅ Database already populated with crop data')
    }
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
  } finally {
    await client.end()
  }
}

seedDatabase()