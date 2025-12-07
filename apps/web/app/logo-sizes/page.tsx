'use client'

import React from 'react'

// Composant Logo réutilisable
const IkassoLogo = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="92" fill="#E85D04"/>
    {/* Fond maison */}
    <path d="M256 100 L430 230 L430 400 C430 410 422 420 410 420 L102 420 C90 420 82 410 82 400 L82 230 Z" fill="white" fillOpacity="0.95"/>
    {/* Toit coloré */}
    <path d="M256 100 L430 230 L82 230 Z" fill="#C44D00"/>
    {/* Porte arrondie */}
    <rect x="206" y="290" width="100" height="130" rx="50" fill="#E85D04"/>
    {/* Poignée */}
    <circle cx="280" cy="360" r="8" fill="white"/>
    {/* Fenêtre gauche */}
    <rect x="110" y="270" width="70" height="60" rx="8" fill="#E85D04"/>
    {/* Fenêtre droite */}
    <rect x="332" y="270" width="70" height="60" rx="8" fill="#E85D04"/>
    {/* Croix fenêtre gauche */}
    <line x1="145" y1="270" x2="145" y2="330" stroke="white" strokeWidth="4"/>
    <line x1="110" y1="300" x2="180" y2="300" stroke="white" strokeWidth="4"/>
    {/* Croix fenêtre droite */}
    <line x1="367" y1="270" x2="367" y2="330" stroke="white" strokeWidth="4"/>
    <line x1="332" y1="300" x2="402" y2="300" stroke="white" strokeWidth="4"/>
  </svg>
)

export default function LogoSizesPage() {
  const sizes = [
    { size: 512, label: '512x512 (Google Play)' },
    { size: 1024, label: '1024x1024 (Apple App Store)' },
    { size: 192, label: '192x192 (PWA)' },
    { size: 180, label: '180x180 (Apple Touch Icon)' },
    { size: 128, label: '128x128' },
    { size: 96, label: '96x96' },
    { size: 72, label: '72x72' },
    { size: 48, label: '48x48' },
    { size: 32, label: '32x32 (Favicon)' },
    { size: 16, label: '16x16 (Favicon)' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4" style={{ color: '#E85D04' }}>
          Logo Ikasso - Toutes les tailles
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Faites un clic droit sur chaque logo → "Enregistrer l'image sous..." pour télécharger en PNG
        </p>

        <div className="space-y-8">
          {sizes.map(({ size, label }) => (
            <div key={size} className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">{label}</h2>
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <IkassoLogo size={size} />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                Dimensions : {size} × {size} pixels
              </p>
            </div>
          ))}
        </div>

        {/* Section avec fond transparent */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#E85D04' }}>
            Version fond transparent (512x512)
          </h2>
          <div className="flex justify-center p-8" style={{ 
            backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            borderRadius: '12px'
          }}>
            <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Version sans fond */}
              <path d="M256 80 L450 220 L450 410 C450 430 434 450 410 450 L102 450 C78 450 62 430 62 410 L62 220 Z" fill="white" stroke="#E85D04" strokeWidth="8"/>
              <path d="M256 80 L450 220 L62 220 Z" fill="#E85D04"/>
              <rect x="206" y="290" width="100" height="160" rx="50" fill="#E85D04"/>
              <circle cx="280" cy="370" r="10" fill="white"/>
              <rect x="100" y="260" width="80" height="70" rx="8" fill="#E85D04"/>
              <rect x="332" y="260" width="80" height="70" rx="8" fill="#E85D04"/>
              <line x1="140" y1="260" x2="140" y2="330" stroke="white" strokeWidth="4"/>
              <line x1="100" y1="295" x2="180" y2="295" stroke="white" strokeWidth="4"/>
              <line x1="372" y1="260" x2="372" y2="330" stroke="white" strokeWidth="4"/>
              <line x1="332" y1="295" x2="412" y2="295" stroke="white" strokeWidth="4"/>
            </svg>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
          <h3 className="font-bold text-lg mb-3" style={{ color: '#E85D04' }}>📱 Instructions pour les stores :</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ <strong>Google Play Store :</strong> Utilisez le logo 512x512</li>
            <li>✅ <strong>Apple App Store :</strong> Utilisez le logo 1024x1024</li>
            <li>✅ <strong>PWA :</strong> Utilisez les logos 192x192 et 512x512</li>
            <li>✅ <strong>Favicon :</strong> Utilisez les logos 32x32 et 16x16</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

