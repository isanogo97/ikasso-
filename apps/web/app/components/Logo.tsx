import React from 'react'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo SVG basé sur votre image */}
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Maison principale */}
          <path
            d="M20 75 L20 45 L35 30 L50 45 L65 30 L80 45 L80 75 L20 75 Z"
            stroke="#d35400"
            strokeWidth="2.5"
            fill="none"
          />
          
          {/* Toit principal */}
          <path
            d="M15 45 L35 25 L50 40 L65 25 L85 45"
            stroke="#d35400"
            strokeWidth="2.5"
            fill="none"
          />
          
          {/* Petite extension */}
          <path
            d="M50 45 L50 35 L60 25 L70 35 L70 45"
            stroke="#d35400"
            strokeWidth="2.5"
            fill="none"
          />
          
          {/* Porte */}
          <rect
            x="40"
            y="55"
            width="20"
            height="20"
            stroke="#d35400"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Fenêtres */}
          <rect
            x="25"
            y="50"
            width="10"
            height="8"
            stroke="#d35400"
            strokeWidth="1.5"
            fill="none"
          />
          <rect
            x="65"
            y="50"
            width="10"
            height="8"
            stroke="#d35400"
            strokeWidth="1.5"
            fill="none"
          />
          
          {/* Fenêtre dans la porte */}
          <rect
            x="45"
            y="60"
            width="10"
            height="6"
            stroke="#d35400"
            strokeWidth="1"
            fill="none"
          />
          
          {/* Lignes de division dans la fenêtre de la porte */}
          <line
            x1="47"
            y1="60"
            x2="47"
            y2="66"
            stroke="#d35400"
            strokeWidth="1"
          />
          <line
            x1="53"
            y1="60"
            x2="53"
            y2="66"
            stroke="#d35400"
            strokeWidth="1"
          />
          
          {/* Cercles décoratifs */}
          <circle
            cx="75"
            cy="20"
            r="4"
            stroke="#d35400"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="25"
            cy="35"
            r="3"
            stroke="#d35400"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-primary-500 ${textSizeClasses[size]} leading-tight`}>
            IKASSO
          </span>
          <span className="text-xs text-secondary-700 font-medium leading-tight">
            ENTREZ, VOUS ÊTES CHEZ VOUS
          </span>
        </div>
      )}
    </div>
  )
}
