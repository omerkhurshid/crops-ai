'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { hash } from 'bcryptjs'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Lock, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams?.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      validateToken(tokenParam)
    } else {
      setValidatingToken(false)
      setError('No reset token provided')
    }
  }, [searchParams])

  const validateToken = async (resetToken: string) => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken })
      })

      if (response.ok) {
        setTokenValid(true)
      } else {
        setError('Invalid or expired reset link')
      }
    } catch (err) {
      setError('Failed to validate reset link')
    } finally {
      setValidatingToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          password 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/login?password-reset=true')
        }, 3000)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-agricultural">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-agricultural py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 agricultural-overlay"></div>
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Crops.AI</h1>
          </div>
          
          <ModernCard variant="floating" className="shadow-2xl">
            <ModernCardContent className="text-center py-8">
              <div className="space-y-4">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-sage-800">Password Reset Successful!</h3>
                <p className="text-sage-600">
                  Your password has been reset. Redirecting to login...
                </p>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-agricultural py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 agricultural-overlay"></div>
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Crops.AI</h1>
          <p className="text-white/80 text-lg font-light">Create your new password</p>
        </div>
        
        <ModernCard variant="floating" className="shadow-2xl">
          <ModernCardHeader>
            <ModernCardTitle>Reset Password</ModernCardTitle>
            <ModernCardDescription>
              Enter your new password below
            </ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent>
            {!tokenValid ? (
              <div className="space-y-4 text-center">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Link href="/forgot-password">
                  <InlineFloatingButton
                    icon={<ArrowLeft className="h-4 w-4" />}
                    label="Request New Link"
                    variant="secondary"
                    showLabel={true}
                  />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sage-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Enter new password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-400 hover:text-sage-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-sage-500">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sage-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-400 hover:text-sage-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <InlineFloatingButton
                  icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  label={isLoading ? 'Resetting...' : 'Reset Password'}
                  variant="primary"
                  showLabel={true}
                  disabled={isLoading}
                  className="w-full"
                  type="submit"
                />

                <div className="text-center pt-4">
                  <Link href="/login" className="text-sm text-sage-600 hover:text-sage-700">
                    <InlineFloatingButton
                      icon={<ArrowLeft className="h-4 w-4" />}
                      label="Back to Login"
                      variant="ghost"
                      showLabel={true}
                    />
                  </Link>
                </div>
              </form>
            )}
          </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  )
}