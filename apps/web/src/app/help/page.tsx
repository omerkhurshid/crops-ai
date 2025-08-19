import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { HelpSearch } from '../../components/help/help-search'
import { 
  HelpCircle, Book, Video, MessageCircle, Mail, 
  Sprout, Activity, CloudRain, DollarSign, BarChart3,
  Leaf, Satellite, Target, Settings, Users, ExternalLink,
  ChevronRight, Search, Phone, Clock
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const helpSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Essential guides to set up and use your Crops.AI platform',
    icon: <Sprout className="h-6 w-6" />,
    articles: [
      {
        title: 'Account Setup & First Login',
        description: 'Complete guide to setting up your Crops.AI account and first-time login',
        readTime: '5 min read',
        tags: ['Setup', 'Account']
      },
      {
        title: 'Creating Your First Farm',
        description: 'Step-by-step instructions for adding your first farm and setting up basic information',
        readTime: '8 min read',
        tags: ['Farm Setup', 'Beginner']
      },
      {
        title: 'Adding Field Boundaries',
        description: 'How to define precise field boundaries for accurate satellite monitoring',
        readTime: '10 min read',
        tags: ['Fields', 'Mapping']
      },
      {
        title: 'Understanding the Dashboard',
        description: 'Navigate your main dashboard and understand key metrics and insights',
        readTime: '6 min read',
        tags: ['Dashboard', 'Overview']
      }
    ]
  },
  {
    id: 'crop-health',
    title: 'Crop Health Monitoring',
    description: 'Learn to monitor and analyze your crop health with satellite data',
    icon: <Activity className="h-6 w-6" />,
    articles: [
      {
        title: 'Understanding NDVI & Vegetation Indices',
        description: 'Learn what NDVI, EVI, and other vegetation indices tell you about your crops',
        readTime: '12 min read',
        tags: ['NDVI', 'Satellite', 'Science']
      },
      {
        title: 'Health Score Interpretation',
        description: 'How to read and interpret your crop health scores and alerts',
        readTime: '8 min read',
        tags: ['Health Score', 'Analysis']
      },
      {
        title: 'Setting Up Health Alerts',
        description: 'Configure automated alerts for crop stress, disease, and other health issues',
        readTime: '6 min read',
        tags: ['Alerts', 'Monitoring']
      },
      {
        title: 'Historical Health Trends',
        description: 'Analyze historical crop health data to identify patterns and optimize practices',
        readTime: '10 min read',
        tags: ['Trends', 'History']
      }
    ]
  },
  {
    id: 'weather',
    title: 'Weather Intelligence',
    description: 'Master weather forecasting and agricultural weather insights',
    icon: <CloudRain className="h-6 w-6" />,
    articles: [
      {
        title: 'Hyperlocal Weather Forecasts',
        description: 'Access field-specific weather forecasts with agricultural insights',
        readTime: '7 min read',
        tags: ['Weather', 'Forecasts']
      },
      {
        title: 'Agricultural Weather Alerts',
        description: 'Set up alerts for frost, precipitation, wind, and other agricultural conditions',
        readTime: '9 min read',
        tags: ['Alerts', 'Weather']
      },
      {
        title: 'Irrigation Planning',
        description: 'Use weather data and soil moisture insights for optimal irrigation timing',
        readTime: '11 min read',
        tags: ['Irrigation', 'Planning']
      },
      {
        title: 'Weather Data Integration',
        description: 'How weather data enhances crop health analysis and recommendations',
        readTime: '8 min read',
        tags: ['Integration', 'Analysis']
      }
    ]
  },
  {
    id: 'recommendations',
    title: 'AI Recommendations',
    description: 'Get the most from AI-powered farming recommendations',
    icon: <Target className="h-6 w-6" />,
    articles: [
      {
        title: 'Understanding AI Recommendations',
        description: 'How our AI analyzes your data to provide personalized farming advice',
        readTime: '10 min read',
        tags: ['AI', 'Recommendations']
      },
      {
        title: 'Implementing Suggested Actions',
        description: 'Best practices for implementing AI recommendations on your farm',
        readTime: '12 min read',
        tags: ['Implementation', 'Best Practices']
      },
      {
        title: 'Confidence Scores & Reliability',
        description: 'Understanding confidence levels and when to trust AI recommendations',
        readTime: '8 min read',
        tags: ['Confidence', 'Trust']
      },
      {
        title: 'Customizing Recommendation Settings',
        description: 'Tailor AI recommendations to your specific crops, practices, and preferences',
        readTime: '9 min read',
        tags: ['Customization', 'Settings']
      }
    ]
  },
  {
    id: 'financial',
    title: 'Financial Management',
    description: 'Track expenses, analyze profitability, and manage farm finances',
    icon: <DollarSign className="h-6 w-6" />,
    articles: [
      {
        title: 'Setting Up Financial Tracking',
        description: 'Configure expense categories, budgets, and financial goals for your farm',
        readTime: '15 min read',
        tags: ['Setup', 'Budgeting']
      },
      {
        title: 'Recording Expenses & Income',
        description: 'How to accurately record all farm-related financial transactions',
        readTime: '8 min read',
        tags: ['Expenses', 'Income']
      },
      {
        title: 'Profitability Analysis',
        description: 'Analyze profit margins, ROI, and financial performance by field or crop',
        readTime: '12 min read',
        tags: ['Analysis', 'Profitability']
      },
      {
        title: 'Financial Reporting & Export',
        description: 'Generate financial reports and export data for accounting or tax purposes',
        readTime: '10 min read',
        tags: ['Reports', 'Export']
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Common issues and solutions for using Crops.AI',
    icon: <Settings className="h-6 w-6" />,
    articles: [
      {
        title: 'Data Sync Issues',
        description: 'Troubleshoot satellite data delays, weather updates, and sync problems',
        readTime: '6 min read',
        tags: ['Sync', 'Data']
      },
      {
        title: 'Mobile App Problems',
        description: 'Common mobile app issues and solutions for field data collection',
        readTime: '8 min read',
        tags: ['Mobile', 'Issues']
      },
      {
        title: 'Account & Login Issues',
        description: 'Password reset, account access, and authentication troubleshooting',
        readTime: '5 min read',
        tags: ['Account', 'Login']
      },
      {
        title: 'Performance Optimization',
        description: 'Tips to improve app performance and reduce loading times',
        readTime: '7 min read',
        tags: ['Performance', 'Speed']
      }
    ]
  }
]

const quickActions = [
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step video guides',
    icon: <Video className="h-5 w-5" />,
    href: '/help/videos',
    external: false
  },
  {
    title: 'Community Forum',
    description: 'Connect with other farmers',
    icon: <MessageCircle className="h-5 w-5" />,
    href: 'https://community.crops.ai',
    external: true
  },
  {
    title: 'Contact Support',
    description: 'Get personalized help',
    icon: <Mail className="h-5 w-5" />,
    href: '/help/contact',
    external: false
  },
  {
    title: 'System Status',
    description: 'Check service availability',
    icon: <Activity className="h-5 w-5" />,
    href: 'https://status.crops.ai',
    external: true
  }
]

