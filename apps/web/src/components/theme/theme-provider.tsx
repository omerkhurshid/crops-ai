'use client'
import { createContext, useContext, useEffect, useState } from 'react'
type Theme = 'light' | 'dark' | 'system'
interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}
interface ThemeProviderState {
  theme: Theme
  actualTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}
const initialState: ThemeProviderState = {
  theme: 'system',
  actualTheme: 'light',
  setTheme: () => null,
  toggleTheme: () => null,
}
const ThemeProviderContext = createContext<ThemeProviderState>(initialState)
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'crops-ai-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    // Load theme from localStorage on mount
    const storedTheme = localStorage.getItem(storageKey) as Theme
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [storageKey])
  useEffect(() => {
    const root = window.document.documentElement
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    let resolvedTheme: 'light' | 'dark' = 'light'
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      resolvedTheme = systemTheme
    } else {
      resolvedTheme = theme
    }
    // Apply theme class
    root.classList.add(resolvedTheme)
    setActualTheme(resolvedTheme)
    // Save to localStorage
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])
  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light'
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(systemTheme)
      setActualTheme(systemTheme)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])
  const value = {
    theme,
    actualTheme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
    },
    toggleTheme: () => {
      setTheme(actualTheme === 'light' ? 'dark' : 'light')
    },
  }
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')
  return context
}