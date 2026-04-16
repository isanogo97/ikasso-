import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('ad_transactions')
      .select('*')
      .eq('sponsor_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      if (error.message.includes('does not exist')) return NextResponse.json({ transactions: [] })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ transactions: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()

    // Generate invoice number if type is facture
    let invoiceNumber = body.invoice_number || null
    if (body.type === 'facture' && !invoiceNumber) {
      const year = new Date().getFullYear()
      const { count } = await supabase.from('ad_transactions').select('id', { count: 'exact', head: true }).eq('type', 'facture')
      invoiceNumber = `IK-PUB-${year}-${String((count || 0) + 1).padStart(4, '0')}`
    }

    const { data, error } = await supabase
      .from('ad_transactions')
      .insert({
        sponsor_id: params.id,
        type: body.type,
        amount: body.amount,
        description: body.description || null,
        invoice_number: invoiceNumber,
        payment_method: body.payment_method || null,
        payment_reference: body.payment_reference || null,
        status: body.type === 'paiement' ? 'paid' : 'pending',
        created_by: body.created_by || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If payment registered, activate the sponsor
    if (body.type === 'paiement') {
      await supabase.from('sponsors').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', params.id)
    }

    return NextResponse.json({ success: true, transaction: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
