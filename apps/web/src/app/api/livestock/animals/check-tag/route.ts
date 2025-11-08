import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../../../lib/auth/server'
import { prisma } from '../../../../../lib/prisma'
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { tagNumber, farmId } = await request.json()
    if (!tagNumber || !farmId) {
      return NextResponse.json(
        { error: 'Missing required fields: tagNumber, farmId' },
        { status: 400 }
      )
    }
    // Check if an animal with this tag number exists on this farm
    const existingAnimal = await prisma.animal.findFirst({
      where: {
        farmId: farmId,
        tagNumber: tagNumber,
        userId: user.id
      }
    })
    return NextResponse.json({ exists: !!existingAnimal })
  } catch (error) {
    console.error('Error checking tag number:', error)
    return NextResponse.json(
      { error: 'Failed to check tag number' },
      { status: 500 }
    )
  }
}