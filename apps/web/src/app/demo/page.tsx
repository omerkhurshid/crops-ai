'use client'
import { useState } from 'react'
import { Navbar } from '../../components/navigation/navbar'
import { Play, X, CheckCircle, BarChart3, Satellite, DollarSign } from 'lucide-react'

export default function DemoPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const demoFeatures = [
    {
      icon: <Satellite className="h-6 w-6" />,
      title: "Live Satellite Analysis",
      description: "See real NDVI data from Copernicus satellites",
      time: "1:30"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Smart Recommendations", 
      description: "AI-powered insights for optimal farming decisions",
      time: "2:15"
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Financial Intelligence",
      description: "Track profitability and market opportunities",
      time: "1:45"
    }
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              See Cropple.AI in Action
            </h1>
            <p className="text-xl text-[#555555] max-w-2xl mx-auto">
              Watch how farmers are making smarter decisions with real-time data and AI-powered insights.
            </p>
          </div>

          {/* Video Player */}
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
            <div className="aspect-video bg-gradient-to-br from-[#7A8F78] to-[#5E6F5A] flex items-center justify-center">
              {!isVideoPlaying ? (
                <button
                  onClick={() => setIsVideoPlaying(true)}
                  className="group flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                >
                  <Play className="h-8 w-8 text-white ml-1" />
                </button>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg">Demo video would play here</p>
                    <p className="text-sm opacity-80 mt-2">Integrated with your video hosting platform</p>
                    <button
                      onClick={() => setIsVideoPlaying(false)}
                      className="mt-4 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Demo Timeline */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {demoFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-[#F3F4F6]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#F8FAF8] rounded-lg text-[#7A8F78]">
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium text-[#7A8F78]">{feature.time}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-[#555555] text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* What You'll Learn */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#F3F4F6] mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What You'll Learn in 5 Minutes
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#8FBF7F] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Setup Your First Farm</h4>
                    <p className="text-sm text-[#555555]">Add fields, set boundaries, and configure crop types</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#8FBF7F] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Read Satellite Data</h4>
                    <p className="text-sm text-[#555555]">Understand NDVI values and field health indicators</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#8FBF7F] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Smart Alerts</h4>
                    <p className="text-sm text-[#555555]">Set up weather alerts and timing recommendations</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#8FBF7F] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Financial Tracking</h4>
                    <p className="text-sm text-[#555555]">Monitor profitability and expense management</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#8FBF7F] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Mobile Workflow</h4>
                    <p className="text-sm text-[#555555]">Use Cropple on your phone while in the field</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#8FBF7F] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Integration Setup</h4>
                    <p className="text-sm text-[#555555]">Connect with existing farm management tools</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-lg text-[#555555] mb-8 max-w-2xl mx-auto">
              Join 2,400+ farmers who've increased their profitability with Cropple.AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-[#7A8F78] hover:bg-[#5E6F5A] text-white font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 inline-flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                Start Your Free Trial
              </a>
              <a
                href="/login"
                className="border-2 border-[#7A8F78] text-[#7A8F78] hover:bg-[#7A8F78] hover:text-white font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 inline-flex items-center justify-center"
              >
                Sign In
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}