'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface LogoUniversalProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'horizontal'
  mobileCompact?: boolean
  priority?: boolean
}

export default function LogoUniversal({ 
  className = '', 
  showText = true, 
  size = 'md', 
  variant = 'default',
  mobileCompact = false,
  priority = false
}: LogoUniversalProps) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null)

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
            unoptimized={logoSrc.endsWith('.svg')}
          />
        ) : (
          // Fallback si aucun logo n'est trouvé - Vos couleurs Ikasso
          <div className={`w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center ${variant === 'white' ? 'bg-white border-2 border-gray-300' : ''}`}>
            <span className={`font-bold text-xs ${variant === 'white' ? 'text-orange-600' : 'text-white'}`}>
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
