'use client'

import { useState, useEffect, Suspense } from 'react'
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
        default:
          setError('An error occurred.')
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Use NextAuth signIn function
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else if (result?.ok) {
        // Redirect to dashboard on successful login, avoid login page loop
        const redirectUrl = callbackUrl === '/login' ? '/dashboard' : callbackUrl
        window.location.href = redirectUrl
      } else {
        setError('An error occurred. Please try again.')
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
          <Button type="submit" className="w-full h-12 text-base font-medium bg-earth-600 hover:bg-earth-700 text-white" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  return (
    <Suspense fallback={
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Loading...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    }>
      <LoginFormContent callbackUrl={callbackUrl} />
    </Suspense>
  )
}