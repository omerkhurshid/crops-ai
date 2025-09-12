/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@crops-ai/shared", "@crops-ai/ui"],
  eslint: {
    // Allow production builds to complete even if there are ESLint warnings
    ignoreDuringBuilds: false,
    // Directories to run ESLint on during build
    dirs: ['src'],
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if type errors are present
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        // Apply CSP to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel.app *.nextjs.org maps.googleapis.com maps.gstatic.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com maps.googleapis.com",
              "img-src 'self' data: blob: maps.googleapis.com maps.gstatic.com *.googleusercontent.com *.gstatic.com",
              "font-src 'self' fonts.gstatic.com",
              "connect-src 'self' maps.googleapis.com",
              "frame-src 'self' maps.googleapis.com"
            ].join('; ')
          }
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/authentication/:path*',
      },
    ]
  },
}

module.exports = nextConfig