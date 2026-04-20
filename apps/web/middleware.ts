import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes accessible without authentication
const PUBLIC_ROUTES = ['/', '/auth', '/api', '/search', '/property', '/help', '/contact', '/terms', '/privacy', '/pricing', '/host', '/experiences', '/offline']
const PUBLIC_FILES = ['/_next', '/images', '/sw.js', '/manifest.json', '/robots.txt', '/sitemap.xml', '/favicon']

// Routes that require authentication (redirect to login if no cookie)
const PROTECTED_ROUTES = ['/dashboard', '/messages', '/settings', '/verify-identity', '/booking']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public files
  if (PUBLIC_FILES.some(f => pathname.startsWith(f))) return NextResponse.next()

  // Allow public routes
  if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) return NextResponse.next()

  // Block debug pages in production
  if (pathname.startsWith('/debug-')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Block demo-accounts page
  if (pathname.startsWith('/demo-accounts')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Check for auth on protected routes
  const hasAuthCookie = req.cookies.getAll().some(c => c.name.includes('auth-token'))

  // Admin route: allow access (admin has its own login page)
  if (pathname.startsWith('/admin')) return NextResponse.next()

  // Protected routes: require auth cookie
  if (PROTECTED_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/')) && !hasAuthCookie) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
