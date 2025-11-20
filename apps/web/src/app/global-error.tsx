'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '../components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4">
                Something went wrong
              </h2>
              <p className="text-[#555555] mb-6">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={reset}
                  className="w-full bg-[#7A8F78] hover:bg-[#5E6F5A]"
                >
                  Try again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Go to homepage
                </Button>
              </div>
              {error.digest && (
                <p className="mt-4 text-xs text-[#555555]">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}