'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Search, Clock, ChevronRight, X } from 'lucide-react'

interface HelpArticle {
  id: string
  title: string
  description: string
  content: string
  tags: string[]
  section: string
  readTime: string
  keywords: string[]
}

// Sample help articles data - in a real app this would come from a CMS or database
const helpArticles: HelpArticle[] = [
  {
    id: 'account-setup',
    title: 'Account Setup & First Login',
    description: 'Complete guide to setting up your Crops.AI account and first-time login',
    content: 'Step-by-step guide to creating and configuring your account...',
    tags: ['Setup', 'Account'],
    section: 'Getting Started',
    readTime: '5 min read',
    keywords: ['account', 'login', 'setup', 'registration', 'password']
  },
  {
    id: 'first-farm',
    title: 'Creating Your First Farm',
    description: 'Step-by-step instructions for adding your first farm and setting up basic information',
    content: 'Learn how to add your farm details, location, and initial configuration...',
    tags: ['Farm Setup', 'Beginner'],
    section: 'Getting Started', 
    readTime: '8 min read',
    keywords: ['farm', 'create', 'add', 'setup', 'location', 'GPS']
  },
  {
    id: 'field-boundaries',
    title: 'Adding Field Boundaries',
    description: 'How to define precise field boundaries for accurate satellite monitoring',
    content: 'Detailed guide on mapping field boundaries using our interactive tools...',
    tags: ['Fields', 'Mapping'],
    section: 'Getting Started',
    readTime: '10 min read',
    keywords: ['fields', 'boundaries', 'mapping', 'polygon', 'satellite', 'GPS']
  },
  {
    id: 'ndvi-understanding',
    title: 'Understanding NDVI & Vegetation Indices',
    description: 'Learn what NDVI, EVI, and other vegetation indices tell you about your crops',
    content: 'Comprehensive explanation of vegetation indices and their agricultural applications...',
    tags: ['NDVI', 'Satellite', 'Science'],
    section: 'Crop Health',
    readTime: '12 min read',
    keywords: ['NDVI', 'EVI', 'vegetation', 'index', 'satellite', 'crop', 'health']
  },
  {
    id: 'health-scores',
    title: 'Health Score Interpretation',
    description: 'How to read and interpret your crop health scores and alerts',
    content: 'Learn to understand health scores, thresholds, and what they mean for your crops...',
    tags: ['Health Score', 'Analysis'],
    section: 'Crop Health',
    readTime: '8 min read',
    keywords: ['health', 'score', 'interpretation', 'alerts', 'thresholds']
  },
  {
    id: 'weather-forecasts',
    title: 'Hyperlocal Weather Forecasts',
    description: 'Access field-specific weather forecasts with agricultural insights',
    content: 'How to use hyperlocal weather data for precision farming decisions...',
    tags: ['Weather', 'Forecasts'],
    section: 'Weather',
    readTime: '7 min read',
    keywords: ['weather', 'forecast', 'hyperlocal', 'field', 'agricultural']
  },
  {
    id: 'ai-recommendations',
    title: 'Understanding AI Recommendations',
    description: 'How our AI analyzes your data to provide personalized farming advice',
    content: 'Deep dive into how our AI system generates farming recommendations...',
    tags: ['AI', 'Recommendations'],
    section: 'AI Recommendations',
    readTime: '10 min read',
    keywords: ['AI', 'artificial intelligence', 'recommendations', 'advice', 'machine learning']
  },
  {
    id: 'financial-setup',
    title: 'Setting Up Financial Tracking',
    description: 'Configure expense categories, budgets, and financial goals for your farm',
    content: 'Complete guide to setting up financial tracking and budgeting...',
    tags: ['Setup', 'Budgeting'],
    section: 'Financial Management',
    readTime: '15 min read',
    keywords: ['financial', 'expense', 'budget', 'tracking', 'money', 'cost']
  },
  {
    id: 'data-sync',
    title: 'Data Sync Issues',
    description: 'Troubleshoot satellite data delays, weather updates, and sync problems',
    content: 'Common sync issues and how to resolve them...',
    tags: ['Sync', 'Data'],
    section: 'Troubleshooting',
    readTime: '6 min read',
    keywords: ['sync', 'data', 'delay', 'update', 'satellite', 'weather']
  }
]

interface HelpSearchProps {
  onArticleSelect?: (article: HelpArticle) => void
  placeholder?: string
}

export function HelpSearch({ onArticleSelect, placeholder = "Search help articles..." }: HelpSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<HelpArticle[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    const searchWords = searchTerm.toLowerCase().split(' ')
    const filtered = helpArticles.filter(article => {
      const searchableText = [
        article.title,
        article.description,
        article.section,
        ...article.tags,
        ...article.keywords
      ].join(' ').toLowerCase()

      return searchWords.every(word => searchableText.includes(word))
    }).slice(0, 8) // Limit to 8 results

    setResults(filtered)
    setShowResults(true)
  }, [searchTerm])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.length >= 2 && !recentSearches.includes(term)) {
      setRecentSearches(prev => [term, ...prev.slice(0, 4)]) // Keep last 5 searches
    }
  }

  const handleArticleClick = (article: HelpArticle) => {
    setShowResults(false)
    setSearchTerm('')
    if (onArticleSelect) {
      onArticleSelect(article)
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sage-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-sage-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-sage-500" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <ModernCard variant="floating" className="max-h-96 overflow-y-auto">
            <ModernCardContent className="p-4">
              {results.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm text-sage-600 mb-3">
                    {results.length} article{results.length !== 1 ? 's' : ''} found
                  </div>
                  {(results || []).map((article) => (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="w-full text-left p-3 rounded-lg hover:bg-sage-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sage-800 group-hover:text-sage-900">
                          {article.title}
                        </h3>
                        <ChevronRight className="h-4 w-4 text-sage-400 group-hover:text-sage-600 transition-colors flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-sm text-sage-600 mb-2 line-clamp-2">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {article.section}
                          </Badge>
                          {(article.tags || []).slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-sage-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Search className="h-8 w-8 text-sage-400 mx-auto mb-3" />
                  <p className="text-sage-600 mb-2">No articles found</p>
                  <p className="text-sm text-sage-500">
                    Try different keywords or browse our help sections below
                  </p>
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && results.length === 0 && searchTerm.length < 2 && (
                <div className="mt-4 pt-4 border-t border-sage-200">
                  <div className="text-sm text-sage-600 mb-2">Recent searches</div>
                  <div className="flex flex-wrap gap-2">
                    {(recentSearches || []).map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(term)}
                        className="text-xs px-2 py-1 bg-sage-100 text-sage-700 rounded-full hover:bg-sage-200 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  )
}