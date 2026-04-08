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
    const logoUrl = 'https://ikasso.ml/images/logos/ikasso-logo-800.png'
    const dashboardUrl = isHost ? 'https://ikasso.ml/dashboard/host' : 'https://ikasso.ml/search'

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#E85D04,#F77F00);padding:48px 40px 36px;text-align:center;">
    <img src="${logoUrl}" alt="Ikasso" width="220" style="display:block;margin:0 auto 16px;filter:brightness(0) invert(1);" />
    <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">Bienvenue, ${name} !</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:15px;">Votre compte a bien ete cree</p>
  </td></tr>
  <!-- Content -->
  <tr><td style="padding:40px;">
    <p style="margin:0 0 20px;color:#444;font-size:15px;line-height:1.7;">
      ${isHost
        ? "Votre espace hote est pret. Vous pouvez des maintenant ajouter vos proprietes et commencer a recevoir des reservations."
        : "Vous pouvez maintenant parcourir les hebergements disponibles au Mali et effectuer vos premieres reservations."
      }
    </p>

    ${isHost ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#FFF7ED;border-radius:10px;padding:16px 20px;border-left:4px solid #E85D04;">
        <strong style="color:#9A3412;">Creer vos annonces</strong><br/>
        <span style="color:#78350F;font-size:13px;">Ajoutez vos logements avec photos, prix et disponibilites.</span>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#FFF7ED;border-radius:10px;padding:16px 20px;border-left:4px solid #E85D04;">
        <strong style="color:#9A3412;">Gerer vos reservations</strong><br/>
        <span style="color:#78350F;font-size:13px;">Suivez vos revenus et gerez vos disponibilites.</span>
      </td></tr>
    </table>
    ` : `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#FFF7ED;border-radius:10px;padding:16px 20px;border-left:4px solid #E85D04;">
        <strong style="color:#9A3412;">Decouvrir des logements</strong><br/>
        <span style="color:#78350F;font-size:13px;">Hotels, maisons et appartements dans tout le Mali.</span>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#FFF7ED;border-radius:10px;padding:16px 20px;border-left:4px solid #E85D04;">
        <strong style="color:#9A3412;">Reserver en toute securite</strong><br/>
        <span style="color:#78350F;font-size:13px;">Paiements securises via Orange Money et carte bancaire.</span>
      </td></tr>
    </table>
    `}

    <div style="text-align:center;margin:32px 0;">
      <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#E85D04,#F77F00);color:#fff;padding:14px 36px;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
        ${isHost ? "Acceder a mon espace hote" : "Decouvrir les logements"}
      </a>
    </div>

    <p style="color:#999;font-size:13px;line-height:1.6;">
      Besoin d'aide ? Contactez-nous a <a href="mailto:support@ikasso.ml" style="color:#E85D04;">support@ikasso.ml</a>
    </p>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#FAFAFA;padding:24px 40px;border-top:1px solid #f0f0f0;text-align:center;">
    <img src="${logoUrl}" alt="Ikasso" width="100" style="display:block;margin:0 auto 12px;opacity:0.5;" />
    <p style="margin:0;color:#999;font-size:12px;">&copy; ${new Date().getFullYear()} Ikasso Mali. Tous droits reserves.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`

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

