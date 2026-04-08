'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🌐</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Vous etes hors ligne</h1>
        <p className="text-gray-600 mb-6">
          Verifiez votre connexion internet et reessayez.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-500 hover:bg-primary-600 text-white py-3 px-8 rounded-xl font-semibold transition-all"
        >
          Reessayer
        </button>
      </div>
    </div>
  )
}
