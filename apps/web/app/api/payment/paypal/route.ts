import { NextRequest, NextResponse } from 'next/server'

// PayPal REST API
// Documentation: https://developer.paypal.com/docs/api/orders/v2/

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'EUR', description = 'Paiement Ikasso' } = await request.json()

    // Valider les données
    if (!amount) {
      return NextResponse.json(
        { success: false, message: 'Montant requis' },
        { status: 400 }
      )
    }

    const orderId = `PP${Date.now()}`

    /*
    PRODUCTION - Utiliser l'API PayPal:
    
    // Obtenir un token d'accès
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')
    
    const tokenResponse = await fetch(
      `${process.env.PAYPAL_API_URL}/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      }
    )
    
    const { access_token } = await tokenResponse.json()
    
    // Créer l'ordre PayPal
    const orderResponse = await fetch(
      `${process.env.PAYPAL_API_URL}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency,
              value: amount.toString()
            },
            description: description
          }],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`
          }
        })
      }
    )
    
    const orderData = await orderResponse.json()
    const approveLink = orderData.links.find((link: any) => link.rel === 'approve').href
    */

    // Mode DÉMO
    console.log(`💳 PayPal - Order: ${orderId}`)
    console.log(`💰 Montant: ${amount} ${currency}`)

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Ordre PayPal créé',
      approvalUrl: `/payment/paypal/confirm?order=${orderId}&amount=${amount}`,
      // En production, retourner l'URL d'approbation PayPal
      demo: true
    })

  } catch (error) {
    console.error('Erreur PayPal:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors du paiement PayPal' },
      { status: 500 }
    )
  }
}

