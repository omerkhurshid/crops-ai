#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { produceSeedData, nutritionalSeedData, plantingCalendarSeedData } from './produce-seed-data'

const prisma = new PrismaClient()

async function seedProduceDatabase() {
  console.log('🌱 Starting produce database seeding...')

  try {
    // Seed all produce types with their varieties
    for (const category of Object.keys(produceSeedData) as Array<keyof typeof produceSeedData>) {
      console.log(`\n📦 Seeding ${category}...`)
      
      const produceItems = produceSeedData[category]
      
      for (const produceItem of produceItems) {
        const { varieties, ...produceTypeData } = produceItem as any
        
        console.log(`  🌿 Creating ${produceTypeData.name}...`)
        
        // Create the produce type
        const createdProduceType = await prisma.produceType.upsert({
          where: { name: produceTypeData.name },
          create: produceTypeData,
          update: produceTypeData,
        })
        
        // Create varieties if they exist
        if (varieties && varieties.length > 0) {
          for (const variety of varieties) {
            console.log(`    🌱 Adding variety: ${variety.name}`)
            
            await prisma.produceVariety.upsert({
              where: {
                produceTypeId_name: {
                  produceTypeId: createdProduceType.id,
                  name: variety.name,
                }
              },
              create: {
                ...variety,
                produceTypeId: createdProduceType.id,
              },
              update: {
                ...variety,
                produceTypeId: createdProduceType.id,
              },
            })
          }
        }
      }
    }

    // Seed nutritional data
    console.log('\n🥗 Seeding nutritional data...')
    for (const nutritionData of nutritionalSeedData) {
      const { produceTypeName, ...nutrition } = nutritionData
      
      const produceType = await prisma.produceType.findUnique({
        where: { name: produceTypeName }
      })
      
      if (produceType) {
        console.log(`  🥄 Adding nutrition for ${produceTypeName}`)
        
        await prisma.nutritionalData.upsert({
          where: { produceTypeId: produceType.id },
          create: {
            ...nutrition,
            produceTypeId: produceType.id,
          },
          update: nutrition,
        })
      }
    }

    // Seed planting calendars
    console.log('\n📅 Seeding planting calendars...')
    for (const calendarData of plantingCalendarSeedData) {
      const { produceTypeName, ...calendar } = calendarData
      
      const produceType = await prisma.produceType.findUnique({
        where: { name: produceTypeName }
      })
      
      if (produceType) {
        console.log(`  📆 Adding calendar for ${produceTypeName} - ${calendar.region}`)
        
        await prisma.plantingCalendar.upsert({
          where: {
            produceTypeId_region: {
              produceTypeId: produceType.id,
              region: calendar.region,
            }
          },
          create: {
            ...calendar,
            produceTypeId: produceType.id,
          },
          update: calendar,
        })
      }
    }

    // Generate summary stats
    const stats = {
      produceTypes: await prisma.produceType.count(),
      varieties: await prisma.produceVariety.count(),
      nutritionalProfiles: await prisma.nutritionalData.count(),
      plantingCalendars: await prisma.plantingCalendar.count(),
    }

    console.log('\n✅ Produce database seeding completed!')
    console.log('📊 Summary:')
    console.log(`  • ${stats.produceTypes} produce types`)
    console.log(`  • ${stats.varieties} varieties`)
    console.log(`  • ${stats.nutritionalProfiles} nutritional profiles`)
    console.log(`  • ${stats.plantingCalendars} planting calendars`)

    // Show breakdown by category
    console.log('\n📋 Breakdown by category:')
    for (const category of ['CROPS', 'VEGETABLES', 'FRUITS', 'TREES', 'HERBS', 'NUTS']) {
      const count = await prisma.produceType.count({
        where: { category: category as any }
      })
      if (count > 0) {
        console.log(`  • ${category}: ${count} types`)
      }
    }

  } catch (error) {
    console.error('❌ Error seeding produce database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedProduceDatabase()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedProduceDatabase }