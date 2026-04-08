import { NextResponse } from 'next/server'
import { getStripe, isStripeConfigured } from '../../../../lib/stripe'

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })
  }

  const stripe = getStripe()!
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const bookingId = session.metadata?.bookingId

        if (bookingId) {
          // Update booking payment status in Supabase
          try {
            const { createServerSupabaseClient } = await import('../../../../lib/supabase/server')
            const supabase = await createServerSupabaseClient()
            await supabase.from('bookings').update({
              payment_status: 'paid',
              payment_id: session.payment_intent,
              status: 'confirmed',
            }).eq('id', bookingId)
          } catch (e) {
            console.error('Failed to update booking:', e)
          }
        }
        break
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any
        console.error('Payment failed:', paymentIntent.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }
}
