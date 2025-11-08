/**
 * Database seeding script for comprehensive livestock data
 * Extends existing livestock event system with detailed breed information
 */
import { PrismaClient } from '@prisma/client'
import { livestockSeedData } from './livestock-seed-data'
const prisma = new PrismaClient()
export async function seedLivestockDatabase() {
  try {
    // Since we don't have a comprehensive livestock schema like crops,
    // we'll create seed data for the existing livestock event system
    // and add reference data for common livestock types
    let totalBreeds = 0
    const livestockTypes = new Set<string>()
    // Extract unique livestock types for enum validation
    for (const livestock of livestockSeedData) {
      const typeKey = livestock.category.toUpperCase()
      livestockTypes.add(typeKey)
      totalBreeds += livestock.varieties.length
    }
    // For now, log the comprehensive data that would be inserted
    // This demonstrates the full livestock information available
    for (const livestock of livestockSeedData) {
      for (const variety of livestock.varieties) {
      }
    }
    // Create reference data that can be used by the existing livestock event system
    const livestockReference = livestockSeedData.map(livestock => ({
      type: livestock.category.toLowerCase().replace('_', '-'),
      name: livestock.name,
      scientificName: livestock.scientificName,
      description: livestock.description,
      primaryPurpose: livestock.primaryPurpose,
      typicalHerdSize: livestock.typicalHerdSize,
      housingRequirements: livestock.housingRequirements,
      marketInfo: {
        demand: livestock.marketDemand,
        avgPrice: livestock.avgPrice,
        priceUnit: livestock.priceUnit
      },
      breedingInfo: {
        lifespan: livestock.lifespan,
        matureWeight: livestock.matureWeight,
        breedingAge: livestock.breedingAge,
        gestationPeriod: livestock.gestationPeriod,
        avgOffspring: livestock.avgOffspring
      },
      healthInfo: {
        commonDiseases: livestock.commonDiseases,
        vaccineSchedule: livestock.vaccineSchedule,
        monitoringParameters: livestock.monitoringParameters
      },
      managementInfo: {
        feedRequirements: livestock.feedRequirements,
        spaceRequirements: livestock.spaceRequirements,
        climateAdaptation: livestock.climateAdaptation
      },
      varieties: livestock.varieties
    }))
    // Store reference data in a way that can be accessed by the application
    // This could be saved to a JSON file or used to populate a reference table
    return {
      success: true,
      livestockTypes: livestockSeedData.length,
      totalBreeds,
      categories: Array.from(livestockTypes),
      referenceData: livestockReference
    }
  } catch (error) {
    console.error('❌ Error processing livestock database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
// Run seeding if called directly
if (require.main === module) {
  seedLivestockDatabase()
    .then((result) => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Livestock database processing failed:', error)
      process.exit(1)
    })
}
/**
 * Enhanced livestock event validation
 * Validates livestock types against comprehensive database
 */
export function validateLivestockType(type: string): boolean {
  const validTypes = livestockSeedData.map(l => l.category.toLowerCase())
  return validTypes.includes(type.toLowerCase())
}
/**
 * Get livestock information by type
 */
export function getLivestockInfo(type: string) {
  return livestockSeedData.find(l => 
    l.category.toLowerCase() === type.toLowerCase() ||
    l.name.toLowerCase() === type.toLowerCase()
  )
}
/**
 * Get all available livestock breeds for a type
 */
export function getLivestockBreeds(type: string) {
  const livestock = getLivestockInfo(type)
  return livestock?.varieties || []
}
/**
 * Enhanced livestock type mappings for the existing enum system
 */
export const livestockTypeMapping = {
  'cattle': ['Holstein', 'Jersey', 'Angus', 'Hereford'],
  'sheep': ['Merino'],
  'goats': ['Saanen'],
  'pigs': ['Yorkshire'],
  'poultry': ['Rhode Island Red', 'Leghorn'],
  'other': ['Horses', 'Alpacas', 'Bees']
}