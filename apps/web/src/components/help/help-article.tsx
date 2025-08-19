'use client'

import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  ArrowLeft, Clock, Share2, Bookmark, ThumbsUp, ThumbsDown,
  CheckCircle2, Info, Lightbulb, AlertTriangle, ExternalLink
} from 'lucide-react'

interface HelpArticleProps {
  id: string
  title: string
  description: string
  section: string
  tags: string[]
  readTime: string
  lastUpdated?: string
  onBack?: () => void
}

export function HelpArticle({ 
  id, 
  title, 
  description, 
  section, 
  tags, 
  readTime, 
  lastUpdated,
  onBack 
}: HelpArticleProps) {
  
  // Article content would typically be fetched from a CMS or database
  const getArticleContent = (articleId: string) => {
    switch (articleId) {
      case 'account-setup':
        return (
          <div className="prose prose-sage max-w-none">
            <p className="lead">
              Welcome to Crops.AI! This comprehensive guide will walk you through setting up your account 
              and getting started with precision agriculture monitoring.
            </p>

            <h3>Step 1: Creating Your Account</h3>
            <ol>
              <li>Visit the Crops.AI registration page</li>
              <li>Enter your email address and create a secure password</li>
              <li>Verify your email address by clicking the link we send you</li>
              <li>Complete your profile with basic information about your farming operation</li>
            </ol>

            <Alert className="my-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Tip:</strong> Use a strong password with at least 12 characters, 
                including uppercase, lowercase, numbers, and symbols.
              </AlertDescription>
            </Alert>

            <h3>Step 2: First Login & Profile Setup</h3>
            <p>
              After verifying your email, log in with your credentials. You&apos;ll be guided through 
              a brief onboarding process to set up your farming profile.
            </p>

            <ul>
              <li><strong>Farm Type:</strong> Specify your primary agricultural focus</li>
              <li><strong>Experience Level:</strong> Help us tailor recommendations</li>
              <li><strong>Location:</strong> Enable location services for local weather data</li>
              <li><strong>Notification Preferences:</strong> Choose how you want to receive alerts</li>
            </ul>

            <h3>Step 3: Dashboard Overview</h3>
            <p>
              Once your profile is complete, you&apos;ll access your personalized dashboard. 
              The main dashboard provides:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="p-4 border border-sage-200 rounded-lg">
                <h4 className="font-semibold mb-2">Farm Overview</h4>
                <p className="text-sm text-sage-600">Summary of your farms and fields</p>
              </div>
              <div className="p-4 border border-sage-200 rounded-lg">
                <h4 className="font-semibold mb-2">Health Alerts</h4>
                <p className="text-sm text-sage-600">Recent crop health notifications</p>
              </div>
              <div className="p-4 border border-sage-200 rounded-lg">
                <h4 className="font-semibold mb-2">Weather Updates</h4>
                <p className="text-sm text-sage-600">Local weather and agricultural forecasts</p>
              </div>
              <div className="p-4 border border-sage-200 rounded-lg">
                <h4 className="font-semibold mb-2">AI Recommendations</h4>
                <p className="text-sm text-sage-600">Personalized farming insights</p>
              </div>
            </div>

            <Alert className="my-6">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> After completing account setup, we recommend adding your first farm 
                to start receiving personalized insights and recommendations.
              </AlertDescription>
            </Alert>
          </div>
        )

      case 'first-farm':
        return (
          <div className="prose prose-sage max-w-none">
            <p className="lead">
              Adding your first farm is the foundation of using Crops.AI effectively. 
              This guide covers everything you need to know about farm setup and configuration.
            </p>

            <h3>Before You Start</h3>
            <p>Gather the following information about your farm:</p>
            <ul>
              <li>Farm name and description</li>
              <li>Physical address or GPS coordinates</li>
              <li>Total farm area (in hectares or acres)</li>
              <li>Primary crop types you grow</li>
              <li>Any existing field boundaries or maps</li>
            </ul>

            <h3>Step 1: Navigate to Farm Creation</h3>
            <ol>
              <li>From your dashboard, click &quot;Add Farm&quot; or use the &quot;+&quot; button</li>
              <li>Choose &quot;Create New Farm&quot; from the dropdown menu</li>
              <li>You&apos;ll be redirected to the farm creation wizard</li>
            </ol>

            <h3>Step 2: Basic Farm Information</h3>
            <div className="bg-sage-50 p-4 rounded-lg my-6">
              <h4 className="font-semibold mb-3">Required Fields:</h4>
              <ul className="space-y-2">
                <li><strong>Farm Name:</strong> Choose a descriptive name for easy identification</li>
                <li><strong>Description:</strong> Brief overview of your farming operation</li>
                <li><strong>Location:</strong> Enter address or pin location on map</li>
                <li><strong>Total Area:</strong> Specify in your preferred units</li>
              </ul>
            </div>

            <h3>Step 3: Location & Mapping</h3>
            <p>
              Accurate location data is crucial for satellite monitoring and weather forecasting:
            </p>
            <ul>
              <li>Use the interactive map to pin your farm location</li>
              <li>Adjust the marker for precise positioning</li>
              <li>The system will automatically detect your time zone</li>
              <li>Verify the address information is correct</li>
            </ul>

            <Alert className="my-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> GPS coordinates must be accurate for optimal satellite coverage. 
                If your location seems incorrect, manually adjust the map marker.
              </AlertDescription>
            </Alert>

            <h3>Step 4: Crop Information</h3>
            <p>Select your primary crops to receive relevant insights:</p>
            <ul>
              <li>Choose from common crop types or add custom ones</li>
              <li>Specify planting seasons if applicable</li>
              <li>Add any special growing conditions or practices</li>
            </ul>

            <h3>Step 5: Review & Save</h3>
            <p>
              Before saving, review all information for accuracy. Once created, 
              you can always edit farm details from the farm management page.
            </p>

            <Alert className="my-6">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Success!</strong> Once your farm is created, satellite data will begin processing within 24-48 hours. 
                You can add field boundaries immediately to start receiving detailed insights.
              </AlertDescription>
            </Alert>
          </div>
        )

      case 'ndvi-understanding':
        return (
          <div className="prose prose-sage max-w-none">
            <p className="lead">
              Understanding vegetation indices is key to interpreting your satellite data. 
              This guide explains NDVI, EVI, and other metrics that power your crop health insights.
            </p>

            <h3>What is NDVI?</h3>
            <p>
              NDVI (Normalized Difference Vegetation Index) is a satellite-derived measurement that 
              indicates vegetation health and vigor. It&apos;s calculated using near-infrared and red light 
              reflectance from satellite imagery.
            </p>

            <div className="bg-earth-50 p-4 rounded-lg my-6">
              <h4 className="font-semibold mb-3">NDVI Scale Interpretation:</h4>
              <ul className="space-y-2">
                <li><strong>0.8 - 1.0:</strong> Dense, healthy vegetation</li>
                <li><strong>0.6 - 0.8:</strong> Moderately dense vegetation</li>
                <li><strong>0.4 - 0.6:</strong> Sparse vegetation or early growth</li>
                <li><strong>0.2 - 0.4:</strong> Very sparse vegetation or stressed crops</li>
                <li><strong>0.0 - 0.2:</strong> Bare soil, rock, or water</li>
                <li><strong>Below 0:</strong> Water bodies</li>
              </ul>
            </div>

            <h3>Other Important Vegetation Indices</h3>
            
            <h4>EVI (Enhanced Vegetation Index)</h4>
            <p>
              EVI provides improved sensitivity in high biomass regions and better vegetation 
              monitoring through a de-coupling of the canopy background signal and a reduction 
              in atmosphere influences.
            </p>

            <h4>SAVI (Soil Adjusted Vegetation Index)</h4>
            <p>
              SAVI minimizes soil brightness influences from spectral vegetation indices 
              involving red and near-infrared (NIR) wavelengths. It&apos;s particularly useful 
              for crops with sparse canopy cover.
            </p>

            <h4>LAI (Leaf Area Index)</h4>
            <p>
              LAI measures the leaf area per unit ground area and is an important structural 
              parameter for understanding crop growth and development.
            </p>

            <h3>Practical Applications in Farming</h3>
            <ul>
              <li><strong>Crop Health Monitoring:</strong> Identify stressed areas early</li>
              <li><strong>Yield Prediction:</strong> Correlate vegetation indices with expected yields</li>
              <li><strong>Irrigation Management:</strong> Optimize water application timing</li>
              <li><strong>Nutrient Management:</strong> Identify areas needing fertilization</li>
              <li><strong>Pest/Disease Detection:</strong> Spot anomalies that may indicate problems</li>
            </ul>

            <Alert className="my-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tip:</strong> Use NDVI trends over time rather than single measurements. 
                Consistent decline in NDVI values often indicates developing problems that require attention.
              </AlertDescription>
            </Alert>

            <h3>Limitations to Consider</h3>
            <p>While vegetation indices are powerful tools, they have limitations:</p>
            <ul>
              <li>Cloud cover can affect satellite data quality</li>
              <li>Atmospheric conditions may influence readings</li>
              <li>Soil type and moisture can impact index values</li>
              <li>Index saturation in very dense vegetation</li>
            </ul>
          </div>
        )

      default:
        return (
          <div className="prose prose-sage max-w-none">
            <p>This article is being prepared. Please check back soon for complete content.</p>
            <Alert className="my-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Need immediate help?</strong> Contact our support team at support@crops.ai 
                or use the live chat feature for personalized assistance.
              </AlertDescription>
            </Alert>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Article Header */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-4 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Help Center
                </button>
              )}
              
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{section}</Badge>
                <span className="text-sm text-sage-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readTime}
                </span>
              </div>

              <ModernCardTitle className="text-3xl text-sage-800 mb-3">
                {title}
              </ModernCardTitle>
              
              <ModernCardDescription className="text-lg">
                {description}
              </ModernCardDescription>

              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <button className="p-2 hover:bg-sage-100 rounded-lg transition-colors">
                <Bookmark className="h-4 w-4 text-sage-600" />
              </button>
              <button className="p-2 hover:bg-sage-100 rounded-lg transition-colors">
                <Share2 className="h-4 w-4 text-sage-600" />
              </button>
            </div>
          </div>
        </ModernCardHeader>
      </ModernCard>

      {/* Article Content */}
      <ModernCard variant="floating">
        <ModernCardContent className="p-8">
          {getArticleContent(id)}
        </ModernCardContent>
      </ModernCard>

      {/* Article Footer */}
      <ModernCard variant="soft">
        <ModernCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-sage-600">Was this article helpful?</span>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1 hover:bg-sage-100 rounded-lg transition-colors text-sm">
                  <ThumbsUp className="h-4 w-4" />
                  Yes
                </button>
                <button className="flex items-center gap-2 px-3 py-1 hover:bg-sage-100 rounded-lg transition-colors text-sm">
                  <ThumbsDown className="h-4 w-4" />
                  No
                </button>
              </div>
            </div>
            
            {lastUpdated && (
              <span className="text-xs text-sage-500">
                Last updated: {lastUpdated}
              </span>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-sage-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sage-600">
                Need more help? <button className="text-sage-800 hover:underline">Contact Support</button>
              </span>
              <button className="flex items-center gap-1 text-sage-600 hover:text-sage-800">
                View related articles <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}