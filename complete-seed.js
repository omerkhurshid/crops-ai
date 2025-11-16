#!/usr/bin/env node

/**
 * Complete database seeding that handles all required fields
 */

const { Client } = require('pg')

const client = new Client({
  connectionString: "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
})

async function seedDatabase() {
  try {
    console.log('🌱 Starting complete database seeding...')
    
    await client.connect()
    console.log('✅ Database connection established')
    
    // First check what's required for Farm table
    const farmColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Farm' AND table_schema = 'public'
      ORDER BY ordinal_position
    `)
    
    console.log('📋 Farm table schema:')
    farmColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`)
    })
    
    // Check existing data
    const farmCount = await client.query('SELECT COUNT(*) FROM "Farm"')
    const fieldCount = await client.query('SELECT COUNT(*) FROM "Field"')
    const cropCount = await client.query('SELECT COUNT(*) FROM "Crop"')
    
    console.log(`📊 Current data: ${farmCount.rows[0].count} farms, ${fieldCount.rows[0].count} fields, ${cropCount.rows[0].count} crops`)
    
    if (farmCount.rows[0].count === '0') {
      console.log('🚜 Creating sample farm with all required fields...')
      
      // Create a complete farm record
      const farmId = 'farm_demo_001'
      await client.query(`
        INSERT INTO "Farm" (
          id, name, location, "totalArea", "usedArea", latitude, longitude, 
          timezone, "isActive", "ownerId", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        farmId, 
        'Demo Agricultural Farm',
        'Midwest USA', 
        250.0, // totalArea
        150.0, // usedArea 
        41.8781, // latitude (Iowa)
        -93.0977, // longitude (Iowa)
        'America/Chicago',
        true,
        'demo_owner_001'
      ])
      console.log('✅ Created sample farm')
      
      // Create sample field
      const fieldId = 'field_demo_001'
      await client.query(`
        INSERT INTO "Field" (
          id, name, size, "farmId", "isActive", status, "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [fieldId, 'North Field', 50.0, farmId, true, 'ACTIVE'])
      console.log('✅ Created sample field')
    }
    
    // Now get available farms and fields
    const farms = await client.query('SELECT id FROM "Farm" LIMIT 1')
    const fields = await client.query('SELECT id, "farmId" FROM "Field" LIMIT 1')
    
    if (farms.rows.length > 0 && fields.rows.length > 0) {
      console.log('🌾 Creating sample crops...')
      
      const crops = [
        {
          id: 'crop_demo_001',
          cropType: 'Corn',
          variety: 'Pioneer 1234',
          plantingDate: '2024-03-15',
          expectedHarvestDate: '2024-09-15',
          status: 'GROWING',
          plantingDensity: 32000,
          estimatedYield: 180,
          yieldUnit: 'bushels/acre',
          notes: 'High-yield hybrid corn for grain production',
          farmId: farms.rows[0].id,
          fieldId: fields.rows[0].id
        },
        {
          id: 'crop_demo_002', 
          cropType: 'Soybeans',
          variety: 'Asgrow AG2032',
          plantingDate: '2024-05-01',
          expectedHarvestDate: '2024-09-30',
          status: 'PLANTED',
          plantingDensity: 140000,
          estimatedYield: 50,
          yieldUnit: 'bushels/acre',
          notes: 'High-protein soybeans for livestock feed',
          farmId: farms.rows[0].id,
          fieldId: fields.rows[0].id
        }
      ]
      
      let created = 0
      for (const crop of crops) {
        try {
          await client.query(`
            INSERT INTO "Crop" (
              id, "cropType", variety, "plantingDate", "expectedHarvestDate", 
              status, "plantingDensity", "estimatedYield", "yieldUnit", 
              notes, "farmId", "fieldId", "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4::timestamp, $5::timestamp, $6::"CropStatus", $7, $8, $9, $10, $11, $12, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, [
            crop.id, crop.cropType, crop.variety, crop.plantingDate, crop.expectedHarvestDate,
            crop.status, crop.plantingDensity, crop.estimatedYield, crop.yieldUnit,
            crop.notes, crop.farmId, crop.fieldId
          ])
          console.log(`✅ Created crop: ${crop.cropType} - ${crop.variety}`)
          created++
        } catch (error) {
          console.log(`⚠️  Failed to create ${crop.cropType}: ${error.message}`)
        }
      }
      
      // Final verification
      const finalCounts = await Promise.all([
        client.query('SELECT COUNT(*) FROM "Farm"'),
        client.query('SELECT COUNT(*) FROM "Field"'),
        client.query('SELECT COUNT(*) FROM "Crop"')
      ])
      
      console.log(`📊 Final data: ${finalCounts[0].rows[0].count} farms, ${finalCounts[1].rows[0].count} fields, ${finalCounts[2].rows[0].count} crops`)
      console.log(`🆕 Added ${created} new crops`)
      
      if (created > 0 || finalCounts[2].rows[0].count > 0) {
        console.log('✅ Database seeding completed successfully!')
        console.log('🌾 The platform now has sample agricultural data for demonstration')
      }
    } else {
      console.log('❌ Could not establish farm/field structure for crops')
    }
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
  } finally {
    await client.end()
  }
}

seedDatabase()