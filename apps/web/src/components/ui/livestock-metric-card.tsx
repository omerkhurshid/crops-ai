'use client'

import React from 'react'
import { FarmerMetricCard } from './farmer-metric-card'
import { Heart, TrendingUp, TrendingDown } from 'lucide-react'

interface LivestockMetricCardProps {
  totalCount: number
  healthyCount: number
  sickCount?: number
  trend?: number
  showMore?: boolean
  onShowMore?: () => void
}

export function LivestockMetricCard({
  totalCount,
  healthyCount,
  sickCount = 0,
  trend = 0,
  showMore = false,
  onShowMore
}: LivestockMetricCardProps) {
  const healthPercentage = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 100
  
  const getStatus = () => {
    if (healthPercentage >= 95) return 'excellent'
    if (healthPercentage >= 85) return 'good'
    if (healthPercentage >= 70) return 'warning'
    return 'critical'
  }

  const trendData = trend !== 0 ? {
    direction: trend > 0 ? 'up' as const : 'down' as const,
    percentage: Math.abs(trend),
    label: 'vs last month'
  } : undefined

  return (
    <FarmerMetricCard
      title="Livestock Health"
      value={`${healthPercentage}%`}
      subtitle={`${totalCount} total head • ${sickCount > 0 ? `${sickCount} need attention` : 'All healthy'}`}
      status={getStatus()}
      trend={trendData}
      showMore={showMore}
      onShowMore={onShowMore}
      icon={<Heart className="h-6 w-6" />}
      variant="soft"
    />
  )
}