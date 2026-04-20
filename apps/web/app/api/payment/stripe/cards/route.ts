import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isStripeConfigured } from '../../../../lib/stripe'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { requireAuth, safeError } from '../../../../lib/api-auth'

// GET: List saved cards
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req)
  if (error) return error

  if (!isStripeConfigured()) {
    return NextResponse.json({ cards: [] })
  }

  try {
    const stripe = getStripe()!
    const supabase = createAdminClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ cards: [] })
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: 'card',
    })

    const cards = paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand || 'unknown',
      last4: pm.card?.last4 || '****',
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault: false,
    }))

    return NextResponse.json({ cards })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}

// DELETE: Remove a saved card
export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth(req)
  if (error) return error

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe non configure' }, { status: 503 })
  }

  try {
    const { paymentMethodId } = await req.json()
    if (!paymentMethodId) {
      return NextResponse.json({ error: 'paymentMethodId requis' }, { status: 400 })
    }

    const stripe = getStripe()!
    await stripe.paymentMethods.detach(paymentMethodId)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
