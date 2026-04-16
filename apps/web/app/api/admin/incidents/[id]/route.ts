import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../../lib/supabase/admin'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const incidentId = params.id

    // Get incident
    const { data: incident, error: incErr } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single()

    if (incErr || !incident) {
      return NextResponse.json({ error: 'Incident non trouve' }, { status: 404 })
    }

    // Get messages
    const { data: messages } = await supabase
      .from('incident_messages')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true })

    // Get user info
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('id', incident.user_id)
      .single()

    let userEmail = profile?.email
    if (!userEmail) {
      const { data: authUser } = await supabase.auth.admin.getUserById(incident.user_id)
      userEmail = authUser?.user?.email
    }

    return NextResponse.json({
      incident: {
        ...incident,
        user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Inconnu',
        user_email: userEmail || '-',
      },
      messages: messages || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const incidentId = params.id
    const body = await req.json()
    const { status, adminName } = body

    const updates: any = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (status === 'closed') updates.closed_at = new Date().toISOString()

    const { error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', incidentId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add system message for status change
    const statusLabels: Record<string, string> = {
      open: 'ouvert',
      pending: 'en attente',
      on_hold: 'en pause',
      closed: 'cloture',
    }
    await supabase.from('incident_messages').insert({
      incident_id: incidentId,
      sender_type: 'system',
      sender_name: adminName || 'Systeme',
      content: `Statut change en "${statusLabels[status] || status}" par ${adminName || 'admin'}`,
      email_sent: false,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const incidentId = params.id
    const { message, adminName, sendEmail, userEmail, subject } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 })
    }

    // Add message
    const { error } = await supabase.from('incident_messages').insert({
      incident_id: incidentId,
      sender_type: 'admin',
      sender_name: adminName || 'Admin',
      content: message,
      email_sent: !!sendEmail,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update incident timestamp
    await supabase
      .from('incidents')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', incidentId)

    // Send email if requested
    if (sendEmail && userEmail) {
      try {
        const { Resend } = await import('resend')
        const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
        if (resend) {
          await resend.emails.send({
            from: 'Ikasso <noreply@ikasso.ml>',
            to: [userEmail],
            subject: subject ? `Re: ${subject}` : 'Message de Ikasso',
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                <div style="background:linear-gradient(135deg,#c2410c,#ea580c);padding:28px 32px;text-align:center;">
                  <span style="font-size:24px;font-weight:700;color:#fff;">Ikasso</span>
                </div>
                <div style="padding:32px;">
                  <div style="color:#374151;font-size:15px;line-height:1.7;white-space:pre-wrap;">${message}</div>
                  <p style="margin-top:24px;color:#6b7280;font-size:13px;">Pour repondre, contactez-nous a support@ikasso.ml</p>
                </div>
                <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                  <p style="color:#9ca3af;font-size:12px;margin:0;">Equipe Ikasso - ikasso.ml</p>
                </div>
              </div>
            `,
          })
        }
      } catch {}
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
