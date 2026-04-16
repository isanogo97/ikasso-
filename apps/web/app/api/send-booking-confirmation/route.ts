import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    if (!resend) {
      return NextResponse.json({ success: false, message: 'Email service not configured' }, { status: 503 })
    }
    const {
      email, 
      name, 
      bookingId,
      propertyName,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      hostName,
      propertyAddress
    } = await request.json()

    if (!email || !name || !bookingId) {
      return NextResponse.json(
        { success: false, message: 'Email, nom et ID de réservation requis' },
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
          .booking-box {
            background: #f8f9fa;
            border: 2px solid #E85D04;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
          }
          .booking-detail {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .booking-detail:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            color: #E85D04;
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #E85D04;
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
          .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
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
            <span style="font-size:24px;font-weight:700;color:#fff;">Ikasso</span>
            <h1>✅ Réservation confirmée !</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px;">Bonjour <strong>${name}</strong>,</p>
            
            <p style="font-size: 16px;">Votre réservation a été confirmée avec succès ! 🎉</p>
            
            <div class="booking-box">
              <h2 style="margin-top: 0; color: #E85D04;">📋 Détails de votre réservation</h2>
              
              <div class="booking-detail">
                <span><strong>Numéro de réservation</strong></span>
                <span>${bookingId}</span>
              </div>
              
              <div class="booking-detail">
                <span><strong>🏠 Logement</strong></span>
                <span>${propertyName || 'Non spécifié'}</span>
              </div>
              
              ${hostName ? `
                <div class="booking-detail">
                  <span><strong>👤 Hôte</strong></span>
                  <span>${hostName}</span>
                </div>
              ` : ''}
              
              ${propertyAddress ? `
                <div class="booking-detail">
                  <span><strong>📍 Adresse</strong></span>
                  <span>${propertyAddress}</span>
                </div>
              ` : ''}
              
              <div class="booking-detail">
                <span><strong>📅 Arrivée</strong></span>
                <span>${checkIn || 'Non spécifié'}</span>
              </div>
              
              <div class="booking-detail">
                <span><strong>📅 Départ</strong></span>
                <span>${checkOut || 'Non spécifié'}</span>
              </div>
              
              <div class="booking-detail">
                <span><strong>👥 Voyageurs</strong></span>
                <span>${guests || '1'} personne(s)</span>
              </div>
              
              <div class="booking-detail">
                <span><strong>💰 Total</strong></span>
                <span>${totalPrice || '0'} FCFA</span>
              </div>
            </div>
            
            <div class="info-box">
              <strong>ℹ️ Prochaines étapes :</strong><br>
              1. Vous recevrez les coordonnées de votre hôte 24h avant votre arrivée<br>
              2. Préparez vos documents d'identité<br>
              3. En cas de question, contactez votre hôte via la messagerie Ikasso
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ikasso-pwxa.vercel.app/dashboard/bookings/${bookingId}" class="button">Voir ma réservation</a>
            </div>
            
            <p style="margin-top: 30px;">
              <strong>Besoin d'aide ?</strong><br>
              Notre équipe est disponible 24/7 :<br>
              📧 <a href="mailto:support@ikasso.ml" style="color: #E85D04;">support@ikasso.ml</a><br>
              💬 <a href="mailto:contact@ikasso.ml" style="color: #E85D04;">contact@ikasso.ml</a>
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              Bon séjour !<br>
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
        from: 'Ikasso <noreply@ikasso.ml>',
        to: [email],
        subject: `✅ Réservation confirmée #${bookingId} - Ikasso`,
        html: htmlContent,
      })

      if (error) {
        console.error('❌ Erreur Resend:', error)
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }

      console.log('✅ Email de confirmation envoyé:', data?.id, 'à', email)

      return NextResponse.json({ 
        success: true, 
        message: 'Email de confirmation envoyé avec succès',
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







