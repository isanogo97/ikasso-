import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logSecurityEvent } from './security-log'

/**
 * Verify that the request comes from an authenticated Supabase user.
 * Returns the user object or null.
 */
export async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') || req.cookies.get('sb-access-token')?.value

  // Also check for Supabase auth cookie pattern
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return null

  // Try to get token from cookies (Supabase stores as sb-<ref>-auth-token)
  let accessToken = token
  if (!accessToken) {
    for (const [name, cookie] of req.cookies.getAll().map(c => [c.name, c.value] as const)) {
      if (name.includes('auth-token')) {
        try {
          const parsed = JSON.parse(cookie)
          accessToken = parsed.access_token || parsed[0]?.access_token
          break
        } catch {
          // might be the token directly
          if (cookie.startsWith('ey')) {
            accessToken = cookie
            break
          }
        }
      }
    }
  }

  if (!accessToken) return null

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return user
  } catch {
    return null
  }
}

/**
 * Verify that the request comes from an admin user.
 * Returns { user, isAdmin } or sends 401/403 response.
 */
export async function requireAdmin(req: NextRequest): Promise<{ user: any; error?: NextResponse }> {
  const user = await getAuthenticatedUser(req)

  if (!user) {
    logSecurityEvent({
      action: 'unauthorized_access',
      ip: req.headers.get('x-forwarded-for') || undefined,
      path: req.nextUrl.pathname,
      details: 'unauthenticated request to admin endpoint',
    })
    return { user: null, error: NextResponse.json({ error: 'Non authentifie' }, { status: 401 }) }
  }

  // Check admin_users table
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('id, role, is_activated')
    .eq('user_id', user.id)
    .eq('is_activated', true)
    .single()

  if (!adminRecord) {
    logSecurityEvent({
      action: 'unauthorized_access',
      userId: user.id,
      ip: req.headers.get('x-forwarded-for') || undefined,
      path: req.nextUrl.pathname,
      details: 'non-admin attempted admin access',
    })
    return { user, error: NextResponse.json({ error: 'Acces refuse' }, { status: 403 }) }
  }

  return { user: { ...user, adminRole: adminRecord.role } }
}

/**
 * Verify that the request comes from an authenticated user (not necessarily admin).
 */
export async function requireAuth(req: NextRequest): Promise<{ user: any; error?: NextResponse }> {
  const user = await getAuthenticatedUser(req)

  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Non authentifie' }, { status: 401 }) }
  }

  return { user }
}

/**
 * HTML escape utility to prevent XSS in email templates
 */
export function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Simple in-memory rate limiter
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    logSecurityEvent({
      action: 'rate_limited',
      ip: key,
      details: `rate limit exceeded: ${record.count}/${maxRequests} in ${windowMs}ms`,
    })
    return false
  }

  record.count++
  return true
}
