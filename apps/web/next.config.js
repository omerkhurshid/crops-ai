/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@crops-ai/shared", "@crops-ai/ui", "@crops-ai/database"],
}

module.exports = nextConfig