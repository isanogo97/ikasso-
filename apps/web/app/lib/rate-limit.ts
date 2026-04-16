import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Use in-memory fallback if Upstash is not configured
const isUpstashConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

let ratelimit: Ratelimit | null = null

if (isUpstashConfigured) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requests per minute default
    analytics: true,
  })
}

// In-memory fallback for when Upstash is not configured
const memoryStore = new Map<string, { count: number; resetAt: number }>()

export async function globalRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<{ success: boolean; remaining: number }> {
  if (ratelimit) {
    try {
      const result = await ratelimit.limit(identifier)
      return { success: result.success, remaining: result.remaining }
    } catch {
      // Fallback to memory if Upstash fails
    }
  }

  // In-memory fallback
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const record = memoryStore.get(identifier)

  if (!record || now > record.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: maxRequests - record.count }
}

// Specific rate limiters
export async function authRateLimit(ip: string) {
  return globalRateLimit(`auth:${ip}`, 5, 900) // 5 per 15 min
}

export async function emailRateLimit(ip: string) {
  return globalRateLimit(`email:${ip}`, 3, 60) // 3 per minute
}

export async function apiRateLimit(ip: string) {
  return globalRateLimit(`api:${ip}`, 60, 60) // 60 per minute
}

export async function uploadRateLimit(ip: string) {
  return globalRateLimit(`upload:${ip}`, 10, 300) // 10 per 5 min
}

// Backward-compatible sync rate limiter for routes that use the old API
export function rateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 10, windowMs: 60000 }
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = memoryStore.get(key)

  if (!record || now > record.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + options.windowMs })
    return { success: true, remaining: options.maxRequests - 1 }
  }

  if (record.count >= options.maxRequests) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: options.maxRequests - record.count }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}
