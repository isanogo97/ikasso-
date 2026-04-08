// In-memory rate limiter for API routes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    rateLimitMap.forEach((value, key) => {
      if (now > value.resetAt) rateLimitMap.delete(key)
    })
  }, 300000)
}

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export function rateLimit(key: string, options: RateLimitOptions = { maxRequests: 10, windowMs: 60000 }): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + options.windowMs })
    return { success: true, remaining: options.maxRequests - 1 }
  }

  if (entry.count >= options.maxRequests) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: options.maxRequests - entry.count }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

// Pre-configured rate limiters
export function authRateLimit(ip: string) {
  return rateLimit(`auth:${ip}`, { maxRequests: 5, windowMs: 60000 })
}

export function emailRateLimit(ip: string) {
  return rateLimit(`email:${ip}`, { maxRequests: 3, windowMs: 60000 })
}

export function paymentRateLimit(ip: string) {
  return rateLimit(`payment:${ip}`, { maxRequests: 10, windowMs: 60000 })
}
