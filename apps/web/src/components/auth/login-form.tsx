'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { unifiedAuth } from '../../lib/auth-unified'
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
  // Component lifecycle and registration success check
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
    setIsLoading(true)
    setError('')
    try {
      // Use unified auth for Supabase authentication
      const result = await unifiedAuth.signIn(email, password)
      if (result?.error) {
        setError(result.error)
      } else {
        setError('')
        setSuccessMessage('Login successful! Redirecting...')
        setTimeout(() => {
          window.location.href = callbackUrl
        }, 1000)
      }
    } catch (err) {
      console.error('Login error:', err)
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
                className="text-xs sm:text-sm text-[#555555] hover:text-gray-900 underline"
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
            <div className="text-[#7A8F78] text-xs sm:text-sm bg-[#F8FAF8] p-3 rounded-md border border-[#DDE4D8]">
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
            className="w-full h-12 text-base font-medium bg-[#7A8F78] hover:bg-[#5E6F5A] text-white" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
export function LoginForm({ callbackUrl }: LoginFormProps) {// Wrap in Suspense to handle useSearchParams for SSR
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
          <div className="text-center py-8 text-[#555555]">
            Loading...
          </div>
        </CardContent>
      </Card>
    }>
      <LoginFormContent callbackUrl={callbackUrl} />
    </Suspense>
  )
}