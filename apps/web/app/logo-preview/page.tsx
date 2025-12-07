'use client'

import React, { useState } from 'react'

export default function LogoPreviewPage() {
  const [selectedLogo, setSelectedLogo] = useState(1)

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Choisissez votre logo Ikasso
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Cliquez sur un logo pour le voir en grand, puis faites une capture d'écran
        </p>

        {/* Grille de logos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => setSelectedLogo(num)}
              className={`aspect-square bg-white rounded-2xl shadow-lg p-4 transition-all hover:scale-105 ${
                selectedLogo === num ? 'ring-4 ring-primary-500' : ''
              }`}
            >
              <LogoVariant variant={num} size={200} />
            </button>
          ))}
        </div>

        {/* Logo sélectionné en grand (pour capture) */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 mb-4">
            👇 Logo sélectionné - Faites une capture d'écran de ce carré
          </p>
        </div>
        
        {/* Zone de capture 512x512 */}
        <div className="flex justify-center">
          <div 
            id="logo-capture"
            className="w-[512px] h-[512px] flex items-center justify-center"
            style={{ 
              width: '512px', 
              height: '512px',
              maxWidth: '100vw',
              maxHeight: '100vw'
            }}
          >
            <LogoVariant variant={selectedLogo} size={512} />
          </div>
        </div>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Astuce : Sur iPhone, appuyez sur Bouton latéral + Volume haut pour capturer
        </p>
      </div>
    </div>
  )
}

function LogoVariant({ variant, size }: { variant: number; size: number }) {
  const s = size
  const r = s * 0.18 // border radius

  switch (variant) {
    case 1:
      // Logo moderne minimaliste - Maison géométrique
      return (
        <svg width={s} height={s} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="512" height="512" rx={r} fill="#E85D04"/>
          {/* Maison moderne */}
          <path d="M256 100 L420 220 L420 400 L92 400 L92 220 Z" fill="none" stroke="white" strokeWidth="16" strokeLinejoin="round"/>
          {/* Toit accent */}
          <path d="M256 100 L420 220 L92 220 Z" fill="white" fillOpacity="0.2"/>
          {/* Porte */}
          <rect x="206" y="280" width="100" height="120" rx="8" fill="white"/>
          {/* Fenêtres */}
          <rect x="120" y="250" width="60" height="50" rx="6" fill="white" fillOpacity="0.9"/>
          <rect x="332" y="250" width="60" height="50" rx="6" fill="white" fillOpacity="0.9"/>
          {/* Cheminée */}
          <rect x="340" y="130" width="30" height="60" rx="4" fill="white"/>
        </svg>
      )

    case 2:
      // Logo gradient moderne - Lettre I stylisée comme maison
      return (
        <svg width={s} height={s} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B35"/>
              <stop offset="100%" stopColor="#E85D04"/>
            </linearGradient>
          </defs>
          <rect width="512" height="512" rx={r} fill="url(#grad2)"/>
          {/* I comme maison */}
          <path d="M180 420 L180 200 L256 120 L332 200 L332 420" fill="none" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Toit */}
          <path d="M140 200 L256 100 L372 200" fill="none" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Base */}
          <line x1="140" y1="420" x2="372" y2="420" stroke="white" strokeWidth="24" strokeLinecap="round"/>
          {/* Fenêtre ronde */}
          <circle cx="256" cy="280" r="35" fill="none" stroke="white" strokeWidth="12"/>
        </svg>
      )

    case 3:
      // Logo épuré - Icône maison dans cercle
      return (
        <svg width={s} height={s} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="512" height="512" rx={r} fill="#E85D04"/>
          {/* Cercle */}
          <circle cx="256" cy="256" r="180" fill="none" stroke="white" strokeWidth="12"/>
          {/* Maison simplifiée */}
          <path d="M160 270 L256 170 L352 270 L352 350 L160 350 Z" fill="none" stroke="white" strokeWidth="14" strokeLinejoin="round"/>
          {/* Porte */}
          <rect x="226" y="290" width="60" height="60" rx="4" fill="white"/>
        </svg>
      )

    case 4:
      // Logo bold - IK avec toit
      return (
        <svg width={s} height={s} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad4" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF7043"/>
              <stop offset="100%" stopColor="#E85D04"/>
            </linearGradient>
          </defs>
          <rect width="512" height="512" rx={r} fill="url(#grad4)"/>
          {/* Toit au-dessus */}
          <path d="M100 180 L256 80 L412 180" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
          {/* I */}
          <rect x="130" y="220" width="50" height="200" rx="8" fill="white"/>
          {/* K */}
          <rect x="220" y="220" width="50" height="200" rx="8" fill="white"/>
          <path d="M270 320 L370 220" stroke="white" strokeWidth="50" strokeLinecap="round"/>
          <path d="M290 320 L390 420" stroke="white" strokeWidth="50" strokeLinecap="round"/>
        </svg>
      )

    case 5:
      // Logo premium - Maison avec détails dorés
      return (
        <svg width={s} height={s} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E85D04"/>
              <stop offset="50%" stopColor="#FF6B35"/>
              <stop offset="100%" stopColor="#E85D04"/>
            </linearGradient>
          </defs>
          <rect width="512" height="512" rx={r} fill="url(#grad5)"/>
          {/* Maison élégante */}
          <path d="M256 80 L440 200 L440 420 L72 420 L72 200 Z" fill="none" stroke="white" strokeWidth="10"/>
          {/* Toit double */}
          <path d="M256 80 L440 200 L72 200 Z" fill="white" fillOpacity="0.15"/>
          {/* Colonnes */}
          <rect x="140" y="280" width="20" height="140" rx="4" fill="white"/>
          <rect x="352" y="280" width="20" height="140" rx="4" fill="white"/>
          {/* Grande porte */}
          <path d="M206 420 L206 260 L256 220 L306 260 L306 420" fill="none" stroke="white" strokeWidth="10"/>
          {/* Fenêtre porte */}
          <circle cx="256" cy="300" r="25" fill="white" fillOpacity="0.9"/>
          {/* Étoile décorative */}
          <polygon points="256,100 262,115 278,115 265,125 270,140 256,130 242,140 247,125 234,115 250,115" fill="white"/>
        </svg>
      )

    case 6:
      // Logo flat design - Simple et moderne
      return (
        <svg width={s} height={s} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="512" height="512" rx={r} fill="#E85D04"/>
          {/* Fond maison */}
          <path d="M256 100 L430 230 L430 400 C430 410 422 420 410 420 L102 420 C90 420 82 410 82 400 L82 230 Z" fill="white" fillOpacity="0.95"/>
          {/* Toit coloré */}
          <path d="M256 100 L430 230 L82 230 Z" fill="#C44D00"/>
          {/* Porte */}
          <rect x="206" y="290" width="100" height="130" rx="50 50 0 0" fill="#E85D04"/>
          {/* Poignée */}
          <circle cx="280" cy="360" r="8" fill="white"/>
          {/* Fenêtres */}
          <rect x="110" y="270" width="70" height="60" rx="8" fill="#E85D04"/>
          <rect x="332" y="270" width="70" height="60" rx="8" fill="#E85D04"/>
          {/* Croix fenêtres */}
          <line x1="145" y1="270" x2="145" y2="330" stroke="white" strokeWidth="4"/>
          <line x1="110" y1="300" x2="180" y2="300" stroke="white" strokeWidth="4"/>
          <line x1="367" y1="270" x2="367" y2="330" stroke="white" strokeWidth="4"/>
          <line x1="332" y1="300" x2="402" y2="300" stroke="white" strokeWidth="4"/>
        </svg>
      )

    default:
      return null
  }
}

