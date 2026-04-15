import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    if (!resend) {
      return NextResponse.json({ success: false, message: 'Email service not configured' }, { status: 503 })
    }
    const { email, name, status, reason } = await request.json()

    if (!email || !status) {
      return NextResponse.json({ success: false, message: 'Email et statut requis' }, { status: 400 })
    }

    const logoUrl = 'https://ikasso.ml/images/logos/ikasso-logo-800.png'

    const statusConfig: Record<string, { subject: string; title: string; message: string; color: string }> = {
      approved: {
        subject: 'Votre compte Ikasso est verifie !',
        title: 'Compte verifie',
        message: 'Votre identite a ete verifiee avec succes. Vous pouvez maintenant effectuer des reservations et proposer des logements sur Ikasso.',
        color: '#16a34a',
      },
      rejected: {
        subject: 'Verification de votre compte Ikasso',
        title: 'Verification refusee',
        message: `Votre demande de verification a ete refusee.${reason ? `<br/><br/><strong>Motif :</strong> ${reason}` : ''}<br/><br/>Vous pouvez soumettre une nouvelle demande avec des documents valides.`,
        color: '#dc2626',
      },
      pending: {
        subject: 'Verification en cours - Ikasso',
        title: 'Verification en cours',
        message: `Votre demande de verification est en cours d'examen.${reason ? `<br/><br/><strong>Note :</strong> ${reason}` : ''}<br/><br/>Vous recevrez un email lorsque la verification sera terminee (delai 48h maximum).`,
        color: '#d97706',
      },
      suspended: {
        subject: 'Information importante - Ikasso',
        title: 'Compte suspendu',
        message: `Votre compte Ikasso a ete temporairement suspendu.${reason ? `<br/><br/><strong>Motif :</strong> ${reason}` : ''}<br/><br/>Pour toute question, contactez-nous a support@ikasso.ml.`,
        color: '#dc2626',
      },
      reactivated: {
        subject: 'Votre compte Ikasso est reactive !',
        title: 'Compte reactive',
        message: 'Votre compte Ikasso a ete reactive. Vous pouvez a nouveau utiliser tous les services de la plateforme.',
        color: '#16a34a',
      },
    }

    const config = statusConfig[status] || statusConfig.pending

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#E85D04,#F77F00);padding:40px 40px 30px;text-align:center;">
    <img src="${logoUrl}" alt="Ikasso" width="200" style="display:block;margin:0 auto 16px;filter:brightness(0) invert(1);" />
  </td></tr>
  <tr><td style="padding:40px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:60px;height:60px;border-radius:50%;background:${config.color}15;line-height:60px;text-align:center;">
        <span style="font-size:30px;">${status === 'approved' || status === 'reactivated' ? '✓' : status === 'rejected' || status === 'suspended' ? '✗' : '⏳'}</span>
      </div>
    </div>
    <h1 style="margin:0 0 16px;font-size:22px;color:${config.color};text-align:center;">${config.title}</h1>
    <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.7;">Bonjour <strong>${name || ''}</strong>,</p>
    <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.7;">${config.message}</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://ikasso.ml/dashboard" style="display:inline-block;background:linear-gradient(135deg,#E85D04,#F77F00);color:#fff;padding:14px 36px;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
        Acceder a mon compte
      </a>
    </div>
  </td></tr>
  <tr><td style="background:#FAFAFA;padding:24px 40px;border-top:1px solid #f0f0f0;text-align:center;">
    <img src="${logoUrl}" alt="Ikasso" width="100" style="display:block;margin:0 auto 12px;opacity:0.5;" />
    <p style="margin:0;color:#999;font-size:12px;">&copy; ${new Date().getFullYear()} Ikasso Mali</p>
    <p style="margin:4px 0 0;color:#999;font-size:11px;">support@ikasso.ml</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`

    const { data, error } = await resend.emails.send({
      from: 'Ikasso <noreply@ikasso.ml>',
      to: [email],
      subject: config.subject,
      html: htmlContent,
    })

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
