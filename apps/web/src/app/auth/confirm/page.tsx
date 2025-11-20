'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { InlineFloatingButton } from '../../../components/ui/floating-button'
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

function AuthConfirmContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const code = searchParams?.get('code')
    const token = searchParams?.get('token')
    const error = searchParams?.get('error')
    const errorDescription = searchParams?.get('error_description')
    
    if (error) {
      setStatus('error')
      setErrorMessage(errorDescription || error)
      return
    }
    
    if (code) {
      verifyAuthCode(code)
    } else if (token) {
      verifyCustomToken(token)
    } else {
      setStatus('error')
      setErrorMessage('No verification code or token provided')
    }
  }, [searchParams])

  async function verifyAuthCode(code: string) {
    try {
      if (!supabase) {
        throw new Error('Authentication service not available')
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        throw error
      }

      if (data?.session) {
        setStatus('success')
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        throw new Error('Failed to create session')
      }
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message || 'Verification failed')
    }
  }

  async function verifyCustomToken(token: string) {
    try {
      // For custom token verification, we'll use the existing verify-email API
      const res = await fetch('/api/user-auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        // Redirect to login with verification success
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 2000)
      } else {
        throw new Error(data.error || 'Verification failed')
      }
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message || 'Token verification failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-agricultural py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 agricultural-overlay"></div>
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Cropple.ai</h1>
        </div>
        <ModernCard variant="floating" className="shadow-2xl">
          <ModernCardHeader className="text-center">
            <ModernCardTitle className="text-2xl">Email Verification</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="text-center py-8">
            {status === 'verifying' && (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-[#7A8F78] mx-auto" />
                <p className="text-[#7A8F78]">Verifying your email address...</p>
              </div>
            )}
            {status === 'success' && (
              <div className="space-y-4">
                <div className="p-3 bg-[#F8FAF8] rounded-full w-fit mx-auto">
                  <CheckCircle2 className="h-12 w-12 text-[#7A8F78]" />
                </div>
                <h3 className="text-xl font-semibold text-[#7A8F78]">Welcome to Cropple.ai!</h3>
                <p className="text-[#7A8F78]">
                  Your email has been verified successfully. Redirecting to your dashboard...
                </p>
                <div className="pt-4">
                  <Link href="/dashboard">
                    <InlineFloatingButton
                      icon={<ArrowRight className="h-4 w-4" />}
                      label="Go to Dashboard"
                      variant="primary"
                      showLabel={true}
                    />
                  </Link>
                </div>
              </div>
            )}
            {status === 'error' && (
              <div className="space-y-4">
                <div className="p-3 bg-red-100 rounded-full w-fit mx-auto">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-[#7A8F78]">Verification Failed</h3>
                <p className="text-[#7A8F78]">{errorMessage}</p>
                <div className="pt-4 space-y-3">
                  <p className="text-sm text-[#7A8F78]">
                    The verification link may have expired or is invalid.
                  </p>
                  <Link href="/login">
                    <InlineFloatingButton
                      icon={<ArrowRight className="h-4 w-4" />}
                      label="Back to Login"
                      variant="secondary"
                      showLabel={true}
                    />
                  </Link>
                </div>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-agricultural">
        <div className="absolute inset-0 agricultural-overlay"></div>
        <div className="relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      </div>
    }>
      <AuthConfirmContent />
    </Suspense>
  )
}