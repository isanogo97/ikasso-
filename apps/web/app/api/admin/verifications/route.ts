import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin, safeError } from '../../../lib/api-auth'

const DOC_TYPE_LABELS: Record<string, string> = {
  nina: 'NINA',
  passport: 'Passeport',
  id_card: "Carte d'identite",
  driver_license: 'Permis de conduire',
}

export async function GET(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()

    // Fetch pending verifications
    const { data, error } = await supabase
      .from('identity_verifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch verifications error:', error)
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    // Fetch profile info for each user
    const userIds = Array.from(new Set((data || []).map((v: any) => v.user_id)))
    const profiles: Record<string, any> = {}

    if (userIds.length > 0) {
      // Get from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, user_type')
        .in('id', userIds)

      if (profileData) {
        for (const p of profileData) {
          profiles[p.id] = p
        }
      }

      // Also get email from auth.users for users missing email in profiles
      for (const uid of userIds) {
        if (!profiles[uid]?.email) {
          const { data: authUser } = await supabase.auth.admin.getUserById(uid)
          if (authUser?.user?.email) {
            if (!profiles[uid]) profiles[uid] = { id: uid }
            profiles[uid].email = authUser.user.email
            // Also grab name from user_metadata if missing
            if (!profiles[uid].first_name) {
              profiles[uid].first_name = authUser.user.user_metadata?.first_name || authUser.user.user_metadata?.name || ''
            }
            if (!profiles[uid].last_name) {
              profiles[uid].last_name = authUser.user.user_metadata?.last_name || ''
            }
          }
        }
      }
    }

    // Re-generate fresh signed URLs for all documents
    const enriched = await Promise.all(
      (data || []).map(async (v: any) => {
        const freshUrls: Record<string, string | null> = {}
        const urlFields = ['document_front_url', 'document_back_url', 'face_front_url', 'face_left_url', 'face_right_url']

        for (const field of urlFields) {
          const storedValue = v[field]
          if (!storedValue) {
            freshUrls[field] = null
            continue
          }

          // Extract the storage path from the URL or use it directly
          let storagePath: string | null = null

          if (storedValue.startsWith('http')) {
            // Extract path from signed URL: /object/sign/bucket/path?token=...
            const match = storedValue.match(/\/identity-docs\/(.+?)(?:\?|$)/)
            if (match) {
              storagePath = match[1]
            }
          } else {
            storagePath = storedValue
          }

          if (storagePath) {
            // Generate a fresh signed URL (24h)
            const { data: signedData } = await supabase.storage
              .from('identity-docs')
              .createSignedUrl(storagePath, 60 * 60 * 24)
            freshUrls[field] = signedData?.signedUrl || storedValue
          } else {
            freshUrls[field] = storedValue
          }
        }

        const profile = profiles[v.user_id]
        const fullName = profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
          : null

        return {
          id: v.id,
          user_id: v.user_id,
          document_type: v.document_type,
          document_type_label: DOC_TYPE_LABELS[v.document_type] || v.document_type,
          status: v.status,
          rejection_reason: v.rejection_reason,
          submitted_at: v.submitted_at,
          created_at: v.created_at,
          ...freshUrls,
          user_name: fullName || 'Utilisateur inconnu',
          user_email: profile?.email || '-',
          user_phone: profile?.phone || null,
          user_type: profile?.user_type || 'client',
        }
      })
    )

    return NextResponse.json({ verifications: enriched })
  } catch (err: any) {
    console.error('Admin verifications error:', err)
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { user, error: authError } = await requireAdmin(req)
  if (authError) return authError

  try {
    const supabase = createAdminClient()
    const { id, status, rejection_reason } = await req.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'ID et statut requis' }, { status: 400 })
    }

    const updates: any = { status }
    if (rejection_reason) updates.rejection_reason = rejection_reason
    if (status === 'approved' || status === 'rejected') {
      updates.reviewed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('identity_verifications')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Update verification error:', error)
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: safeError(err) }, { status: 500 })
  }
}
