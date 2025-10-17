/**
 * API endpoint for searching comprehensive agricultural database crops
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.string().optional().nullable().transform(val => val ? parseInt(val) : 20),
  type: z.string().optional().nullable()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = searchSchema.safeParse({
      q: searchParams.get('q') || undefined,
      limit: searchParams.get('limit') || undefined,
      type: searchParams.get('type') || undefined
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { q: query, limit, type } = validation.data;

    // Build search conditions
    const whereConditions = query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { scientificName: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } }
      ]
    } : {};

    // Add type filter if specified
    if (type) {
      Object.assign(whereConditions, {
        category: type.toUpperCase()
      });
    }

    const crops = await prisma.produceType.findMany({
      where: whereConditions,
      take: limit,
      include: {
        varieties: {
          take: 5 // Limit varieties per crop for performance
        },
        nutritionalData: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Format response to match expected structure
    const formattedCrops = crops.map(crop => ({
      id: crop.id,
      name: crop.name,
      scientificName: crop.scientificName,
      category: crop.category,
      description: crop.description,
      daysToMaturity: crop.daysToMaturity,
      waterRequirement: crop.waterRequirement,
      sunRequirement: crop.sunRequirement,
      growthHabit: crop.growthHabit,
      companionPlants: crop.companionPlants,
      commonPests: crop.commonPests,
      commonDiseases: crop.commonDiseases,
      varieties: crop.varieties.map(variety => ({
        id: variety.id,
        name: variety.name,
        description: variety.description,
        daysToMaturity: variety.daysToMaturity,
        marketDemand: variety.marketDemand,
        premiumVariety: variety.premiumVariety,
        diseaseResistance: variety.diseaseResistance,
        droughtTolerant: variety.droughtTolerant,
        coldTolerant: variety.coldTolerant,
        heatTolerant: variety.heatTolerant
      })),
      nutritionalData: crop.nutritionalData
    }));

    return NextResponse.json({
      crops: formattedCrops,
      total: crops.length,
      query,
      message: `Found ${crops.length} crops matching your search`
    });

  } catch (error) {
    console.error('Error searching crops:', error);
    return NextResponse.json(
      { error: 'Internal server error while searching crops' },
      { status: 500 }
    );
  }
}