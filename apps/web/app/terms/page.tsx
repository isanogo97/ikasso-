'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <Logo size="sm" />
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
          Conditions Générales d'Utilisation
        </h1>
        
        <p className="text-sm text-gray-500 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Objet</h2>
            <p className="text-gray-600 leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme 
              Ikasso, accessible via l'application mobile et le site web ikasso.ml. En utilisant nos services, 
              vous acceptez ces conditions dans leur intégralité.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Définitions</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Ikasso :</strong> la plateforme de réservation d'hébergements</li>
              <li><strong>Utilisateur :</strong> toute personne utilisant la plateforme</li>
              <li><strong>Voyageur :</strong> utilisateur qui réserve un hébergement</li>
              <li><strong>Hôte :</strong> utilisateur qui propose un hébergement</li>
              <li><strong>Hébergement :</strong> logement proposé à la réservation</li>
              <li><strong>Réservation :</strong> contrat entre un voyageur et un hôte</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Inscription</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Pour utiliser nos services, vous devez :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Avoir au moins 18 ans</li>
              <li>Fournir des informations exactes et à jour</li>
              <li>Vérifier votre email et numéro de téléphone</li>
              <li>Maintenir la confidentialité de vos identifiants</li>
              <li>Nous informer de tout accès non autorisé à votre compte</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Services pour les Voyageurs</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-2">4.1 Réservation</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              En effectuant une réservation, vous vous engagez à respecter les conditions de l'hébergement, 
              les règles de la maison définies par l'hôte, et à payer le montant total de la réservation.
            </p>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2">4.2 Paiement</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Les paiements sont traités de manière sécurisée via Orange Money, carte bancaire ou PayPal. 
              Le montant est débité au moment de la réservation et transféré à l'hôte après le check-in.
            </p>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2">4.3 Annulation</h3>
            <p className="text-gray-600 leading-relaxed">
              Les conditions d'annulation varient selon l'hébergement. Consultez la politique d'annulation 
              avant de réserver. Les remboursements sont effectués selon la politique applicable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Services pour les Hôtes</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-2">5.1 Publication d'annonces</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              En publiant une annonce, vous garantissez que les informations sont exactes, que vous avez 
              le droit de louer le logement, et que celui-ci respecte les normes de sécurité.
            </p>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2">5.2 Obligations</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Maintenir l'hébergement conforme à la description</li>
              <li>Répondre aux demandes dans un délai raisonnable</li>
              <li>Accueillir les voyageurs comme convenu</li>
              <li>Respecter les lois locales sur la location</li>
            </ul>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">5.3 Commissions</h3>
            <p className="text-gray-600 leading-relaxed">
              Ikasso prélève une commission de 8% pour les particuliers et 10% pour les professionnels 
              sur chaque réservation confirmée.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Comportement des utilisateurs</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Les utilisateurs s'engagent à :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Respecter les autres utilisateurs</li>
              <li>Ne pas publier de contenu illégal, offensant ou trompeur</li>
              <li>Ne pas utiliser la plateforme à des fins frauduleuses</li>
              <li>Ne pas contourner le système de paiement d'Ikasso</li>
              <li>Ne pas collecter les données d'autres utilisateurs</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Avis et évaluations</h2>
            <p className="text-gray-600 leading-relaxed">
              Les avis doivent être honnêtes, pertinents et respectueux. Ikasso se réserve le droit de 
              supprimer les avis qui ne respectent pas ces critères ou qui sont manifestement faux.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Responsabilité</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Ikasso agit en tant qu'intermédiaire entre les voyageurs et les hôtes. Nous ne sommes pas 
              responsables de :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>L'état ou la qualité des hébergements</li>
              <li>Les actions ou omissions des utilisateurs</li>
              <li>Les dommages résultant de l'utilisation de nos services</li>
              <li>Les interruptions de service indépendantes de notre volonté</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Propriété intellectuelle</h2>
            <p className="text-gray-600 leading-relaxed">
              Tout le contenu de la plateforme (logos, textes, images, code) est protégé par les droits 
              de propriété intellectuelle. Toute reproduction sans autorisation est interdite.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Suspension et résiliation</h2>
            <p className="text-gray-600 leading-relaxed">
              Ikasso peut suspendre ou résilier votre compte en cas de violation des présentes CGU, 
              de comportement frauduleux, ou pour toute autre raison légitime. Vous pouvez supprimer 
              votre compte à tout moment depuis les paramètres.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Modifications</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous pouvons modifier ces CGU à tout moment. Les modifications entrent en vigueur dès 
              leur publication. En continuant à utiliser nos services, vous acceptez les nouvelles conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Droit applicable</h2>
            <p className="text-gray-600 leading-relaxed">
              Les présentes CGU sont régies par le droit malien. Tout litige sera soumis aux tribunaux 
              compétents de Bamako, Mali.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contact</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Ikasso</strong></p>
              <p className="text-gray-600">Email : <a href="mailto:legal@ikasso.ml" className="text-primary-600 hover:underline">legal@ikasso.ml</a></p>
              <p className="text-gray-600">Support : <a href="mailto:support@ikasso.ml" className="text-primary-600 hover:underline">support@ikasso.ml</a></p>
              <p className="text-gray-600">Téléphone : +223 20 22 45 67</p>
              <p className="text-gray-600">Adresse : Bamako, Mali</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  )
}





