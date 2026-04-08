import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getClientIp } from '../../../lib/rate-limit'

const schema = z.object({
  amount: z.number().positive(),
  phoneNumber: z.string().min(8),
  propertyName: z.string().optional(),
  bookingId: z.string().optional(),
  currency: z.string().default('XOF'),
})

function isOrangeMoneyConfigured(): boolean {
  return !!(process.env.ORANGE_MONEY_API_KEY && process.env.ORANGE_MONEY_MERCHANT_ID)
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success } = rateLimit(`orange:${ip}`, { maxRequests: 10, windowMs: 60000 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const data = schema.parse(body)
    const transactionId = `OM${Date.now()}`

    if (isOrangeMoneyConfigured()) {
      // PRODUCTION — Real Orange Money API
      const response = await fetch('https://api.orange.com/orange-money-webpay/dev/v1/webpayment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ORANGE_MONEY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_key: process.env.ORANGE_MONEY_MERCHANT_ID,
          currency: data.currency,
          order_id: transactionId,
          amount: data.amount,
          return_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://ikasso.ml' : 'http://localhost:3000'}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://ikasso.ml' : 'http://localhost:3000'}/payment/cancel`,
          notif_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://ikasso.ml' : 'http://localhost:3000'}/api/payment/orange-money/callback`,
          lang: 'fr',
          reference: `Ikasso - ${data.propertyName || transactionId}`,
        }),
      })

      const result = await response.json()

      if (result.payment_url) {
        return NextResponse.json({
          success: true,
          transactionId,
          paymentUrl: result.payment_url,
          demo: false,
        })
      }

      return NextResponse.json({
        success: false,
        error: result.message || 'Erreur Orange Money',
      }, { status: 400 })
    }

    // DEMO MODE
    return NextResponse.json({
      success: true,
      transactionId,
      message: 'Paiement Orange Money initie (mode demo)',
      demo: true,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Donnees invalides', details: error.issues }, { status: 400 })
    }
    console.error('Erreur Orange Money:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
