import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../components/providers/auth-provider'
import { ThemeProvider } from '../components/theme/theme-provider'
import { CacheProvider } from '../components/providers/cache-provider'
import { UserPreferencesProvider } from '../contexts/user-preferences-context'
import { Toaster } from 'react-hot-toast'
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
})
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}
export const metadata: Metadata = {
  title: 'Cropple.ai - Smart Farm Management',
  description: 'Help your farm grow better crops and increase profits with field health tracking, weather alerts, and smart recommendations.',
  keywords: 'agriculture, farming, smart farming, crop health, field monitoring, farm management',
  authors: [{ name: 'Cropple.ai Team' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico'
  },
  openGraph: {
    title: 'Cropple.ai - Smart Farm Management',
    description: 'Help your farm grow better crops and increase profits with field health tracking, weather alerts, and smart recommendations.',
    url: 'https://cropple.ai',
    siteName: 'Cropple.ai',
    type: 'website',
    images: [
      {
        url: '/crops-ai-logo.png',
        width: 400,
        height: 400,
        alt: 'Cropple.ai - Smart farming logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@croppleai',
    title: 'Cropple.ai - Smart Farm Management',
    description: 'Help your farm grow better crops and increase profits with field health tracking, weather alerts, and smart recommendations.',
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
      <body className={`${inter.className} bg-[#FAFAF7] text-gray-900`}>
        <ThemeProvider defaultTheme="system">
          <CacheProvider>
            <AuthProvider>
              <UserPreferencesProvider>
                {children}
              </UserPreferencesProvider>
            </AuthProvider>
          </CacheProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#FFFFFF',
                color: '#1A1A1A',
                border: '1px solid #F3F4F6',
                borderRadius: '12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                fontSize: '14px',
              },
              success: {
                style: {
                  background: '#7A8F78',
                  color: '#FFFFFF',
                  border: '1px solid #7A8F78',
                },
                iconTheme: {
                  primary: '#FFFFFF',
                  secondary: '#7A8F78',
                },
              },
              error: {
                style: {
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: '1px solid #DC2626',
                },
                iconTheme: {
                  primary: '#FFFFFF',
                  secondary: '#DC2626',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}