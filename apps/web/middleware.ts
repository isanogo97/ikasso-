import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware simplifie - l'auth est geree cote client via AuthContext
// Le middleware ne bloque plus les routes - il laisse passer toutes les requetes
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|icons|manifest.json|sw.js|api).*)',
  ],
}
