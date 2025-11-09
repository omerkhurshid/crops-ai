import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, confirmationUrl } = await request.json()

    if (!email || !confirmationUrl) {
      return NextResponse.json(
        { error: 'Email and confirmation URL are required' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'Cropple.ai <noreply@cropple.ai>',
      to: [email],
      subject: 'Confirm your Cropple.ai account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Cropple.ai</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; }
            .logo { color: white; font-size: 28px; font-weight: bold; margin: 0; }
            .content { padding: 40px 30px; background-color: #ffffff; }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { padding: 20px 30px; background-color: #f8fafc; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">🌱 Cropple.ai</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Smart Farm Management Platform</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to Cropple.ai! 🚀</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                Thank you for joining our smart farming community. You're just one step away from revolutionizing your farm management with AI-powered insights.
              </p>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
                Please confirm your email address to get started:
              </p>
              
              <div style="text-align: center;">
                <a href="${confirmationUrl}" class="button">Confirm Your Account</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If you didn't create an account with Cropple.ai, you can safely ignore this email.
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <span style="word-break: break-all; color: #22c55e;">${confirmationUrl}</span>
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">
                Best regards,<br>
                <strong>The Cropple.ai Team</strong>
              </p>
              <p style="margin: 10px 0 0 0;">
                Smart farming solutions for modern agriculture
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend API error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      message: 'Confirmation email sent successfully'
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}