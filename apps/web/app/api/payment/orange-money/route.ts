import { NextRequest, NextResponse } from 'next/server'

// Orange Money API - Mali
// Documentation: https://developer.orange.com/apis/orange-money-webpay/

export async function POST(request: NextRequest) {
  try {
    const { amount, phone, merchantId, currency = 'XOF' } = await request.json()

    // Valider les données
    if (!amount || !phone) {
      return NextResponse.json(
        { success: false, message: 'Montant et numéro de téléphone requis' },
        { status: 400 }
      )
    }

    // En mode démo, simuler le paiement
    // En production, utiliser l'API Orange Money Mali
    const transactionId = `OM${Date.now()}`
    
    /*
    PRODUCTION - Utiliser l'API Orange Money:
    
    const response = await fetch('https://api.orange.com/orange-money-webpay/dev/v1/webpayment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ORANGE_MONEY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_key: process.env.ORANGE_MONEY_MERCHANT_KEY,
        currency: currency,
        order_id: transactionId,
        amount: amount,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        notif_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/orange-money/callback`,
        lang: 'fr',
        reference: `Paiement Ikasso - ${transactionId}`
      })
    })
    
    const data = await response.json()
    */

    // Mode DÉMO
    console.log(`🍊 Orange Money - Transaction: ${transactionId}`)
    console.log(`💰 Montant: ${amount} ${currency}`)
    console.log(`📱 Téléphone: ${phone}`)

    return NextResponse.json({
      success: true,
      transactionId,
      message: 'Paiement Orange Money initié',
      paymentUrl: `/payment/orange-money/confirm?transaction=${transactionId}&amount=${amount}`,
      // En production, retourner l'URL de paiement Orange Money
      demo: true
    })

  } catch (error) {
    console.error('Erreur Orange Money:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors du paiement Orange Money' },
      { status: 500 }
    )
  }
}

