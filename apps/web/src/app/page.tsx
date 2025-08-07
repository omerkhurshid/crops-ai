import { Navbar } from '../components/navigation/navbar'
import Link from 'next/link'
import { Button } from '../components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-crops organic-bg flex items-center justify-start">
        <div className="relative z-10 max-w-7xl w-full px-8 lg:px-16">
          <div className="max-w-3xl">
            <div className="mb-4">
              <h2 className="text-2xl md:text-3xl font-light text-white/90 mb-2">
                Landing Page
              </h2>
              <p className="text-lg text-white/70">Creative Design</p>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 text-white leading-tight">
              Crops.AI
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl leading-relaxed">
              AI-powered land and crop management platform for modern agriculture. 
              Optimize your farm&apos;s productivity with intelligent decision-support, 
              real-time monitoring, and predictive analytics. Transform your agricultural operations with cutting-edge technology.
            </p>
            
            {/* Dots indicator */}
            <div className="flex gap-2 mb-8">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <div className="w-3 h-3 bg-white/50 rounded-full"></div>
              <div className="w-3 h-3 bg-white/50 rounded-full"></div>
              <div className="w-3 h-3 bg-white/50 rounded-full"></div>
            </div>
            
            <div className="flex gap-6">
              <Link href="/register">
                <button className="border-2 border-white/50 bg-transparent text-white hover:bg-white/10 transition-all duration-300 rounded-full px-8 py-3 font-medium text-lg">
                  FREE
                </button>
              </Link>
              <Link href="/login">
                <button className="border-2 border-white/50 bg-transparent text-white hover:bg-white/10 transition-all duration-300 rounded-full px-8 py-3 font-medium text-lg">
                  PREMIUM
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