import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rechercher un hebergement au Mali - Ikasso',
  description: 'Trouvez et reservez les meilleurs hebergements au Mali. Hotels, villas, appartements a Bamako, Sikasso, Mopti, Tombouctou. Paiement Orange Money.',
  openGraph: {
    title: 'Rechercher un logement au Mali',
    description: 'Trouvez votre hebergement ideal au Mali sur Ikasso.',
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
