import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../components/providers/auth-provider'
import { ThemeProvider } from '../components/theme/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crops.AI - AI-Powered Farm Management',
  description: 'Optimize agricultural productivity with intelligent decision-support, real-time monitoring, and predictive analytics.',
  keywords: 'agriculture, farming, AI, precision agriculture, crop monitoring, farm management',
  authors: [{ name: 'Crops.AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico'
  },
  openGraph: {
    title: 'Crops.AI - AI-Powered Farm Management',
    description: 'Transform your agricultural operations with intelligent decision-support, real-time monitoring, and predictive analytics.',
    url: 'https://crops.ai',
    siteName: 'Crops.AI',
    type: 'website',
    images: [
      {
        url: '/crops-ai-logo.png',
        width: 400,
        height: 400,
        alt: 'Crops.AI - Satellite and agricultural field logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cropsai',
    title: 'Crops.AI - AI-Powered Farm Management',
    description: 'Transform your agricultural operations with intelligent decision-support, real-time monitoring, and predictive analytics.',
    images: ['/crops-ai-logo.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}