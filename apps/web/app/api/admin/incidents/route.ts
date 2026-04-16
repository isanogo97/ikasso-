import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin, escapeHtml, safeError } from '../../../lib/api-auth'

const createIncidentSchema = z.object({
  userId: z.string().uuid(),
  subject: z.string().min(1).max(500),
  message: z.string().max(5000).optional(),
  adminName: z.string().max(200).optional(),
  sendEmail: z.boolean().optional(),
  userEmail: z.string().email().optional(),
})

export async function GET(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const statusFilter = req.nextUrl.searchParams.get('status')
    const userId = req.nextUrl.searchParams.get('userId')

    let query = supabase
      .from('incidents')
      .select('*')
      .order('updated_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      if (error.message.includes('does not exist')) {
        return NextResponse.json({ incidents: [], needsMigration: true })
      }
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    // Enrich with user info
    const userIds = Array.from(new Set((data || []).map((i: any) => i.user_id)))
    const profiles: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds)
      if (profileData) {
        for (const p of profileData) profiles[p.id] = p
      }
      // Fallback to auth.users for missing emails
      for (const uid of userIds) {
        if (!profiles[uid]?.email) {
          const { data: authUser } = await supabase.auth.admin.getUserById(uid as string)
          if (authUser?.user) {
            if (!profiles[uid]) profiles[uid] = { id: uid }
            profiles[uid].email = authUser.user.email
            if (!profiles[uid].first_name) {
              profiles[uid].first_name = authUser.user.user_metadata?.first_name || ''
              profiles[uid].last_name = authUser.user.user_metadata?.last_name || ''
            }
          }
        }
      }
    }

    // Count messages per incident
    const incidentIds = (data || []).map((i: any) => i.id)
    let messageCounts: Record<string, number> = {}
    if (incidentIds.length > 0) {
      const { data: msgData } = await supabase
        .from('incident_messages')
        .select('incident_id')
        .in('incident_id', incidentIds)
      if (msgData) {
        for (const m of msgData) {
          messageCounts[m.incident_id] = (messageCounts[m.incident_id] || 0) + 1
        }
      }
    }

    const enriched = (data || []).map((i: any) => {
      const profile = profiles[i.user_id]
      return {
        ...i,
        user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Inconnu' : 'Inconnu',
        user_email: profile?.email || '-',
        message_count: messageCounts[i.id] || 0,
      }
    })

    return NextResponse.json({ incidents: enriched })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const body = await req.json()

    const parsed = createIncidentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message || 'Donnees invalides' }, { status: 400 })
    }
    const { userId, subject, message, adminName, sendEmail, userEmail } = parsed.data

    // Create incident
    const { data: incident, error: incErr } = await supabase
      .from('incidents')
      .insert({
        user_id: userId,
        subject,
        status: 'open',
        created_by_admin: adminName || 'Admin',
      })
      .select()
      .single()

    if (incErr) {
      return NextResponse.json({ error: safeError(incErr) }, { status: 500 })
    }

    // Add first message
    if (message) {
      await supabase.from('incident_messages').insert({
        incident_id: incident.id,
        sender_type: 'admin',
        sender_name: adminName || 'Admin',
        content: message,
        email_sent: !!sendEmail,
      })
    }

    // Send email if requested
    if (sendEmail && userEmail && message) {
      try {
        const { Resend } = await import('resend')
        const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
        if (resend) {
          await resend.emails.send({
            from: 'Ikasso <noreply@ikasso.ml>',
            to: [userEmail],
            subject,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                <div style="background:linear-gradient(135deg,#c2410c,#ea580c);padding:28px 32px;text-align:center;">
                  <span style="font-size:24px;font-weight:700;color:#fff;">Ikasso</span>
                </div>
                <div style="padding:32px;">
                  <h2 style="color:#111827;font-size:18px;margin:0 0 16px;">${escapeHtml(subject)}</h2>
                  <div style="color:#374151;font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</div>
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

    return NextResponse.json({ success: true, incident })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
