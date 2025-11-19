import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // Générer un code OTP à 6 chiffres
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Pour la démo, on retourne directement le code
    // En production, utiliser Twilio, AWS SNS, ou un service SMS local malien
    
    /* Exemple avec Twilio (décommenter pour utiliser) :
    const twilio = require('twilio')
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    
    await client.messages.create({
      body: `Votre code de vérification Ikasso est : ${otpCode}. Valide pendant 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    })
    */

    console.log(`Code SMS pour ${phone}: ${otpCode}`)

    return NextResponse.json({ 
      success: true, 
      message: 'SMS de vérification envoyé',
      otpCode // À retirer en production - juste pour la démo
    })

  } catch (error) {
    console.error('Erreur envoi SMS:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'envoi du SMS' },
      { status: 500 }
    )
  }
}

