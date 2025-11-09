'use client'
import { useEffect, useState } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { InlineFloatingButton } from '../ui/floating-button'
import { 
  Command, X, Keyboard, Search, Plus, Home, Activity,
  CloudRain, DollarSign, BarChart3, Settings, HelpCircle,
  RefreshCw, ArrowUp, ArrowDown
} from 'lucide-react'
interface ShortcutAction {
  id: string
  key: string
  modifiers: ('cmd' | 'ctrl' | 'alt' | 'shift')[]
  description: string
  action: () => void
  category: 'navigation' | 'actions' | 'search' | 'general'
  icon: React.ReactNode
  disabled?: boolean
}
interface KeyboardShortcutsProps {
  customShortcuts?: ShortcutAction[]
  onShortcutExecuted?: (shortcutId: string) => void
}
export function KeyboardShortcuts({ customShortcuts = [], onShortcutExecuted }: KeyboardShortcutsProps) {
  const [showModal, setShowModal] = useState(false)
  const [executedShortcut, setExecutedShortcut] = useState<string | null>(null)
  // Default shortcuts
  const defaultShortcuts: ShortcutAction[] = [
    // Navigation
    {
      id: 'home',
      key: 'h',
      modifiers: ['cmd'],
      description: 'Go to Dashboard',
      action: () => window.location.href = '/dashboard',
      category: 'navigation',
      icon: <Home className="h-4 w-4" />
    },
    {
      id: 'farms',
      key: 'f',
      modifiers: ['cmd'],
      description: 'Go to Farms',
      action: () => window.location.href = '/farms',
      category: 'navigation',
      icon: <Activity className="h-4 w-4" />
    },
    {
      id: 'weather',
      key: 'w',
      modifiers: ['cmd'],
      description: 'Go to Weather',
      action: () => window.location.href = '/weather',
      category: 'navigation',
      icon: <CloudRain className="h-4 w-4" />
    },
    {
      id: 'financial',
      key: 'm',
      modifiers: ['cmd'],
      description: 'Go to Financial',
      action: () => window.location.href = '/financial',
      category: 'navigation',
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      id: 'reports',
      key: 'r',
      modifiers: ['cmd'],
      description: 'Go to Reports',
      action: () => window.location.href = '/reports',
      category: 'navigation',
      icon: <BarChart3 className="h-4 w-4" />
    },
    // Search
    {
      id: 'search',
      key: 'k',
      modifiers: ['cmd'],
      description: 'Open Global Search',
      action: () => {
        const searchInput = document.querySelector('[data-global-search]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      category: 'search',
      icon: <Search className="h-4 w-4" />
    },
    // Actions
    {
      id: 'new-farm',
      key: 'n',
      modifiers: ['cmd'],
      description: 'Create New Farm',
      action: () => window.location.href = '/farms/create-unified,
      category: 'actions',
      icon: <Plus className="h-4 w-4" />
    },
    {
      id: 'refresh',
      key: 'r',
      modifiers: ['cmd', 'shift'],
      description: 'Refresh Page',
      action: () => window.location.reload(),
      category: 'actions',
      icon: <RefreshCw className="h-4 w-4" />
    },
    // General
    {
      id: 'help',
      key: '?',
      modifiers: ['shift'],
      description: 'Show Keyboard Shortcuts',
      action: () => setShowModal(true),
      category: 'general',
      icon: <Keyboard className="h-4 w-4" />
    },
    {
      id: 'settings',
      key: ',',
      modifiers: ['cmd'],
      description: 'Open Settings',
      action: () => window.location.href = '/settings',
      category: 'general',
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: 'help-center',
      key: 'h',
      modifiers: ['cmd', 'shift'],
      description: 'Open Help Center',
      action: () => window.location.href = '/help',
      category: 'general',
      icon: <HelpCircle className="h-4 w-4" />
    }
  ]
  const allShortcuts = [...defaultShortcuts, ...customShortcuts]
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).contentEditable === 'true'
      ) {
        // Exception for search shortcut (Cmd/Ctrl + K)
        if (!((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
          return
        }
      }
      const matchingShortcut = allShortcuts.find(shortcut => {
        if (shortcut.disabled) return false
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase()
        const modifiersMatch = shortcut.modifiers.every(modifier => {
          switch (modifier) {
            case 'cmd':
              return event.metaKey
            case 'ctrl':
              return event.ctrlKey
            case 'alt':
              return event.altKey
            case 'shift':
              return event.shiftKey
            default:
              return false
          }
        }) && shortcut.modifiers.length === [
          event.metaKey && 'cmd',
          event.ctrlKey && 'ctrl',
          event.altKey && 'alt', 
          event.shiftKey && 'shift'
        ].filter(Boolean).length
        return keyMatches && modifiersMatch
      })
      if (matchingShortcut) {
        event.preventDefault()
        event.stopPropagation()
        matchingShortcut.action()
        setExecutedShortcut(matchingShortcut.id)
        if (onShortcutExecuted) {
          onShortcutExecuted(matchingShortcut.id)
        }
        // Clear executed indicator after animation
        setTimeout(() => setExecutedShortcut(null), 1000)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [allShortcuts, onShortcutExecuted])
  // Close modal on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        setShowModal(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showModal])
  const getModifierSymbol = (modifier: string) => {
    switch (modifier) {
      case 'cmd': return '⌘'
      case 'ctrl': return 'Ctrl'
      case 'alt': return '⌥'
      case 'shift': return '⇧'
      default: return modifier
    }
  }
  const formatShortcut = (shortcut: ShortcutAction) => {
    const modifiers = shortcut.modifiers.map(getModifierSymbol)
    const key = shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase()
    return [...modifiers, key].join(' + ')
  }
  const groupedShortcuts = allShortcuts.reduce((groups, shortcut) => {
    if (!groups[shortcut.category]) {
      groups[shortcut.category] = []
    }
    groups[shortcut.category].push(shortcut)
    return groups
  }, {} as Record<string, ShortcutAction[]>)
  const categoryLabels = {
    navigation: 'Navigation',
    actions: 'Actions',
    search: 'Search & Filters',
    general: 'General'
  }
  const categoryIcons = {
    navigation: <Home className="h-4 w-4" />,
    actions: <Plus className="h-4 w-4" />,
    search: <Search className="h-4 w-4" />,
    general: <Settings className="h-4 w-4" />
  }
  return (
    <>
      {/* Keyboard Shortcuts Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ModernCard variant="floating" className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <ModernCardHeader>
              <div className="flex items-center justify-between">
                <ModernCardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Shortcuts
                </ModernCardTitle>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-sage-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </ModernCardHeader>
            <ModernCardContent className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-sage-600">
                        {categoryIcons[category as keyof typeof categoryIcons]}
                      </div>
                      <h3 className="font-semibold text-sage-800">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {shortcuts.map((shortcut) => (
                        <div
                          key={shortcut.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            executedShortcut === shortcut.id
                              ? 'bg-sage-100 border-sage-300 shadow-sm'
                              : shortcut.disabled
                              ? 'bg-sage-50 border-sage-200 opacity-50'
                              : 'bg-white border-sage-200 hover:bg-sage-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`text-sage-600 ${shortcut.disabled ? 'opacity-50' : ''}`}>
                              {shortcut.icon}
                            </div>
                            <span className={`text-sm ${shortcut.disabled ? 'text-sage-400' : 'text-sage-700'}`}>
                              {shortcut.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {shortcut.modifiers.map((modifier, index) => (
                              <kbd key={index} className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded border">
                                {getModifierSymbol(modifier)}
                              </kbd>
                            ))}
                            <kbd className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded border">
                              {shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase()}
                            </kbd>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-sage-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-sage-600">
                    Press <kbd className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded border">Esc</kbd> to close
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {allShortcuts.filter(s => !s.disabled).length} shortcuts available
                    </Badge>
                  </div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      )}
      {/* Executed Shortcut Indicator */}
      {executedShortcut && (
        <div className="fixed bottom-4 right-4 z-40 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="bg-sage-800 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="text-sage-200">
              {allShortcuts.find(s => s.id === executedShortcut)?.icon}
            </div>
            <span className="text-sm">
              {allShortcuts.find(s => s.id === executedShortcut)?.description}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
// Hook to add the keyboard shortcuts system to any component
export function useKeyboardShortcuts(shortcuts: ShortcutAction[] = []) {
  const [shortcutsComponent, setShortcutsComponent] = useState<React.ReactElement | null>(null)
  useEffect(() => {
    setShortcutsComponent(
      <KeyboardShortcuts customShortcuts={shortcuts} />
    )
  }, [shortcuts])
  return shortcutsComponent
}
// Predefined shortcut sets for different pages
export const farmPageShortcuts: ShortcutAction[] = [
  {
    id: 'new-field',
    key: 'f',
    modifiers: ['cmd', 'shift'],
    description: 'Add New Field',
    action: () => {
      const addFieldBtn = document.querySelector('[data-action="add-field"]') as HTMLElement
      if (addFieldBtn) addFieldBtn.click()
    },
    category: 'actions',
    icon: <Plus className="h-4 w-4" />
  }
]
export const weatherPageShortcuts: ShortcutAction[] = [
  {
    id: 'refresh-weather',
    key: 'u',
    modifiers: ['cmd'],
    description: 'Update Weather Data',
    action: () => {
      const refreshBtn = document.querySelector('[data-action="refresh-weather"]') as HTMLElement
      if (refreshBtn) refreshBtn.click()
    },
    category: 'actions',
    icon: <RefreshCw className="h-4 w-4" />
  }
]