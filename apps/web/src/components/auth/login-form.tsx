'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
    
    if (registered === 'true') {
      setSuccessMessage('Account created successfully! Please sign in with your credentials.')
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam))
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting sign in with:', { email, hasPassword: !!password })
      
      // Use our custom authentication endpoint
      const response = await fetch('/api/authentication/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const result = await response.json()
      console.log('Sign in result:', result)

      if (response.ok && result.success) {
        console.log('Sign in successful, redirecting to:', callbackUrl)
        // Force a page refresh to ensure session is loaded properly
        window.location.href = callbackUrl
      } else {
        console.error('Sign in error:', result.error)
        setError(result.error || 'Invalid email or password')
      }
    } catch (err) {
      console.error('Sign in exception:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Enter your email and password to access your farm dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <a 
                href="#" 
                className="text-sm text-sage-600 hover:text-sage-800 underline" 
                onClick={(e) => {
                  e.preventDefault()
                  // TODO: Implement forgot password flow
                  alert('Forgot password feature coming soon! Please contact support.')
                }}
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {successMessage && (
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Demo Credentials</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Demo User:</strong> demo@crops.ai / Demo123!</p>
            <p><strong>Admin User:</strong> admin@crops.ai / Admin123!</p>
          </div>
        </div>
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