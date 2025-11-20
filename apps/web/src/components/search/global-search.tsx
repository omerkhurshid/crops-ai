'use client'
import { useState, useEffect, useRef } from 'react'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { 
  Search, Command, Filter, Clock, MapPin, Activity, 
  CloudRain, DollarSign, Users, FileText, ChevronRight,
  X, Zap, BarChart3, Target, Settings, Plus
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
  // Perform search API call
  const performSearch = async (searchTerm: string, filter: string): Promise<SearchResult[]> => {
    if (!searchTerm.trim()) return []
    try {
      const params = new URLSearchParams({
        q: searchTerm,
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
      return []
    }
  }
  // Search functionality
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const searchAsync = async () => {
      try {
        const results = await performSearch(query, selectedFilter)
        setResults(results)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      }
    }
    searchAsync()
  }, [query, selectedFilter])
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
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
  const handleResultSelect = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    // Add to recent searches
    if (!recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)])
    }
    if (onResultSelect) {
      onResultSelect(result)
    }
  }
  const clearSearch = () => {
    setQuery('')
    setResults([])
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
          className="w-full pl-10 pr-20 py-3 border border-[#DDE4D8] rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-[#F8FAF8] rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-sage-400" />
            </button>
          )}
          <div className="text-xs text-sage-400 border border-[#DDE4D8] rounded px-1.5 py-0.5 font-mono">
            ⌘K
          </div>
        </div>
      </div>
      {/* Search Results Dropdown */}
      {isOpen && (
        <ModernCard className="absolute top-full mt-2 w-full z-50 shadow-xl border-[#DDE4D8]">
          <ModernCardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {/* Search Filters */}
              {showFilters && (
                <div className="p-4 border-b border-[#DDE4D8]">
                  <div className="flex gap-2 flex-wrap">
                    {searchFilters.map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          selectedFilter === filter.id 
                            ? 'bg-[#F8FAF8] text-sage-900 border border-[#DDE4D8]' 
                            : 'text-[#555555] hover:bg-[#F8FAF8]'
                        }`}
                      >
                        {filter.icon}
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Search Results */}
              <div className="p-2">
                {results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map(result => (
                      <button
                        key={result.id}
                        onClick={() => handleResultSelect(result)}
                        className="w-full text-left p-3 rounded-lg hover:bg-[#F8FAF8] transition-colors flex items-start gap-3"
                      >
                        <div className="mt-0.5 text-[#555555]">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sage-900 truncate">
                            {result.title}
                          </div>
                          <div className="text-sm text-[#555555] truncate">
                            {result.description}
                          </div>
                          {result.metadata && (
                            <div className="flex items-center gap-3 mt-1 text-xs text-sage-500">
                              {result.metadata.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {result.metadata.location}
                                </span>
                              )}
                              {result.metadata.status && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.metadata.status}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-sage-400 mt-0.5" />
                      </button>
                    ))}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-sage-400 mx-auto mb-3" />
                    <p className="text-[#555555] mb-2">No results found</p>
                    <p className="text-sm text-sage-500">
                      Try adjusting your search terms or filters
                    </p>
                  </div>
                ) : (
                  <div className="py-4">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="mb-6">
                        <div className="text-sm text-[#555555] mb-3 px-3">Recent searches</div>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => setQuery(search)}
                              className="w-full text-left p-2 rounded-lg hover:bg-[#F8FAF8] transition-colors flex items-center gap-3 text-sm text-[#555555]"
                            >
                              <Clock className="h-4 w-4 text-sage-400" />
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Quick Actions */}
              {query.length < 2 && (
                <div className="border-t border-[#DDE4D8] p-4">
                  <div className="text-sm text-[#555555] mb-3">Quick actions</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F8FAF8] transition-colors text-sm text-[#555555]">
                      <Plus className="h-4 w-4" />
                      Add Farm
                    </button>
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F8FAF8] transition-colors text-sm text-[#555555]">
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </button>
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F8FAF8] transition-colors text-sm text-[#555555]">
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F8FAF8] transition-colors text-sm text-[#555555]">
                      <FileText className="h-4 w-4" />
                      Help
                    </button>
                  </div>
                </div>
              )}
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
    </div>
  )
}