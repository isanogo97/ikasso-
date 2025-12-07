import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import './globals.css'
import { LanguageProvider } from './contexts/LanguageContext'
import CookieConsent from './components/CookieConsent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ikasso - Chez Toi au Mali',
  description: "Découvrez et réservez les meilleurs hébergements au Mali. Hôtels, maisons d'hôtes et logements chez l'habitant.",
  keywords: "Mali, hébergement, hôtel, maison d'hôte, Bamako, Sikasso, Ségou, Mopti, Tombouctou",
  manifest: '/manifest.json',
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
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider>
          {children}
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  )
}
