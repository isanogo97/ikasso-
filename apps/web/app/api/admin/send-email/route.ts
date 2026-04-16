import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { requireAdmin, rateLimit, escapeHtml, safeError } from '../../../lib/api-auth'

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1).max(500),
  message: z.string().min(1).max(10000),
  senderName: z.string().max(200).optional(),
})

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!rateLimit(`email-${ip}`, 5, 60000)) {
    return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 })
  }

  try {
    if (!resend) {
      return NextResponse.json({ error: 'Service email non configure' }, { status: 500 })
    }

    const body = await req.json()

    const parsed = sendEmailSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message || 'Donnees invalides' }, { status: 400 })
    }
    const { to, subject, message, senderName } = parsed.data

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="background:linear-gradient(135deg,#c2410c,#ea580c);padding:28px 32px;text-align:center;">
            <span style="font-size:24px;font-weight:700;color:#fff;">Ikasso</span>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#111827;font-size:20px;margin:0 0 16px;">${escapeHtml(subject)}</h2>
            <div style="color:#374151;font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</div>
          </div>
          <div style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              ${senderName ? `Envoye par ${escapeHtml(senderName)} - ` : ''}Equipe Ikasso<br/>
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
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin send email error:', err)
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
