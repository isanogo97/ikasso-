import { NextRequest, NextResponse } from 'next/server'
import { getStripe, isStripeConfigured } from '../../../../lib/stripe'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { requireAuth, safeError } from '../../../../lib/api-auth'

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req)
  if (error) return error

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe non configure' }, { status: 503 })
  }

  try {
    const stripe = getStripe()!
    const supabase = createAdminClient()
    const origin = req.headers.get('origin') || 'https://ikasso.ml'

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, first_name, last_name')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create a Checkout Session in setup mode (save card without charging)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      payment_method_types: ['card'],
      success_url: `${origin}/settings?tab=payments&setup=success`,
      cancel_url: `${origin}/settings?tab=payments&setup=cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
