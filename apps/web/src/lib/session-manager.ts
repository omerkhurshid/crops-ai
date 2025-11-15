/**
 * Session Manager for Supabase Authentication
 * Handles proper session cookie management and token refresh
 */
import { supabase } from './supabase'

export class SessionManager {
  private static instance: SessionManager
  private session: any = null
  private refreshTimer: NodeJS.Timeout | null = null

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  async initializeSession(): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('❌ Supabase not configured')
        return false
      }

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Session initialization error:', error)
        return false
      }

      if (session) {
        this.session = session
        this.setupRefreshTimer(session)
        console.log('✅ Session initialized:', session.user.id)
        
        // Ensure cookies are set by calling the session endpoint
        await this.syncSessionCookies()
        return true
      }

      console.log('ℹ️ No active session found')
      return false
    } catch (error) {
      console.error('❌ Session initialization failed:', error)
      return false
    }
  }

  private async syncSessionCookies(): Promise<void> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Session cookies synchronized:', !!data.session)
      } else {
        console.warn('⚠️ Failed to sync session cookies:', response.status)
      }
    } catch (error) {
      console.warn('⚠️ Session cookie sync failed:', error)
    }
  }

  private setupRefreshTimer(session: any): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    const expiresAt = session.expires_at * 1000 // Convert to milliseconds
    const now = Date.now()
    const timeToRefresh = expiresAt - now - 60000 // Refresh 1 minute before expiry

    if (timeToRefresh > 0) {
      this.refreshTimer = setTimeout(async () => {
        await this.refreshSession()
      }, timeToRefresh)
    }
  }

  private async refreshSession(): Promise<void> {
    try {
      if (!supabase) return

      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('❌ Session refresh failed:', error)
        this.session = null
        return
      }

      if (data.session) {
        this.session = data.session
        this.setupRefreshTimer(data.session)
        await this.syncSessionCookies()
        console.log('✅ Session refreshed successfully')
      }
    } catch (error) {
      console.error('❌ Session refresh error:', error)
    }
  }

  getSession(): any {
    return this.session
  }

  getAccessToken(): string | null {
    try {
      return this.session?.access_token || null
    } catch (error) {
      console.warn('Failed to get access token:', error)
      return null
    }
  }

  isAuthenticated(): boolean {
    try {
      return !!this.session && !!this.session.user
    } catch (error) {
      console.warn('Failed to check authentication status:', error)
      return false
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = null
      }

      if (supabase) {
        await supabase.auth.signOut()
      }

      this.session = null
      console.log('✅ Signed out successfully')
    } catch (error) {
      console.error('❌ Sign out error:', error)
    }
  }
}

export const sessionManager = SessionManager.getInstance()