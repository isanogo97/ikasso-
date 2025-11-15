import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ikasso - Chez Toi au Mali',
  description: "Découvrez et réservez les meilleurs hébergements au Mali. Hôtels, maisons d'hôtes et logements chez l'habitant.",
  keywords: "Mali, hébergement, hôtel, maison d'hôte, Bamako, Sikasso, Ségou, Mopti, Tombouctou",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

