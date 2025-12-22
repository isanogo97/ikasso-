'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LogoFinal from './components/LogoFinal'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <LogoFinal size="sm" />
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
          Politique de Confidentialité
        </h1>
        
        <p className="text-sm text-gray-500 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Bienvenue sur Ikasso. Nous nous engageons à protéger votre vie privée et vos données personnelles. 
              Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons 
              vos informations lorsque vous utilisez notre application et nos services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Informations que nous collectons</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous collectons les types d'informations suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Informations d'inscription :</strong> nom, prénom, adresse email, numéro de téléphone, date de naissance</li>
              <li><strong>Informations de profil :</strong> adresse, ville, pays, photo de profil</li>
              <li><strong>Informations de paiement :</strong> numéro Orange Money, informations de carte bancaire (traitées par nos partenaires de paiement sécurisés)</li>
              <li><strong>Informations de réservation :</strong> dates, destinations, préférences d'hébergement</li>
              <li><strong>Données d'utilisation :</strong> pages visitées, fonctionnalités utilisées, durée des sessions</li>
              <li><strong>Informations techniques :</strong> adresse IP, type d'appareil, navigateur, système d'exploitation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Comment nous utilisons vos informations</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous utilisons vos informations pour :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Traiter vos réservations et paiements</li>
              <li>Vous envoyer des confirmations et mises à jour de réservation</li>
              <li>Vous contacter pour le service client</li>
              <li>Améliorer nos services et votre expérience utilisateur</li>
              <li>Vous envoyer des communications marketing (avec votre consentement)</li>
              <li>Prévenir la fraude et assurer la sécurité de notre plateforme</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Partage des informations</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous pouvons partager vos informations avec :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Hôtes :</strong> pour faciliter votre réservation (nom, dates de séjour, coordonnées)</li>
              <li><strong>Prestataires de paiement :</strong> Orange Money, Stripe, PayPal pour traiter les transactions</li>
              <li><strong>Prestataires de services :</strong> hébergement cloud, envoi d'emails, analyse de données</li>
              <li><strong>Autorités légales :</strong> si requis par la loi ou pour protéger nos droits</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Nous ne vendons jamais vos données personnelles à des tiers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Sécurité des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Stockage sécurisé des mots de passe (hashage)</li>
              <li>Accès restreint aux données personnelles</li>
              <li>Surveillance continue de nos systèmes</li>
              <li>Formation de notre personnel à la protection des données</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Conservation des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services 
              et respecter nos obligations légales. Après la suppression de votre compte, nous pouvons conserver 
              certaines données pendant une période limitée pour des raisons légales ou de sécurité.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Vos droits</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Conformément au RGPD et aux lois applicables, vous avez le droit de :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Rectification :</strong> corriger vos données inexactes ou incomplètes</li>
              <li><strong>Suppression :</strong> demander la suppression de vos données</li>
              <li><strong>Limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Retrait du consentement :</strong> retirer votre consentement à tout moment</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@ikasso.ml" className="text-primary-600 hover:underline">privacy@ikasso.ml</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous utilisons des cookies et technologies similaires pour améliorer votre expérience. 
              Vous pouvez gérer vos préférences de cookies via la bannière de consentement ou les paramètres 
              de votre navigateur. Pour plus d'informations, consultez notre politique de cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Transferts internationaux</h2>
            <p className="text-gray-600 leading-relaxed">
              Vos données peuvent être transférées et stockées sur des serveurs situés en dehors de votre pays. 
              Nous nous assurons que ces transferts sont effectués conformément aux lois applicables et avec 
              des garanties appropriées pour protéger vos données.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Mineurs</h2>
            <p className="text-gray-600 leading-relaxed">
              Nos services ne s'adressent pas aux personnes de moins de 18 ans. Nous ne collectons pas 
              sciemment de données personnelles auprès de mineurs. Si vous êtes parent et pensez que 
              votre enfant nous a fourni des données, contactez-nous.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Modifications</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité. En cas de modifications 
              importantes, nous vous en informerons par email ou via une notification dans l'application. 
              Nous vous encourageons à consulter régulièrement cette page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Ikasso</strong></p>
              <p className="text-gray-600">Email : <a href="mailto:privacy@ikasso.ml" className="text-primary-600 hover:underline">privacy@ikasso.ml</a></p>
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





