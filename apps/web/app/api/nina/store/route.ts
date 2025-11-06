import { NextRequest, NextResponse } from 'next/server'

type Entry = { nina: string; dob?: string; verified?: boolean; updatedAt: number }
const store = new Map<string, Entry>() // key: email

// Basic per-IP rate limiting
const WINDOW_MS = 60 * 1000
const MAX_REQ = 20
const MAX_BUCKETS = 1000
const buckets = new Map<string, { count: number; resetAt: number }>()

function pruneBuckets(now: number) {
  const toDelete: string[] = []
  buckets.forEach((b, ip) => {
    if (now > b.resetAt) toDelete.push(ip)
  })
  toDelete.forEach((ip) => buckets.delete(ip))
  if (buckets.size > MAX_BUCKETS) {
    const entries = Array.from(buckets.entries()).sort((a, b) => a[1].resetAt - b[1].resetAt)
    for (let i = 0; i < entries.length - MAX_BUCKETS; i++) buckets.delete(entries[i][0])
  }
}

const getIp = (req: NextRequest) => {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  // @ts-ignore
  return (req as any).ip || 'unknown'
}

function rl(req: NextRequest): NextResponse | null {
  try {
    const ip = getIp(req)
    const now = Date.now()
    pruneBuckets(now)
    const b = buckets.get(ip)
    if (!b || now > b.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS })
      return null
    }
    if (b.count >= MAX_REQ) {
      return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard.' }, { status: 429 })
    }
    b.count += 1
    return null
  } catch {
    return null
  }
}

// Disable unauthenticated readback to avoid exposing PII
export async function GET() {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
}

export async function POST(req: NextRequest) {
  const limited = rl(req)
  if (limited) return limited
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
  const email = typeof body?.email === 'string' ? body.email : ''
  const nina = typeof body?.nina === 'string' ? body.nina : ''
  const dob = typeof body?.dob === 'string' ? body.dob : undefined
  const verified = !!body?.verified
  if (!email || !nina) {
    return NextResponse.json({ error: 'email et nina sont requis' }, { status: 400 })
  }
  // Basic in-memory storage with simple pruning to avoid unbounded growth
  const now = Date.now()
  if (store.size > 1000) {
    const entries = Array.from(store.entries()).sort((a, b) => a[1].updatedAt - b[1].updatedAt)
    for (let i = 0; i < entries.length - 1000; i++) store.delete(entries[i][0])
  }
  store.set(email, { nina, dob, verified, updatedAt: now })
  return NextResponse.json({ ok: true })
}
