'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Shield, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function VerificationBanner() {
  const { user, isLoading } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  if (isLoading || !user || dismissed) return null
  if ((user as any).identityVerified || (user as any).identity_verified) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Shield className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900">
            Completez votre profil pour utiliser Ikasso
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Verifiez votre identite pour pouvoir reserver ou proposer des logements
          </p>
          <Link
            href="/verify-identity"
            className="inline-flex items-center gap-1.5 mt-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            Verifier mon identite
          </Link>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-amber-100 text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
