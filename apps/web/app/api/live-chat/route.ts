import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../lib/supabase/admin'
import { getAuthenticatedUser, safeError } from '../../lib/api-auth'

// GET: load chat history for authenticated user
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ messages: [], isAuthenticated: false })

  try {
    const supabase = createAdminClient()

    // Find or create a "live-chat" incident for this user
    const { data: existing } = await supabase
      .from('incidents')
      .select('id')
      .eq('user_id', user.id)
      .eq('subject', '[Live Chat] Support')
      .in('status', ['open', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!existing) return NextResponse.json({ messages: [], isAuthenticated: true, incidentId: null })

    // Get messages
    const { data: messages } = await supabase
      .from('incident_messages')
      .select('*')
      .eq('incident_id', existing.id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      messages: messages || [],
      isAuthenticated: true,
      incidentId: existing.id,
      userId: user.id
    })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}

// POST: send a message
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { message, name, email } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 })
    }

    const user = await getAuthenticatedUser(req)
    const isAuthenticated = !!user

    let incidentId = body.incidentId
    let userId = user?.id

    // If no existing incident, create one
    if (!incidentId) {
      // For authenticated users, use their profile
      if (isAuthenticated) {
        // Check for existing open chat
        const { data: existing } = await supabase
          .from('incidents')
          .select('id')
          .eq('user_id', userId)
          .eq('subject', '[Live Chat] Support')
          .in('status', ['open', 'pending'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (existing) {
          incidentId = existing.id
        } else {
          const { data: incident } = await supabase
            .from('incidents')
            .insert({
              user_id: userId,
              subject: '[Live Chat] Support',
              status: 'open',
              created_by_admin: null,
            })
            .select()
            .single()
          incidentId = incident?.id
        }
      } else {
        // Anonymous user - cannot create incident due to FK constraints
        // Return a message directing them to sign up or email support
        return NextResponse.json({
          success: true,
          message: 'Message recu. Contactez-nous a support@ikasso.ml pour un suivi.',
          isAuthenticated: false
        })
      }
    }

    if (!incidentId) {
      return NextResponse.json({ error: 'Impossible de creer la conversation' }, { status: 500 })
    }

    // Add message
    await supabase.from('incident_messages').insert({
      incident_id: incidentId,
      sender_type: 'user',
      sender_name: name || user?.email || 'Utilisateur',
      content: message.trim(),
      email_sent: false,
    })

    // Update incident timestamp
    await supabase
      .from('incidents')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', incidentId)

    // Get updated messages
    const { data: messages } = await supabase
      .from('incident_messages')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      success: true,
      incidentId,
      messages: messages || [],
      isAuthenticated
    })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
