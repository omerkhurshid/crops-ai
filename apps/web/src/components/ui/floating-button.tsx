import React from 'react'
import { cn } from '../../lib/utils'

interface FloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  isFloating?: boolean
}

const variants = {
  primary: 'bg-sage-500 hover:bg-sage-600 text-white shadow-glow hover:shadow-soft-lg',
  secondary: 'bg-cream-200 hover:bg-cream-300 text-sage-800 shadow-soft hover:shadow-floating',
  ghost: 'bg-white/70 hover:bg-white/90 text-sage-700 backdrop-blur-sm shadow-soft',
  success: 'bg-crops-green-500 hover:bg-crops-green-600 text-white shadow-glow',
  warning: 'bg-earth-500 hover:bg-earth-600 text-white shadow-soft'
}

const sizes = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-16 w-16 text-xl'
}

export function FloatingButton({
  className,
  variant = 'primary',
  size = 'md',
  children,
  isFloating = true,
  disabled,
  ...props
}: FloatingButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full border-0 font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sage-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center',
        variants[variant],
        sizes[size],
        isFloating && 'hover:scale-110 hover:-translate-y-1 active:scale-95',
        disabled && 'hover:scale-100 hover:translate-y-0',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// Specialized floating action buttons for common actions
interface ActionButtonProps extends Omit<FloatingButtonProps, 'children'> {
  icon: React.ReactNode
  label?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function FloatingActionButton({
  icon,
  label,
  position = 'bottom-right',
  className,
  ...props
}: ActionButtonProps) {
  const positions = {
    'bottom-right': 'fixed bottom-6 right-6 z-50',
    'bottom-left': 'fixed bottom-6 left-6 z-50',
    'top-right': 'fixed top-6 right-6 z-50',
    'top-left': 'fixed top-6 left-6 z-50'
  }

  return (
    <div className={positions[position]}>
      <FloatingButton
        className={cn('group', className)}
        {...props}
      >
        {icon}
        {label && (
          <span className="absolute right-full mr-3 px-2 py-1 bg-sage-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {label}
          </span>
        )}
      </FloatingButton>
    </div>
  )
}

// Inline floating button for use within layouts
export function InlineFloatingButton({
  icon,
  label,
  showLabel = false,
  className,
  ...props
}: ActionButtonProps & { showLabel?: boolean }) {
  return (
    <FloatingButton
      className={cn(
        'group relative',
        showLabel ? 'px-4 rounded-full w-auto flex items-center gap-2' : '',
        className
      )}
      {...props}
    >
      {icon}
      {label && showLabel && (
        <span className="text-sm font-medium">{label}</span>
      )}
      {label && !showLabel && (
        <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-sage-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {label}
        </span>
      )}
    </FloatingButton>
  )
}