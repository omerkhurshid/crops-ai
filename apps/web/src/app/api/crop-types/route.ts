import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Fetch crop types from the database
    const cropTypes = await prisma.produceType.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        scientificName: true,
        description: true,
        climateZones: true,
        growthHabit: true,
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Group by category for better organization
    const groupedCrops = cropTypes.reduce((acc: any, crop) => {
      if (!acc[crop.category]) {
        acc[crop.category] = []
      }
      acc[crop.category].push({
        id: crop.id,
        name: crop.name,
        category: crop.category,
        scientificName: crop.scientificName,
        description: crop.description,
        climateZones: crop.climateZones,
        growthHabit: crop.growthHabit
      })
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      crops: cropTypes.map(crop => ({
        id: crop.id,
        name: crop.name,
        category: crop.category,
        scientificName: crop.scientificName,
        description: crop.description,
        climateZones: crop.climateZones,
        growthHabit: crop.growthHabit
      })),
      groupedCrops
    })
  } catch (error) {
    console.error('Error fetching crop types:', error)
    
    // Return fallback data if database query fails
    const fallbackCrops = [
      { id: '1', name: 'Corn', category: 'Grains', scientificName: 'Zea mays' },
      { id: '2', name: 'Soybeans', category: 'Legumes', scientificName: 'Glycine max' },
      { id: '3', name: 'Wheat', category: 'Grains', scientificName: 'Triticum aestivum' },
      { id: '4', name: 'Tomatoes', category: 'Vegetables', scientificName: 'Solanum lycopersicum' },
      { id: '5', name: 'Cotton', category: 'Cash Crops', scientificName: 'Gossypium' },
      { id: '6', name: 'Rice', category: 'Grains', scientificName: 'Oryza sativa' },
      { id: '7', name: 'Potatoes', category: 'Vegetables', scientificName: 'Solanum tuberosum' },
      { id: '8', name: 'Apples', category: 'Fruits', scientificName: 'Malus domestica' },
      { id: '9', name: 'Lettuce', category: 'Vegetables', scientificName: 'Lactuca sativa' },
      { id: '10', name: 'Carrots', category: 'Vegetables', scientificName: 'Daucus carota' },
    ]
    
    return NextResponse.json({
      success: true,
      crops: fallbackCrops,
      fallback: true
    })
  }
}