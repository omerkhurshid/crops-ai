'use client'

import { FloatingActionButton } from './floating-button'

interface ClientFloatingButtonProps {
  icon: React.ReactNode
  label: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning'
}

export function ClientFloatingButton({ icon, label, variant = 'primary' }: ClientFloatingButtonProps) {
  return (
    <FloatingActionButton
      icon={icon}
      label={label}
      variant={variant}
      onClick={() => {
        // Add functionality later
        console.log(`${label} clicked`)
      }}
    />
  )
}