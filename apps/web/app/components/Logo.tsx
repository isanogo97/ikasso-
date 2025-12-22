'use client'

import React from 'react'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  mobileCompact?: boolean
}

export default function Logo({ className = '', showText = false, size = 'md', mobileCompact = false }: LogoProps) {
  
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo professionnel Ikasso uniquement */}
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <img
          src="/images/logos/ikasso-logo.svg"
          alt="Ikasso Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback vers PNG si SVG échoue
            const target = e.target as HTMLImageElement
            if (target.src.includes('.svg')) {
              target.src = '/images/logos/ikasso-logo.png'
            } else {
              // Fallback vers SVG par défaut si tout échoue
              target.outerHTML = `
                <svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 75 L20 45 L35 30 L50 45 L65 30 L80 45 L80 75 L20 75 Z" stroke="#E85D04" stroke-width="3" fill="none"/>
                  <path d="M15 45 L35 25 L50 40 L65 25 L85 45" stroke="#E85D04" stroke-width="3" fill="none"/>
                  <path d="M50 45 L50 35 L60 25 L70 35 L70 45" stroke="#E85D04" stroke-width="3" fill="none"/>
                  <rect x="40" y="55" width="20" height="20" stroke="#E85D04" stroke-width="2.5" fill="none"/>
                  <rect x="25" y="50" width="10" height="8" stroke="#E85D04" stroke-width="2" fill="none"/>
                  <rect x="65" y="50" width="10" height="8" stroke="#E85D04" stroke-width="2" fill="none"/>
                  <rect x="45" y="60" width="10" height="6" stroke="#E85D04" stroke-width="1.5" fill="none"/>
                  <line x1="47" y1="60" x2="47" y2="66" stroke="#E85D04" stroke-width="1.5"/>
                  <line x1="53" y1="60" x2="53" y2="66" stroke="#E85D04" stroke-width="1.5"/>
                  <circle cx="75" cy="20" r="4" stroke="#E85D04" stroke-width="2.5" fill="none"/>
                  <circle cx="25" cy="35" r="3" stroke="#E85D04" stroke-width="2" fill="none"/>
                </svg>
              `
            }
          }}
        />
      </div>
      
    </div>
  )
}
