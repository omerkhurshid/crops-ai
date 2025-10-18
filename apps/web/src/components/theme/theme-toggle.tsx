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
        className={`p-2 rounded-lg hover:bg-fk-background dark:hover:bg-fk-background-muted transition-colors ${className}`}
        title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        {actualTheme === 'light' ? (
          <Moon className="h-4 w-4 text-fk-text-muted" />
        ) : (
          <Sun className="h-4 w-4 text-fk-text-muted" />
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
                  <h3 className="font-medium text-fk-text mb-3">
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
                          ? 'bg-fk-background border-fk-border'
                          : 'hover:bg-fk-background/50'
                      }`}
                    >
                      <div className={`${
                        theme === themeOption.key 
                          ? 'text-fk-primary' 
                          : 'text-fk-text-muted'
                      }`}>
                        {themeOption.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          theme === themeOption.key 
                            ? 'text-fk-text' 
                            : 'text-fk-text-muted'
                        }`}>
                          {themeOption.name}
                          {themeOption.key === 'system' && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {actualTheme}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-fk-text-muted mt-0.5">
                          {themeOption.description}
                        </div>
                      </div>
                      {theme === themeOption.key && (
                        <Check className="h-4 w-4 text-fk-primary" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-fk-border">
                  <div className="text-xs text-fk-text-muted">
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