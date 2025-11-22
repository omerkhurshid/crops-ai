'use client'
import { Navbar } from '../components/navigation/navbar'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { 
  Coffee, Sunrise, Smartphone, TrendingUp, Shield, 
  Users, ArrowRight, Target, Eye, DollarSign, CheckCircle, Clock,
  AlertTriangle, Calendar, MapPin, Droplets, ThermometerSun,
  Wind, BarChart3, Star, Award, Phone, MessageSquare
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from '../lib/auth-unified'
import { HomePageDemos } from '../components/demos/home-page-demos'

// Mock interactive demo component for the solution section
const InteractiveDemo = () => {
  const [activeQuestion, setActiveQuestion] = useState(0)
  
  const questions = [
    {
      question: "Should I spray Field 12 today?",
      answer: "Yes - 6-hour window from 7am-1pm",
      conditions: "8mph winds, 68°F, 45% humidity, no rain for 48hrs",
      color: "bg-[#8FBF7F]"
    },
    {
      question: "When should I harvest my wheat?",
      answer: "Start Tuesday, finish by Thursday",
      conditions: "Optimal moisture window + 5-day weather forecast + current market price",
      color: "bg-[#7A8F78]"
    },
    {
      question: "Which fields need attention today?",
      answer: "3 fields require immediate action",
      conditions: "Field 7: Irrigation needed | Field 12: Spray window | Field 19: Disease check",
      color: "bg-[#5E6F5A]"
    }
  ]

  return (
    <div className="bg-white rounded-xl border border-[#F3F4F6] p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        {questions.map((q, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              activeQuestion === index 
                ? 'border-[#7A8F78] bg-[#F8FAF8]' 
                : 'border-[#F3F4F6] hover:border-[#DDE4D8]'
            }`}
            onClick={() => setActiveQuestion(index)}
          >
            <div className="font-semibold text-[#1A1A1A] mb-2">{q.question}</div>
            {activeQuestion === index && (
              <div className="space-y-2">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${q.color}`}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {q.answer}
                </div>
                <div className="text-sm text-[#555555]">{q.conditions}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status !== 'loading' && session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Above the Fold */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-[#F8FAF8] to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6 leading-tight">
                Farm with confidence,<br />
                <span className="text-[#7A8F78]">not guesswork</span>
              </h1>
              <p className="text-xl text-[#555555] mb-8 leading-relaxed">
                Every day, you're making million-dollar decisions with incomplete information. 
                Cropple gives you the clarity to act decisively—so you can spend less time 
                second-guessing and more time doing what you do best.
              </p>
              
              <div className="mb-8">
                <Link href="/register">
                  <button className="bg-[#7A8F78] hover:bg-[#5E6F5A] text-white font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl mr-4 mb-4">
                    Try Cropple Free for 30 Days
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                </Link>
                <Link href="/demo">
                  <button className="border-2 border-[#7A8F78] text-[#7A8F78] hover:bg-[#7A8F78] hover:text-white font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 inline-flex items-center mb-4">
                    Watch 5-Minute Demo
                    <Eye className="h-5 w-5 ml-2" />
                  </button>
                </Link>
              </div>

              <div className="text-[#555555]">
                <p className="mb-2">✓ Join 2,400+ farms across North America</p>
                <p>✓ No credit card required</p>
              </div>
            </div>

            {/* Right: Hero Image/Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#7A8F78] to-[#5E6F5A] rounded-2xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <Coffee className="h-6 w-6 mr-2" />
                  <span className="font-medium">Morning briefing - Field Overview</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                    <span>Field 12 - Spray window today</span>
                    <span className="bg-[#8FBF7F] px-2 py-1 rounded text-xs font-medium">Action</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                    <span>Weather: Perfect conditions</span>
                    <CheckCircle className="h-5 w-5 text-[#8FBF7F]" />
                  </div>
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                    <span>Market price: $6.85/bushel</span>
                    <TrendingUp className="h-5 w-5 text-[#8FBF7F]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Problem (Empathy First) */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-6">
              You shouldn't need a meteorology degree to farm
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">"Did I miss the window?"</h3>
              <p className="text-[#555555] leading-relaxed">
                Checking three weather apps, walking fields twice a day, waking up at 4am wondering 
                if today's the day to spray—only to have conditions change by noon.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">"Am I leaving money on the table?"</h3>
              <p className="text-[#555555] leading-relaxed">
                Harvesting too early costs you yield. Waiting too long risks weather damage. 
                The optimal 72-hour window is invisible until it's gone.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">"Where's the fire?"</h3>
              <p className="text-[#555555] leading-relaxed">
                You've got 2,000 acres and a dozen decisions competing for attention. 
                Which fields actually need you today? Which can wait?
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-[#7A8F78] font-semibold">
              What if you could make these calls in 30 seconds instead of 3 hours?
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: The Solution (Show the Magic) */}
      <section className="py-20 px-4 bg-[#F8FAF8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-6">
              One question. One answer. Move on with your day.
            </h2>
          </div>

          <InteractiveDemo />

          <div className="mt-12 text-center">
            <div className="bg-[#DDE4D8] border border-[#7A8F78] rounded-xl p-6 max-w-3xl mx-auto">
              <p className="text-[#1A1A1A] font-semibold text-lg">
                "Cropple isn't trying to replace your judgment—it's giving you the confidence to trust it."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3.5: Live Demo Features */}
      <HomePageDemos />

      {/* Section 4: Real Impact (Social Proof) */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-6">
              What farmers are saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white border border-[#F3F4F6] rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#7A8F78] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  MP
                </div>
                <div>
                  <div className="font-bold text-[#1A1A1A]">Mike Patterson</div>
                  <div className="text-sm text-[#555555]">850 acres - Wheat & Soy, Kansas</div>
                </div>
              </div>
              <blockquote className="text-[#555555] mb-4 italic">
                "That hail warning saved my entire wheat crop. I harvested 48 hours early based on 
                Cropple's alert. That one decision paid for a decade of the service. Now I don't farm without it."
              </blockquote>
              <div className="bg-[#8FBF7F] text-white px-3 py-1 rounded-full text-sm font-medium inline-block">
                Prevented $127,000 in losses, first season
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-[#F3F4F6] rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#7A8F78] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  SC
                </div>
                <div>
                  <div className="font-bold text-[#1A1A1A]">Sarah Chen</div>
                  <div className="text-sm text-[#555555]">3,200 acres - Diversified, California</div>
                </div>
              </div>
              <blockquote className="text-[#555555] mb-4 italic">
                "I used to drive to every field each morning—90 minutes before I even started work. 
                Now I get my priority list over coffee. My crew knows exactly where to go. 
                We cut labor costs by $45,000 this year."
              </blockquote>
              <div className="bg-[#8FBF7F] text-white px-3 py-1 rounded-full text-sm font-medium inline-block">
                15 hours saved per week
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white border border-[#F3F4F6] rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#7A8F78] rounded-full flex items-center justify-center text-white font-bold mr-4">
                  TH
                </div>
                <div>
                  <div className="font-bold text-[#1A1A1A]">Tom & Rebecca Hoffman</div>
                  <div className="text-sm text-[#555555]">450 acres - Family Farm, Iowa</div>
                </div>
              </div>
              <blockquote className="text-[#555555] mb-4 italic">
                "We're not tech people, but Cropple just makes sense. It's like having an agronomist, 
                meteorologist, and farm consultant in your pocket. We make better decisions faster, 
                and we actually sleep at night now."
              </blockquote>
              <div className="bg-[#8FBF7F] text-white px-3 py-1 rounded-full text-sm font-medium inline-block">
                $23,000 increase in net profit per acre
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: How It Works */}
      <section className="py-20 px-4 bg-[#F8FAF8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-6">
              Set it up once. Use it every day.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#7A8F78] text-white rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Map your operation</h3>
              <p className="text-[#555555] mb-2 font-medium">(10 minutes)</p>
              <p className="text-[#555555]">
                Draw your fields, tell us what you're growing. That's it.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#7A8F78] text-white rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Get your daily briefing</h3>
              <p className="text-[#555555] mb-2 font-medium">Every morning: priorities, windows, alerts</p>
              <p className="text-[#555555]">
                Like a weather app, but for farming decisions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#7A8F78] text-white rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Log as you go</h3>
              <p className="text-[#555555] mb-2 font-medium">Voice logging for expenses, observations, applications</p>
              <p className="text-[#555555]">
                No paperwork, no data entry.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-[#8FBF7F] text-white px-4 py-2 rounded-full text-sm font-medium inline-block">
              ✓ Works offline. Syncs when you have signal. Built for rural connectivity.
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Trust & Credibility */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-6">
              Trusted by farms from 50 to 15,000 acres
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#7A8F78] mb-2">2,400+</div>
              <div className="text-[#555555]">Active farms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#7A8F78] mb-2">847K+</div>
              <div className="text-[#555555]">Acres under management</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#7A8F78] mb-2">$12.3M</div>
              <div className="text-[#555555]">Prevented losses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#7A8F78] mb-2">4.8/5</div>
              <div className="text-[#555555]">Farmer rating</div>
            </div>
          </div>

          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-sm font-medium">USDA Partnership</div>
            <div className="text-sm font-medium">AgTech Innovation Award</div>
            <div className="text-sm font-medium">Data Security Certified</div>
          </div>
        </div>
      </section>

      {/* Section 8: FAQ */}
      <section className="py-20 px-4 bg-[#F8FAF8]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-6">
              Common questions from farmers like you
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-[#F3F4F6]">
              <h3 className="font-bold text-[#1A1A1A] mb-2">Do I need to be tech-savvy?</h3>
              <p className="text-[#555555]">
                If you can use a weather app, you can use Cropple. Most farmers are up and running in under 15 minutes.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#F3F4F6]">
              <h3 className="font-bold text-[#1A1A1A] mb-2">What if I lose cell signal in the field?</h3>
              <p className="text-[#555555]">
                Cropple works offline and syncs when you're back in range. Download your day's priorities over breakfast.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#F3F4F6]">
              <h3 className="font-bold text-[#1A1A1A] mb-2">Does this work for my crops?</h3>
              <p className="text-[#555555]">
                We support all major row crops, specialty crops, and permanent crops. If we don't support yours yet, let us know—we're always expanding.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#F3F4F6]">
              <h3 className="font-bold text-[#1A1A1A] mb-2">Will this replace my agronomist?</h3>
              <p className="text-[#555555]">
                No. Cropple gives you data to have better conversations with your agronomist. Many of our customers share their Cropple dashboard with their advisors.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#F3F4F6]">
              <h3 className="font-bold text-[#1A1A1A] mb-2">What if I have questions or need help?</h3>
              <p className="text-[#555555]">
                Text or call our farmer support team (all ag backgrounds). Average response time: 12 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-[#5E6F5A] text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Stop second-guessing. Start farming with confidence.
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Try Cropple free for 30 days. No credit card. No commitment. Cancel anytime.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/register">
              <button className="bg-white text-[#5E6F5A] hover:bg-[#FAFAF7] font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 inline-flex items-center shadow-lg">
                <Target className="h-5 w-5 mr-2" />
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </Link>
            
            <Link href="/demo">
              <button className="border-2 border-white text-white hover:bg-white hover:text-[#5E6F5A] font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 inline-flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule a 15-Minute Demo
              </button>
            </Link>
          </div>

          <p className="text-white/80 mb-8">
            Join 2,400+ farms making better decisions every day
          </p>
          
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center text-white/90">
                    <Phone className="h-4 w-4 mr-2" />
                    (555) 123-CROP
                  </div>
                  <div className="flex items-center text-white/90">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Text us: (555) 123-4567
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-6 text-sm text-white/70">
                <Link href="/how-it-works" className="hover:text-white">How it works</Link>
                <Link href="/pricing" className="hover:text-white">Pricing</Link>
                <Link href="/help" className="hover:text-white">Support</Link>
                <Link href="/about" className="hover:text-white">About</Link>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-white/70 text-sm">&copy; 2024 Cropple.ai. All rights reserved.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}