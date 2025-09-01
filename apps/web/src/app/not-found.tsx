import Link from 'next/link'
import { Badge } from '../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../components/ui/modern-card'
import { InlineFloatingButton } from '../components/ui/floating-button'
import { Home, ArrowLeft, Search, Map, Sprout } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Animated Background with Floating Elements */}
      <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
        <Search className="h-8 w-8 text-sage-600" />
      </div>
      <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
        <Map className="h-8 w-8 text-sage-600" />
      </div>
      
      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-br from-sage-100 to-earth-100 rounded-3xl relative overflow-hidden">
              <Sprout className="h-16 w-16 text-sage-700 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-sage-200/30 to-earth-200/30 animate-pulse-soft"></div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="text-8xl font-light text-sage-300 mb-4">404</div>
            <h1 className="text-4xl md:text-5xl font-light text-sage-800 mb-4 tracking-tight">
              Page Not Found
            </h1>
            <p className="text-xl text-sage-600 font-light leading-relaxed">
              Looks like this field hasn&apos;t been planted yet. Let&apos;s get you back to fertile ground.
            </p>
          </div>
          
          <Badge className="bg-sage-100 text-sage-700 border-sage-200 mb-8">
            <Search className="h-4 w-4 mr-2" />
            Lost in the fields?
          </Badge>
        </div>

        <ModernCard variant="floating" className="overflow-hidden">
          <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
            <ModernCardTitle className="text-center text-sage-800">Where would you like to go?</ModernCardTitle>
            <ModernCardDescription className="text-center">
              Navigate back to your agricultural dashboard or explore our platform
            </ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/">
                <InlineFloatingButton
                  icon={<Home className="h-5 w-5" />}
                  label="Back to Home"
                  showLabel={true}
                  variant="primary"
                  className="w-full justify-center"
                />
              </Link>
              
              <Link href="/dashboard">
                <InlineFloatingButton
                  icon={<Sprout className="h-5 w-5" />}
                  label="Go to Dashboard"
                  showLabel={true}
                  variant="secondary"
                  className="w-full justify-center"
                />
              </Link>
              
              <Link href="/farms">
                <InlineFloatingButton
                  icon={<Map className="h-5 w-5" />}
                  label="View Farms"
                  showLabel={true}
                  variant="ghost"
                  className="w-full justify-center"
                />
              </Link>
              
              <Link href="/features">
                <InlineFloatingButton
                  icon={<Search className="h-5 w-5" />}
                  label="Explore Features"
                  showLabel={true}
                  variant="ghost"
                  className="w-full justify-center"
                />
              </Link>
            </div>
          </ModernCardContent>
        </ModernCard>

        <div className="text-center mt-8">
          <p className="text-sage-500 text-sm">
            If you believe this is an error, please{' '}
            <Link href="/contact" className="text-sage-700 hover:text-sage-900 underline">
              contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}