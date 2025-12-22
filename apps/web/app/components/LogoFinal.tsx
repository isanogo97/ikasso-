'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface LogoFinalProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'horizontal'
  mobileCompact?: boolean
  priority?: boolean // Pour le chargement prioritaire
}

export default function LogoFinal({ 
  className = '', 
  showText = true, 
  size = 'md', 
  variant = 'default',
  mobileCompact = false,
  priority = false
}: LogoFinalProps) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null)
  const [fallbackToSVG, setFallbackToSVG] = useState(false)

  // Tailles en pixels pour chaque variante
  const sizeMap = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
    xl: { width: 48, height: 48 }
  }

  const currentSize = sizeMap[size]

  // Déterminer le chemin du logo selon la variante
  const getLogoPath = () => {
    const basePath = '/images/logos/'
    
    switch (variant) {
      case 'white':
        return {
          svg: `${basePath}ikasso-logo.svg`,
          png: `${basePath}ikasso-logo.png`
        }
      case 'horizontal':
        return {
          svg: `${basePath}ikasso-logo-main.svg`,
          png: `${basePath}ikasso-logo-400.png`
        }
      default:
        return {
          svg: `${basePath}ikasso-logo.svg`,
          png: `${basePath}ikasso-logo.png`
        }
    }
  }

  // Vérifier si le fichier existe et choisir le bon format
  useEffect(() => {
    const paths = getLogoPath()
    
    // Essayer SVG en premier (recommandé)
    const checkSVG = new window.Image()
    checkSVG.onload = () => setLogoSrc(paths.svg)
    checkSVG.onerror = () => {
      // Si SVG échoue, essayer PNG
      const checkPNG = new window.Image()
      checkPNG.onload = () => {
        setLogoSrc(paths.png)
        setFallbackToSVG(true)
      }
      checkPNG.onerror = () => {
        // Si aucun logo n'est trouvé, garder null pour afficher le fallback
        setLogoSrc(null)
      }
      checkPNG.src = paths.png
    }
    checkSVG.src = paths.svg
  }, [variant])

  // Classes CSS pour les tailles
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  // Couleurs selon la variante
  const textColorClass = variant === 'white' ? 'text-white' : 'text-primary-600'
  const subtextColorClass = variant === 'white' ? 'text-gray-200' : 'text-gray-600'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo */}
      <div className={`${sizeClasses[size]} flex-shrink-0 relative`}>
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt="Ikasso Logo"
            width={currentSize.width}
            height={currentSize.height}
            className="w-full h-full object-contain"
            priority={priority}
            unoptimized={logoSrc.endsWith('.svg')} // SVG non optimisé par Next.js
          />
        ) : (
          // Fallback si aucun logo n'est trouvé
          <div className={`w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center ${variant === 'white' ? 'bg-white border-2 border-gray-300' : ''}`}>
            <span className={`font-bold text-xs ${variant === 'white' ? 'text-primary-600' : 'text-white'}`}>
              IKASSO
            </span>
          </div>
        )}
      </div>
      
      {/* Texte (seulement si pas de logo horizontal et showText = true) */}
      {showText && variant !== 'horizontal' && (
        <div className={`flex flex-col ${mobileCompact ? 'hidden sm:flex' : ''}`}>
          <span className={`font-bold ${textColorClass} ${textSizeClasses[size]} leading-none tracking-wide`}>
            IKASSO
          </span>
          <span className={`text-[10px] sm:text-xs ${subtextColorClass} font-medium leading-tight uppercase tracking-widest hidden sm:block`}>
            Chez Toi
          </span>
        </div>
      )}
      
      {/* Version mobile compacte */}
      {showText && mobileCompact && variant !== 'horizontal' && (
        <span className={`sm:hidden font-bold ${textColorClass} ${textSizeClasses[size]} leading-none tracking-wide`}>
          IKASSO
        </span>
      )}
    </div>
  )
}

// Composant spécialisé pour les favicons
export function Favicon({ size = 32 }: { size?: 16 | 32 | 48 }) {
  return (
    <link
      rel="icon"
      type="image/png"
      sizes={`${size}x${size}`}
      href={`/images/logos/ikasso-logo-${size}.png`}
    />
  )
}

// Composant pour Apple Touch Icon
export function AppleTouchIcon() {
  return (
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="/images/logos/apple-touch-icon.png"
    />
  )
}

// Composant pour les icônes PWA
export function PWAIcons() {
  return (
    <>
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/images/logos/android-chrome-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="512x512"
        href="/images/logos/android-chrome-512x512.png"
      />
    </>
  )
}
