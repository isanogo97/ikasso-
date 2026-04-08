'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement annule</h1>
        <p className="text-gray-600 mb-6">
          Votre paiement a ete annule. Aucun montant n'a ete debite.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold transition-all"
          >
            Retour a l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
