import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email, name, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'Email et code requis' },
        { status: 400 }
      )
    }

    // URL du serveur email externe
    const emailServerUrl = process.env.EMAIL_SERVER_URL || 'http://localhost:3001'

    try {
      // Appeler le serveur email externe
      const response = await fetch(`${emailServerUrl}/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, code })
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Email envoyé via serveur externe:', email)
        return NextResponse.json({ 
          success: true, 
          message: 'Email envoyé avec succès'
        })
      } else {
        console.error('❌ Erreur serveur email:', data.message)
        // Fallback en mode démo si le serveur externe échoue
        return NextResponse.json({ 
          success: true, 
          message: 'Email envoyé (mode démo)',
          code: code // Pour la démo
        })
      }
    } catch (fetchError) {
      console.error('❌ Impossible de contacter le serveur email:', fetchError)
      // Fallback en mode démo
      return NextResponse.json({ 
        success: true, 
        message: 'Email envoyé (mode démo - serveur email offline)',
        code: code // Pour la démo
      })
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de l\'envoi',
        error: error.message 
      },
      { status: 500 }
    )
  }
}
