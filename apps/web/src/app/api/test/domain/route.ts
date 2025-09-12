import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'

/**
 * Check domain verification status
 * GET /api/test/domain
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (process.env.NODE_ENV === 'production' && (!user || user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const resendKey = process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM || 'noreply@cropple.ai'

    if (!resendKey || resendKey.includes('[ADD_YOUR_RESEND_KEY_HERE]')) {
      return NextResponse.json({
        error: 'Resend API key not configured',
        status: 'not_configured'
      }, { status: 500 })
    }

    // Check domains via Resend API
    try {
      const response = await fetch('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const error = await response.json()
        return NextResponse.json({
          error: 'Failed to check domains',
          details: error,
          status: 'api_error'
        }, { status: response.status })
      }

      const domains = await response.json()
      const croppleDomain = domains.data?.find((d: any) => 
        d.name === 'cropple.ai' || d.name.includes('cropple')
      )

      return NextResponse.json({
        success: true,
        currentEmailFrom: emailFrom,
        domains: domains.data || [],
        croppleDomainStatus: croppleDomain ? {
          name: croppleDomain.name,
          status: croppleDomain.status,
          verified: croppleDomain.status === 'verified',
          createdAt: croppleDomain.created_at,
          records: croppleDomain.records || []
        } : null,
        recommendations: croppleDomain ? 
          (croppleDomain.status === 'verified' ? 
            ['✅ Domain verified! You can send emails from @cropple.ai'] :
            [
              '⚠️ Domain verification pending',
              '1. Check your DNS provider (Cloudflare, Namecheap, etc.)',
              '2. Add the DNS records shown in Resend dashboard',
              '3. Wait up to 24 hours for DNS propagation',
              '4. Use onboarding@resend.dev temporarily'
            ]
          ) : 
          [
            '❌ cropple.ai not found in Resend',
            '1. Go to https://resend.com/domains',
            '2. Click "Add Domain"',
            '3. Enter: cropple.ai',
            '4. Follow DNS setup instructions'
          ]
      })

    } catch (apiError) {
      return NextResponse.json({
        error: 'API request failed',
        details: apiError instanceof Error ? apiError.message : 'Unknown error',
        status: 'connection_error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Domain check error:', error)
    
    return NextResponse.json({
      error: 'Domain verification check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'system_error'
    }, { status: 500 })
  }
}