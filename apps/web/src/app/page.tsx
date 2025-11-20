'use client'
import { Navbar } from '../components/navigation/navbar'
import Link from 'next/link'
import { useEffect } from 'react'
import { 
  Sprout, CloudRain, Satellite, TrendingUp, Shield, 
  Users, ArrowRight, Target, Eye, DollarSign
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from '../lib/auth-unified'
import { HomePageDemos } from '../components/demos/home-page-demos'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status !== 'loading' && session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-[#7A8F78] text-white px-4 py-2 rounded-full text-sm font-medium">
              <Sprout className="h-4 w-4 mr-2" />
              Smart Farming Made Simple
            </div>
          </div>
          
          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1A1A1A] mb-6 leading-tight">
              Increase Your Farm Profits<br />
              <span className="text-[#7A8F78]">by 20% This Season</span>
            </h1>
            <p className="text-lg md:text-xl text-[#555555] mb-12 max-w-3xl mx-auto leading-relaxed">
              Make better timing decisions with AI-powered recommendations from <strong>Cropple.ai</strong>. 
              Farmers using our platform average $15,000 more profit per season.
            </p>
            
            {/* CTA Button */}
            <div className="mb-8">
              <Link href="/register">
                <button className="bg-[#7A8F78] hover:bg-[#5E6F5A] text-white font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Start Increasing Profits Today
                </button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="text-center mb-12">
              <p className="text-[#555555] text-sm mb-2">First month free • Setup in 5 minutes • Cancel anytime</p>
              <div className="inline-flex items-center text-[#7A8F78] font-medium text-sm">
                <Shield className="h-4 w-4 mr-2" />
                Trusted by 1,200+ farmers using Cropple.ai
              </div>
            </div>
          </div>
          
          {/* Benefit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="bg-white p-6 rounded-xl border border-[#E6E6E6] shadow-sm text-center">
              <DollarSign className="h-10 w-10 text-[#7A8F78] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Catch Problems Early</h3>
              <p className="text-[#555555] text-sm">Save $5,000+ per season by spotting issues before they spread</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#E6E6E6] shadow-sm text-center">
              <CloudRain className="h-10 w-10 text-[#7A8F78] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Perfect Timing Decisions</h3>
              <p className="text-[#555555] text-sm">15% higher yields with AI-powered planting and harvest timing</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#E6E6E6] shadow-sm text-center">
              <TrendingUp className="h-10 w-10 text-[#7A8F78] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Maximize Market Prices</h3>
              <p className="text-[#555555] text-sm">Sell at peak prices with market timing alerts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#1A1A1A] mb-6">
              Everything You Need to Farm Smarter
            </h2>
            <p className="text-lg text-[#555555] max-w-2xl mx-auto">
              Cropple.ai combines satellite imagery, weather data, and AI insights 
              to help you make better decisions for your farm.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Field Health Monitoring */}
            <div className="bg-[#FAFAF7] p-8 rounded-xl text-center">
              <div className="w-16 h-16 bg-[#7A8F78] rounded-xl flex items-center justify-center mx-auto mb-6">
                <Satellite className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Field Health Monitoring</h3>
              <p className="text-[#555555]">
                Monitor your crops' health with satellite imagery and spot problems 
                before they impact your harvest.
              </p>
            </div>
            
            {/* Weather Intelligence */}
            <div className="bg-[#FAFAF7] p-8 rounded-xl text-center">
              <div className="w-16 h-16 bg-[#7A8F78] rounded-xl flex items-center justify-center mx-auto mb-6">
                <CloudRain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Weather Forecasts</h3>
              <p className="text-[#555555]">
                Get hyper-local weather forecasts and know the perfect timing 
                for spraying, watering, and harvesting.
              </p>
            </div>
            
            {/* Data Analytics */}
            <div className="bg-[#FAFAF7] p-8 rounded-xl text-center">
              <div className="w-16 h-16 bg-[#7A8F78] rounded-xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Track Your Progress</h3>
              <p className="text-[#555555]">
                Monitor your farm's performance with harvest tracking, profit reports, 
                and actionable insights to improve yields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demos Section */}
      <HomePageDemos />

      {/* Trust Section */}
      <section className="py-20 px-4 bg-[#F8FAF8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-[#1A1A1A] mb-6">
            Trusted by Professional Farmers
          </h2>
          <p className="text-lg text-[#555555] mb-12 max-w-2xl mx-auto">
            Cropple.ai is built on proven agricultural science and trusted by farmers worldwide.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-[#7A8F78] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Secure & Private</h3>
              <p className="text-[#555555]">Your farm data is protected with enterprise-grade security</p>
            </div>
            <div className="text-center">
              <Eye className="h-12 w-12 text-[#7A8F78] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Proven Results</h3>
              <p className="text-[#555555]">Based on established agricultural research and real farm data</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-[#7A8F78] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Farmer Focused</h3>
              <p className="text-[#555555]">Designed by and for agricultural professionals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-[#5E6F5A] text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of farmers using Cropple.ai to increase their profits.
          </p>
          <Link href="/register">
            <button className="bg-white text-[#5E6F5A] hover:bg-[#FAFAF7] font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 inline-flex items-center shadow-lg">
              <Target className="h-5 w-5 mr-2" />
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </Link>
          
          <div className="border-t border-white/20 mt-12 pt-8">
            <p className="text-white/70 text-sm mb-4">&copy; 2024 Cropple.ai. All rights reserved.</p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link href="/privacy" className="text-white/70 hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="text-white/70 hover:text-white">Terms of Service</Link>
              <Link href="/help" className="text-white/70 hover:text-white">Help Center</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}