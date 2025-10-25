/**
 * Crops.AI Service Worker
 * Provides offline capabilities and background synchronization for agricultural data
 */

const CACHE_NAME = 'crops-ai-v1'
const STATIC_CACHE = 'crops-ai-static-v1'
const DYNAMIC_CACHE = 'crops-ai-dynamic-v1'

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/farms',
  '/offline',
  '/manifest.json',
  // Add critical CSS and JS files
]

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/weather/current',
  '/api/tasks',
  '/api/farms',
  '/api/crops',
  '/api/livestock',
  '/api/quick-actions/',
  '/api/field-photos/',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      })
      .catch((error) => {
        // Use structured error event for production monitoring
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_ERROR',
              error: 'Installation failed',
              details: error.message
            })
          })
        })
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets and pages
  event.respondWith(handleStaticRequest(request))
})

/**
 * Handle API requests with network-first strategy
 */
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses for cacheable APIs
    if (networkResponse.ok && isCacheableApi(url.pathname)) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache fallback
    
    // Fall back to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for critical APIs
    if (isCriticalApi(url.pathname)) {
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'This data is not available offline',
          cached: false
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    throw error
  }
}

/**
 * Handle static assets and pages with cache-first strategy
 */
async function handleStaticRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fetch from network
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Static request failed
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline')
      if (offlineResponse) {
        return offlineResponse
      }
    }
    
    throw error
  }
}

/**
 * Check if API endpoint should be cached
 */
function isCacheableApi(pathname) {
  return CACHEABLE_APIS.some(api => pathname.startsWith(api))
}

/**
 * Check if API is critical and needs offline response
 */
function isCriticalApi(pathname) {
  const criticalApis = ['/api/weather/', '/api/farms', '/api/tasks']
  return criticalApis.some(api => pathname.startsWith(api))
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData())
  }
})

/**
 * Sync data when connection is restored
 */
async function syncData() {
  try {
    // Get any pending data from IndexedDB
    const pendingData = await getPendingData()
    
    // Send pending data to server
    for (const data of pendingData) {
      try {
        await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: data.body
        })
        
        // Remove from pending queue
        await removePendingData(data.id)
      } catch (error) {
        // Log sync failure for monitoring
      }
    }
  } catch (error) {
    // Background sync failed - handled silently in production
  }
}

/**
 * Handle push notifications for farm alerts
 */
self.addEventListener('push', (event) => {
  
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body || 'New farm alert',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: data.tag || 'farm-alert',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png'
        }
      ],
      requireInteraction: data.urgent || false
    }
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Farm Alert',
        options
      )
    )
  }
})

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  
  event.notification.close()
  
  if (event.action === 'view') {
    // Open the app to the relevant page
    const urlToOpen = event.notification.data.url || '/dashboard'
    
    event.waitUntil(
      clients.openWindow(urlToOpen)
    )
  }
})

// IndexedDB operations for background sync
async function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CropsAISyncDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('backgroundSync')) {
        const store = db.createObjectStore('backgroundSync', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('tag', 'tag', { unique: false });
      }
    };
  });
}
async function getPendingData() {
  try {
    const db = await openSyncDB();
    const transaction = db.transaction(['backgroundSync'], 'readonly');
    const store = transaction.objectStore('backgroundSync');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get pending data:', error);
    return [];
  }
}

async function removePendingData(id) {
  // Remove successfully synced data from IndexedDB
  const db = await openSyncDB();
  const transaction = db.transaction(['backgroundSync'], 'readwrite');
  const store = transaction.objectStore('backgroundSync');
  await store.delete(event.data.id);
}