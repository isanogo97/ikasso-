'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement confirme !</h1>
        <p className="text-gray-600 mb-6">
          Votre reservation a ete confirmee. Vous recevrez un email de confirmation sous peu.
        </p>
        {sessionId && (
          <p className="text-xs text-gray-400 mb-6">Ref: {sessionId.slice(0, 20)}...</p>
        )}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold transition-all"
          >
            Voir mes reservations
          </Link>
          <Link
            href="/"
            className="block w-full text-gray-600 hover:text-gray-900 py-2 text-sm"
          >
            Retour a l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
