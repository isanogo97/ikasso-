'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, Book, MessageCircle, Phone, Mail, ChevronDown, ChevronRight, ArrowLeft, HelpCircle, Users, CreditCard, Home, Shield } from 'lucide-react'
import Logo from '../components/Logo'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Toutes les catégories', icon: Book },
    { id: 'booking', name: 'Réservations', icon: Home },
    { id: 'payment', name: 'Paiements', icon: CreditCard },
    { id: 'account', name: 'Compte', icon: Users },
    { id: 'safety', name: 'Sécurité', icon: Shield },
    { id: 'host', name: 'Hôtes', icon: HelpCircle }
  ]

  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: 'Comment réserver un hébergement sur Ikasso ?',
      answer: 'Pour réserver un hébergement : 1) Utilisez la barre de recherche pour sélectionner votre destination et vos dates. 2) Parcourez les résultats et cliquez sur l\'hébergement qui vous intéresse. 3) Vérifiez les détails, les photos et les avis. 4) Cliquez sur "Réserver" et suivez les étapes de paiement. 5) Vous recevrez une confirmation par email et SMS.'
    },
    {
      id: 2,
      category: 'payment',
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons plusieurs moyens de paiement pour votre commodité : Orange Money (recommandé au Mali), cartes bancaires Visa/Mastercard, PayPal, et Klarna. Orange Money est notre méthode privilégiée car elle est largement utilisée au Mali et offre des transactions sécurisées.'
    },
    {
      id: 3,
      category: 'booking',
      question: 'Puis-je annuler ma réservation ?',
      answer: 'Oui, vous pouvez annuler votre réservation selon la politique d\'annulation de l\'hôte. Les politiques varient : Flexible (annulation gratuite 24h avant), Modérée (annulation gratuite 5 jours avant), ou Stricte (remboursement de 50% si annulation 7 jours avant). Consultez les détails lors de la réservation.'
    },
    {
      id: 4,
      category: 'account',
      question: 'Comment créer un compte sur Ikasso ?',
      answer: 'Créer un compte est simple : 1) Cliquez sur "S\'inscrire" en haut de la page. 2) Choisissez si vous voulez voyager ou devenir hôte. 3) Remplissez vos informations (nom, email, téléphone malien). 4) Créez un mot de passe sécurisé. 5) Acceptez nos conditions. Vous pouvez aussi vous inscrire avec Google ou Apple.'
    },
    {
      id: 5,
      category: 'host',
      question: 'Comment devenir hôte sur Ikasso ?',
      answer: 'Pour devenir hôte : 1) Créez un compte en sélectionnant "Devenir hôte". 2) Ajoutez votre propriété avec photos de qualité. 3) Rédigez une description attrayante. 4) Fixez vos tarifs et disponibilités. 5) Définissez vos règles de maison. 6) Attendez la validation (24-48h). 7) Commencez à recevoir des réservations !'
    },
    {
      id: 6,
      category: 'payment',
      question: 'Comment fonctionne Orange Money sur Ikasso ?',
      answer: 'Orange Money est intégré de manière sécurisée : 1) Sélectionnez Orange Money au moment du paiement. 2) Entrez votre numéro Orange Money (+223 XX XX XX XX). 3) Vous recevrez un SMS avec un code de confirmation. 4) Entrez le code pour valider le paiement. 5) Votre réservation est confirmée instantanément.'
    },
    {
      id: 7,
      category: 'safety',
      question: 'Comment Ikasso assure-t-il ma sécurité ?',
      answer: 'Votre sécurité est notre priorité : Vérification d\'identité obligatoire, système d\'avis bidirectionnel, support client 24/7, assurance incluse, paiements sécurisés, photos vérifiées des propriétés, et équipe de modération active. Nous vérifions tous les hôtes et propriétés avant publication.'
    },
    {
      id: 8,
      category: 'booking',
      question: 'Que faire si j\'ai un problème avec mon hébergement ?',
      answer: 'En cas de problème : 1) Contactez d\'abord votre hôte via la messagerie Ikasso. 2) Si pas de réponse, contactez notre support 24/7. 3) Nous médierons entre vous et l\'hôte. 4) Si nécessaire, nous vous aiderons à trouver un hébergement alternatif. 5) Notre garantie client vous protège en cas de problème majeur.'
    },
    {
      id: 9,
      category: 'host',
      question: 'Quelles sont les commissions d\'Ikasso ?',
      answer: 'Nos commissions sont transparentes : 8% pour les particuliers et 10% pour les entreprises/hôtels. Ces frais couvrent le marketing, le support client, les paiements sécurisés, et la plateforme. Vous recevez vos paiements 24h après le check-in de vos invités via Orange Money ou virement bancaire.'
    },
    {
      id: 10,
      category: 'account',
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Pour modifier vos informations : 1) Connectez-vous à votre compte. 2) Allez dans "Paramètres" depuis votre tableau de bord. 3) Cliquez sur "Informations personnelles". 4) Modifiez les champs souhaités. 5) Sauvegardez les changements. Certaines modifications (email, téléphone) nécessitent une vérification.'
    }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/demo-accounts" className="text-primary-600 hover:text-primary-700 font-medium">Démo</Link>
              <Link href="/contact" className="text-gray-600 hover:text-primary-600">Contact</Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-primary-600">Connexion</Link>
              <Link href="/auth/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Inscription</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Centre d'aide Ikasso</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trouvez rapidement des réponses à vos questions ou contactez notre équipe support
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans l'aide..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/contact" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-primary-100 p-3 rounded-lg mr-4">
                <MessageCircle className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Chat en direct</h3>
            </div>
            <p className="text-gray-600">Chattez avec notre équipe support pour une aide immédiate</p>
          </Link>

          <Link href="/contact" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-primary-100 p-3 rounded-lg mr-4">
                <Phone className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Nous appeler</h3>
            </div>
            <p className="text-gray-600">+223 20 22 45 67 - Lun-Ven 8h-18h, Sam 9h-15h</p>
          </Link>

          <Link href="/contact" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-primary-100 p-3 rounded-lg mr-4">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Envoyer un email</h3>
            </div>
            <p className="text-gray-600">support@ikasso.ml - Réponse sous 24h</p>
          </Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Catégories</h2>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {category.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Questions fréquentes
                {selectedCategory !== 'all' && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    - {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
              </h2>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
                  <p className="text-gray-600">Essayez de modifier votre recherche ou contactez notre support.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <h3 className="font-medium text-gray-900 pr-4">{faq.question}</h3>
                        {expandedFaq === faq.id ? (
                          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-4 pb-4">
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Still need help */}
            <div className="mt-8 bg-primary-50 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">
                Vous n'avez pas trouvé votre réponse ?
              </h3>
              <p className="text-primary-700 mb-6">
                Notre équipe support est là pour vous aider 24h/7j
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Contacter le support
                </Link>
                <button
                  onClick={() => alert('Chat en direct ouvert !\n\nBonjour ! Comment puis-je vous aider ?')}
                  className="border border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-600 hover:text-white transition-colors"
                >
                  Chat en direct
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}


