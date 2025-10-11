/**
 * API endpoint for searching comprehensive agricultural database crops
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  type: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = searchSchema.safeParse({
      q: searchParams.get('q'),
      limit: searchParams.get('limit'),
      type: searchParams.get('type')
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { q: query, limit, type } = validation.data;

    // For now, return mock data since we haven't populated the database yet
    // In production, this would query the actual comprehensive database
    const mockCrops = [
      {
        id: 'corn_zea_mays',
        name: 'Corn',
        scientific_name: 'Zea mays',
        common_names: ['Maize', 'Sweet corn', 'Field corn'],
        crop_type: 'cereal',
        days_to_maturity_min: 80,
        days_to_maturity_max: 120,
        climate_zones: ['temperate', 'subtropical', 'tropical'],
        varieties: [
          {
            variety_name: 'Pioneer P1151AM',
            yield_potential_kg_per_hectare: 11500,
            disease_resistance: ['corn_borer', 'leaf_blight']
          },
          {
            variety_name: 'DeKalb DKC60-87',
            yield_potential_kg_per_hectare: 12200,
            disease_resistance: ['gray_leaf_spot', 'northern_leaf_blight']
          }
        ]
      },
      {
        id: 'soybean_glycine_max',
        name: 'Soybean',
        scientific_name: 'Glycine max',
        common_names: ['Soybeans', 'Soy'],
        crop_type: 'legume',
        days_to_maturity_min: 100,
        days_to_maturity_max: 140,
        climate_zones: ['temperate', 'subtropical'],
        varieties: [
          {
            variety_name: 'Asgrow AG4632',
            yield_potential_kg_per_hectare: 4500,
            disease_resistance: ['soybean_cyst_nematode', 'sudden_death_syndrome']
          }
        ]
      },
      {
        id: 'wheat_triticum_aestivum',
        name: 'Wheat',
        scientific_name: 'Triticum aestivum',
        common_names: ['Winter wheat', 'Spring wheat', 'Hard wheat'],
        crop_type: 'cereal',
        days_to_maturity_min: 90,
        days_to_maturity_max: 240,
        climate_zones: ['temperate', 'continental'],
        varieties: [
          {
            variety_name: 'WB-Grainfield',
            yield_potential_kg_per_hectare: 6800,
            disease_resistance: ['stripe_rust', 'leaf_rust']
          }
        ]
      },
      {
        id: 'tomato_solanum_lycopersicum',
        name: 'Tomato',
        scientific_name: 'Solanum lycopersicum',
        common_names: ['Tomatoes', 'Cherry tomato', 'Roma tomato'],
        crop_type: 'vegetable',
        days_to_maturity_min: 60,
        days_to_maturity_max: 100,
        climate_zones: ['temperate', 'subtropical', 'tropical'],
        varieties: [
          {
            variety_name: 'Celebrity',
            yield_potential_kg_per_hectare: 75000,
            disease_resistance: ['verticillium_wilt', 'fusarium_wilt']
          }
        ]
      },
      {
        id: 'cotton_gossypium_hirsutum',
        name: 'Cotton',
        scientific_name: 'Gossypium hirsutum',
        common_names: ['Upland cotton', 'American cotton'],
        crop_type: 'fiber',
        days_to_maturity_min: 180,
        days_to_maturity_max: 220,
        climate_zones: ['subtropical', 'tropical'],
        varieties: [
          {
            variety_name: 'FiberMax 9170',
            yield_potential_kg_per_hectare: 1800,
            disease_resistance: ['bacterial_blight', 'fusarium_wilt']
          }
        ]
      }
    ];

    // Filter crops based on search query
    const filteredCrops = mockCrops.filter(crop =>
      crop.name.toLowerCase().includes(query.toLowerCase()) ||
      crop.scientific_name.toLowerCase().includes(query.toLowerCase()) ||
      crop.common_names.some(name => name.toLowerCase().includes(query.toLowerCase())) ||
      (type && crop.crop_type === type)
    ).slice(0, limit);

    return NextResponse.json({
      crops: filteredCrops,
      total: filteredCrops.length,
      query,
      message: 'Mock data - Replace with actual database query when comprehensive database is populated'
    });

    // TODO: Replace mock data with actual database query:
    /*
    const crops = await prisma.crop.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            scientific_name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            common_names: {
              has: query
            }
          }
        ],
        ...(type && { crop_type: type })
      },
      include: {
        varieties: {
          select: {
            variety_name: true,
            yield_potential_kg_per_hectare: true,
            disease_resistance: true
          },
          take: 3
        }
      },
      take: limit
    });

    return NextResponse.json({
      crops: crops.map(crop => ({
        id: crop.id,
        name: crop.name,
        scientific_name: crop.scientific_name,
        common_names: crop.common_names,
        crop_type: crop.crop_type,
        days_to_maturity_min: crop.days_to_maturity_min,
        days_to_maturity_max: crop.days_to_maturity_max,
        climate_zones: crop.climate_zones,
        varieties: crop.varieties
      })),
      total: crops.length
    });
    */

  } catch (error) {
    console.error('Error searching crops:', error);
    return NextResponse.json(
      { error: 'Internal server error while searching crops' },
      { status: 500 }
    );
  }
}