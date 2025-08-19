'use client'

import { useTheme } from './theme-provider'
import { InlineFloatingButton } from '../ui/floating-button'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Moon, Sun, Monitor, Palette, Check } from 'lucide-react'
import { useState } from 'react'

interface ThemeToggleProps {
  variant?: 'button' | 'menu' | 'compact'
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({ variant = 'button', showLabel = true, className = "" }: ThemeToggleProps) {
  const { theme, actualTheme, setTheme } = useTheme()
  const [showMenu, setShowMenu] = useState(false)

  const themes = [
    {
      key: 'light' as const,
      name: 'Light',
      description: 'Clean and bright interface',
      icon: <Sun className="h-4 w-4" />,
    },
    {
      key: 'dark' as const, 
      name: 'Dark',
      description: 'Easy on the eyes in low light',
      icon: <Moon className="h-4 w-4" />,
    },
    {
      key: 'system' as const,
      name: 'System',
      description: 'Follow your device preferences',
      icon: <Monitor className="h-4 w-4" />,
    },
  ]

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setTheme(actualTheme === 'light' ? 'dark' : 'light')}
        className={`p-2 rounded-lg hover:bg-sage-100 dark:hover:bg-sage-800 transition-colors ${className}`}
        title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        {actualTheme === 'light' ? (
          <Moon className="h-4 w-4 text-sage-600 dark:text-sage-400" />
        ) : (
          <Sun className="h-4 w-4 text-sage-600 dark:text-sage-400" />
        )}
      </button>
    )
  }

  if (variant === 'button') {
    return (
      <InlineFloatingButton
        icon={actualTheme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        label={showLabel ? `Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode` : undefined}
        showLabel={showLabel}
        variant="ghost"
        onClick={() => setTheme(actualTheme === 'light' ? 'dark' : 'light')}
        className={className}
      />
    )
  }

  // Menu variant
  return (
    <div className={`relative ${className}`}>
      <InlineFloatingButton
        icon={<Palette className="h-4 w-4" />}
        label="Theme"
        showLabel={showLabel}
        variant="ghost"
        onClick={() => setShowMenu(!showMenu)}
      />

      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 z-40">
            <ModernCard variant="floating" className="w-64 shadow-lg border">
              <ModernCardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sage-800 dark:text-sage-200 mb-3">
                    Choose Theme
                  </h3>
                  {themes.map((themeOption) => (
                    <button
                      key={themeOption.key}
                      onClick={() => {
                        setTheme(themeOption.key)
                        setShowMenu(false)
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                        theme === themeOption.key
                          ? 'bg-sage-100 dark:bg-sage-800 border-sage-300 dark:border-sage-600'
                          : 'hover:bg-sage-50 dark:hover:bg-sage-800/50'
                      }`}
                    >
                      <div className={`${
                        theme === themeOption.key 
                          ? 'text-sage-600 dark:text-sage-400' 
                          : 'text-sage-500 dark:text-sage-400'
                      }`}>
                        {themeOption.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          theme === themeOption.key 
                            ? 'text-sage-800 dark:text-sage-200' 
                            : 'text-sage-700 dark:text-sage-300'
                        }`}>
                          {themeOption.name}
                          {themeOption.key === 'system' && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {actualTheme}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-sage-500 dark:text-sage-500 mt-0.5">
                          {themeOption.description}
                        </div>
                      </div>
                      {theme === themeOption.key && (
                        <Check className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-sage-200 dark:border-sage-700">
                  <div className="text-xs text-sage-500 dark:text-sage-500">
                    Current: <span className="font-medium capitalize">{actualTheme}</span> mode
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </div>
        </>
      )}
    </div>
  )
}