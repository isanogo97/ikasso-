import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = parseInt(searchParams.get('size') || '512')
  
  // Génère un SVG simple comme icône temporaire
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#E85D04"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial Black, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white">
        IK
      </text>
    </svg>
  `
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  })
}

