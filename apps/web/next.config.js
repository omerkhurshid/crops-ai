/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@crops-ai/shared", "@crops-ai/ui"],
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