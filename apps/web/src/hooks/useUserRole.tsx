'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type UserRole = 'farmer' | 'landowner' | 'rancher' | 'mixed'

interface UserRoleContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  modulePreferences: ModulePreferences
  updateModulePreferences: (preferences: Partial<ModulePreferences>) => void
}

interface ModulePreferences {
  showCrops: boolean
  showLivestock: boolean
  showFinancials: boolean
  showWeather: boolean
  showMarkets: boolean
  showTasks: boolean
  defaultView: 'dashboard' | 'farms' | 'financials' | 'weather'
  compactMode: boolean
}

const defaultPreferences: Record<UserRole, ModulePreferences> = {
  farmer: {
    showCrops: true,
    showLivestock: false,
    showFinancials: true,
    showWeather: true,
    showMarkets: true,
    showTasks: true,
    defaultView: 'dashboard',
    compactMode: false
  },
  landowner: {
    showCrops: true,
    showLivestock: false,
    showFinancials: true,
    showWeather: false,
    showMarkets: true,
    showTasks: false,
    defaultView: 'financials',
    compactMode: true
  },
  rancher: {
    showCrops: false,
    showLivestock: true,
    showFinancials: true,
    showWeather: true,
    showMarkets: false,
    showTasks: true,
    defaultView: 'dashboard',
    compactMode: false
  },
  mixed: {
    showCrops: true,
    showLivestock: true,
    showFinancials: true,
    showWeather: true,
    showMarkets: true,
    showTasks: true,
    defaultView: 'dashboard',
    compactMode: false
  }
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('farmer')
  const [modulePreferences, setModulePreferences] = useState<ModulePreferences>(
    defaultPreferences.farmer
  )

  // Load preferences from localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole
    const savedPreferences = localStorage.getItem('modulePreferences')
    
    if (savedRole && defaultPreferences[savedRole]) {
      setRole(savedRole)
      setModulePreferences(
        savedPreferences 
          ? JSON.parse(savedPreferences)
          : defaultPreferences[savedRole]
      )
    }
  }, [])

  // Update preferences when role changes
  useEffect(() => {
    setModulePreferences(defaultPreferences[role])
    localStorage.setItem('userRole', role)
  }, [role])

  const updateModulePreferences = (updates: Partial<ModulePreferences>) => {
    const newPreferences = { ...modulePreferences, ...updates }
    setModulePreferences(newPreferences)
    localStorage.setItem('modulePreferences', JSON.stringify(newPreferences))
  }

  return (
    <UserRoleContext.Provider value={{
      role,
      setRole,
      modulePreferences,
      updateModulePreferences
    }}>
      {children}
    </UserRoleContext.Provider>
  )
}

export function useUserRole() {
  const context = useContext(UserRoleContext)
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider')
  }
  return context
}

// Hook for filtering components based on user role
export function useRoleBasedComponents() {
  const { role, modulePreferences } = useUserRole()
  
  const shouldShow = {
    crops: modulePreferences.showCrops,
    livestock: modulePreferences.showLivestock,
    financials: modulePreferences.showFinancials,
    weather: modulePreferences.showWeather,
    markets: modulePreferences.showMarkets,
    tasks: modulePreferences.showTasks,
    
    // Navigation items
    nav: {
      dashboard: true,
      farms: modulePreferences.showCrops || modulePreferences.showLivestock,
      cropHealth: modulePreferences.showCrops,
      livestock: modulePreferences.showLivestock,
      weather: modulePreferences.showWeather,
      financials: modulePreferences.showFinancials,
      reports: true,
      help: true
    },
    
    // Dashboard sections
    dashboard: {
      marketTicker: modulePreferences.showMarkets,
      urgentTasks: modulePreferences.showTasks,
      cropHealth: modulePreferences.showCrops,
      livestock: modulePreferences.showLivestock,
      weather: modulePreferences.showWeather,
      financials: modulePreferences.showFinancials
    }
  }
  
  const getQuickActions = () => {
    const actions = []
    
    if (modulePreferences.showFinancials) {
      actions.push({
        id: 'expense',
        label: 'Log Expense',
        category: 'financial'
      })
    }
    
    if (modulePreferences.showCrops) {
      actions.push(
        {
          id: 'irrigation',
          label: 'Log Irrigation',
          category: 'crop'
        },
        {
          id: 'harvest',
          label: 'Log Harvest',
          category: 'crop'
        }
      )
    }
    
    if (modulePreferences.showLivestock) {
      actions.push({
        id: 'livestock',
        label: 'Log Livestock Event',
        category: 'livestock'
      })
    }
    
    return actions
  }
  
  return {
    shouldShow,
    getQuickActions,
    role,
    isCompactMode: modulePreferences.compactMode
  }
}