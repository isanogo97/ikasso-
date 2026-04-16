import { NextRequest, NextResponse } from 'next/server'
import { safeError } from '../../lib/api-auth'

// Configuration Orange API SMS Mali
const ORANGE_CLIENT_ID = process.env.ORANGE_CLIENT_ID || 'GexB8PAJh2wrvh7wlAOVsQv2h8vbAd22'
const ORANGE_CLIENT_SECRET = process.env.ORANGE_CLIENT_SECRET || '' // À configurer dans Vercel
const ORANGE_API_URL = 'https://api.orange.com/smsmessaging/v1/outbound'

// Fonction pour obtenir le token d'accès Orange
async function getOrangeAccessToken(): Promise<string | null> {
  try {
    const credentials = Buffer.from(`${ORANGE_CLIENT_ID}:${ORANGE_CLIENT_SECRET}`).toString('base64')
    
    const response = await fetch('https://api.orange.com/oauth/v3/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      console.error('Erreur token Orange:', await response.text())
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Erreur obtention token Orange:', error)
    return null
  }
}

// Fonction pour formater le numéro de téléphone au format international
function formatPhoneNumber(phone: string): string {
  // Nettoyer le numéro
  let cleaned = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '')
  
  // Si le numéro commence par 0, le remplacer par +223 (Mali)
  if (cleaned.startsWith('0')) {
    cleaned = '+223' + cleaned.substring(1)
  }
  
  // Si le numéro ne commence pas par +, ajouter +223
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('223')) {
      cleaned = '+' + cleaned
    } else {
      cleaned = '+223' + cleaned
    }
  }
  
  return cleaned
}

export async function POST(request: NextRequest) {
  try {
    const { phone, message, code } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Numéro de téléphone requis' },
        { status: 400 }
      )
    }

    // Formater le numéro
    const formattedPhone = formatPhoneNumber(phone)
    
    // Créer le message
    const smsMessage = code 
      ? `Ikasso - Votre code de vérification est : ${code}. Ne partagez ce code avec personne.`
      : message || 'Message de test Ikasso'

    // Vérifier si le secret est configuré
    if (!ORANGE_CLIENT_SECRET) {
      console.log('⚠️ Orange API non configurée - Mode démo')
      console.log(`📱 SMS simulé vers ${formattedPhone}: ${smsMessage}`)
      
      return NextResponse.json({
        success: true,
        message: 'SMS envoyé (mode démo)',
        demo: true,
        phone: formattedPhone,
        code: code
      })
    }

    // Obtenir le token d'accès
    const accessToken = await getOrangeAccessToken()
    
    if (!accessToken) {
      console.error('Impossible d\'obtenir le token Orange')
      return NextResponse.json({
        success: false,
        message: 'Erreur d\'authentification Orange API',
        demo: true,
        code: code
      })
    }

    // Encoder le numéro pour l'URL
    const encodedPhone = encodeURIComponent(formattedPhone)
    
    // Envoyer le SMS via Orange API
    const smsResponse = await fetch(
      `${ORANGE_API_URL}/tel:${encodedPhone}/requests`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          outboundSMSMessageRequest: {
            address: `tel:${formattedPhone}`,
            senderAddress: 'tel:+223IKASSO', // Sera remplacé par votre sender ID
            senderName: 'Ikasso',
            outboundSMSTextMessage: {
              message: smsMessage
            }
          }
        })
      }
    )

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text()
      console.error('Erreur envoi SMS Orange:', errorText)
      
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de l\'envoi du SMS',
        error: errorText,
        demo: true,
        code: code
      })
    }

    const result = await smsResponse.json()
    console.log('✅ SMS envoyé avec succès:', result)

    return NextResponse.json({
      success: true,
      message: 'SMS envoyé avec succès',
      messageId: result.outboundSMSMessageRequest?.resourceURL
    })

  } catch (error) {
    console.error('Erreur API SMS:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur serveur',
        error: safeError(error)
      },
      { status: 500 }
    )
  }
}





