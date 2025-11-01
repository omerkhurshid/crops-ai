/**
 * Test Email API
 * 
 * Quick test endpoint to verify Resend email configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@cropple.ai',
      to: [email],
      subject: 'Cropple.ai Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Email Configuration Test</h2>
          <p>Congratulations! Your Resend email configuration is working correctly.</p>
          <p><strong>From:</strong> ${process.env.EMAIL_FROM}</p>
          <p><strong>Sent:</strong> ${new Date().toISOString()}</p>
          <p><strong>Domain:</strong> cropple.ai</p>
          <hr>
          <p style="color: #666; font-size: 14px;">
            This is a test email from your Cropple.ai authentication system.
          </p>
        </div>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Test email sent successfully'
    })

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}