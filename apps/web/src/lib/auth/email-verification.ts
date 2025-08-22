import crypto from 'crypto'
import { prisma } from '../prisma'
import { sendEmail, emailTemplates } from '../email/send-email'

export async function sendVerificationEmail(userId: string, email: string, userName?: string) {
  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  
  // Store token in database
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
      type: 'email-verify',
      userId
    }
  })
  
  // Generate verification URL
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`
  
  // Send email using template
  const { subject, html, text } = emailTemplates.verification(verifyUrl, userName)
  
  return await sendEmail({
    to: email,
    subject,
    html,
    text
  })
}

export async function verifyEmailToken(token: string) {
  // Find valid token
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      type: 'email-verify',
      expires: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  })
  
  if (!verificationToken || !verificationToken.user) {
    return { success: false, error: 'Invalid or expired verification token' }
  }
  
  // Update user as verified
  await prisma.user.update({
    where: { id: verificationToken.userId! },
    data: { emailVerified: new Date() }
  })
  
  // Delete used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verificationToken.identifier,
        token: verificationToken.token
      }
    }
  })
  
  return { 
    success: true, 
    user: verificationToken.user,
    email: verificationToken.identifier 
  }
}

export async function sendPasswordResetEmail(email: string) {
  // Find user
  const user = await prisma.user.findUnique({ 
    where: { email },
    select: { id: true, name: true }
  })
  
  // Don't reveal if email exists for security
  if (!user) {
    return { success: true }
  }
  
  // Generate token
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
  
  // Store token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
      type: 'password-reset',
      userId: user.id
    }
  })
  
  // Generate reset URL
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  
  // Send email
  const { subject, html, text } = emailTemplates.passwordReset(resetUrl, user.name)
  
  await sendEmail({
    to: email,
    subject,
    html,
    text
  })
  
  return { success: true }
}

export async function verifyPasswordResetToken(token: string) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      type: 'password-reset',
      expires: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  })
  
  if (!verificationToken || !verificationToken.user) {
    return { success: false, error: 'Invalid or expired reset token' }
  }
  
  return { 
    success: true, 
    user: verificationToken.user,
    email: verificationToken.identifier 
  }
}

export async function resetPassword(token: string, newPasswordHash: string) {
  // Verify token first
  const verification = await verifyPasswordResetToken(token)
  
  if (!verification.success || !verification.user) {
    return { success: false, error: 'Invalid token' }
  }
  
  // Update password
  await prisma.user.update({
    where: { id: verification.user.id },
    data: { passwordHash: newPasswordHash }
  })
  
  // Delete used token
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: verification.email,
      type: 'password-reset'
    }
  })
  
  return { success: true }
}

// Cleanup expired tokens (can be run as a cron job)
export async function cleanupExpiredTokens() {
  const deleted = await prisma.verificationToken.deleteMany({
    where: {
      expires: {
        lt: new Date()
      }
    }
  })
  
  return { deleted: deleted.count }
}