import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin } from '../../../lib/api-auth'

export async function GET(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      if (error.message.includes('does not exist')) {
        return NextResponse.json({ sponsors: [], needsMigration: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enrich with user info
    const enriched = await Promise.all(
      (data || []).map(async (s: any) => {
        if (s.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', s.user_id)
            .single()
          if (profile) {
            return {
              ...s,
              user_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
              user_email: profile.email || s.contact_email,
            }
          }
        }
        return { ...s, user_name: s.contact_name || s.business_name, user_email: s.contact_email }
      })
    )

    return NextResponse.json({ sponsors: enriched })
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

    const { data, error } = await supabase
      .from('sponsors')
      .insert({
        user_id: body.user_id || null,
        business_name: body.business_name,
        contact_name: body.contact_name || null,
        contact_email: body.contact_email || null,
        contact_phone: body.contact_phone || null,
        property_id: body.property_id || null,
        plan: body.plan || 'standard',
        amount_paid: body.amount_paid || 0,
        currency: 'FCFA',
        payment_method: body.payment_method || null,
        payment_reference: body.payment_reference || null,
        start_date: body.start_date,
        end_date: body.end_date,
        is_active: true,
        notes: body.notes || null,
        created_by: body.created_by || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, sponsor: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    updates.updated_at = new Date().toISOString()
    const { error } = await supabase.from('sponsors').update(updates).eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const { id } = await req.json()

    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    const { error } = await supabase.from('sponsors').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
