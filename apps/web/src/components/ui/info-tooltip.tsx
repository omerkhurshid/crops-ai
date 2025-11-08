'use client'
import { useState } from 'react'
import { Info } from 'lucide-react'
interface InfoTooltipProps {
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'default' | 'light'
}
export function InfoTooltip({ 
  title, 
  description, 
  position = 'top', 
  size = 'sm',
  className = '',
  variant = 'default'
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }
  const tooltipPositions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }
  const arrowPositions = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800'
  }
  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className={`transition-colors duration-200 focus:outline-none focus:ring-2 rounded-full p-1 ${
          variant === 'light' 
            ? 'text-white/70 hover:text-white focus:ring-white/50' 
            : 'text-sage-500 hover:text-sage-700 focus:ring-sage-300'
        }`}
        type="button"
        aria-label={`Information about ${title}`}
      >
        <Info className={`${sizeClasses[size]} opacity-60 hover:opacity-100 transition-opacity`} />
      </button>
      {isVisible && (
        <div className={`absolute z-50 ${tooltipPositions[position]} pointer-events-none`}>
          <div className="bg-slate-800/95 backdrop-blur-sm text-white text-sm rounded-lg px-3 py-2 shadow-lg border border-slate-700/50 max-w-xs">
            <div className="font-medium text-cream-100 mb-1">{title}</div>
            <div className="text-slate-200 text-xs leading-relaxed">{description}</div>
          </div>
          <div className={`absolute w-0 h-0 border-4 ${arrowPositions[position]}`}></div>
        </div>
      )}
    </div>
  )
}
