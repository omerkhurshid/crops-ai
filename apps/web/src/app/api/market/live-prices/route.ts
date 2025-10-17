import { NextRequest, NextResponse } from 'next/server'
import { cmePricingService } from '../../../../lib/market/cme-pricing'
import { getCurrentUser } from '../../../../lib/auth/session'
import { prisma } from '../../../../lib/prisma'

/**
 * Get live commodity prices
 * GET /api/market/live-prices?symbols=ZC,ZW,ZS
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get('symbols')
    const includeHistory = searchParams.get('history') === 'true'

    // Get user's commodity preferences
    let symbols: string[]
    
    if (symbolsParam) {
      symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase())
    } else {
      // Use default commodity symbols for now
      // User preferences implementation pending
      symbols = ['CORN', 'WHEAT', 'SOYBEANS']
    }

    // Get current prices
    const prices = await cmePricingService.getMultiplePrices(symbols)
    
    // Optionally include price history
    let historicalData = null
    if (includeHistory) {
      const historyPromises = symbols.map(symbol => 
        cmePricingService.getPriceHistory(symbol, 30)
      )
      const histories = await Promise.all(historyPromises)
      historicalData = histories.filter(h => h !== null)
    }

    // Cache prices to database for performance
    try {
      for (const price of prices) {
        await prisma.marketPrice.create({
          data: {
            commodity: price.name,
            market: price.exchange,
            price: price.price,
            currency: price.currency,
            unit: price.unit,
            date: new Date(price.sessionDate)
          }
        })
      }
    } catch (cacheError) {
      console.error('Error caching market prices:', cacheError)
      // Don't fail the request if caching fails - prices may already exist for today
    }

    return NextResponse.json({
      success: true,
      data: {
        prices,
        historical: historicalData,
        timestamp: new Date().toISOString(),
        source: cmePricingService.isConfigured() ? 'CME Group API' : 'Mock Data'
      }
    })

  } catch (error) {
    console.error('Error fetching live market prices:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch market prices',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get market summary with trends and indicators
 * GET /api/market/live-prices/summary
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type = 'agricultural', includeForecast = false } = body

    let marketSummary
    if (type === 'agricultural') {
      marketSummary = await cmePricingService.getAgriculturalPrices()
    } else {
      // Could expand for other market types
      marketSummary = await cmePricingService.getAgriculturalPrices()
    }

    let forecasts = null
    if (includeForecast) {
      const mainSymbols = ['ZC', 'ZW', 'ZS']
      const forecastPromises = mainSymbols.map(symbol => 
        cmePricingService.getPriceForecast(symbol)
      )
      forecasts = await Promise.all(forecastPromises)
      forecasts = forecasts.filter(f => f !== null)
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: marketSummary,
        forecasts,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error generating market summary:', error)
    
    return NextResponse.json({
      error: 'Failed to generate market summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}