/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@crops-ai/shared", "@crops-ai/ui"],
  eslint: {
    // Allow production builds to complete even if there are ESLint warnings
    ignoreDuringBuilds: true,
    // Directories to run ESLint on during build
    dirs: ['src'],
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if type errors are present
    ignoreBuildErrors: false,
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