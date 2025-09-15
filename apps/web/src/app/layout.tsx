import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../components/providers/auth-provider'
import { ThemeProvider } from '../components/theme/theme-provider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cropple.ai - AI-Powered Farm Management',
  description: 'Optimize agricultural productivity with intelligent decision-support, real-time monitoring, and predictive analytics.',
  keywords: 'agriculture, farming, AI, precision agriculture, crop monitoring, farm management',
  authors: [{ name: 'Cropple.ai Team' }],
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
    title: 'Cropple.ai - AI-Powered Farm Management',
    description: 'Transform your agricultural operations with intelligent decision-support, real-time monitoring, and predictive analytics.',
    url: 'https://cropple.ai',
    siteName: 'Cropple.ai',
    type: 'website',
    images: [
      {
        url: '/crops-ai-logo.png',
        width: 400,
        height: 400,
        alt: 'Cropple.ai - Satellite and agricultural field logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@croppleai',
    title: 'Cropple.ai - AI-Powered Farm Management',
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
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}