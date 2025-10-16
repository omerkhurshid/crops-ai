import { Navbar } from '../components/navigation/navbar'
import Link from 'next/link'
import { Badge } from '../components/ui/badge'
import dynamic from 'next/dynamic'

// Interactive demo removed for production

import { 
  Sprout, CloudRain, Satellite, Brain, TrendingUp, Shield, 
  BarChart, Users, ArrowRight, Target, Eye
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../lib/auth/session'
import { HomePageDemos } from '../components/demos/home-page-demos'

export default async function Home() {
  // Check if user is logged in
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Professional Header */}
          <div className="text-center mb-8">
            <Badge variant="outline" className="bg-sage-600 text-white border-sage-500 px-4 py-2 text-sm font-medium">
              <Satellite className="h-4 w-4 mr-2" />
              Advanced Agricultural Intelligence Platform
            </Badge>
          </div>

          {/* Main Hero */}
          <div className="text-center mb-8 sm:mb-16 p-4 sm:p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-sage-100">
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-sage-800 leading-tight">
              Precision Agriculture<br />
              <span className="text-sage-600">Made Simple</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-sage-700 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
              Advanced satellite monitoring, AI-powered insights, and data-driven decisions for modern farming operations.
            </p>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-5xl mx-auto px-2">
              <div className="bg-sage-50 p-4 sm:p-6 rounded-lg border border-sage-200">
                <Satellite className="h-8 w-8 sm:h-10 sm:w-10 text-sage-600 mb-2 sm:mb-3 mx-auto" />
                <h3 className="text-base sm:text-lg font-semibold text-sage-700 mb-2">Satellite Monitoring</h3>
                <p className="text-sm sm:text-base text-sage-600">Real-time crop health tracking with NDVI analysis</p>
              </div>
              <div className="bg-earth-50 p-4 sm:p-6 rounded-lg border border-earth-200">
                <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-earth-600 mb-2 sm:mb-3 mx-auto" />
                <h3 className="text-base sm:text-lg font-semibold text-earth-700 mb-2">AI Analytics</h3>
                <p className="text-sm sm:text-base text-earth-600">Smart recommendations and predictive insights</p>
              </div>
              <div className="bg-cream-50 p-4 sm:p-6 rounded-lg border border-cream-200">
                <BarChart className="h-8 w-8 sm:h-10 sm:w-10 text-golden mb-2 sm:mb-3 mx-auto" />
                <h3 className="text-base sm:text-lg font-semibold text-golden mb-2">Data Management</h3>
                <p className="text-sm sm:text-base text-golden">Comprehensive farm records and analytics</p>
              </div>
            </div>
            
            {/* CTA */}
            <div className="mb-6">
              <Link href="/register">
                <button className="bg-sage-600 hover:bg-sage-700 px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold text-base sm:text-lg rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center mb-4 w-full sm:w-auto justify-center">
                  <Sprout className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Start Your Free Trial
                </button>
              </Link>
              <div className="text-center">
                <p className="text-sage-600 text-xs sm:text-sm mb-2 px-4">30-day free trial • No setup fees • Cancel anytime</p>
                <div className="inline-flex items-center text-sage-600 font-medium text-xs sm:text-sm">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Enterprise-grade security and reliability
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 px-2">
            
            {/* Crop Monitoring */}
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-sage-200 hover:shadow-lg transition-shadow">
              <div className="p-2 sm:p-3 bg-sage-100 rounded-full w-fit mb-3 sm:mb-4">
                <Satellite className="h-6 w-6 sm:h-8 sm:w-8 text-sage-700" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-sage-800 mb-2 sm:mb-3">Satellite Crop Monitoring</h3>
              <p className="text-sm sm:text-base text-sage-600 leading-relaxed">
                Monitor vegetation health using advanced satellite imagery and NDVI analysis. 
                Get early detection of stress, disease, and pest issues before they impact yields.
              </p>
            </div>
            
            {/* Weather Intelligence */}
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-sage-200 hover:shadow-lg transition-shadow">
              <div className="p-2 sm:p-3 bg-earth-100 rounded-full w-fit mb-3 sm:mb-4">
                <CloudRain className="h-6 w-6 sm:h-8 sm:w-8 text-earth-700" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-sage-800 mb-2 sm:mb-3">Weather Intelligence</h3>
              <p className="text-sm sm:text-base text-sage-600 leading-relaxed">
                Hyperlocal weather forecasting with agricultural-specific insights. 
                Optimize spray timing, irrigation schedules, and harvest planning.
              </p>
            </div>
            
            {/* Data Analytics */}
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-sage-200 hover:shadow-lg transition-shadow">
              <div className="p-2 sm:p-3 bg-cream-100 rounded-full w-fit mb-3 sm:mb-4">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-golden" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-sage-800 mb-2 sm:mb-3">Performance Analytics</h3>
              <p className="text-sm sm:text-base text-sage-600 leading-relaxed">
                Comprehensive farm analytics with yield tracking, financial insights, 
                and performance benchmarking to optimize your operations.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Interactive Demos Section */}
      <HomePageDemos />

      {/* Trust & Security */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-sage-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-sage-800 mb-8">
            Trusted by Professional Farmers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-sage-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-sage-800 mb-2">Enterprise Security</h3>
              <p className="text-sage-600">Bank-level encryption and data protection</p>
            </div>
            <div className="text-center">
              <Eye className="h-12 w-12 text-sage-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-sage-800 mb-2">Proven Science</h3>
              <p className="text-sage-600">Based on established agricultural research</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-sage-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-sage-800 mb-2">Farmer Focused</h3>
              <p className="text-sage-600">Designed by and for agricultural professionals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join professional farmers using advanced agricultural technology.
          </p>
          <Link href="/register">
            <button className="bg-sage-600 hover:bg-sage-700 px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold text-base sm:text-lg rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center w-full sm:w-auto justify-center">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Start Free Trial
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            </button>
          </Link>
        </div>
      </section>

    </div>
  )
}