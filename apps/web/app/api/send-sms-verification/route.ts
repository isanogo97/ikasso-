import { NextRequest, NextResponse } from 'next/server'
import { safeError } from '../../lib/api-auth'
import { globalRateLimit, getClientIp } from '../../lib/rate-limit'
import { z } from 'zod'

const smsSchema = z.object({
  phone: z.string().min(8).max(20),
  code: z.string().min(4).max(10),
})

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success: rlOk } = await globalRateLimit(`sms:${ip}`, 3, 60)
  if (!rlOk) return NextResponse.json({ success: false, message: 'Trop de requetes' }, { status: 429 })

  try {
    const body = await request.json()
    const parsed = smsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Donnees invalides' }, { status: 400 })
    }
    const { phone, code } = parsed.data

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: 'Telephone et code requis' },
        { status: 400 }
      )
    }

    // Pour l'instant en mode démo - le code sera implémenté avec une vraie API SMS
    // Options disponibles :
    // 1. Orange Money SMS API (Mali)
    // 2. Africa's Talking (Afrique)
    // 3. Twilio (International)
    
    console.log(`SMS à envoyer au ${phone}: Code ${code}`)

    // Simulation d'envoi (en production, décommenter et utiliser une vraie API)
    /*
    // Exemple avec Twilio:
    const twilio = require('twilio')
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    
    await client.messages.create({
      body: `Votre code de vérification Ikasso est : ${code}. Valide pendant 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    })
    */

    /*
    // Exemple avec Africa's Talking:
    const AfricasTalking = require('africastalking')({
      apiKey: process.env.AFRICASTALKING_API_KEY,
      username: process.env.AFRICASTALKING_USERNAME
    })
    
    const sms = AfricasTalking.SMS
    await sms.send({
      to: [phone],
      message: `Votre code de vérification Ikasso est : ${code}. Valide pendant 10 minutes.`,
      from: 'Ikasso'
    })
    */

    // En mode démo, on retourne succès (code JAMAIS renvoye au client)
    return NextResponse.json({
      success: true,
      message: 'SMS envoye (mode demo)'
    })

  } catch (error: any) {
    console.error('Erreur envoi SMS:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de l\'envoi du SMS',
        error: safeError(error)
      },
      { status: 500 }
    )
  }
}

