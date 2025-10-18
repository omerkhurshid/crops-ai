/**
 * Service Worker Registration and Management
 * Handles offline capabilities and background sync for Crops.AI
 */

// Logger replaced with console for local development
import { getConfig } from '../config/environment'

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager
  private registration: ServiceWorkerRegistration | null = null
  private isSupported = false

  private constructor() {
    this.isSupported = 'serviceWorker' in navigator
  }

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager()
    }
    return ServiceWorkerManager.instance
  }

  /**
   * Register the service worker
   */
  async register(): Promise<boolean> {
    if (!this.isSupported) {

      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      })

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdate()
      })

      // Check for existing service worker updates
      if (this.registration.waiting) {
        this.handleUpdate()
      }

      return true
    } catch (error) {
      console.error('Service Worker registration failed', error)
      return false
    }
  }

  /**
   * Handle service worker updates
   */
  private handleUpdate(): void {
    if (!this.registration?.installing) return

    const newWorker = this.registration.installing

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New version available
          this.showUpdateNotification()
        } else {
          // First installation
          this.showInstallationSuccess()
        }
      }
    })
  }

  /**
   * Show update notification to user
   */
  private showUpdateNotification(): void {
    // Create a custom event that the app can listen to
    const event = new CustomEvent('swUpdate', {
      detail: {
        type: 'update-available',
        message: 'New version available! Click to update.'
      }
    })
    window.dispatchEvent(event)
  }

  /**
   * Show installation success message
   */
  private showInstallationSuccess(): void {
    const event = new CustomEvent('swUpdate', {
      detail: {
        type: 'offline-ready',
        message: 'App is ready for offline use!'
      }
    })
    window.dispatchEvent(event)
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) return

    // Send message to waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Listen for controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }

  /**
   * Request push notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {

      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {

      return false
    }

    try {
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'
      
      if (granted) {

        await this.subscribeToPush()
      }
      
      return granted
    } catch (error) {
      console.error('Failed to request notification permission', error)
      return false
    }
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPush(): Promise<void> {
    if (!this.registration) return

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          getConfig().NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as BufferSource
      })

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      })

    } catch (error) {
      console.error('Push subscription failed', error)
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  /**
   * Check if app is currently offline
   */
  isOffline(): boolean {
    return !navigator.onLine
  }

  /**
   * Get network status information
   */
  getNetworkInfo(): { online: boolean; effectiveType?: string; downlink?: number } {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink
    }
  }

  /**
   * Queue data for background sync when offline
   */
  async queueForSync(data: {
    url: string
    method: string
    headers: Record<string, string>
    body: string
    id: string
  }): Promise<void> {
    if (!this.registration) return

    try {
      // Store data in IndexedDB for sync when online
      await this.storeForSync(data)
      
      // Register for background sync
      if ('sync' in this.registration) {
        await (this.registration as any).sync.register('background-sync')
      }

    } catch (error) {
      console.error('Failed to queue data for sync', error)
    }
  }

  /**
   * Store data for background sync (placeholder for IndexedDB implementation)
   */
  private async storeForSync(data: any): Promise<void> {
    // TODO: Implement IndexedDB storage
    // For now, store in localStorage as fallback
    const pendingData = JSON.parse(localStorage.getItem('pendingSync') || '[]')
    pendingData.push(data)
    localStorage.setItem('pendingSync', JSON.stringify(pendingData))
  }
}

// Export singleton instance
export const serviceWorkerManager = ServiceWorkerManager.getInstance()