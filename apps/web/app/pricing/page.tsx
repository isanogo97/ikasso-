"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Calculator, Building, User, Check, ArrowRight } from "lucide-react"

export default function PricingPage() {
  const [propertyPrice, setPropertyPrice] = useState(25000)
  const [hostType, setHostType] = useState<"particulier" | "entreprise">("particulier")
  const [nights, setNights] = useState(3)

  const commissionRate = hostType === "entreprise" ? 0.1 : 0.08
  const totalRevenue = propertyPrice * nights
  const commission = totalRevenue * commissionRate
  const hostEarnings = totalRevenue - commission

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(price)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">Ikasso</Link>
              <span className="ml-2 text-sm text-gray-500">Chez Toi</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary-600">Accueil</Link>
              <Link href="/search" className="text-gray-700 hover:text-primary-600">Hébergements</Link>
              <Link href="/host" className="text-gray-700 hover:text-primary-600">Devenir Hôte</Link>
              <Link href="/pricing" className="text-primary-600 font-medium">Tarifs</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tarifs et Commissions Ikasso</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Découvrez nos tarifs transparents et calculez vos gains en tant qu'hôte sur Ikasso</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Structure des commissions</h2>

            <div className="space-y-6">
              <div className="border rounded-lg p-6 bg-blue-50 border-blue-200">
                <div className="flex items-center mb-4">
                  <User className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Particuliers</h3>
                    <p className="text-blue-700">Propriétaires individuels</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">8%</div>
                <p className="text-blue-800">Commission sur chaque réservation</p>
                <ul className="mt-4 space-y-2 text-sm text-blue-700">
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2" />Maisons individuelles</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2" />Appartements privés</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2" />Chambres chez l'habitant</li>
                </ul>
              </div>

              <div className="border rounded-lg p-6 bg-orange-50 border-orange-200">
                <div className="flex items-center mb-4">
                  <Building className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-orange-900">Entreprises</h3>
                    <p className="text-orange-700">Établissements commerciaux</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">10%</div>
                <p className="text-orange-800">Commission sur chaque réservation</p>
                <ul className="mt-4 space-y-2 text-sm text-orange-700">
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2" />Hôtels</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2" />Auberges</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2" />Résidences hôtelières</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Ce qui est inclus :</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Plateforme de réservation sécurisée</li>
                <li>• Support client 24h/7j</li>
                <li>• Outils de gestion des réservations</li>
                <li>• Marketing et promotion</li>
                <li>• Système de paiement intégré</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6"><Calculator className="h-6 w-6 text-primary-600 mr-2" /><h2 className="text-2xl font-bold text-gray-900">Calculateur de gains</h2></div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'hôte</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setHostType("particulier")} className={`p-3 border rounded-lg text-center transition-all ${hostType === "particulier" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}>
                    <User className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Particulier</div>
                    <div className="text-xs text-gray-500">8% commission</div>
                  </button>
                  <button onClick={() => setHostType("entreprise")} className={`p-3 border rounded-lg text-center transition-all ${hostType === "entreprise" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 hover:border-gray-300"}`}>
                    <Building className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Entreprise</div>
                    <div className="text-xs text-gray-500">10% commission</div>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix par nuit (FCFA)</label>
                <input type="number" className="input-field" value={propertyPrice} onChange={(e) => setPropertyPrice(Number(e.target.value))} min="1000" step="1000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de nuits</label>
                <input type="number" className="input-field" value={nights} onChange={(e) => setNights(Number(e.target.value))} min="1" max="30" />
              </div>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Calcul des gains :</h3>
                <div className="flex justify-between items-center"><span className="text-gray-600">Revenus bruts :</span><span className="font-medium">{formatPrice(totalRevenue)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Commission Ikasso ({(commissionRate * 100).toFixed(0)}%) :</span><span className="font-medium text-red-600">-{formatPrice(commission)}</span></div>
                <div className="border-t pt-4"><div className="flex justify-between items-center"><span className="text-lg font-semibold text-gray-900">Vos gains nets :</span><span className="text-2xl font-bold text-green-600">{formatPrice(hostEarnings)}</span></div></div>
                <div className="text-sm text-gray-500 mt-4">* Les gains sont calculés avant taxes. Les hôtes sont responsables de leurs obligations fiscales.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Questions fréquentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quand la commission est-elle prélevée ?</h3>
              <p className="text-gray-600 text-sm">La commission est automatiquement déduite lors du paiement de chaque réservation confirmée.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Comment déterminer si je suis particulier ou entreprise ?</h3>
              <p className="text-gray-600 text-sm">Si vous possédez un établissement commercial (hôtel, auberge) ou une entreprise enregistrée, vous êtes considéré comme entreprise.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Y a-t-il d'autres frais ?</h3>
              <p className="text-gray-600 text-sm">Non, la commission Ikasso est le seul frais prélevé. Aucun frais d'inscription ni frais cachés.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quand suis-je payé ?</h3>
              <p className="text-gray-600 text-sm">Les paiements sont effectués 24h après l'arrivée confirmée du voyageur, directement sur votre compte.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-xl mb-6">Rejoignez des centaines d'hôtes qui font confiance à Ikasso</p>
            <Link href="/host" className="inline-flex items-center bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
              Devenir Hôte
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}