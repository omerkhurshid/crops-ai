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

    // Crop database not yet implemented - return error instead of mock data
    return NextResponse.json({
      error: 'Crop database not available',
      message: 'The comprehensive crop database is not yet implemented. Please contact support for assistance with crop selection.',
      crops: [],
      total: 0,
      query
    }, { status: 501 })

    // TODO: Implement actual database query when crop database is ready:
    /*
    const crops = await prisma.crop.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { scientific_name: { contains: query, mode: 'insensitive' } },
          { common_names: { has: query } },
          { crop_type: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      include: {
        varieties: true
      }
    });
    
    return NextResponse.json({
      crops,
      total: crops.length,
      query
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