export default async function HelpPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="minimal-page">
      <Navbar />
      
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage-50/80 to-earth-50/80 -z-10"></div>
      <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
        <Book className="h-8 w-8 text-sage-600" />
      </div>
      <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
        <HelpCircle className="h-8 w-8 text-sage-600" />
      </div>
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl">
              <HelpCircle className="h-10 w-10 text-sage-700" />
            </div>
            <h1 className="text-4xl md:text-6xl font-light text-sage-800 tracking-tight">
              Help Center
            </h1>
          </div>
          <p className="text-xl text-sage-600 font-light max-w-2xl mx-auto leading-relaxed mb-8">
            Everything you need to master precision agriculture with Crops.AI
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <HelpSearch placeholder="Search help articles, guides, and tutorials..." />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-sage-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <ModernCard key={index} variant="soft" className="group hover:shadow-soft transition-all duration-300">
                <ModernCardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-sage-100 rounded-lg group-hover:bg-sage-200 transition-colors">
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-sage-800">{action.title}</h3>
                    {action.external && <ExternalLink className="h-4 w-4 text-sage-500" />}
                  </div>
                  <p className="text-sm text-sage-600 mb-4">{action.description}</p>
                  <div className="flex items-center text-sage-700 font-medium text-sm group-hover:text-sage-800">
                    Access now <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Support Contact Info */}
        <div className="mb-16">
          <ModernCard variant="glow" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-earth-50">
              <ModernCardTitle className="text-sage-800 flex items-center gap-3">
                <Users className="h-6 w-6" />
                Need Personal Support?
              </ModernCardTitle>
              <ModernCardDescription>
                Our agricultural technology experts are here to help you succeed
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-3 bg-sage-100 rounded-xl mx-auto w-fit mb-3">
                    <Phone className="h-6 w-6 text-sage-700" />
                  </div>
                  <h4 className="font-semibold text-sage-800 mb-1">Phone Support</h4>
                  <p className="text-sm text-sage-600 mb-2">+1 (555) 123-4567</p>
                  <Badge variant="outline" className="text-xs">Mon-Fri 8AM-6PM EST</Badge>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-earth-100 rounded-xl mx-auto w-fit mb-3">
                    <Mail className="h-6 w-6 text-earth-700" />
                  </div>
                  <h4 className="font-semibold text-earth-800 mb-1">Email Support</h4>
                  <p className="text-sm text-earth-600 mb-2">support@crops.ai</p>
                  <Badge variant="outline" className="text-xs">24-48 hour response</Badge>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-cream-100 rounded-xl mx-auto w-fit mb-3">
                    <Clock className="h-6 w-6 text-sage-700" />
                  </div>
                  <h4 className="font-semibold text-sage-800 mb-1">Live Chat</h4>
                  <p className="text-sm text-sage-600 mb-2">Available in-app</p>
                  <Badge variant="outline" className="text-xs">Mon-Fri 9AM-5PM EST</Badge>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Help Sections */}
        <div className="space-y-12">
          {helpSections.map((section) => (
            <div key={section.id}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-sage-100 to-earth-100 rounded-xl">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-sage-800">{section.title}</h2>
                  <p className="text-sage-600">{section.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.articles.map((article, index) => (
                  <ModernCard key={index} variant="soft" className="group hover:shadow-soft transition-all duration-300">
                    <ModernCardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-sage-800 group-hover:text-sage-900">
                          {article.title}
                        </h3>
                        <ChevronRight className="h-4 w-4 text-sage-400 group-hover:text-sage-600 transition-colors" />
                      </div>
                      <p className="text-sm text-sage-600 mb-4 leading-relaxed">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-sage-500">{article.readTime}</span>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help */}
        <div className="mt-16 text-center">
          <Alert className="max-w-2xl mx-auto">
            <Search className="h-4 w-4" />
            <AlertDescription>
              <strong>Can&apos;t find what you&apos;re looking for?</strong> Use the search feature in the top navigation 
              or contact our support team directly. We&apos;re here to ensure you get the most out of your precision agriculture platform.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    </div>
  )
}