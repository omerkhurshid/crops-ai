import { Resend } from 'resend'
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    if (!resend) {
      return { success: false, error: 'Email service not configured' }
    }
    const data = await resend.emails.send({
      from: `Cropple.ai <${process.env.EMAIL_FROM || 'noreply@cropple.ai'}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || subject, // Fallback plain text
    })
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
// Email Templates
export const emailTemplates = {
  verification: (verifyUrl: string, userName?: string) => ({
    subject: 'Verify your Cropple.ai account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🌾 Cropple.ai</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Welcome to Smart Farming</p>
            </div>
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">
                ${userName ? `Welcome, ${userName}!` : 'Welcome!'}
              </h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                Thanks for signing up for Cropple.ai. Please verify your email address to get started with intelligent farm management.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="display: inline-block; padding: 14px 30px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              <div style="background-color: #f3f4f6; border-radius: 6px; padding: 20px; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                  Or copy and paste this link in your browser:
                </p>
                <p style="color: #059669; font-size: 14px; word-break: break-all; margin: 0;">
                  ${verifyUrl}
                </p>
              </div>
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">
                Need help? Contact us at support@crops.ai
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2024 Cropple.ai. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to Cropple.ai! Please verify your email by visiting: ${verifyUrl}`
  }),
  passwordReset: (resetUrl: string, userName?: string) => ({
    subject: 'Reset your Cropple.ai password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🔐 Password Reset</h1>
            </div>
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">
                ${userName ? `Hi ${userName},` : 'Hi there,'}
              </h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 30px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              <div style="background-color: #f3f4f6; border-radius: 6px; padding: 20px; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                  Or copy and paste this link in your browser:
                </p>
                <p style="color: #dc2626; font-size: 14px; word-break: break-all; margin: 0;">
                  ${resetUrl}
                </p>
              </div>
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © 2024 Cropple.ai. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Reset your password by visiting: ${resetUrl}`
  })
}