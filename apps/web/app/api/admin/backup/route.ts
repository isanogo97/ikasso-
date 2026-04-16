import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin, safeError } from '../../../lib/api-auth'

const TABLES = [
  'profiles',
  'properties',
  'bookings',
  'reviews',
  'conversations',
  'messages',
  'admin_users',
  'identity_verifications',
  'promo_codes',
  'incidents',
  'incident_messages',
  'sponsors',
  'ad_transactions',
  'referral_codes',
  'referrals',
  'audit_log',
]

export async function GET(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const format = req.nextUrl.searchParams.get('format') || 'json'
    const tableParam = req.nextUrl.searchParams.get('table')

    // Single table export
    if (tableParam && TABLES.includes(tableParam)) {
      const { data, error } = await supabase
        .from(tableParam)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000)

      if (error) {
        return NextResponse.json({ error: safeError(error) }, { status: 500 })
      }

      if (format === 'download') {
        const jsonStr = JSON.stringify(data, null, 2)
        return new NextResponse(jsonStr, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename=ikasso_${tableParam}_${new Date().toISOString().split('T')[0]}.json`,
          },
        })
      }

      return NextResponse.json({ table: tableParam, count: data?.length || 0, data })
    }

    // Full backup: export all tables
    const backup: Record<string, { count: number; data: any[] }> = {}
    const errors: string[] = []

    for (const table of TABLES) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10000)

        if (error) {
          errors.push(`${table}: ${error.message}`)
          backup[table] = { count: 0, data: [] }
        } else {
          backup[table] = { count: data?.length || 0, data: data || [] }
        }
      } catch {
        errors.push(`${table}: erreur inattendue`)
        backup[table] = { count: 0, data: [] }
      }
    }

    const metadata = {
      exportedAt: new Date().toISOString(),
      exportedBy: user.email || user.id,
      tables: TABLES.length,
      totalRecords: Object.values(backup).reduce((sum, t) => sum + t.count, 0),
      errors: errors.length > 0 ? errors : undefined,
    }

    if (format === 'download') {
      const fullBackup = { metadata, backup }
      const jsonStr = JSON.stringify(fullBackup, null, 2)
      return new NextResponse(jsonStr, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename=ikasso_backup_${new Date().toISOString().split('T')[0]}.json`,
        },
      })
    }

    // Summary only (no data) for quick check
    const summary: Record<string, number> = {}
    for (const [table, info] of Object.entries(backup)) {
      summary[table] = info.count
    }

    return NextResponse.json({ metadata, summary, errors: errors.length > 0 ? errors : undefined })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
