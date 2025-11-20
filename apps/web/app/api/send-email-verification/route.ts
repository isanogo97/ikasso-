import { NextRequest, NextResponse } from 'next/server'

// Forcer l'utilisation de Node.js runtime
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

    // HTML de l'email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content { 
            padding: 40px 30px; 
          }
          .code-box { 
            background: #f8f9fa; 
            border: 3px dashed #667eea; 
            padding: 25px; 
            text-align: center; 
            margin: 30px 0;
            border-radius: 10px;
          }
          .code { 
            font-size: 36px; 
            font-weight: bold; 
            letter-spacing: 8px; 
            color: #667eea;
            font-family: 'Courier New', monospace;
          }
          .footer { 
            background: #f8f9fa;
            text-align: center; 
            color: #666; 
            font-size: 13px; 
            padding: 20px;
            border-top: 1px solid #eee;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Bienvenue sur Ikasso !</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px;">Bonjour <strong>${name || 'Cher utilisateur'}</strong>,</p>
            
            <p>Merci de vous être inscrit sur <strong>Ikasso</strong>, votre plateforme de location et d'expériences au Mali.</p>
            
            <p>Pour finaliser votre inscription, veuillez utiliser le code de vérification ci-dessous :</p>
            
            <div class="code-box">
              <div style="color: #666; font-size: 14px; margin-bottom: 10px;">Votre code de vérification</div>
              <div class="code">${code}</div>
            </div>
            
            <div class="warning">
              <strong>⏱️ Important :</strong> Ce code est valable pendant <strong>15 minutes</strong>.
            </div>
            
            <p style="margin-top: 30px;">Si vous n'avez pas créé de compte sur Ikasso, ignorez simplement cet email.</p>
            
            <p style="margin-top: 30px;">
              Besoin d'aide ? Contactez notre équipe :<br>
              📧 <a href="mailto:support@ikasso.ml" style="color: #667eea;">support@ikasso.ml</a><br>
              💬 <a href="mailto:contact@ikasso.ml" style="color: #667eea;">contact@ikasso.ml</a>
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              À bientôt sur Ikasso !<br>
              <strong>L'équipe Ikasso Mali</strong> 🇲🇱
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} <strong>Ikasso Mali</strong>. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // En mode démo, on retourne succès sans envoyer vraiment
    // En production, connecter à Resend, SendGrid ou autre service
    console.log(`Email simulé pour ${email} avec code ${code}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Email envoyé (mode démo)',
      code: code // Retourné temporairement pour la démo
    })

  } catch (error: any) {
    console.error('Erreur:', error)
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
