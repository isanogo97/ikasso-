import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()

    // Get sponsor info
    const { data: sponsor } = await supabase.from('sponsors').select('*').eq('id', params.id).single()
    if (!sponsor) return NextResponse.json({ error: 'Sponsor non trouve' }, { status: 404 })

    // Generate invoice number
    const year = new Date().getFullYear()
    const { count } = await supabase.from('ad_transactions').select('id', { count: 'exact', head: true }).eq('type', 'facture')
    const invoiceNumber = `IK-PUB-${year}-${String((count || 0) + 1).padStart(4, '0')}`

    const amount = body.amount || sponsor.amount_paid || 0
    const planLabels: Record<string, string> = { standard: 'Standard', premium: 'Premium', elite: 'Elite' }

    // Create transaction record
    await supabase.from('ad_transactions').insert({
      sponsor_id: params.id,
      type: 'facture',
      amount,
      invoice_number: invoiceNumber,
      description: `Facture publicite - Formule ${planLabels[sponsor.plan] || sponsor.plan}`,
      status: 'pending',
      created_by: body.created_by || 'Admin',
    })

    // Send invoice email
    const email = body.email || sponsor.contact_email
    if (email) {
      try {
        const { Resend } = await import('resend')
        const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
        if (resend) {
          const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
          await resend.emails.send({
            from: 'Ikasso <noreply@ikasso.ml>',
            to: [email],
            subject: `Facture ${invoiceNumber} - Ikasso Publicite`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                <div style="background:linear-gradient(135deg,#c2410c,#ea580c);padding:28px 32px;text-align:center;">
                  <span style="font-size:24px;font-weight:700;color:#fff;">Ikasso</span>
                </div>
                <div style="padding:32px;">
                  <h2 style="color:#111;margin:0 0 8px;">Facture ${invoiceNumber}</h2>
                  <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Date : ${today}</p>
                  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                    <tr style="background:#f9fafb;">
                      <td style="padding:12px;border:1px solid #e5e7eb;font-size:14px;font-weight:600;">Client</td>
                      <td style="padding:12px;border:1px solid #e5e7eb;font-size:14px;">${sponsor.business_name}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px;border:1px solid #e5e7eb;font-size:14px;font-weight:600;">Contact</td>
                      <td style="padding:12px;border:1px solid #e5e7eb;font-size:14px;">${sponsor.contact_name || '-'}</td>
                    </tr>
                    <tr style="background:#f9fafb;">
                      <td style="padding:12px;border:1px solid #e5e7eb;font-size:14px;font-weight:600;">Formule</td>
                      <td style="padding:12px;border:1px solid #e5e7eb;font-size:14px;">${planLabels[sponsor.plan] || sponsor.plan}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px;border:1px solid #e5e7eb;font-size:14px;font-weight:600;">Periode</td>
                      <td style="padding:12px;border:1px solid #e5e7eb;font-size:14px;">Du ${new Date(sponsor.start_date).toLocaleDateString('fr-FR')} au ${new Date(sponsor.end_date).toLocaleDateString('fr-FR')}</td>
                    </tr>
                    <tr style="background:#f9fafb;">
                      <td style="padding:12px;border:1px solid #e5e7eb;font-size:14px;font-weight:700;">Montant</td>
                      <td style="padding:12px;border:1px solid #e5e7eb;font-size:18px;font-weight:700;color:#c2410c;">${amount.toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                  </table>
                  <p style="color:#6b7280;font-size:13px;">Pour effectuer le paiement, contactez-nous a support@ikasso.ml ou par Orange Money.</p>
                </div>
                <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                  <p style="color:#9ca3af;font-size:12px;margin:0;">Ikasso Mali - ikasso.ml | support@ikasso.ml</p>
                </div>
              </div>
            `,
          })
        }
      } catch {}
    }

    return NextResponse.json({ success: true, invoiceNumber })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
