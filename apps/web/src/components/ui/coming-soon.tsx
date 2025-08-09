'use client'

import { Badge } from './badge'
import { ModernCard, ModernCardContent } from './modern-card'
import { Clock, Sparkles } from 'lucide-react'

interface ComingSoonProps {
  title?: string
  description?: string
  variant?: 'default' | 'compact' | 'inline'
  className?: string
}

export function ComingSoon({ 
  title = "Feature Coming Soon",
  description = "This feature is currently in development and will be available in a future update.",
  variant = 'default',
  className = '' 
}: ComingSoonProps) {
  
  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Badge className="bg-sage-100 text-sage-700 border-sage-200">
          <Clock className="h-3 w-3 mr-1" />
          Coming Soon
        </Badge>
      </div>
    )
  }
  
  if (variant === 'compact') {
    return (
      <div className={`p-4 bg-gradient-to-br from-sage-50 to-cream-50 rounded-xl border-2 border-sage-100 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-sage-600" />
          <span className="text-sm font-medium text-sage-800">{title}</span>
        </div>
        <p className="text-xs text-sage-600 leading-relaxed">{description}</p>
      </div>
    )
  }
  
  return (
    <ModernCard variant="glow" className={`text-center ${className}`}>
      <ModernCardContent className="p-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-sage-100 to-sage-50 rounded-2xl">
            <Clock className="h-12 w-12 text-sage-600" />
          </div>
        </div>
        <h3 className="text-2xl font-light text-sage-800 mb-3">{title}</h3>
        <p className="text-sage-600 leading-relaxed max-w-md mx-auto mb-6">
          {description}
        </p>
        <Badge className="bg-sage-100 text-sage-700 border-sage-200">
          <Sparkles className="h-4 w-4 mr-2" />
          In Development
        </Badge>
      </ModernCardContent>
    </ModernCard>
  )
}