'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HostRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirection automatique vers la page d'ajout de propriété
    router.replace('/host/add-property')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  )
}
