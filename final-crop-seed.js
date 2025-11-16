#!/usr/bin/env node

/**
 * Final crop seeding that matches exact database schema
 */

const { Client } = require('pg')

const client = new Client({
  connectionString: "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
})

async function seedCrops() {
  try {
    console.log('🌱 Starting final crop seeding...')
    
    await client.connect()
    console.log('✅ Database connection established')
    
    // Check available farms and fields
    const farmResult = await client.query('SELECT id, name FROM "Farm" LIMIT 5')
    const fieldResult = await client.query('SELECT id, name, "farmId" FROM "Field" LIMIT 5') 
    
    console.log(`🚜 Available farms: ${farmResult.rows.length}`)
    farmResult.rows.forEach(farm => console.log(`  - ${farm.id}: ${farm.name}`))
    
    console.log(`🏞️ Available fields: ${fieldResult.rows.length}`)
    fieldResult.rows.forEach(field => console.log(`  - ${field.id}: ${field.name} (farm: ${field.farmId})`))
    
    if (farmResult.rows.length === 0 || fieldResult.rows.length === 0) {
      console.log('⚠️  No farms or fields available. Creating sample farm and field first...')
      
      // Create a sample farm
      const farmId = 'farm_seed_001'
      await client.query(`
        INSERT INTO "Farm" (id, name, location, "ownerId", "isActive", "createdAt", "updatedAt")
        VALUES ($1, 'Sample Crops Farm', 'Demo Location', 'demo_user', true, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [farmId])
      console.log('✅ Created sample farm')
      
      // Create a sample field
      const fieldId = 'field_seed_001'
      await client.query(`
        INSERT INTO "Field" (id, name, size, "farmId", "isActive", status, "createdAt", "updatedAt")
        VALUES ($1, 'Demo Field', 50.0, $2, true, 'ACTIVE', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [fieldId, farmId])
      console.log('✅ Created sample field')
      
      // Update our available farms/fields
      const newFarmResult = await client.query('SELECT id FROM "Farm" WHERE id = $1', [farmId])
      const newFieldResult = await client.query('SELECT id, "farmId" FROM "Field" WHERE id = $1', [fieldId])
      
      if (newFarmResult.rows.length > 0 && newFieldResult.rows.length > 0) {
        farmResult.rows = newFarmResult.rows
        fieldResult.rows = newFieldResult.rows
        console.log('✅ Sample farm and field ready for crops')
      }
    }
    
    if (farmResult.rows.length > 0 && fieldResult.rows.length > 0) {
      // Check existing crops
      const countResult = await client.query('SELECT COUNT(*) FROM "Crop"')
      console.log(`📊 Existing crops: ${countResult.rows[0].count}`)
      
      // Insert crops with correct schema
      const crops = [
        {
          id: 'crop_seed_001',
          cropType: 'Corn',
          variety: 'Sweet Corn',
          plantingDate: '2024-03-15',
          expectedHarvestDate: '2024-07-15',
          status: 'GROWING',
          plantingDensity: 30000.0, // seeds per acre
          estimatedYield: 150.0,
          yieldUnit: 'bushels',
          notes: 'High-yielding variety suitable for fresh market',
          farmId: farmResult.rows[0].id,
          fieldId: fieldResult.rows[0].id
        },
        {
          id: 'crop_seed_002',
          cropType: 'Tomatoes',
          variety: 'Roma',
          plantingDate: '2024-04-01',
          expectedHarvestDate: '2024-08-01',
          status: 'GROWING',
          plantingDensity: 5000.0,
          estimatedYield: 40.0,
          yieldUnit: 'tons',
          notes: 'Processing tomatoes for sauce production',
          farmId: farmResult.rows[0].id,
          fieldId: fieldResult.rows[0].id
        },
        {
          id: 'crop_seed_003',
          cropType: 'Wheat',
          variety: 'Hard Red Winter',
          plantingDate: '2023-10-15',
          expectedHarvestDate: '2024-06-15',
          status: 'HARVESTED',
          plantingDensity: 1500000.0,
          estimatedYield: 50.0,
          actualYield: 48.0,
          yieldUnit: 'bushels',
          notes: 'Excellent quality grain, harvest completed',
          farmId: farmResult.rows[0].id,
          fieldId: fieldResult.rows[0].id
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
            crop.status, crop.plantingDensity, crop.estimatedYield, crop.actualYield, 
            crop.yieldUnit, crop.notes, crop.farmId, crop.fieldId
          ])
          console.log(`✅ Created crop: ${crop.cropType} - ${crop.variety}`)
          created++
        } catch (error) {
          console.log(`⚠️  Failed to create ${crop.cropType}: ${error.message}`)
        }
      }
      
      // Final count
      const finalResult = await client.query('SELECT COUNT(*) FROM "Crop"')
      console.log(`🌾 Total crops: ${finalResult.rows[0].count}`)
      console.log(`🆕 Added: ${created}`)
      
      if (created > 0) {
        console.log('✅ Crop database seeding completed successfully!')
      } else {
        console.log('⚠️  No new crops were added (may already exist)')
      }
    } else {
      console.log('❌ Unable to create farms/fields for crop association')
    }
    
  } catch (error) {
    console.error('❌ Crop seeding failed:', error)
  } finally {
    await client.end()
  }
}

seedCrops()