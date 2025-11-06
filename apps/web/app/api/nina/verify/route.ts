import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (per IP)
const WINDOW_MS = 60 * 1000
const MAX_REQ = 10
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
  // @ts-ignore: not always available
  return (req as any).ip || 'unknown'
}

const normalizeNina = (n: string) => n.replace(/\s+/g, '').toUpperCase()
const isValidNinaFormat = (n: string) => /^\d{14}$/.test(normalizeNina(n))

export async function POST(req: NextRequest) {
  // Rate limiting
  try {
    const ip = getIp(req)
    const now = Date.now()
    pruneBuckets(now)
    const bucket = buckets.get(ip)
    if (!bucket || now > bucket.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    } else {
      if (bucket.count >= MAX_REQ) {
        return NextResponse.json({ error: 'Trop de tentatives, réessayez plus tard.' }, { status: 429 })
      }
      bucket.count += 1
    }
  } catch {
    // ignore rate limiter errors
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const nina = typeof body?.nina === 'string' ? body.nina : ''
  const fullName = typeof body?.fullName === 'string' ? body.fullName : ''
  const dob = typeof body?.dob === 'string' ? body.dob : '' // YYYY-MM-DD

  if (!nina) {
    return NextResponse.json({ error: 'NINA manquant' }, { status: 400 })
  }

  if (!isValidNinaFormat(nina)) {
    return NextResponse.json({ ok: false, validFormat: false, verified: false, message: 'Format NINA invalide (14 chiffres requis).' }, { status: 200 })
  }

  // Optional basic DOB sanity check
  if (dob) {
    const d = new Date(dob)
    if (Number.isNaN(d.getTime()) || d > new Date()) {
      return NextResponse.json({ ok: false, validFormat: true, verified: false, message: 'Date de naissance invalide.' }, { status: 200 })
    }
  }

  // Placeholder verification: Only format check implemented.
  // Integrate with the official NINA service here when available.
  return NextResponse.json({ ok: true, validFormat: true, verified: false, message: 'Format valide. Intégration NINA à connecter (service externe).' })
}
