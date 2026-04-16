import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml, safeError } from '../../lib/api-auth'
import { emailRateLimit } from '../../lib/rate-limit'

export const runtime = 'nodejs'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await emailRateLimit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Trop de requetes, reessayez plus tard' }, { status: 429 })
  }

  try {
    if (!resend) {
      return NextResponse.json({ success: false, message: 'Email service not configured' }, { status: 503 })
    }
    const { email, name, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'Email et code requis' },
        { status: 400 }
      )
    }

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <!-- Header with logo -->
  <tr><td style="background:linear-gradient(135deg,#E85D04,#F77F00);padding:40px 40px 30px;text-align:center;">
    <span style="font-size:24px;font-weight:700;color:#fff;">Ikasso</span>
    <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">Plateforme de reservation au Mali</p>
  </td></tr>
  <!-- Content -->
  <tr><td style="padding:40px;">
    <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Code de verification</h1>
    <p style="margin:0 0 24px;color:#666;font-size:15px;">Bonjour <strong>${escapeHtml(name || '')}</strong>, voici votre code pour verifier votre adresse email :</p>

    <div style="background:#FFF7ED;border:2px solid #E85D04;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <div style="font-size:38px;font-weight:bold;letter-spacing:10px;color:#E85D04;font-family:'Courier New',monospace;">${code}</div>
      <p style="margin:12px 0 0;color:#92400E;font-size:13px;">Valable pendant 15 minutes</p>
    </div>

    <p style="color:#666;font-size:14px;line-height:1.6;">Si vous n'avez pas demande ce code, ignorez simplement cet email.</p>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#FAFAFA;padding:24px 40px;border-top:1px solid #f0f0f0;text-align:center;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">Ikasso Mali - ikasso.ml</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`

    try {
      // Envoyer avec Resend
      const { data, error } = await resend.emails.send({
        from: 'Ikasso <noreply@ikasso.ml>',
        to: [email],
        subject: '🔐 Votre code de vérification Ikasso',
        html: htmlContent,
      })

      if (error) {
        console.error('❌ Erreur Resend:', error)
        return NextResponse.json(
          { success: false, message: safeError(error) },
          { status: 400 }
        )
      }

      console.log('✅ Email envoyé:', data?.id, 'à', email)

      return NextResponse.json({ 
        success: true, 
        message: 'Email envoyé avec succès',
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
