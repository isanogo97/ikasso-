import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: NextRequest) {
  try {
    if (!resend) {
      return NextResponse.json({ error: 'Service email non configure' }, { status: 500 })
    }

    const { to, subject, message, senderName } = await req.json()

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Destinataire, sujet et message requis' }, { status: 400 })
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="background:linear-gradient(135deg,#c2410c,#ea580c);padding:28px 32px;text-align:center;">
            <img src="https://ikasso.ml/images/logos/ikasso-logo-800.png" alt="Ikasso" style="height:40px;" />
          </div>
          <div style="padding:32px;">
            <h2 style="color:#111827;font-size:20px;margin:0 0 16px;">${subject}</h2>
            <div style="color:#374151;font-size:15px;line-height:1.7;white-space:pre-wrap;">${message}</div>
          </div>
          <div style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              ${senderName ? `Envoye par ${senderName} - ` : ''}Equipe Ikasso<br/>
              <a href="https://ikasso.ml" style="color:#c2410c;text-decoration:none;">ikasso.ml</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const { error } = await resend.emails.send({
      from: 'Ikasso <noreply@ikasso.ml>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html: htmlContent,
    })

    if (error) {
      console.error('Send email error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin send email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
