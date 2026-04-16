import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin } from '../../../lib/api-auth'

function generateCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'REF'
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${suffix}`
}

export async function GET(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()

    const { data: codes, error } = await supabase
      .from('referral_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      if (error.message.includes('does not exist')) return NextResponse.json({ codes: [], referrals: [] })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get host names
    const hostIds = Array.from(new Set((codes || []).map((c: any) => c.host_id)))
    const profiles: Record<string, any> = {}
    if (hostIds.length > 0) {
      const { data: profileData } = await supabase.from('profiles').select('id, first_name, last_name, email').in('id', hostIds)
      if (profileData) for (const p of profileData) profiles[p.id] = p
    }

    // Get all referrals
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false })

    // Enrich referrals with user names
    const referredIds = Array.from(new Set((referrals || []).filter((r: any) => r.referred_id).map((r: any) => r.referred_id)))
    if (referredIds.length > 0) {
      const { data: refProfiles } = await supabase.from('profiles').select('id, first_name, last_name, email').in('id', referredIds)
      if (refProfiles) for (const p of refProfiles) profiles[p.id] = p
    }

    const enrichedCodes = (codes || []).map((c: any) => {
      const host = profiles[c.host_id]
      return {
        ...c,
        host_name: host ? `${host.first_name || ''} ${host.last_name || ''}`.trim() : 'Inconnu',
        host_email: host?.email || '-',
      }
    })

    const enrichedReferrals = (referrals || []).map((r: any) => {
      const referrer = profiles[r.referrer_id]
      const referred = profiles[r.referred_id]
      return {
        ...r,
        referrer_name: referrer ? `${referrer.first_name || ''} ${referrer.last_name || ''}`.trim() : 'Inconnu',
        referred_name: referred ? `${referred.first_name || ''} ${referred.last_name || ''}`.trim() : r.referred_email || 'En attente',
      }
    })

    return NextResponse.json({ codes: enrichedCodes, referrals: enrichedReferrals })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { host_id, reward_type, reward_months, max_referrals } = body

    if (!host_id) return NextResponse.json({ error: 'Hote requis' }, { status: 400 })

    // Get host name for code generation
    const { data: profile } = await supabase.from('profiles').select('first_name, last_name').eq('id', host_id).single()
    const code = generateCode(profile?.first_name || 'REF')

    const { data, error } = await supabase
      .from('referral_codes')
      .insert({
        host_id,
        code,
        reward_type: reward_type || 'commission_free',
        reward_months: reward_months || 3,
        max_referrals: max_referrals || 10,
        is_active: true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, referralCode: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const { id, is_active } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    const { error } = await supabase.from('referral_codes').update({ is_active }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
