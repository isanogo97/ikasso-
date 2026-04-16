'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo'

export default function PrivacyPage() {
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
          Politique de Confidentialit&eacute;
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Derni&egrave;re mise &agrave; jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none">
          {/* Section 1 - Responsable du traitement */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Responsable du traitement</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Le responsable du traitement de vos donn&eacute;es personnelles est :
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Ikasso</strong></p>
              <p className="text-gray-600">Op&eacute;r&eacute; par Ibrahim Sanogo</p>
              <p className="text-gray-600">Adresse : Bamako, Mali</p>
              <p className="text-gray-600">Email : <a href="mailto:privacy@ikasso.ml" className="text-primary-600 hover:underline">privacy@ikasso.ml</a></p>
              <p className="text-gray-600">Contact protection des donn&eacute;es : <a href="mailto:privacy@ikasso.ml" className="text-primary-600 hover:underline">privacy@ikasso.ml</a></p>
            </div>
          </section>

          {/* Section 2 - Introduction */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Bienvenue sur Ikasso. Nous nous engageons &agrave; prot&eacute;ger votre vie priv&eacute;e et vos donn&eacute;es personnelles
              conform&eacute;ment au R&egrave;glement G&eacute;n&eacute;ral sur la Protection des Donn&eacute;es (RGPD) et aux lois applicables en mati&egrave;re
              de protection des donn&eacute;es. Cette politique de confidentialit&eacute; explique comment nous collectons, utilisons,
              stockons et prot&eacute;geons vos informations lorsque vous utilisez notre application et nos services.
            </p>
          </section>

          {/* Section 3 - Informations collectees */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Informations que nous collectons</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous collectons les types d&apos;informations suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Informations d&apos;inscription :</strong> nom, pr&eacute;nom, adresse email, num&eacute;ro de t&eacute;l&eacute;phone, date de naissance</li>
              <li><strong>Informations de profil :</strong> adresse, ville, pays, photo de profil</li>
              <li><strong>Informations de paiement :</strong> num&eacute;ro Orange Money, informations de carte bancaire (trait&eacute;es par nos partenaires de paiement s&eacute;curis&eacute;s)</li>
              <li><strong>Informations de r&eacute;servation :</strong> dates, destinations, pr&eacute;f&eacute;rences d&apos;h&eacute;bergement</li>
              <li><strong>Documents d&apos;identit&eacute; :</strong> pi&egrave;ce d&apos;identit&eacute; pour la v&eacute;rification de votre compte</li>
              <li><strong>Messages :</strong> communications entre h&ocirc;tes et voyageurs sur la plateforme</li>
              <li><strong>Donn&eacute;es d&apos;utilisation :</strong> pages visit&eacute;es, fonctionnalit&eacute;s utilis&eacute;es, dur&eacute;e des sessions</li>
              <li><strong>Informations techniques :</strong> adresse IP, type d&apos;appareil, navigateur, syst&egrave;me d&apos;exploitation</li>
              <li><strong>Journaux de s&eacute;curit&eacute; :</strong> logs d&apos;acc&egrave;s et d&apos;audit pour la s&eacute;curit&eacute; de la plateforme</li>
            </ul>
          </section>

          {/* Section 4 - Comment nous utilisons vos informations */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Comment nous utilisons vos informations</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous utilisons vos informations pour :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Cr&eacute;er et g&eacute;rer votre compte utilisateur</li>
              <li>Traiter vos r&eacute;servations et paiements</li>
              <li>Vous envoyer des confirmations et mises &agrave; jour de r&eacute;servation</li>
              <li>Vous contacter pour le service client</li>
              <li>Am&eacute;liorer nos services et votre exp&eacute;rience utilisateur</li>
              <li>Vous envoyer des communications marketing (avec votre consentement)</li>
              <li>V&eacute;rifier votre identit&eacute; pour la s&eacute;curit&eacute; de la plateforme</li>
              <li>Pr&eacute;venir la fraude et assurer la s&eacute;curit&eacute; de notre plateforme</li>
              <li>Respecter nos obligations l&eacute;gales et comptables</li>
            </ul>
          </section>

          {/* Section 5 - Bases legales */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Bases l&eacute;gales du traitement</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Conform&eacute;ment &agrave; l&apos;article 6 du RGPD, chaque traitement de vos donn&eacute;es repose sur une base l&eacute;gale sp&eacute;cifique :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-600 border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 pr-4 font-semibold text-gray-900">Traitement</th>
                    <th className="text-left py-3 font-semibold text-gray-900">Base l&eacute;gale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Cr&eacute;ation de compte</td>
                    <td className="py-3">Ex&eacute;cution du contrat (art. 6.1.b)</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Traitement des r&eacute;servations</td>
                    <td className="py-3">Ex&eacute;cution du contrat (art. 6.1.b)</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Paiement</td>
                    <td className="py-3">Ex&eacute;cution du contrat (art. 6.1.b) + Obligation l&eacute;gale (art. 6.1.c)</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">V&eacute;rification d&apos;identit&eacute;</td>
                    <td className="py-3">Int&eacute;r&ecirc;t l&eacute;gitime - s&eacute;curit&eacute; (art. 6.1.f)</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Emails marketing</td>
                    <td className="py-3">Consentement (art. 6.1.a)</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Analyse d&apos;utilisation (analytics)</td>
                    <td className="py-3">Int&eacute;r&ecirc;t l&eacute;gitime - am&eacute;lioration du service (art. 6.1.f)</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Journalisation de s&eacute;curit&eacute;</td>
                    <td className="py-3">Int&eacute;r&ecirc;t l&eacute;gitime - s&eacute;curit&eacute; (art. 6.1.f)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              Lorsque le traitement est fond&eacute; sur votre consentement, vous pouvez le retirer &agrave; tout moment
              en nous contactant &agrave; <a href="mailto:privacy@ikasso.ml" className="text-primary-600 hover:underline">privacy@ikasso.ml</a> ou
              via les param&egrave;tres de votre compte. Le retrait du consentement ne remet pas en cause la
              l&eacute;galit&eacute; du traitement effectu&eacute; avant ce retrait.
            </p>
          </section>

          {/* Section 6 - Partage / sous-traitants */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Partage des informations et sous-traitants</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous pouvons partager vos informations avec :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li><strong>H&ocirc;tes :</strong> pour faciliter votre r&eacute;servation (nom, dates de s&eacute;jour, coordonn&eacute;es)</li>
              <li><strong>Autorit&eacute;s l&eacute;gales :</strong> si requis par la loi ou pour prot&eacute;ger nos droits</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous faisons appel aux sous-traitants suivants pour le traitement de vos donn&eacute;es :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-600 border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 pr-4 font-semibold text-gray-900">Sous-traitant</th>
                    <th className="text-left py-3 pr-4 font-semibold text-gray-900">Service</th>
                    <th className="text-left py-3 font-semibold text-gray-900">Localisation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Supabase</td>
                    <td className="py-3 pr-4">Base de donn&eacute;es PostgreSQL, Authentification, Stockage</td>
                    <td className="py-3">AWS EU/US</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Vercel</td>
                    <td className="py-3 pr-4">H&eacute;bergement</td>
                    <td className="py-3">AWS Global</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Resend</td>
                    <td className="py-3 pr-4">Envoi d&apos;emails</td>
                    <td className="py-3">US</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Stripe</td>
                    <td className="py-3 pr-4">Paiements (certifi&eacute; PCI DSS)</td>
                    <td className="py-3">US</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Upstash</td>
                    <td className="py-3 pr-4">Redis (limitation de d&eacute;bit)</td>
                    <td className="py-3">AWS Tokyo</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Sentry</td>
                    <td className="py-3 pr-4">Surveillance des erreurs</td>
                    <td className="py-3">US</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Apple / Google</td>
                    <td className="py-3 pr-4">OAuth (authentification sociale)</td>
                    <td className="py-3">US</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              Nous ne vendons jamais vos donn&eacute;es personnelles &agrave; des tiers. Les transferts vers des pays
              hors de l&apos;Espace &Eacute;conomique Europ&eacute;en sont encadr&eacute;s par des clauses contractuelles types
              approuv&eacute;es par la Commission europ&eacute;enne ou par des d&eacute;cisions d&apos;ad&eacute;quation.
            </p>
          </section>

          {/* Section 7 - Securite des donnees */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. S&eacute;curit&eacute; des donn&eacute;es</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous mettons en oeuvre des mesures de s&eacute;curit&eacute; techniques et organisationnelles pour prot&eacute;ger vos donn&eacute;es :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Stockage s&eacute;curis&eacute; des mots de passe (hashage)</li>
              <li>Acc&egrave;s restreint aux donn&eacute;es personnelles</li>
              <li>Surveillance continue de nos syst&egrave;mes</li>
              <li>Formation de notre personnel &agrave; la protection des donn&eacute;es</li>
            </ul>
          </section>

          {/* Section 8 - Conservation des donnees */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Conservation des donn&eacute;es</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous conservons vos donn&eacute;es personnelles pour les dur&eacute;es suivantes :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-600 border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 pr-4 font-semibold text-gray-900">Type de donn&eacute;es</th>
                    <th className="text-left py-3 pr-4 font-semibold text-gray-900">Dur&eacute;e de conservation</th>
                    <th className="text-left py-3 font-semibold text-gray-900">Justification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Donn&eacute;es de compte</td>
                    <td className="py-3 pr-4">Dur&eacute;e du compte + 3 ans apr&egrave;s suppression</td>
                    <td className="py-3">Prescription civile</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Donn&eacute;es de r&eacute;servation</td>
                    <td className="py-3 pr-4">5 ans</td>
                    <td className="py-3">Obligation l&eacute;gale</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Donn&eacute;es de paiement</td>
                    <td className="py-3 pr-4">10 ans</td>
                    <td className="py-3">Obligation comptable</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Documents d&apos;identit&eacute;</td>
                    <td className="py-3 pr-4">1 an apr&egrave;s v&eacute;rification</td>
                    <td className="py-3">V&eacute;rification effectu&eacute;e</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Messages</td>
                    <td className="py-3 pr-4">Dur&eacute;e du compte</td>
                    <td className="py-3">Ex&eacute;cution du service</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Journaux d&apos;audit</td>
                    <td className="py-3 pr-4">2 ans</td>
                    <td className="py-3">S&eacute;curit&eacute; de la plateforme</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4">Cookies</td>
                    <td className="py-3 pr-4">13 mois maximum</td>
                    <td className="py-3">Recommandation CNIL</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              &Agrave; l&apos;expiration de ces d&eacute;lais, vos donn&eacute;es sont supprim&eacute;es ou anonymis&eacute;es de mani&egrave;re irr&eacute;versible.
            </p>
          </section>

          {/* Section 9 - Vos droits */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Vos droits</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Conform&eacute;ment au RGPD (articles 15 &agrave; 22) et aux lois applicables, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Droit d&apos;acc&egrave;s (art. 15) :</strong> obtenir une copie de vos donn&eacute;es personnelles</li>
              <li><strong>Droit de rectification (art. 16) :</strong> corriger vos donn&eacute;es inexactes ou incompl&egrave;tes</li>
              <li><strong>Droit &agrave; l&apos;effacement (art. 17) :</strong> demander la suppression de vos donn&eacute;es</li>
              <li><strong>Droit &agrave; la limitation (art. 18) :</strong> limiter le traitement de vos donn&eacute;es</li>
              <li><strong>Droit &agrave; la portabilit&eacute; (art. 20) :</strong> recevoir vos donn&eacute;es dans un format structur&eacute; et lisible par machine</li>
              <li><strong>Droit d&apos;opposition (art. 21) :</strong> vous opposer au traitement de vos donn&eacute;es, notamment &agrave; des fins de prospection</li>
              <li><strong>Droit au retrait du consentement :</strong> retirer votre consentement &agrave; tout moment, sans affecter la l&eacute;galit&eacute; du traitement ant&eacute;rieur</li>
              <li><strong>Directives post-mortem :</strong> d&eacute;finir des directives relatives au sort de vos donn&eacute;es apr&egrave;s votre d&eacute;c&egrave;s</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous &agrave; : <a href="mailto:privacy@ikasso.ml" className="text-primary-600 hover:underline">privacy@ikasso.ml</a>.
              Nous r&eacute;pondrons &agrave; votre demande dans un d&eacute;lai d&apos;un mois &agrave; compter de sa r&eacute;ception.
            </p>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-gray-700 font-semibold mb-2">Droit d&apos;introduire une r&eacute;clamation</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Si vous estimez que le traitement de vos donn&eacute;es ne respecte pas la r&eacute;glementation, vous avez le
                droit d&apos;introduire une r&eacute;clamation aupr&egrave;s d&apos;une autorit&eacute; de contr&ocirc;le :
              </p>
              <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1 mt-2">
                <li><strong>Au Mali :</strong> Autorit&eacute; de Protection des Donn&eacute;es Personnelles du Mali (APDP)</li>
                <li><strong>En Europe :</strong> Commission Nationale de l&apos;Informatique et des Libert&eacute;s (CNIL) - <a href="https://www.cnil.fr" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a> - ou
                  l&apos;autorit&eacute; de protection des donn&eacute;es de votre pays de r&eacute;sidence</li>
              </ul>
            </div>
          </section>

          {/* Section 10 - Cookies */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Politique de cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nous utilisons des cookies et technologies similaires pour am&eacute;liorer votre exp&eacute;rience.
              Vous pouvez g&eacute;rer vos pr&eacute;f&eacute;rences de cookies via la banni&egrave;re de consentement affich&eacute;e lors de votre
              premi&egrave;re visite, ou en effaçant les cookies de votre navigateur.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              D&eacute;tail des cookies utilis&eacute;s sur Ikasso :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-600 border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 pr-4 font-semibold text-gray-900">Nom du cookie</th>
                    <th className="text-left py-3 pr-4 font-semibold text-gray-900">Finalit&eacute;</th>
                    <th className="text-left py-3 pr-4 font-semibold text-gray-900">Dur&eacute;e</th>
                    <th className="text-left py-3 font-semibold text-gray-900">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-mono text-xs">ikasso-auth</td>
                    <td className="py-3 pr-4">Authentification de l&apos;utilisateur</td>
                    <td className="py-3 pr-4">Dur&eacute;e de la session</td>
                    <td className="py-3">N&eacute;cessaire</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-mono text-xs">ikasso_cookie_consent</td>
                    <td className="py-3 pr-4">Stockage de vos pr&eacute;f&eacute;rences de cookies</td>
                    <td className="py-3 pr-4">13 mois</td>
                    <td className="py-3">N&eacute;cessaire</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-mono text-xs">sb-*</td>
                    <td className="py-3 pr-4">Authentification Supabase</td>
                    <td className="py-3 pr-4">Dur&eacute;e de la session</td>
                    <td className="py-3">N&eacute;cessaire</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-mono text-xs">_vercel_*</td>
                    <td className="py-3 pr-4">Analytique (si activ&eacute;)</td>
                    <td className="py-3 pr-4">1 an</td>
                    <td className="py-3">Analytique</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              Les cookies analytiques et de personnalisation ne sont d&eacute;pos&eacute;s qu&apos;apr&egrave;s obtention de votre consentement.
              Le consentement aux cookies est valable 13 mois. Pass&eacute; ce d&eacute;lai, la banni&egrave;re de consentement
              vous sera &agrave; nouveau pr&eacute;sent&eacute;e.
            </p>
          </section>

          {/* Section 11 - Transferts internationaux */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Transferts internationaux</h2>
            <p className="text-gray-600 leading-relaxed">
              Vos donn&eacute;es peuvent &ecirc;tre transf&eacute;r&eacute;es et stock&eacute;es sur des serveurs situ&eacute;s en dehors de votre pays
              (voir la liste des sous-traitants en section 6). Nous nous assurons que ces transferts sont
              effectu&eacute;s conform&eacute;ment au RGPD, notamment par la mise en place de clauses contractuelles
              types approuv&eacute;es par la Commission europ&eacute;enne (art. 46.2.c du RGPD) ou sur la base de
              d&eacute;cisions d&apos;ad&eacute;quation (art. 45 du RGPD).
            </p>
          </section>

          {/* Section 12 - Mineurs */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Mineurs</h2>
            <p className="text-gray-600 leading-relaxed">
              Nos services ne s&apos;adressent pas aux personnes de moins de 18 ans. Nous ne collectons pas
              sciemment de donn&eacute;es personnelles aupr&egrave;s de mineurs. Si vous &ecirc;tes parent et pensez que
              votre enfant nous a fourni des donn&eacute;es, contactez-nous &agrave;{' '}
              <a href="mailto:privacy@ikasso.ml" className="text-primary-600 hover:underline">privacy@ikasso.ml</a>{' '}
              et nous proc&eacute;derons &agrave; leur suppression.
            </p>
          </section>

          {/* Section 13 - Modifications */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Modifications de cette politique</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous pouvons mettre &agrave; jour cette politique de confidentialit&eacute;. En cas de modifications
              substantielles, nous vous en informerons par email ou via une notification dans l&apos;application
              au moins 30 jours avant leur entr&eacute;e en vigueur. Nous vous encourageons &agrave; consulter
              r&eacute;guli&egrave;rement cette page.
            </p>
          </section>

          {/* Section 14 - Contact */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question concernant cette politique de confidentialit&eacute; ou vos donn&eacute;es personnelles :
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Ikasso</strong></p>
              <p className="text-gray-600">Op&eacute;r&eacute; par Ibrahim Sanogo</p>
              <p className="text-gray-600">Email : <a href="mailto:privacy@ikasso.ml" className="text-primary-600 hover:underline">privacy@ikasso.ml</a></p>
              <p className="text-gray-600">Support : <a href="mailto:support@ikasso.ml" className="text-primary-600 hover:underline">support@ikasso.ml</a></p>
              <p className="text-gray-600">T&eacute;l&eacute;phone : +223 20 22 45 67</p>
              <p className="text-gray-600">Adresse : Bamako, Mali</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour &agrave; l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  )
}
