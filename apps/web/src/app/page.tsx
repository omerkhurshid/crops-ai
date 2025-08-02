import { Navbar } from '@/components/navigation/navbar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex flex-col items-center justify-center py-24 px-4">
        <div className="max-w-6xl w-full text-center">
          <h1 className="text-5xl font-bold mb-6 text-crops-green-700">
            Welcome to Crops.AI
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            AI-powered land and crop management platform for modern agriculture. 
            Optimize your farm&apos;s productivity with intelligent decision-support, 
            real-time monitoring, and predictive analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border border-crops-green-200">
              <div className="text-crops-green-600 text-4xl mb-4">🌤️</div>
              <h2 className="text-xl font-semibold mb-3 text-crops-green-700">
                Weather Intelligence
              </h2>
              <p className="text-gray-600">
                Real-time weather data and hyperlocal forecasting for precise farm management decisions
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border border-crops-green-200">
              <div className="text-crops-green-600 text-4xl mb-4">🛰️</div>
              <h2 className="text-xl font-semibold mb-3 text-crops-green-700">
                Satellite Monitoring
              </h2>
              <p className="text-gray-600">
                Track crop health and growth stages with advanced satellite imagery analysis and NDVI
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border border-crops-green-200">
              <div className="text-crops-green-600 text-4xl mb-4">🤖</div>
              <h2 className="text-xl font-semibold mb-3 text-crops-green-700">
                AI Recommendations
              </h2>
              <p className="text-gray-600">
                Get intelligent insights for planting, irrigation, and harvest optimization powered by ML
              </p>
            </div>
          </div>

          <div className="mt-20 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Transform Your Farm Management Today
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who are already using Crops.AI to increase yields, 
              reduce costs, and make data-driven decisions for sustainable agriculture.
            </p>
            <Link href="/register">
              <Button size="lg">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}