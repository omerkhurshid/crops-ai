'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  TrendingUp, 
  Star, 
  Plus, 
  Info,
  Wheat,
  Beef,
  DollarSign
} from 'lucide-react'
import { COMMODITY_TIERS } from '../../lib/market/commodity-tiers'
interface CommoditySelectorProps {
  userId: string
  currentCommodities: string[]
  onUpdate: (commodities: string[]) => void
}
export function CommoditySelector({ 
  userId, 
  currentCommodities, 
  onUpdate 
}: CommoditySelectorProps) {
  const [selected, setSelected] = useState<string[]>(currentCommodities)
  const [showAll, setShowAll] = useState(false)
  const commodityIcons: Record<string, JSX.Element> = {
    'CORN': <span>🌽</span>,
    'WHEAT': <span>🌾</span>,
    'SOYBEANS': <span>🫘</span>,
    'RICE': <span>🌾</span>,
    'COTTON': <span>🏵️</span>,
    'CATTLE': <span>🐄</span>,
    'HOGS': <span>🐷</span>,
    'COFFEE': <span>☕</span>,
    'SUGAR': <span>🍬</span>,
    'MILK': <span>🥛</span>
  }
  const toggleCommodity = (symbol: string) => {
    if (selected.includes(symbol)) {
      setSelected(selected.filter(s => s !== symbol))
    } else if (selected.length < 6) {
      setSelected([...selected, symbol])
    }
  }
  const savePrefences = async () => {
    // Save to database
    await fetch('/api/user/commodity-preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodities: selected })
    })
    onUpdate(selected)
  }
  const tier1 = Object.entries(COMMODITY_TIERS)
    .filter(([_, info]) => info.tier === 1)
    .map(([symbol]) => symbol)
  const tier2 = Object.entries(COMMODITY_TIERS)
    .filter(([_, info]) => info.tier === 2)
    .map(([symbol]) => symbol)
  const tier3 = Object.entries(COMMODITY_TIERS)
    .filter(([_, info]) => info.tier === 3)
    .map(([symbol]) => symbol)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Market Data</CardTitle>
        <CardDescription>
          Select up to 6 commodities to track. Core grains are always included.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Commodities */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Core Commodities (Always Updated)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {tier1.map(symbol => (
              <div
                key={symbol}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selected.includes(symbol)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleCommodity(symbol)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {commodityIcons[symbol] || <DollarSign className="h-6 w-6" />}
                  </div>
                  <div className="font-medium text-sm">{symbol}</div>
                  <div className="text-xs text-gray-500">
                    {COMMODITY_TIERS[symbol].description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Secondary Commodities */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Additional Commodities (On-Demand Updates)
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {tier2.map(symbol => (
              <div
                key={symbol}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selected.includes(symbol)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${selected.length >= 6 && !selected.includes(symbol) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => selected.length < 6 || selected.includes(symbol) ? toggleCommodity(symbol) : null}
              >
                <div className="text-center">
                  <div className="text-xl mb-1">
                    {commodityIcons[symbol] || <DollarSign className="h-5 w-5" />}
                  </div>
                  <div className="text-xs font-medium">{symbol}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Show More */}
        {showAll && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Specialty Commodities (Daily Updates)
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {tier3.map(symbol => (
                <div
                  key={symbol}
                  className={`p-2 rounded border text-xs cursor-pointer ${
                    selected.includes(symbol)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => toggleCommodity(symbol)}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : 'Show Specialty Crops'}
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {selected.length}/6 selected
            </span>
            <Button 
              onClick={savePrefences}
              disabled={selected.length === 0}
            >
              Save Preferences
            </Button>
          </div>
        </div>
        {/* Info Box */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Smart Updates</p>
              <p className="text-xs">
                Core commodities update every 30 minutes. Additional selections 
                update when you view them, with smart caching to preserve API limits.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}