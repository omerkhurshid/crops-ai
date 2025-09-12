import { NextRequest, NextResponse } from 'next/server'

/**
 * Simple domain configuration checker
 * GET /api/test/domain-simple
 */
export async function GET(request: NextRequest) {
  try {
    const resendKey = process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    return NextResponse.json({
      configuration: {
        resendKey: resendKey ? (resendKey.includes('[ADD_YOUR_RESEND_KEY_HERE]') ? '❌ Not Set' : '✅ Configured') : '❌ Missing',
        emailFrom: emailFrom || 'Not set',
        appUrl: appUrl || 'Not set',
        domain: emailFrom ? emailFrom.split('@')[1] : 'No domain'
      },
      nextSteps: resendKey?.includes('[ADD_YOUR_RESEND_KEY_HERE]') ? [
        '1. Get your Resend API key from https://resend.com/api-keys',
        '2. Add to Vercel Environment Variables',
        '3. Redeploy your app'
      ] : [
        '1. Check domain verification at https://resend.com/domains',
        '2. Add DNS records in Vercel DNS panel if needed',
        '3. Test email sending'
      ],
      testEndpoints: [
        'GET /api/test/email?to=your-email@gmail.com (test sending)',
        'GET /api/test/domain (detailed verification check)'
      ]
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Configuration check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}