#!/usr/bin/env node

/**
 * Simple final seeding using only existing columns
 */

const { Client } = require('pg')

const client = new Client({
  connectionString: "postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
})

async function seedDatabase() {
  try {
    console.log('🌱 Starting simple database seeding...')
    
    await client.connect()
    console.log('✅ Database connection established')
    
    // Check existing data
    const farmCount = await client.query('SELECT COUNT(*) FROM "Farm"')
    const fieldCount = await client.query('SELECT COUNT(*) FROM "Field"')  
    const cropCount = await client.query('SELECT COUNT(*) FROM "Crop"')
    
    console.log(`📊 Current: ${farmCount.rows[0].count} farms, ${fieldCount.rows[0].count} fields, ${cropCount.rows[0].count} crops`)
    
    if (farmCount.rows[0].count === '0') {
      console.log('🚜 Creating sample farm...')
      
      // Create minimal farm with only required fields
      await client.query(`
        INSERT INTO "Farm" (
          id, name, location, "totalArea", "isActive", "ownerId", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        'demo_farm_001',
        'Demo Agricultural Farm', 
        'Sample Location',
        250.0,
        true,
        'demo_owner'
      ])
      console.log('✅ Created sample farm')
      
      // Create minimal field
      await client.query(`
        INSERT INTO "Field" (
          id, name, size, "farmId", "isActive", status, "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, ['demo_field_001', 'Demo Field', 50.0, 'demo_farm_001', true, 'ACTIVE'])
      console.log('✅ Created sample field')
    }
    
    // Get farm and field for crops
    const farms = await client.query('SELECT id FROM "Farm" LIMIT 1')
    const fields = await client.query('SELECT id FROM "Field" LIMIT 1')
    
    if (farms.rows.length > 0 && fields.rows.length > 0) {
      console.log('🌾 Creating crops...')
      
      const farmId = farms.rows[0].id
      const fieldId = fields.rows[0].id
      
      const crops = [
        ['demo_crop_001', 'Corn', 'Sweet Corn', '2024-03-15', '2024-07-15', 'GROWING', 30000.0, 150.0, 'bushels', 'Demo corn crop'],
        ['demo_crop_002', 'Soybeans', 'Non-GMO', '2024-05-01', '2024-09-15', 'PLANTED', 140000.0, 45.0, 'bushels', 'Demo soybean crop']
      ]
      
      let created = 0
      for (const [id, cropType, variety, plantingDate, harvestDate, status, density, yield_, unit, notes] of crops) {
        try {
          await client.query(`
            INSERT INTO "Crop" (
              id, "cropType", variety, "plantingDate", "expectedHarvestDate", 
              status, "plantingDensity", "estimatedYield", "yieldUnit", 
              notes, "farmId", "fieldId", "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4::timestamp, $5::timestamp, $6::"CropStatus", $7, $8, $9, $10, $11, $12, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, [id, cropType, variety, plantingDate, harvestDate, status, density, yield_, unit, notes, farmId, fieldId])
          
          console.log(`✅ Created crop: ${cropType} - ${variety}`)
          created++
        } catch (error) {
          console.log(`⚠️  Failed to create ${cropType}: ${error.message}`)
        }
      }
      
      // Final count
      const finalCount = await client.query('SELECT COUNT(*) FROM "Crop"')
      console.log(`🌾 Total crops: ${finalCount.rows[0].count}`)
      console.log(`🆕 Added: ${created}`)
      
      console.log('✅ Database seeding completed successfully!')
    } else {
      console.log('❌ No farms/fields available for crops')
    }
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
  } finally {
    await client.end()
  }
}

seedDatabase()