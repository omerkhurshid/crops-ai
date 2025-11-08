import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { prisma } from '../../../../lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const location = formData.get('location') as string
    const timestamp = formData.get('timestamp') as string
    const fieldId = formData.get('fieldId') as string | null
    if (!photo) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
    }
    // Create unique filename
    const fileExtension = photo.name.split('.').pop() || 'jpg'
    const fileName = `${randomUUID()}.${fileExtension}`
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'field-photos')
    await mkdir(uploadDir, { recursive: true })
    // Save file to disk
    const filePath = join(uploadDir, fileName)
    const bytes = await photo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    // Save to database
    const fieldPhoto = await prisma.fieldPhoto.create({
      data: {
        userId: user.id,
        fieldId: fieldId || null,
        fileName: fileName,
        filePath: `/uploads/field-photos/${fileName}`,
        location: location || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        metadata: {
          originalName: photo.name,
          size: photo.size,
          type: photo.type
        }
      }
    })
    return NextResponse.json({
      success: true,
      photoId: fieldPhoto.id,
      filePath: fieldPhoto.filePath
    })
  } catch (error) {
    console.error('Error uploading field photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const fieldId = searchParams.get('fieldId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const where = {
      userId: user.id,
      ...(fieldId && { fieldId })
    }
    const [photos, total] = await Promise.all([
      prisma.fieldPhoto.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          field: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.fieldPhoto.count({ where })
    ])
    return NextResponse.json({
      photos,
      total,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error('Error fetching field photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}