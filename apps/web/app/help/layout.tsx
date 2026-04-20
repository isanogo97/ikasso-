import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Centre d\'aide - Ikasso',
  description: 'Trouvez des reponses a vos questions sur Ikasso. Reservations, paiements, securite, hotes. Support 24/7 au Mali.',
  openGraph: {
    title: 'Centre d\'aide Ikasso',
    description: 'Support et FAQ pour la plateforme de reservation au Mali.',
  },
}

const faqItems = [
  { q: 'Comment reserver un hebergement sur Ikasso ?', a: 'Utilisez la barre de recherche pour choisir votre destination et vos dates, parcourez les resultats, puis cliquez sur Reserver et suivez les etapes de paiement.' },
  { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Orange Money (recommande au Mali), cartes bancaires Visa/Mastercard via CinetPay, et bientot Apple Pay et Google Pay.' },
  { q: 'Puis-je annuler ma reservation ?', a: 'Oui, selon la politique de l\'hote. Flexible: 24h avant. Moderee: 5 jours avant. Stricte: remboursement 50% si 7 jours avant.' },
  { q: 'Comment devenir hote sur Ikasso ?', a: 'Creez un compte Hote, ajoutez votre propriete avec photos, fixez vos tarifs. Validation en 24-48h.' },
  { q: 'Quelles sont les commissions d\'Ikasso ?', a: '8% pour les particuliers et 10% pour les entreprises. Paiements recus 24h apres le check-in.' },
  { q: 'Comment Ikasso assure-t-il ma securite ?', a: 'Verification d\'identite NINA, avis bidirectionnel, support client, paiements securises, photos verifiees.' },
]

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />
      {children}
    </>
  )
}
