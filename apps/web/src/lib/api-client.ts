/**
 * Authenticated API Client
 * Handles all API requests with proper authentication headers and session management
 */
import { sessionManager } from './session-manager'

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Get current session token if available
      const accessToken = sessionManager.getAccessToken()
      
      // Build headers with authentication
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      }

      // Add Bearer token if available
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Always include cookies
      })

      // Handle authentication errors
      if (response.status === 401) {
        console.warn('Authentication failed, attempting session refresh...')
        
        // Try to refresh session
        const sessionRefreshed = await sessionManager.initializeSession()
        
        if (sessionRefreshed) {
          // Retry with new token
          const newToken = sessionManager.getAccessToken()
          const retryHeaders = { ...headers }
          if (newToken) {
            retryHeaders['Authorization'] = `Bearer ${newToken}`
          }
          
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: retryHeaders,
            credentials: 'include',
          })
          
          const data = retryResponse.ok ? await retryResponse.json() : null
          return {
            data,
            error: retryResponse.ok ? undefined : `Request failed: ${retryResponse.status}`,
            status: retryResponse.status,
          }
        }
        
        return {
          error: 'Authentication required',
          status: 401,
        }
      }

      const data = response.ok ? await response.json() : null
      
      return {
        data,
        error: response.ok ? undefined : `Request failed: ${response.status}`,
        status: response.status,
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export convenience functions for common API patterns
export const api = {
  farms: {
    getAll: () => apiClient.get<any[]>('/api/farms'),
    getById: (id: string) => apiClient.get<any>(`/api/farms/${id}`),
    create: (data: any) => apiClient.post<any>('/api/farms', data),
    update: (id: string, data: any) => apiClient.put<any>(`/api/farms/${id}`, data),
    delete: (id: string) => apiClient.delete<any>(`/api/farms/${id}`),
  },
  users: {
    getPreferences: () => apiClient.get<any>('/api/users/preferences'),
    updatePreferences: (data: any) => apiClient.put<any>('/api/users/preferences', data),
  },
  auth: {
    getSession: () => apiClient.get<any>('/api/auth/session'),
    getStatus: () => apiClient.get<any>('/api/debug/auth-status'),
  },
}