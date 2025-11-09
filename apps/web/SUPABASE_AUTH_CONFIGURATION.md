# Supabase Authentication Configuration Guide

## Current Issue
Users are receiving default Supabase confirmation emails with localhost redirects instead of custom branded emails pointing to production domain (cropple.ai).

## Required Supabase Dashboard Configuration

### 1. Site URL Configuration
In your Supabase project dashboard (https://supabase.com/dashboard/project/drtbsioeqfodcaelukpo):

**Authentication > URL Configuration**
- **Site URL**: `https://cropple.ai`
- **Redirect URLs**: Add the following allowed URLs:
  - `https://cropple.ai/auth/confirm`
  - `https://cropple.ai/auth/callback`
  - `https://cropple.ai/dashboard`
  - `http://localhost:3000/auth/confirm` (for development)
  - `http://localhost:3000/auth/callback` (for development)

### 2. Email Templates Configuration

**Authentication > Email Templates**

#### Confirm Signup Template:
```html
<h2>Welcome to Cropple.ai!</h2>
<p>Thank you for signing up. Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your account</a></p>
<p>If you didn't create an account with us, please ignore this email.</p>
<br>
<p>Best regards,<br>The Cropple.ai Team</p>
```

#### Reset Password Template:
```html
<h2>Reset your Cropple.ai password</h2>
<p>You requested to reset your password. Click the link below to set a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset your password</a></a></p>
<p>If you didn't request this, please ignore this email.</p>
<br>
<p>Best regards,<br>The Cropple.ai Team</p>
```

### 3. Email Settings
**Authentication > Settings > Email**
- **From Email**: `noreply@cropple.ai`
- **From Name**: `Cropple.ai`

### 4. Advanced Settings
**Authentication > Settings > Advanced**
- **JWT Expiry**: `3600` (1 hour)
- **Refresh Token Expiry**: `2592000` (30 days)
- **Disable Signup**: `false`
- **Enable Email Confirmations**: `true`
- **Double Confirm Email Changes**: `true`

## Current Environment Variables ✅

The following environment variables are already configured in both `.env.local` and `.env.production`:

```bash
# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL="https://drtbsioeqfodcaelukpo.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
NEXT_PUBLIC_APP_URL="https://cropple.ai"
```

## Auth Flow Pages ✅

The following pages are already configured:
- `/auth/confirm` - Handles email confirmation with Supabase's `exchangeCodeForSession`
- `/verify-email` - Legacy email verification (uses old API endpoint)

## Next Steps Required

1. **Login to Supabase Dashboard**:
   - Go to https://supabase.com/dashboard/project/drtbsioeqfodcaelukpo
   - Navigate to Authentication > URL Configuration
   - Update Site URL to `https://cropple.ai`

2. **Add Redirect URLs**:
   - Add all production and development URLs listed above

3. **Configure Email Templates**:
   - Update email templates with Cropple.ai branding
   - Set From Email to `noreply@cropple.ai`

4. **Test Email Flow**:
   - Sign up with a test email
   - Verify custom email template is used
   - Confirm redirect goes to `https://cropple.ai/auth/confirm`

## Alternative: Custom Email Integration

If you prefer to use Resend for all emails instead of Supabase's email system:

1. **Disable Supabase Emails**:
   - Set "Enable Email Confirmations" to `false` in Supabase

2. **Create Custom Webhook**:
   - Add webhook handler in `/api/auth/webhook`
   - Intercept `user.created` events
   - Send custom emails via Resend

3. **Update Registration Flow**:
   - Generate custom verification tokens
   - Send emails via Resend API
   - Handle verification in `/api/user-auth/verify-email`

## Status
- ✅ Environment variables configured
- ✅ Auth confirmation page created
- ⚠️ **Supabase dashboard configuration pending**
- ⚠️ **Custom email templates needed**