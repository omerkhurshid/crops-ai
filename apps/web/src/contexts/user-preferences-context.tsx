'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserPreferences, DEFAULT_PREFERENCES } from '../lib/user-preferences'

interface UserPreferencesContextType {
  preferences: UserPreferences
  loading: boolean
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>
  refreshPreferences: () => Promise<void>
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/users/preferences')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.preferences) {
          setPreferences(data.data.preferences)
        }
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.preferences) {
          setPreferences(data.data.preferences)
        }
      }
    } catch (error) {
      console.error('Failed to update preferences:', error)
      throw error
    }
  }

  const refreshPreferences = async () => {
    setLoading(true)
    await fetchPreferences()
  }

  useEffect(() => {
    fetchPreferences()
  }, [])

  return (
    <UserPreferencesContext.Provider value={{
      preferences,
      loading,
      updatePreferences,
      refreshPreferences
    }}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}