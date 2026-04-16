import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/auth', '/api', '/search', '/property', '/help', '/contact', '/terms', '/privacy', '/pricing', '/host', '/experiences', '/offline', '/admin']
const PUBLIC_FILES = ['/_next', '/images', '/sw.js', '/manifest.json', '/robots.txt', '/sitemap.xml', '/favicon']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public files
  if (PUBLIC_FILES.some(f => pathname.startsWith(f))) return NextResponse.next()

  // Allow public routes
  if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) return NextResponse.next()

  // Check for Supabase auth cookie
  const hasAuthCookie = req.cookies.getAll().some(c => c.name.includes('auth-token'))

  if (!hasAuthCookie) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
