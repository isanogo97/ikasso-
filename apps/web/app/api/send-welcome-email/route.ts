import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    if (!resend) {
      return NextResponse.json({ success: false, message: 'Email service not configured' }, { status: 503 })
    }
    const { email, name, userType } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { success: false, message: 'Email et nom requis' },
        { status: 400 }
      )
    }

    const isHost = userType === 'host' || userType === 'hote'

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
            font-size: 32px;
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
          }
          .feature-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #E85D04;
          }
          .footer { 
            background: #f8f9fa;
            text-align: center; 
            color: #666; 
            font-size: 13px; 
            padding: 20px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://ikasso-pwxa-pak2i44w3-ibrahima-ousmane-sanogos-projects.vercel.app/images/logos/ikasso-logo.png" alt="Bienvenue" style="width: 60px; height: 60px; margin: 0 auto 10px;">
            <h1>Bienvenue sur Ikasso !</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px;">Bonjour <strong>${name}</strong>,</p>
            
            <p style="font-size: 16px;">Nous sommes ravis de vous accueillir sur <strong>Ikasso</strong>, votre plateforme de location et d'expériences au Mali ! 🇲🇱</p>
            
            ${isHost ? `
              <p>En tant qu'<strong>hôte</strong>, vous pouvez maintenant :</p>
              
              <div class="feature-box">
                <strong>🏠 Créer vos annonces</strong><br>
                Partagez vos logements et expériences avec des voyageurs du monde entier.
              </div>
              
              <div class="feature-box">
                <strong>💰 Gérer vos réservations</strong><br>
                Suivez vos revenus et gérez vos disponibilités facilement.
              </div>
              
              <div class="feature-box">
                <strong>📊 Accéder à votre tableau de bord</strong><br>
                Consultez vos statistiques et optimisez vos annonces.
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://ikasso-pwxa.vercel.app/dashboard/host" class="button">Accéder à mon espace hôte</a>
              </div>
            ` : `
              <p>En tant que <strong>voyageur</strong>, vous pouvez maintenant :</p>
              
              <div class="feature-box">
                <strong>🔍 Découvrir des logements uniques</strong><br>
                Trouvez le logement parfait pour votre séjour au Mali.
              </div>
              
              <div class="feature-box">
                <strong>🎯 Réserver des expériences</strong><br>
                Vivez des moments inoubliables avec des hôtes locaux.
              </div>
              
              <div class="feature-box">
                <strong>⭐ Laisser des avis</strong><br>
                Partagez votre expérience avec la communauté.
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://ikasso-pwxa.vercel.app" class="button">Commencer à explorer</a>
              </div>
            `}
            
            <p style="margin-top: 30px;">
              <strong>Besoin d'aide pour démarrer ?</strong><br>
              Notre équipe est là pour vous accompagner :<br>
              📧 <a href="mailto:support@ikasso.ml" style="color: #E85D04;">support@ikasso.ml</a><br>
              💬 <a href="mailto:contact@ikasso.ml" style="color: #E85D04;">contact@ikasso.ml</a>
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              Merci de faire confiance à Ikasso !<br>
              <strong>L'équipe Ikasso Mali</strong> 🇲🇱
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} <strong>Ikasso Mali</strong>. Tous droits réservés.</p>
            <p>Vous recevez cet email car vous venez de créer un compte sur Ikasso.</p>
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
        subject: '🎉 Bienvenue sur Ikasso - Votre compte est activé !',
        html: htmlContent,
      })

      if (error) {
        console.error('❌ Erreur Resend:', error)
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }

      console.log('✅ Email de bienvenue envoyé:', data?.id, 'à', email)

      return NextResponse.json({ 
        success: true, 
        message: 'Email de bienvenue envoyé avec succès',
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

