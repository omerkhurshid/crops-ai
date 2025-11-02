'use client'

import { ReactNode } from 'react'
import { AuthContextProvider } from '../../lib/auth-unified'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  console.log('🔧 AuthProvider initializing with Supabase auth')
  
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  )
}