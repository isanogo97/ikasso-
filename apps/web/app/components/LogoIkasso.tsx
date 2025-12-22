import React from 'react'
import Image from 'next/image'

interface LogoIkassoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  mobileCompact?: boolean
  variant?: 'default' | 'white' | 'dark' | 'icon-only'
  priority?: boolean
}

export default function LogoIkasso({ 
  className = '', 
  showText = true, 
  size = 'md', 
  mobileCompact = false,
  variant = 'default',
  priority = false
}: LogoIkassoProps) {
  
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

  // Choisir le logo selon la variante
  const getLogoSrc = () => {
    if (variant === 'icon-only') {
      return '/images/logos/ikasso-icon.png'
    }
    return '/images/logos/ikasso-logo.svg' // SVG principal
  }

  const logoSrc = getLogoSrc()

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo */}
      <div className={`${sizeClasses[size]} flex-shrink-0 relative`}>
        <Image
          src={logoSrc}
          alt="Ikasso Logo"
          width={size === 'xl' ? 48 : size === 'lg' ? 40 : size === 'md' ? 32 : 24}
          height={size === 'xl' ? 48 : size === 'lg' ? 40 : size === 'md' ? 32 : 24}
          className="w-full h-full object-contain"
          priority={priority}
          unoptimized={logoSrc.endsWith('.svg')}
          onError={(e) => {
            // Fallback vers PNG si SVG échoue
            const target = e.target as HTMLImageElement
            if (target.src.includes('.svg')) {
              target.src = '/images/logos/ikasso-logo.png'
            }
          }}
        />
      </div>
      
      {/* Texte du logo */}
      {showText && variant !== 'icon-only' && (
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
      {showText && mobileCompact && variant !== 'icon-only' && (
        <span className={`sm:hidden font-bold ${textColorClass} ${textSizeClasses[size]} leading-none tracking-wide`}>
          IKASSO
        </span>
      )}
    </div>
  )
}
