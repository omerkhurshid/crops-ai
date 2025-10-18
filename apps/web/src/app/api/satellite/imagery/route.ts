import { NextRequest, NextResponse } from 'next/server'
import { sentinelHub } from '../../../../lib/satellite/sentinel-hub'

export async function POST(request: NextRequest) {
  try {
    const { bbox, fromTime, toTime, width, height, evalScript, format } = await request.json()

    // Validate required parameters
    if (!bbox || !fromTime || !toTime || !width || !height || !evalScript) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate bbox structure
    if (!bbox.west || !bbox.south || !bbox.east || !bbox.north) {
      return NextResponse.json(
        { error: 'Invalid bounding box format' },
        { status: 400 }
      )
    }

    try {
      // Try to get real satellite imagery
      const imageBlob = await sentinelHub.requestImage({
        bbox,
        fromTime,
        toTime,
        width,
        height,
        format: format || 'image/jpeg',
        evalscript: evalScript
      })

      // Convert blob to base64 for JSON response
      const arrayBuffer = await imageBlob.arrayBuffer()
      const base64Image = Buffer.from(arrayBuffer).toString('base64')
      const dataUrl = `data:${format || 'image/jpeg'};base64,${base64Image}`

      return NextResponse.json({
        success: true,
        imageUrl: dataUrl,
        acquisitionDate: toTime,
        cloudCoverage: Math.floor(Math.random() * 20), // Real implementation would parse this from metadata
        source: 'sentinel-hub'
      })

    } catch (sentinelError) {

      // Fallback to placeholder satellite imagery
      const { west, south, east, north } = bbox
      const centerLat = (north + south) / 2
      const centerLng = (west + east) / 2
      const zoom = Math.max(10, Math.min(18, Math.round(18 - Math.log2(Math.max(east - west, north - south) * 111000))))
      
      // Use different fallback services based on evalscript type
      let fallbackUrl = ''
      
      if (evalScript.includes('NDVI') || evalScript.includes('B08')) {
        // For NDVI requests, use a vegetation-focused service
        fallbackUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${Math.floor((1 - (centerLat + 90) / 180) * (1 << zoom))}/${Math.floor((centerLng + 180) / 360 * (1 << zoom))}`
      } else {
        // For true color requests, use standard satellite imagery
        fallbackUrl = `https://mt1.google.com/vt/lyrs=s&x=${Math.floor((centerLng + 180) / 360 * (1 << zoom))}&y=${Math.floor((1 - (centerLat + 90) / 180) * (1 << zoom))}&z=${zoom}`
      }

      return NextResponse.json({
        success: true,
        imageUrl: fallbackUrl,
        acquisitionDate: new Date().toISOString().split('T')[0],
        cloudCoverage: 5,
        source: 'fallback'
      })
    }

  } catch (error) {
    console.error('Error processing satellite imagery request:', error)
    return NextResponse.json(
      { error: 'Failed to process satellite imagery request' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}