/**
 * Database seeding script for comprehensive crop data
 * Populates ProduceType, ProduceVariety, and NutritionalData tables
 */

import { PrismaClient } from '@prisma/client'
import { cropSeedData } from './crop-seed-data'

const prisma = new PrismaClient()

export async function seedCropsDatabase() {
  console.log('🌱 Seeding comprehensive crop database...')
  
  try {
    // Clear existing data (in development only)
    if (process.env.NODE_ENV === 'development') {
      await prisma.nutritionalData.deleteMany()
      await prisma.produceVariety.deleteMany()
      await prisma.produceType.deleteMany()
      console.log('🧹 Cleared existing crop data')
    }

    let totalCrops = 0
    let totalVarieties = 0

    for (const crop of cropSeedData) {
      // Create the main crop/produce type
      const produceType = await prisma.produceType.create({
        data: {
          name: crop.name,
          scientificName: crop.scientificName,
          category: crop.category,
          description: crop.description,
          climateZones: crop.climateZones,
          hardinessZoneMin: crop.hardinessZoneMin,
          hardinessZoneMax: crop.hardinessZoneMax,
          soilTypes: crop.soilTypes,
          soilPhMin: crop.soilPhMin,
          soilPhMax: crop.soilPhMax,
          waterRequirement: crop.waterRequirement,
          sunRequirement: crop.sunRequirement,
          growthHabit: crop.growthHabit,
          plantingDepth: crop.plantingDepth,
          plantSpacing: crop.plantSpacing,
          rowSpacing: crop.rowSpacing,
          germinationDays: crop.germinationDays,
          daysToMaturity: crop.daysToMaturity,
          matureHeight: crop.matureHeight,
          matureSpread: crop.matureSpread,
          companionPlants: crop.companionPlants,
          incompatibleWith: crop.incompatibleWith,
          commonPests: crop.commonPests,
          commonDiseases: crop.commonDiseases
        }
      })

      totalCrops++
      console.log(`✅ Created crop: ${crop.name}`)

      // Create varieties for this crop
      for (const variety of crop.varieties) {
        await prisma.produceVariety.create({
          data: {
            produceTypeId: produceType.id,
            name: variety.name,
            description: variety.description,
            daysToMaturity: variety.daysToMaturity,
            yieldPerPlant: variety.yieldPerPlant,
            yieldUnit: variety.yieldUnit,
            marketDemand: variety.marketDemand,
            premiumVariety: variety.premiumVariety || false,
            diseaseResistance: variety.diseaseResistance,
            droughtTolerant: variety.droughtTolerant || false,
            coldTolerant: variety.coldTolerant || false,
            heatTolerant: variety.heatTolerant || false,
            color: variety.color,
            size: variety.size,
            shape: variety.shape
          }
        })
        totalVarieties++
      }

      // Create nutritional data if available
      if (crop.nutritionalData) {
        await prisma.nutritionalData.create({
          data: {
            produceTypeId: produceType.id,
            calories: crop.nutritionalData.calories,
            protein: crop.nutritionalData.protein,
            carbohydrates: crop.nutritionalData.carbohydrates,
            fiber: crop.nutritionalData.fiber,
            sugar: crop.nutritionalData.sugar,
            fat: crop.nutritionalData.fat,
            vitaminA: crop.nutritionalData.vitaminA,
            vitaminC: crop.nutritionalData.vitaminC,
            calcium: crop.nutritionalData.calcium,
            iron: crop.nutritionalData.iron,
            potassium: crop.nutritionalData.potassium
          }
        })
      }
    }

    console.log(`🎉 Successfully seeded ${totalCrops} crops with ${totalVarieties} varieties`)
    
    // Verify the data
    const cropCount = await prisma.produceType.count()
    const varietyCount = await prisma.produceVariety.count()
    const nutritionCount = await prisma.nutritionalData.count()
    
    console.log(`📊 Database contains:`)
    console.log(`   - ${cropCount} crop types`)
    console.log(`   - ${varietyCount} varieties`)
    console.log(`   - ${nutritionCount} nutritional profiles`)

    return {
      success: true,
      crops: cropCount,
      varieties: varietyCount,
      nutritionalProfiles: nutritionCount
    }

  } catch (error) {
    console.error('❌ Error seeding crop database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedCropsDatabase()
    .then(() => {
      console.log('✅ Crop database seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Crop database seeding failed:', error)
      process.exit(1)
    })
}