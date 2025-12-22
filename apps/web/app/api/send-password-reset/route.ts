import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, name, resetLink } = await request.json()

    if (!email || !resetLink) {
      return NextResponse.json(
        { success: false, message: 'Email et lien de réinitialisation requis' },
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
            background: linear-gradient(135deg, #E85D04 0%, #F77F00 100%); 
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
          .button { 
            display: inline-block;
            background: linear-gradient(135deg, #E85D04 0%, #F77F00 100%);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            opacity: 0.9;
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
          .security-notice {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #721c24;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://ikasso-pwxa-pak2i44w3-ibrahima-ousmane-sanogos-projects.vercel.app/images/logos/ikasso-logo.png" alt="Sécurité" style="width: 60px; height: 60px; margin: 0 auto 10px;">
            <h1>Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px;">Bonjour <strong>${name || 'Cher utilisateur'}</strong>,</p>
            
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>Ikasso</strong>.</p>
            
            <p>Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </div>
            
            <p style="font-size: 14px; color: #666;">Ou copiez-collez ce lien dans votre navigateur :</p>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 13px;">
              ${resetLink}
            </p>
            
            <div class="warning">
              <strong>⏱️ Important :</strong> Ce lien est valable pendant <strong>1 heure</strong>.
            </div>
            
            <div class="security-notice">
              <strong>🛡️ Sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe actuel reste inchangé.
            </div>
            
            <p style="margin-top: 30px;">
              Besoin d'aide ? Contactez notre équipe :<br>
              📧 <a href="mailto:support@ikasso.ml" style="color: #E85D04;">support@ikasso.ml</a><br>
              💬 <a href="mailto:contact@ikasso.ml" style="color: #E85D04;">contact@ikasso.ml</a>
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              Cordialement,<br>
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

    try {
      // Envoyer avec Resend
      const { data, error } = await resend.emails.send({
        from: 'Ikasso <noreply@ikasso.ml>',
        to: [email],
        subject: '🔐 Réinitialisation de votre mot de passe Ikasso',
        html: htmlContent,
      })

      if (error) {
        console.error('❌ Erreur Resend:', error)
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }

      console.log('✅ Email de réinitialisation envoyé:', data?.id, 'à', email)

      return NextResponse.json({ 
        success: true, 
        message: 'Email de réinitialisation envoyé avec succès',
        messageId: data?.id
      })

    } catch (resendError: any) {
      console.error('❌ Erreur Resend:', resendError)
      return NextResponse.json(
        { success: false, message: resendError.message },
        { status: 500 }
      )
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

