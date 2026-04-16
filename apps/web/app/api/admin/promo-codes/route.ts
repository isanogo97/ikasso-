import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin, safeError } from '../../../lib/api-auth'

export async function GET(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not exist yet
      if (error.message.includes('does not exist')) {
        return NextResponse.json({ codes: [], needsMigration: true })
      }
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    return NextResponse.json({ codes: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { code, discount_percent, discount_amount, description, expires_at, max_uses, target_type, target_emails } = body

    if (!code || (!discount_percent && !discount_amount)) {
      return NextResponse.json({ error: 'Code et reduction requis' }, { status: 400 })
    }

    // Parse target_emails: comma-separated string → array
    let emailsArray: string[] | null = null
    if (target_emails && typeof target_emails === 'string') {
      emailsArray = target_emails.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
      if (emailsArray.length === 0) emailsArray = null
    } else if (Array.isArray(target_emails) && target_emails.length > 0) {
      emailsArray = target_emails.map((e: string) => e.trim().toLowerCase())
    }

    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code: code.toUpperCase().trim(),
        description: description || null,
        discount_percent: discount_percent || null,
        discount_amount: discount_amount || null,
        expires_at: expires_at || null,
        max_uses: emailsArray ? emailsArray.length : (max_uses || null),
        is_active: true,
        target_type: target_type || 'all',
        target_emails: emailsArray,
      })
      .select()
      .single()

    if (error) {
      if (error.message.includes('does not exist')) {
        return NextResponse.json({
          error: 'Table promo_codes non creee. Executez la migration SQL dans Supabase.',
          needsMigration: true,
          sql: `CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount INTEGER CHECK (discount_amount >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
        }, { status: 500 })
      }
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        return NextResponse.json({ error: 'Ce code existe deja' }, { status: 409 })
      }
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true, code: data })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const { id, is_active } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
