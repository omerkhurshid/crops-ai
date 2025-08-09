import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rate limiting configuration
const RATE_LIMITS = {
  // API endpoints rate limits (requests per minute)
  '/api/weather': 60,
  '/api/satellite': 30,
  '/api/farms': 100,
  '/api/market': 30,
  '/api/ml': 20,
  '/api/auth/register': 5,
  '/api/auth/login': 10,
  // Default rate limit for other API endpoints
  '/api': 120
}

// Store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiting middleware
 */
async function checkRateLimit(request: NextRequest, limit: number): Promise<boolean> {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const key = `${ip}:${request.nextUrl.pathname}`
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window

  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    // New window or expired record
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false // Rate limit exceeded
  }

  record.count++
  return true
}

/**
 * Security headers middleware
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel.app *.nextjs.org; " +
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
    "font-src 'self' fonts.gstatic.com; " +
    "img-src 'self' data: blob: *.openweathermap.org *.planet.com *.sentinel-hub.com; " +
    "connect-src 'self' *.supabase.co api.openweathermap.org services.sentinel-hub.com api.planet.com *.cmegroup.com quickstats.nass.usda.gov; " +
    "frame-ancestors 'none';"
  )
  
  // Strict Transport Security (HSTS)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  return response
}

/**
 * API authentication middleware
 */
async function checkApiAuth(request: NextRequest): Promise<boolean> {
  // Skip auth for public endpoints
  const publicEndpoints = [
    '/api/health',
    '/api/auth/', // NextAuth endpoints (redirected to /api/authentication/)
    '/api/authentication/', // All authentication endpoints - note the trailing slash
    '/api/debug/', // Debug endpoints  
    '/api/check-connection', // Connection check
    '/api/test-nextauth-route', // Test route
    '/api/test' // Test endpoint for debugging
  ]
  
  console.log(`🔒 Auth check for: ${request.nextUrl.pathname}`)
  console.log(`🔍 Public endpoints:`, publicEndpoints)
  
  const isPublic = publicEndpoints.some(endpoint => {
    // Handle exact matches and trailing slash variants
    const withoutSlash = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
    const withSlash = endpoint.endsWith('/') ? endpoint : endpoint + '/'
    
    return request.nextUrl.pathname === withoutSlash || 
           request.nextUrl.pathname === withSlash ||
           request.nextUrl.pathname.startsWith(withSlash)
  })
  
  console.log(`🔍 Is public check result: ${isPublic}`)
  
  if (isPublic) {
    console.log(`✅ Public endpoint allowed: ${request.nextUrl.pathname}`)
    return true
  }

  // Check for valid JWT token
  console.log(`🔑 Checking JWT token for: ${request.nextUrl.pathname}`)
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const hasToken = !!token
  console.log(`${hasToken ? '✅' : '❌'} JWT token check result: ${hasToken}`)
  return hasToken
}

/**
 * IP-based blocking middleware
 */
function checkIPBlocking(request: NextRequest): boolean {
  const ip = request.ip || request.headers.get('x-forwarded-for') || ''
  
  // Block known malicious IPs (would be maintained in database/config in production)
  const blockedIPs: string[] = [
    // Add blocked IPs here
  ]
  
  // Block requests from blocked IPs
  if (blockedIPs.some(blockedIP => ip.includes(blockedIP))) {
    return false
  }
  
  return true
}

/**
 * User-Agent validation
 */
function validateUserAgent(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  
  // Block requests without user agent (potential bots)
  if (!userAgent.trim()) {
    return false
  }
  
  // Block known malicious user agents
  const maliciousPatterns = [
    'sqlmap',
    'nikto',
    'nessus',
    'burpsuite',
    'nmap'
  ]
  
  const userAgentLower = userAgent.toLowerCase()
  if (maliciousPatterns.some(pattern => userAgentLower.includes(pattern))) {
    return false
  }
  
  return true
}

/**
 * Request size validation
 */
function validateRequestSize(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (size > maxSize) {
      return false
    }
  }
  
  return true
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add security headers to all responses
  addSecurityHeaders(response)
  
  // Skip middleware for static files and internal Next.js routes
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.includes('.') && !request.nextUrl.pathname.startsWith('/api/')
  ) {
    return response
  }
  
  // IP blocking check
  if (!checkIPBlocking(request)) {
    console.warn(`Blocked request from IP: ${request.ip}`)
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  // User-Agent validation
  if (!validateUserAgent(request)) {
    console.warn(`Blocked request with invalid user agent: ${request.headers.get('user-agent')}`)
    return new NextResponse('Bad Request', { status: 400 })
  }
  
  // Request size validation
  if (!validateRequestSize(request)) {
    console.warn(`Blocked request with excessive size from IP: ${request.ip}`)
    return new NextResponse('Payload Too Large', { status: 413 })
  }
  
  // Apply rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Find applicable rate limit
    let rateLimit = RATE_LIMITS['/api'] // Default
    
    for (const [path, limit] of Object.entries(RATE_LIMITS)) {
      if (request.nextUrl.pathname.startsWith(path)) {
        rateLimit = limit
        break
      }
    }
    
    const allowed = await checkRateLimit(request, rateLimit)
    if (!allowed) {
      console.warn(`Rate limit exceeded for IP: ${request.ip}, path: ${request.nextUrl.pathname}`)
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      })
    }
    
    // API authentication check
    const authenticated = await checkApiAuth(request)
    if (!authenticated) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }
  
  // CORS handling for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'http://localhost:3000',
      'https://crops-ai.vercel.app',
      'https://crops.ai'
    ]
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      )
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      )
    }
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200 })
    }
  }
  
  return response
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}