'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

interface LoginFormProps {
  callbackUrl?: string
}

function LoginFormContent({ callbackUrl = '/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Immediate console logs to track component lifecycle
  console.log('🎯 LoginFormContent component rendering...', {
    timestamp: new Date().toISOString(),
    isServer: typeof window === 'undefined',
    location: typeof window !== 'undefined' ? window.location.href : 'server-side'
  })

  // Test React hydration with DOM manipulation
  useEffect(() => {
    console.log('🚀 LoginForm React component mounted and hydrated successfully!')
    console.log('🔍 Client environment confirmed:', {
      location: window.location.href,
      userAgent: navigator.userAgent.substring(0, 50)
    })
    
    // Add a visible indicator that React is working
    const indicator = document.createElement('div')
    indicator.id = 'react-hydration-test'
    indicator.style.cssText = 'position:fixed;top:10px;right:10px;background:green;color:white;padding:4px 8px;border-radius:4px;z-index:9999;font-size:12px;'
    indicator.textContent = '✅ React Hydrated'
    document.body.appendChild(indicator)
    
    // Remove after 3 seconds
    setTimeout(() => {
      const el = document.getElementById('react-hydration-test')
      if (el) el.remove()
    }, 3000)
  }, [])

  useEffect(() => {
    // Check for registration success
    const registered = searchParams?.get('registered')
    const emailParam = searchParams?.get('email')
    const verified = searchParams?.get('verified')
    const errorParam = searchParams?.get('error')
    const passwordReset = searchParams?.get('password-reset')
    
    if (registered === 'true') {
      setSuccessMessage('Account created successfully! Please sign in with your credentials.')
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam))
      }
    }
    
    if (verified === 'true') {
      setSuccessMessage('Email verified successfully! You can now sign in.')
    }
    
    if (passwordReset === 'true') {
      setSuccessMessage('Password reset successfully! You can now sign in with your new password.')
    }
    
    if (errorParam) {
      switch (errorParam) {
        case 'missing-token':
          setError('Verification token is missing.')
          break
        case 'invalid-token':
          setError('Invalid or expired verification token.')
          break
        case 'verification-failed':
          setError('Email verification failed. Please try again.')
          break
        case 'CredentialsSignin':
          setError('Invalid email or password. Please check your credentials and try again.')
          break
        case 'Configuration':
          setError('Authentication configuration error. Please contact support.')
          break
        case 'AccessDenied':
          setError('Access denied. Please contact support if this continues.')
          break
        default:
          setError(`Authentication error: ${errorParam}`)
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔥 FORM SUBMIT TRIGGERED!', { email, password: password ? '***' : 'empty' })
    
    setIsLoading(true)
    setError('')

    try {
      console.log('📧 Starting NextAuth signIn for:', email)
      // Use NextAuth signIn function
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      })

      console.log('🔐 NextAuth Login Result:', result)

      if (result?.error) {
        console.error('❌ Login failed with error:', result.error)
        console.log('🔍 Full error details:', result)
        setError(`Authentication failed: ${result.error} (Debug: ${JSON.stringify(result)})`)
      } else if (result?.ok) {
        console.log('✅ Login successful, redirecting to dashboard')
        // Successful login - NextAuth will handle redirect
        window.location.href = '/dashboard'
      } else {
        console.log('⚠️ Unexpected login result:', result)
        setError(`Unexpected result: ${JSON.stringify(result)}`)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-xl sm:text-2xl">Sign in to your account</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Enter your email and password to access your farm dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Link 
                href="/forgot-password" 
                className="text-xs sm:text-sm text-sage-600 hover:text-sage-800 underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 text-base"
            />
          </div>
          {successMessage && (
            <div className="text-green-600 text-xs sm:text-sm bg-green-50 p-3 rounded-md border border-green-200">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="text-red-600 text-xs sm:text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium bg-earth-600 hover:bg-earth-700 text-white" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  console.log('🚀 LoginForm component rendering at top level!')
  
  // Wrap in Suspense to handle useSearchParams for SSR
  return (
    <Suspense fallback={
      <Card className="w-full border-0 shadow-none">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-xl sm:text-2xl">Sign in to your account</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Enter your email and password to access your farm dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="text-center py-8 text-gray-500">
            Loading...
          </div>
        </CardContent>
      </Card>
    }>
      <LoginFormContent callbackUrl={callbackUrl} />
    </Suspense>
  )
}