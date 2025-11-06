'use client'

import React from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body>
        <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Une erreur est survenue</h1>
            <p className="text-gray-600 mb-6">Désolé, quelque chose s'est mal passé. Vous pouvez réessayer.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => reset()}
                className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
              >
                Réessayer
              </button>
              <a href="/" className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                Retour à l'accueil
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}

