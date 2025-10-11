import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://crops-ai.vercel.app'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/dashboard/private/',
        '/_next/',
        '/monitoring',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}