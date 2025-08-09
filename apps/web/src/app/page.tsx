import { Navbar } from '../components/navigation/navbar'
import Link from 'next/link'
import { Button } from '../components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen bg-agricultural flex items-center justify-start">
        <div className="absolute inset-0 agricultural-overlay"></div>
        <div className="relative z-10 max-w-7xl w-full px-8 lg:px-16">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 text-white leading-tight">
              Crops.AI
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl leading-relaxed">
              AI-powered land and crop management platform for modern agriculture. 
              Optimize your farm&apos;s productivity with intelligent decision-support, 
              real-time monitoring, and predictive analytics. Transform your agricultural operations with cutting-edge technology.
            </p>
            
            <div>
              <Link href="/register">
                <button className="border-4 border-white bg-transparent text-white hover:bg-white hover:text-green-800 transition-all duration-300 rounded-full px-12 py-4 font-medium text-xl">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 lg:px-16 bg-agricultural">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Powerful Features for Modern Agriculture
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Everything you need to optimize your farm&apos;s productivity and sustainability with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="card-sleek text-center group">
              <div className="text-6xl mb-6">🌤️</div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                Weather Intelligence
              </h3>
              <p className="text-white/80 leading-relaxed text-lg">
                Real-time weather data and hyperlocal forecasting for precise farm management decisions. Get alerts for extreme weather conditions.
              </p>
            </div>
            
            <div className="card-sleek text-center group">
              <div className="text-6xl mb-6">🛰️</div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                Satellite Monitoring
              </h3>
              <p className="text-white/80 leading-relaxed text-lg">
                Track crop health and growth stages with advanced satellite imagery analysis, NDVI monitoring, and stress detection.
              </p>
            </div>
            
            <div className="card-sleek text-center group">
              <div className="text-6xl mb-6">🤖</div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                AI Recommendations
              </h3>
              <p className="text-white/80 leading-relaxed text-lg">
                Get intelligent insights for planting, irrigation, and harvest optimization powered by machine learning algorithms.
              </p>
            </div>
          </div>

          <div className="text-center card-sleek max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Transform Your Farm Management Today
            </h2>
            <p className="text-white/80 mb-8 text-xl leading-relaxed">
              Join thousands of farmers who are already using Crops.AI to increase yields, 
              reduce costs, and make data-driven decisions for sustainable agriculture.
            </p>
            <div className="flex justify-center">
              <Link href="/register">
                <button className="border-4 border-white bg-transparent text-white hover:bg-white hover:text-green-800 transition-all duration-300 rounded-full px-16 py-5 font-medium text-xl">
                  Start Your Free Trial
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gradient-crops py-16 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white/80">
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Privacy Center</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Data Protection</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Settings</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Controls</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Cookie</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Essential Cookies</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Analytics Cookies</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Marketing Cookies</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">About Ads</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">How Ads Work</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Ad Preferences</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Opt-Out Options</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20 text-right">
            <p className="text-white/60 text-sm">© 2080 Crops.AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}