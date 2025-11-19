import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    // Générer un code de vérification à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Créer un lien de vérification
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?code=${verificationCode}&email=${encodeURIComponent(email)}`

    // Configuration du transporteur email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Envoyer l'email
    await transporter.sendMail({
      from: `"Ikasso Mali" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Vérifiez votre adresse email - Ikasso',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏡 Bienvenue sur Ikasso !</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              <p>Merci de vous être inscrit sur <strong>Ikasso</strong>, votre plateforme de location et d'expériences au Mali.</p>
              <p>Pour activer votre compte, veuillez vérifier votre adresse email en utilisant le code ci-dessous :</p>
              
              <div class="code">${verificationCode}</div>
              
              <p style="text-align: center;">Ou cliquez sur le bouton ci-dessous :</p>
              <p style="text-align: center;">
                <a href="${verificationLink}" class="button">Vérifier mon email</a>
              </p>
              
              <p><strong>Ce code est valable pendant 24 heures.</strong></p>
              
              <p>Si vous n'avez pas créé de compte sur Ikasso, ignorez simplement cet email.</p>
              
              <p>À bientôt sur Ikasso !<br>L'équipe Ikasso</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ikasso Mali. Tous droits réservés.</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // Sauvegarder le code de vérification (dans la vraie app, utiliser Redis ou une DB)
    // Pour l'instant, on retourne le code pour le stocker côté client
    return NextResponse.json({ 
      success: true, 
      message: 'Email de vérification envoyé',
      verificationCode // À retirer en production
    })

  } catch (error) {
    console.error('Erreur envoi email:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}

