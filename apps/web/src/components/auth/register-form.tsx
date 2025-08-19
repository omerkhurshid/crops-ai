'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { UserRole } from '@crops-ai/shared'

interface RegisterFormProps {
  callbackUrl?: string
}

export function RegisterForm({ callbackUrl = '/dashboard' }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.FARM_OWNER
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ]
    
    strength = checks.filter(Boolean).length
    
    if (strength < 2) return { level: 'weak', color: 'bg-red-500', text: 'Weak' }
    if (strength < 4) return { level: 'medium', color: 'bg-yellow-500', text: 'Medium' }
    if (strength >= 4) return { level: 'strong', color: 'bg-green-500', text: 'Strong' }
    return { level: 'weak', color: 'bg-red-500', text: 'Weak' }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Name is required'
    }
    if (!formData.email.trim()) {
      return 'Email is required'
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/[A-Z]/.test(formData.password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      return 'Password must contain at least one special character (!@#$%^&* etc.)'
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/authentication/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error('Unable to process server response')
      }

      if (!response.ok) {
        const errorMessage = data.error?.message || data.message || `Registration failed (${response.status})`
        throw new Error(errorMessage)
      }

      setSuccess(true)
      
      // Auto-login after successful registration using custom signin endpoint
      setTimeout(async () => {
        try {
          const signinResponse = await fetch('/api/authentication/signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          })

          const signinResult = await signinResponse.json()

          if (signinResponse.ok && signinResult.success) {
            // Force page refresh to ensure session is loaded
            window.location.href = callbackUrl
          } else {
            // Auto-login failed, redirect to login page
            router.push(`/login?email=${encodeURIComponent(formData.email)}&registered=true`)
          }
        } catch (error) {
          console.error('Auto-login error:', error)
          router.push(`/login?email=${encodeURIComponent(formData.email)}&registered=true`)
        }
      }, 500)
      
    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-green-600">Registration Successful!</CardTitle>
          <CardDescription>
            Your account has been created successfully. You are being signed in...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Join Crops.AI to start optimizing your farm management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={isLoading}
            >
              <option value={UserRole.FARM_OWNER}>Farm Owner</option>
              <option value={UserRole.FARM_MANAGER}>Farm Manager</option>
              <option value={UserRole.AGRONOMIST}>Agronomist</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getPasswordStrength(formData.password).color
                      }`}
                      style={{ 
                        width: `${(getPasswordStrength(formData.password).level === 'weak' ? 25 : 
                                   getPasswordStrength(formData.password).level === 'medium' ? 60 : 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className={`text-xs font-medium ${
                    getPasswordStrength(formData.password).level === 'weak' ? 'text-red-600' :
                    getPasswordStrength(formData.password).level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {getPasswordStrength(formData.password).text}
                  </span>
                </div>
              </div>
            )}
            <div className="text-xs text-gray-600">
              Password must have 8+ characters, one uppercase letter, and one special character
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          Sign up with Google
        </Button>
      </CardContent>
    </Card>
  )
}