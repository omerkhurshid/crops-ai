import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'

/**
 * Test email endpoint - REMOVE BEFORE PRODUCTION
 * GET /api/test/email?to=your-email@gmail.com
 */
export async function GET(request: NextRequest) {
  // Only allow in development or for admin users
  if (process.env.NODE_ENV === 'production') {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
  }

  try {
    const { searchParams } = new URL(request.url)
    const toEmail = searchParams.get('to')
    
    if (!toEmail) {
      return NextResponse.json({ 
        error: 'Missing "to" parameter',
        example: '/api/test/email?to=your-email@gmail.com'
      }, { status: 400 })
    }

    // Check if Resend is configured
    const resendKey = process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev'

    if (!resendKey || resendKey.includes('[ADD_YOUR_RESEND_KEY_HERE]')) {
      return NextResponse.json({
        error: 'Resend API key not configured',
        instructions: [
          '1. Sign up at https://resend.com/signup',
          '2. Get API key from https://resend.com/api-keys', 
          '3. Add to RESEND_API_KEY environment variable',
          '4. Add to Vercel environment variables'
        ]
      }, { status: 500 })
    }

    // Send test email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [toEmail],
        subject: '🌾 Cropple.ai Email Test - SUCCESS!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🌾 Cropple.ai</h1>
              <p style="color: white; margin: 10px 0 0 0;">Email System Test</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #374151; margin-bottom: 20px;">✅ Email Configuration Successful!</h2>
              
              <p style="color: #6b7280; line-height: 1.6;">
                Congratulations! Your Cropple.ai email system is working perfectly.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 10px 0; color: #10b981;">Test Results:</h3>
                <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                  <li>✅ Resend API connection working</li>
                  <li>✅ Email delivery successful</li>
                  <li>✅ Template rendering correctly</li>
                  <li>✅ Ready for production launch!</li>
                </ul>
              </div>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  <strong>From:</strong> ${emailFrom}<br>
                  <strong>To:</strong> ${toEmail}<br>
                  <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                  <strong>Status:</strong> Delivered via Resend
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                This is an automated test email. Your users will receive properly styled 
                emails for password resets, account verification, and notifications.
              </p>
            </div>
            
            <div style="background: #374151; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                Cropple.ai - Intelligent Farm Management Platform
              </p>
            </div>
          </div>
        `
      })
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to send email',
        details: result,
        troubleshooting: [
          'Check if RESEND_API_KEY is valid',
          'Verify email address format',
          'Check Resend dashboard for delivery status'
        ]
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      details: {
        emailId: result.id,
        from: emailFrom,
        to: toEmail,
        subject: '🌾 Cropple.ai Email Test - SUCCESS!',
        sentAt: new Date().toISOString()
      },
      nextSteps: [
        '1. Check your email inbox (including spam folder)',
        '2. View delivery status in Resend dashboard',
        '3. Test password reset functionality',
        '4. Remove this test endpoint before production'
      ]
    })

  } catch (error) {
    console.error('Test email error:', error)
    
    return NextResponse.json({
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        'Check RESEND_API_KEY environment variable',
        'Verify internet connection',
        'Check Resend service status',
        'Review error logs'
      ]
    }, { status: 500 })
  }
}