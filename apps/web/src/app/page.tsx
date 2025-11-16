'use client'
import { Navbar } from '../components/navigation/navbar'
import Link from 'next/link'
import { Badge } from '../components/ui/badge'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
// Interactive demo removed for production
import { 
  Sprout, CloudRain, Satellite, Brain, TrendingUp, Shield, 
  BarChart, Users, ArrowRight, Target, Eye, DollarSign
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from '../lib/auth-unified'
import { HomePageDemos } from '../components/demos/home-page-demos'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and redirect to dashboard
    if (status !== 'loading' && session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  return (
    <div className="sage-agricultural-bg min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="sage-hero">
        <div className="sage-container">
          {/* Professional Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-[#7A8F78] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sprout className="h-4 w-4 mr-2" />
              Smart Farming Made Simple
            </div>
          </div>
          
          {/* Main Hero */}
          <div className="sage-card text-center max-w-5xl mx-auto mb-16">
            <h1 className="sage-hero h1 text-4xl md:text-6xl font-medium text-[#1A1A1A] mb-6">
              Increase Your Farm Profits<br />
              <span className="text-[#7A8F78]">by 20% This Season</span>
            </h1>
            <p className="sage-hero p text-xl md:text-2xl font-light text-[#555555] mb-8 max-w-3xl mx-auto">
              Make better timing decisions with AI-powered recommendations from <strong>Cropple.ai</strong>. 
              Farmers using our platform average $15,000 more profit per season.
            </p>
            
            {/* Outcome-Focused Benefits */}
            <div className="sage-feature-grid mb-8">
              <div className="sage-feature-card">
                <DollarSign className="sage-feature-icon" />
                <h3 className="sage-feature-title">Catch Problems Early</h3>
                <p className="sage-feature-description">Save $5,000+ per season by spotting issues before they spread</p>
              </div>
              <div className="sage-feature-card">
                <CloudRain className="sage-feature-icon" />
                <h3 className="sage-feature-title">Perfect Timing Decisions</h3>
                <p className="sage-feature-description">15% higher yields with AI-powered planting and harvest timing</p>
              </div>
              <div className="sage-feature-card">
                <TrendingUp className="sage-feature-icon" />
                <h3 className="sage-feature-title">Maximize Market Prices</h3>
                <p className="sage-feature-description">Sell at peak prices with market timing alerts</p>
              </div>
            </div>
            
            {/* CTA */}
            <div className="mb-6">
              <Link href="/register">
                <button className="btn-primary text-lg px-8 py-4 mb-4">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Start Increasing Profits Today
                </button>
              </Link>
              <div className="text-center">
                <p className="text-[#555555] text-sm mb-2">First month free • Setup in 5 minutes • Cancel anytime</p>
                <div className="inline-flex items-center text-[#7A8F78] font-medium text-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Trusted by 1,200+ farmers using Cropple.ai
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="sage-features">
        <div className="sage-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-[#1A1A1A] mb-6">
              Everything You Need to Farm Smarter
            </h2>
            <p className="text-xl text-[#555555] max-w-2xl mx-auto">
              Cropple.ai combines satellite imagery, weather data, and AI insights 
              to help you make better decisions for your farm.
            </p>
          </div>
          
          <div className="sage-feature-grid">
            {/* Field Health Monitoring */}
            <div className="sage-feature-card">
              <div className="p-3 bg-[#DDE4D8] rounded-full w-fit mb-4 mx-auto">
                <Satellite className="h-8 w-8 text-[#7A8F78]" />
              </div>
              <h3 className="sage-feature-title">Field Health Monitoring</h3>
              <p className="sage-feature-description">
                Monitor your crops' health with satellite imagery and spot problems 
                before they impact your harvest.
              </p>
            </div>
            
            {/* Weather Intelligence */}
            <div className="sage-feature-card">
              <div className="p-3 bg-[#DDE4D8] rounded-full w-fit mb-4 mx-auto">
                <CloudRain className="h-8 w-8 text-[#7A8F78]" />
              </div>
              <h3 className="sage-feature-title">Weather Forecasts</h3>
              <p className="sage-feature-description">
                Get hyper-local weather forecasts and know the perfect timing 
                for spraying, watering, and harvesting.
              </p>
            </div>
            
            {/* Data Analytics */}
            <div className="sage-feature-card">
              <div className="p-3 bg-[#DDE4D8] rounded-full w-fit mb-4 mx-auto">
                <TrendingUp className="h-8 w-8 text-[#7A8F78]" />
              </div>
              <h3 className="sage-feature-title">Track Your Progress</h3>
              <p className="sage-feature-description">
                Monitor your farm's performance with harvest tracking, profit reports, 
                and actionable insights to improve yields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demos Section */}
      <HomePageDemos />

      {/* Trust & Security Section */}
      <section className="sage-section bg-[#F8FAF8]">
        <div className="sage-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium text-[#1A1A1A] mb-8">
              Trusted by Professional Farmers
            </h2>
            <p className="text-lg text-[#555555] max-w-2xl mx-auto mb-12">
              Cropple.ai is built on proven agricultural science and trusted by farmers worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-[#7A8F78] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#1A1A1A] mb-3">Secure & Private</h3>
              <p className="text-[#555555]">Your farm data is protected with enterprise-grade security</p>
            </div>
            <div className="text-center">
              <Eye className="h-12 w-12 text-[#7A8F78] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#1A1A1A] mb-3">Proven Results</h3>
              <p className="text-[#555555]">Based on established agricultural research and real farm data</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-[#7A8F78] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#1A1A1A] mb-3">Farmer Focused</h3>
              <p className="text-[#555555]">Designed by and for agricultural professionals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="sage-footer">
        <div className="sage-container text-center">
          <h2 className="text-3xl font-medium text-white mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of farmers using Cropple.ai to increase their profits.
          </p>
          <Link href="/register">
            <button className="btn-primary text-lg px-8 py-4 bg-white text-[#5E6F5A] hover:bg-[#F8FAF8]">
              <Target className="h-5 w-5 mr-2" />
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </Link>
          
          <div className="sage-divider my-8 border-white/20" />
          
          <div className="text-center text-white/60 text-sm">
            <p>&copy; 2024 Cropple.ai. All rights reserved.</p>
            <div className="flex justify-center space-x-6 mt-4">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/help" className="hover:text-white">Help Center</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}