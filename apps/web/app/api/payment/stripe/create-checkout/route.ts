import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe, isStripeConfigured } from '../../../../lib/stripe'
import { rateLimit, getClientIp } from '../../../../lib/rate-limit'

const schema = z.object({
  amount: z.number().positive(),
  propertyName: z.string().min(1),
  bookingId: z.string().optional(),
  nights: z.number().int().positive().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { success } = rateLimit(`stripe:${ip}`, { maxRequests: 10, windowMs: 60000 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const data = schema.parse(body)

    if (!isStripeConfigured()) {
      // Demo mode
      return NextResponse.json({
        demo: true,
        message: 'Stripe non configure - mode demo',
        sessionId: `demo_${Date.now()}`,
        url: data.successUrl || '/',
      })
    }

    const stripe = getStripe()!
    const origin = request.headers.get('origin') || 'https://ikasso.ml'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'xof',
            product_data: {
              name: data.propertyName,
              description: data.nights ? `${data.nights} nuit(s)` : undefined,
            },
            unit_amount: data.amount, // XOF is zero-decimal
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: data.successUrl || `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: data.cancelUrl || `${origin}/payment/cancel`,
      metadata: {
        bookingId: data.bookingId || '',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Donnees invalides', details: error.issues }, { status: 400 })
    }
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
