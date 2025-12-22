import React from 'react'

interface LogoProProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  mobileCompact?: boolean
  variant?: 'default' | 'white' | 'dark'
}

export default function LogoPro({ 
  className = '', 
  showText = true, 
  size = 'md', 
  mobileCompact = false,
  variant = 'default'
}: LogoProProps) {
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
  const colors = {
    default: {
      primary: '#E85D04',
      secondary: '#F48C06',
      text: 'text-primary-600',
      subtext: 'text-gray-600'
    },
    white: {
      primary: '#FFFFFF',
      secondary: '#F3F4F6',
      text: 'text-white',
      subtext: 'text-gray-200'
    },
    dark: {
      primary: '#1F2937',
      secondary: '#374151',
      text: 'text-gray-900',
      subtext: 'text-gray-600'
    }
  }

  const currentColors = colors[variant]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Version professionnelle */}
      <div className={`${sizeClasses[size]} flex-shrink-0 relative`}>
        {/* Option 1: SVG professionnel */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fond circulaire */}
          <circle 
            cx="60" 
            cy="60" 
            r="55" 
            fill={currentColors.primary}
            stroke={currentColors.secondary}
            strokeWidth="2"
          />
          
          {/* Maison stylisée au centre */}
          <g transform="translate(60, 60)">
            {/* Toit principal */}
            <path
              d="M-25 -5 L0 -30 L25 -5 L20 -5 L20 20 L-20 20 L-20 -5 Z"
              fill="white"
              stroke={currentColors.secondary}
              strokeWidth="1.5"
            />
            
            {/* Porte */}
            <rect
              x="-8"
              y="5"
              width="16"
              height="15"
              fill={currentColors.primary}
              stroke="white"
              strokeWidth="1"
            />
            
            {/* Fenêtres */}
            <rect x="-18" y="0" width="6" height="6" fill="white" rx="1" />
            <rect x="12" y="0" width="6" height="6" fill="white" rx="1" />
            
            {/* Détails décoratifs */}
            <circle cx="0" cy="-25" r="3" fill="white" />
            <path d="M-3 15 L3 15" stroke="white" strokeWidth="1.5" />
          </g>
        </svg>
        
        {/* Option 2: Placeholder pour logo image professionnel */}
        {/* Décommentez cette section quand vous aurez le logo professionnel
        <img 
          src="/images/logo-pro.png" 
          alt="Ikasso Logo"
          className="w-full h-full object-contain"
        />
        */}
      </div>
      
      {/* Texte du logo */}
      {showText && (
        <div className={`flex flex-col ${mobileCompact ? 'hidden sm:flex' : ''}`}>
          <span className={`font-bold ${currentColors.text} ${textSizeClasses[size]} leading-none tracking-wide`}>
            IKASSO
          </span>
          <span className={`text-[10px] sm:text-xs ${currentColors.subtext} font-medium leading-tight uppercase tracking-widest hidden sm:block`}>
            Chez Toi
          </span>
        </div>
      )}
      
      {/* Version mobile compacte */}
      {showText && mobileCompact && (
        <span className={`sm:hidden font-bold ${currentColors.text} ${textSizeClasses[size]} leading-none tracking-wide`}>
          IKASSO
        </span>
      )}
    </div>
  )
}

// Composant pour le logo en mode image (quand vous aurez le logo professionnel)
export function LogoImage({ 
  className = '', 
  size = 'md',
  alt = 'Ikasso Logo'
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  alt?: string
}) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12'
  }

  return (
    <div className={`${className}`}>
      {/* Placeholder - remplacez par votre logo professionnel */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xs`}>
        LOGO
      </div>
      
      {/* Version finale avec image
      <img 
        src="/images/logo-professional.png"
        alt={alt}
        className={`${sizeClasses[size]} object-contain`}
      />
      */}
    </div>
  )
}
