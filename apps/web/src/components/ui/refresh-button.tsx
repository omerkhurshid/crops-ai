'use client'

import { Button } from './button'

interface RefreshButtonProps {
  children: React.ReactNode
  className?: string
}

export function RefreshButton({ children, className }: RefreshButtonProps) {
  return (
    <Button 
      onClick={() => window.location.reload()} 
      className={className}
    >
      {children}
    </Button>
  )
}