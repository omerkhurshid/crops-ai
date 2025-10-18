import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: 'Crops.AI - Smart Farm Management',
  description: 'Help your farm grow better crops and increase profits with field health tracking, weather alerts, and smart recommendations.',
  keywords: 'agriculture, farming, smart farming, crop health, field monitoring, farm management',
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
    title: 'Crops.AI - Smart Farm Management',
    description: 'Help your farm grow better crops and increase profits with field health tracking, weather alerts, and smart recommendations.',
    url: 'https://crops.ai',
    siteName: 'Crops.AI',
    type: 'website',
    images: [
      {
        url: '/crops-ai-logo.png',
        width: 400,
        height: 400,
        alt: 'Crops.AI - Smart farming logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cropsai',
    title: 'Crops.AI - Smart Farm Management',
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
      <body className={inter.className}>
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