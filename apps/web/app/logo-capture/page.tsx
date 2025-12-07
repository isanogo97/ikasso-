'use client'

import React from 'react'

export default function LogoCapturePage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E85D04' }}>
      {/* Logo 512x512 - Centré pour capture facile */}
      <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </div>
  )
}

