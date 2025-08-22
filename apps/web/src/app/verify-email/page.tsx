'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../components/ui/modern-card'
import { LoadingSpinner } from '../../components/ui/loading'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const token = searchParams?.get('token')
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setErrorMessage('No verification token provided')
    }
  }, [searchParams])

  async function verifyEmail(token: string) {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setStatus('success')
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 3000)
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('An error occurred during verification')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-agricultural py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 agricultural-overlay"></div>
      <div className="max-w-md w-full relative z-10">
        <ModernCard variant="floating" className="shadow-2xl">
          <ModernCardHeader className="text-center">
            <ModernCardTitle className="text-2xl">Email Verification</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="text-center py-8">
            {status === 'verifying' && (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-sage-600 mx-auto" />
                <p className="text-sage-600">Verifying your email address...</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="space-y-4">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-sage-800">Email Verified!</h3>
                <p className="text-sage-600">
                  Your email has been successfully verified. Redirecting to login...
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <InlineFloatingButton
                      icon={<ArrowRight className="h-4 w-4" />}
                      label="Go to Login"
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
                <h3 className="text-xl font-semibold text-sage-800">Verification Failed</h3>
                <p className="text-sage-600">{errorMessage}</p>
                <div className="pt-4 space-y-3">
                  <p className="text-sm text-sage-600">
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