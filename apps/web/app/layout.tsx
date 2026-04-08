import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import './globals.css'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import CookieConsent from './components/CookieConsent'
import InstallPrompt from './components/InstallPrompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Ikasso - Chez Toi au Mali',
    template: '%s | Ikasso',
  },
  description: "Decouvrez et reservez les meilleurs hebergements au Mali. Hotels, maisons d'hotes et logements chez l'habitant a Bamako, Sikasso, Segou, Mopti, Tombouctou.",
  keywords: "Mali, hebergement, hotel, maison d'hote, Bamako, Sikasso, Segou, Mopti, Tombouctou, reservation, Airbnb Mali",
  manifest: '/manifest.json',
  metadataBase: new URL('https://ikasso.ml'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://ikasso.ml',
    siteName: 'Ikasso',
    title: 'Ikasso - Chez Toi au Mali',
    description: "La premiere plateforme malienne de reservation d'hebergements. Trouvez le logement ideal pour vos voyages au Mali.",
    images: [
      {
        url: '/images/logos/ikasso-logo-800.png',
        width: 800,
        height: 600,
        alt: 'Ikasso - Hebergements au Mali',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ikasso - Chez Toi au Mali',
    description: "Reservez les meilleurs hebergements au Mali.",
    images: ['/images/logos/ikasso-logo-800.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ikasso',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#E85D04',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Favicons - Vos logos professionnels */}
        <link rel="icon" type="image/png" sizes="16x16" href="/images/logos/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logos/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/images/logos/ikasso-logo-icon.png" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logos/apple-touch-icon.png" />
        
        {/* Android/PWA Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/images/logos/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/logos/android-chrome-512x512.png" />
        
        {/* Fallback vers les anciens icons si les nouveaux n'existent pas encore */}
        <link rel="alternate icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
        <link rel="alternate icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
        
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <CookieConsent />
            <InstallPrompt />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
