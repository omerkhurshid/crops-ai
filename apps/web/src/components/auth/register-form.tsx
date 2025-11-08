'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { unifiedAuth } from '../../lib/auth-unified'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { UserRole } from '@prisma/client'
import { Sprout, Users, TreePine, Info } from 'lucide-react'
interface RegisterFormProps {
  callbackUrl?: string
}
export function RegisterForm({ callbackUrl = '/dashboard' }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.FARM_OWNER,
    userType: '', // Will be 'CROPS', 'LIVESTOCK', 'ORCHARD', or 'MIXED'
    acceptTerms: false,
    subscribeNewsletter: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
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
    if (!formData.acceptTerms) {
      return 'You must accept the Terms & Conditions to continue'
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
      // Use unifiedAuth.signUp for Supabase registration
      const result = await unifiedAuth.signUp(formData.email, formData.password, formData.name)
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      setSuccess(true)
      // Auto-login after successful registration
      setTimeout(async () => {
        try {
          const loginResult = await unifiedAuth.signIn(formData.email, formData.password)
          if (!loginResult?.error) {
            window.location.href = callbackUrl
          } else {
            router.push(`/login?email=${encodeURIComponent(formData.email)}&registered=true`)
          }
        } catch (error) {
          console.error('❌ Auto-login error:', error)
          router.push(`/login?email=${encodeURIComponent(formData.email)}&registered=true`)
        }
      }, 1000)
    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  const handleGoogleSignIn = () => {
    // Google signin not currently configured
    setError('Google sign-in is not available at this time. Please use email registration.')
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
          Join Cropple.ai to start optimizing your farm management
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
          {/* User Type Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="userType">Primary Interest</Label>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>This helps us share relevant features and updates</span>
              </div>
            </div>
            <div className="relative">
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border-2 border-sage-200 hover:border-sage-300 focus-visible:border-sage-400 bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-200 appearance-none"
                disabled={isLoading}
              >
                <option value="">Select your primary interest</option>
                <option value="CROPS">Crops - Grains, vegetables, fruits</option>
                <option value="LIVESTOCK">Livestock - Cattle, sheep, poultry</option>
                <option value="ORCHARD">Orchard - Tree fruits, nuts</option>
                <option value="MIXED">Mixed - Multiple interests</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border-2 border-sage-200 hover:border-sage-300 focus-visible:border-sage-400 bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-200 appearance-none"
                disabled={isLoading}
                required
              >
                <option value={UserRole.FARM_OWNER}>Farm Owner</option>
                <option value={UserRole.FARM_MANAGER}>Farm Manager</option>
                <option value={UserRole.AGRONOMIST}>Agronomist</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
          {/* Terms & Conditions and Newsletter */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="flex items-start space-x-2">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="mt-0.5 h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-tight">
                I accept the{' '}
                <a 
                  href="/terms" 
                  target="_blank" 
                  className="text-sage-600 hover:text-sage-700 underline"
                >
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a 
                  href="/privacy" 
                  target="_blank" 
                  className="text-sage-600 hover:text-sage-700 underline"
                >
                  Privacy Policy
                </a>
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>
            <div className="flex items-start space-x-2">
              <input
                id="subscribeNewsletter"
                name="subscribeNewsletter"
                type="checkbox"
                checked={formData.subscribeNewsletter}
                onChange={handleChange}
                disabled={isLoading}
                className="mt-0.5 h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
              />
              <label htmlFor="subscribeNewsletter" className="text-sm text-gray-700 leading-tight">
                <span className="font-medium">Join our newsletter</span> for farming tips, feature updates, and insights to maximize your yield{' '}
                <span className="text-gray-500">(optional)</span>
              </label>
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-sage-600 hover:bg-sage-700 text-white font-medium" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-sage-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-sage-600">Or continue with</span>
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