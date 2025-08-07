import { Navbar } from '../components/navigation/navbar'
import Link from 'next/link'
import { Button } from '../components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-crops organic-bg flex items-center justify-center">
        <div className="relative z-10 max-w-6xl w-full text-center px-4">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 text-white">
            Transform Your Farm with{' '}
            <span className="block text-white/90">
              Crops.AI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            AI-powered land and crop management platform for modern agriculture. 
            Optimize your farm&apos;s productivity with intelligent decision-support, 
            real-time monitoring, and predictive analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link href="/register">
              <button className="btn-ghost-white text-lg px-10 py-4">
                Get Started Free
              </button>
            </Link>
            <Link href="/login">
              <button className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 rounded-full px-10 py-4 font-medium text-lg">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <main className="py-24 px-4 bg-gradient-crops-light">
        <div className="max-w-6xl w-full mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gradient">
              Powerful Features for Modern Agriculture
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to optimize your farm&apos;s productivity and sustainability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="card-gradient text-center">
              <div className="text-5xl mb-6">🌤️</div>
              <h3 className="text-xl font-semibold mb-4 text-gradient">
                Weather Intelligence
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time weather data and hyperlocal forecasting for precise farm management decisions
              </p>
            </div>
            
            <div className="card-gradient text-center">
              <div className="text-5xl mb-6">🛰️</div>
              <h3 className="text-xl font-semibold mb-4 text-gradient">
                Satellite Monitoring
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Track crop health and growth stages with advanced satellite imagery analysis and NDVI
              </p>
            </div>
            
            <div className="card-gradient text-center">
              <div className="text-5xl mb-6">🤖</div>
              <h3 className="text-xl font-semibold mb-4 text-gradient">
                AI Recommendations
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get intelligent insights for planting, irrigation, and harvest optimization powered by ML
              </p>
            </div>
          </div>

          <div className="text-center card-gradient max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gradient">
              Transform Your Farm Management Today
            </h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Join thousands of farmers who are already using Crops.AI to increase yields, 
              reduce costs, and make data-driven decisions for sustainable agriculture.
            </p>
            <Link href="/register">
              <button className="btn-ghost text-lg px-10 py-4">
                Start Your Free Trial
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}