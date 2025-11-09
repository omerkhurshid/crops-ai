'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/user-auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (response.ok) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-agricultural py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 agricultural-overlay"></div>
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Cropple.ai</h1>
          </div>
          <ModernCard variant="floating" className="shadow-2xl">
            <ModernCardContent className="text-center py-8">
              <div className="space-y-4">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-sage-800">Check Your Email</h3>
                <p className="text-sage-600">
                  If an account exists with <span className="font-medium">{email}</span>, 
                  we&apos;ve sent a password reset link.
                </p>
                <p className="text-sm text-sage-500">
                  The link will expire in 1 hour.
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <InlineFloatingButton
                      icon={<ArrowLeft className="h-4 w-4" />}
                      label="Back to Login"
                      variant="secondary"
                      showLabel={true}
                    />
                  </Link>
                </div>
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
          <p className="text-white/80 text-lg font-light">Reset your password</p>
        </div>
        <ModernCard variant="floating" className="shadow-2xl">
          <ModernCardHeader>
            <ModernCardTitle>Forgot Password?</ModernCardTitle>
            <ModernCardDescription>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email address</Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sage-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="user@cropple.ai"
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <InlineFloatingButton
                icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                label={isLoading ? 'Sending...' : 'Send Reset Link'}
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
          </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  )
}