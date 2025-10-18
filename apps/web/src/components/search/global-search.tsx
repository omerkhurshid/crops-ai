'use client'

import { useState, useEffect, useRef } from 'react'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { 
  Search, Command, Filter, Clock, MapPin, Activity, 
  CloudRain, DollarSign, Users, FileText, ChevronRight,
  X, Zap, BarChart3, Target, Settings
} from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'farm' | 'field' | 'health' | 'weather' | 'financial' | 'help' | 'recommendation'
  url: string
  metadata?: {
    location?: string
    status?: string
    date?: string
    value?: string
  }
  icon: React.ReactNode
  relevance: number
}

interface GlobalSearchProps {
  placeholder?: string
  showFilters?: boolean
  onResultSelect?: (result: SearchResult) => void
  className?: string
}

// Search state
const [searchResults, setSearchResults] = useState<SearchResult[]>([])
const [isSearching, setIsSearching] = useState(false)

// Perform search API call
const performSearch = async (query: string, filter: string): Promise<SearchResult[]> => {
  if (!query.trim()) return []
  
  try {
    const params = new URLSearchParams({
      q: query,
      filter: filter !== 'all' ? filter : '',
      limit: '10'
    })
    
    const response = await fetch(`/api/search?${params}`)
    if (!response.ok) {
      throw new Error('Search service unavailable')
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Search failed:', error)
    // Return empty results instead of mock data
    return []
  }
}

const searchFilters = [
  { id: 'all', label: 'All', icon: <Search className="h-3 w-3" /> },
  { id: 'farm', label: 'Farms', icon: <MapPin className="h-3 w-3" /> },
  { id: 'field', label: 'Fields', icon: <Activity className="h-3 w-3" /> },
  { id: 'health', label: 'Health', icon: <Activity className="h-3 w-3" /> },
  { id: 'weather', label: 'Weather', icon: <CloudRain className="h-3 w-3" /> },
  { id: 'financial', label: 'Financial', icon: <DollarSign className="h-3 w-3" /> },
  { id: 'help', label: 'Help', icon: <FileText className="h-3 w-3" /> }
]

export function GlobalSearch({ 
  placeholder = "Search farms, fields, weather, and more...", 
  showFilters = true, 
  onResultSelect,
  className = ""
}: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'corn health', 'weather alerts', 'irrigation schedule'
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Search functionality
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    
    try {
      const results = await performSearch(query, selectedFilter)
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Legacy filter logic (can be removed once search API handles all filtering)
  const legacyFilter = (results: SearchResult[], query: string) => {
    const searchTerms = query.toLowerCase().split(' ')
    return results.filter(result => {
      const searchableText = [
        result.title,
        result.description,
        result.metadata?.location,
        result.metadata?.status,
        result.type
      ].join(' ').toLowerCase()

      return searchTerms.every(term => searchableText.includes(term))
    })

    // Sort by relevance
    filteredResults = filteredResults.sort((a, b) => b.relevance - a.relevance)
    
    setResults(filteredResults.slice(0, 8)) // Limit to 8 results
  }, [query, selectedFilter])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    
    // Add to recent searches
    if (!recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)])
    }

    if (onResultSelect) {
      onResultSelect(result)
    } else {
      window.location.href = result.url
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'farm': return 'text-sage-600 bg-sage-100'
      case 'field': return 'text-earth-600 bg-earth-100'  
      case 'health': return 'text-red-600 bg-red-100'
      case 'weather': return 'text-blue-600 bg-blue-100'
      case 'financial': return 'text-green-600 bg-green-100'
      case 'help': return 'text-purple-600 bg-purple-100'
      case 'recommendation': return 'text-orange-600 bg-orange-100'
      default: return 'text-sage-600 bg-sage-100'
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sage-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          data-global-search
          className="w-full pl-10 pr-20 py-3 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-sage-100 rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-sage-500" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-sage-100 text-sage-600 text-xs rounded border">
            <Command className="h-3 w-3" />
            K
          </kbd>
        </div>
      </div>

      {/* Search Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <ModernCard variant="floating" className="max-h-96 overflow-hidden">
            <ModernCardContent className="p-0">
              {/* Filters */}
              {showFilters && (
                <div className="flex items-center gap-2 p-4 border-b border-sage-200">
                  <Filter className="h-4 w-4 text-sage-500" />
                  <div className="flex gap-2 overflow-x-auto">
                    {searchFilters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedFilter === filter.id
                            ? 'bg-sage-100 text-sage-800'
                            : 'hover:bg-sage-50 text-sage-600'
                        }`}
                      >
                        {filter.icon}
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-2">
                    <div className="text-sm text-sage-600 mb-3 px-2">
                      {results.length} result{results.length !== 1 ? 's' : ''} found
                    </div>
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left p-3 rounded-lg hover:bg-sage-50 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="text-sage-500">
                              {result.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-sage-800 group-hover:text-sage-900 text-sm">
                                {result.title}
                              </h3>
                              <p className="text-xs text-sage-600 line-clamp-2 leading-relaxed">
                                {result.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-sage-400 group-hover:text-sage-600 transition-colors flex-shrink-0" />
                        </div>
                        
                        <div className="flex items-center justify-between pl-7">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${getTypeColor(result.type)}`}>
                              {result.type}
                            </Badge>
                            {result.metadata?.location && (
                              <span className="text-xs text-sage-500">
                                📍 {result.metadata.location}
                              </span>
                            )}
                            {result.metadata?.status && (
                              <Badge variant="secondary" className="text-xs">
                                {result.metadata.status}
                              </Badge>
                            )}
                          </div>
                          {result.metadata?.date && (
                            <span className="text-xs text-sage-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {result.metadata.date}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-sage-400 mx-auto mb-3" />
                    <p className="text-sage-600 mb-2">No results found</p>
                    <p className="text-sm text-sage-500">
                      Try different keywords or check filters
                    </p>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="text-sm text-sage-600 mb-3">Recent searches</div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="w-full text-left p-2 rounded-lg hover:bg-sage-50 transition-colors text-sm text-sage-700 flex items-center gap-2"
                        >
                          <Clock className="h-3 w-3 text-sage-500" />
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {query.length < 2 && (
                <div className="border-t border-sage-200 p-4">
                  <div className="text-sm text-sage-600 mb-3">Quick actions</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-sage-50 transition-colors text-sm text-sage-700">
                      <Zap className="h-3 w-3" />
                      View alerts
                    </button>
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-sage-50 transition-colors text-sm text-sage-700">
                      <BarChart3 className="h-3 w-3" />
                      Reports
                    </button>
                  </div>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
        </div>
      )}
    </div>
  )
}