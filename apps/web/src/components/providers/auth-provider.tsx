'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  console.log('🔧 AuthProvider initializing with basePath: /api/nextauth-alt')
  
  return (
    <SessionProvider 
      basePath="/api/nextauth-alt"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  )
}