import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireAdmin, rateLimit, escapeHtml, safeError } from '../../lib/api-auth'

export const runtime = 'nodejs'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAdmin(request)
  if (authError) return authError

  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!rateLimit(`email-${ip}`, 5, 60000)) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 })
  }

  try {
    if (!resend) {
      return NextResponse.json({ success: false, message: 'Email service not configured' }, { status: 503 })
    }
    const { email, name, token } = await request.json()

    if (!email || !name || !token) {
      return NextResponse.json(
        { success: false, message: 'Email, nom et token requis' },
        { status: 400 }
      )
    }

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ikasso-pwxa.vercel.app'}/admin/set-password?token=${token}`

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
          .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span style="font-size:24px;font-weight:700;color:#fff;">Ikasso</span>
            <h1>Invitation Administrateur Ikasso</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px;">Bonjour <strong>${escapeHtml(name)}</strong>,</p>
            
            <p style="font-size: 16px;">Vous avez été invité à rejoindre l'équipe d'administration d'<strong>Ikasso</strong> ! 🎉</p>
            
            <div class="info-box">
              <strong>🛡️ Votre rôle :</strong> Vous avez été ajouté en tant qu'administrateur de la plateforme Ikasso.
            </div>
            
            <p>Pour activer votre compte administrateur, vous devez créer votre mot de passe en cliquant sur le bouton ci-dessous :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="button">Créer mon mot de passe</a>
            </div>
            
            <p style="font-size: 14px; color: #666;">Ou copiez-collez ce lien dans votre navigateur :</p>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 13px;">
              ${resetLink}
            </p>
            
            <div class="warning">
              <strong>⏱️ Important :</strong> Ce lien est valable pendant <strong>24 heures</strong>.
            </div>
            
            <div class="info-box">
              <strong>📧 Votre email de connexion :</strong> ${email}<br>
              <strong>🔐 Mot de passe :</strong> À définir via le lien ci-dessus
            </div>
            
            <p style="margin-top: 30px;">
              Une fois votre mot de passe créé, vous pourrez accéder au panneau d'administration :<br>
              <strong>URL :</strong> <a href="https://ikasso-pwxa.vercel.app/admin" style="color: #E85D04;">https://ikasso-pwxa.vercel.app/admin</a>
            </p>
            
            <p style="margin-top: 30px;">
              Besoin d'aide ? Contactez le super administrateur :<br>
              📧 <a href="mailto:admin@ikasso.ml" style="color: #E85D04;">admin@ikasso.ml</a>
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              Bienvenue dans l'équipe !<br>
              <strong>L'équipe Ikasso Mali</strong> 🇲🇱
            </p>
          </div>
          <div class="footer">
            <p style="color:#9ca3af;font-size:12px;margin:0;">Ikasso Mali - ikasso.ml</p>
          </div>
        </div>
      </body>
      </html>
    `

    try {
      // Envoyer avec Resend
      const { data, error } = await resend.emails.send({
        from: 'Ikasso Admin <noreply@ikasso.ml>',
        to: [email],
        subject: '🛡️ Invitation Administrateur Ikasso - Créez votre mot de passe',
        html: htmlContent,
      })

      if (error) {
        console.error('❌ Erreur Resend:', error)
        return NextResponse.json(
          { success: false, message: safeError(error) },
          { status: 400 }
        )
      }

      console.log('✅ Email d\'invitation admin envoyé:', data?.id, 'à', email)

      return NextResponse.json({ 
        success: true, 
        message: 'Email d\'invitation envoyé avec succès',
        messageId: data?.id
      })

    } catch (resendError: any) {
      console.error('❌ Erreur Resend:', resendError)
      return NextResponse.json(
        { success: false, message: safeError(resendError) },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de l\'envoi',
        error: safeError(error)
      },
      { status: 500 }
    )
  }
}







