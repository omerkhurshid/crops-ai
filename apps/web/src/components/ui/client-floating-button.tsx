'use client'

import { FloatingActionButton } from './floating-button'

interface ClientFloatingButtonProps {
  icon: React.ReactNode
  label: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning'
  onClick?: () => void
  href?: string
}

export function ClientFloatingButton({ icon, label, variant = 'primary', onClick, href }: ClientFloatingButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      window.location.href = href
    } else {
      // Default actions based on label
      if (label.includes('Task')) {
        window.location.href = '/tasks?action=add-task'
      } else if (label.includes('Crop')) {
        window.location.href = '/crops?action=add-planting'
      } else {

      }
    }
  }

  return (
    <FloatingActionButton
      icon={icon}
      label={label}
      variant={variant}
      onClick={handleClick}
    />
  )
}