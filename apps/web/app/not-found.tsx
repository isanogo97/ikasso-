import React from 'react'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page introuvable</h1>
        <p className="text-gray-600 mb-6">La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <a href="/" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">
          Retour à l'accueil
        </a>
      </div>
    </main>
  )
}

