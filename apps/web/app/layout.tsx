import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ikasso - Chez Toi au Mali',
  description: "D\u00e9couvrez et r\u00e9servez les meilleurs h\u00e9bergements au Mali. H\u00f4tels, maisons d'h\u00f4tes et logements chez l'habitant.",
  keywords: "Mali, h\u00e9bergement, h\u00f4tel, maison d'h\u00f4te, Bamako, Sikasso, S\u00e9gou, Mopti, Tombouctou",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}


