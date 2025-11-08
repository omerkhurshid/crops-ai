'use client'
import { ReactNode } from 'react'
import { AuthContextProvider } from '../../lib/auth-unified'
interface AuthProviderProps {
  children: ReactNode
}
export function AuthProvider({ children }: AuthProviderProps) {return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  )
}