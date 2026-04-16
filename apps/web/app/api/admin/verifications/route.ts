import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Fetch pending verifications with user profile info
    const { data, error } = await supabase
      .from('identity_verifications')
      .select(`
        id,
        user_id,
        document_type,
        document_front_url,
        document_back_url,
        face_front_url,
        face_left_url,
        face_right_url,
        status,
        rejection_reason,
        submitted_at,
        created_at
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch verifications error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch profile info for each user
    const userIds = Array.from(new Set((data || []).map((v: any) => v.user_id)))
    let profiles: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds)

      if (profileData) {
        for (const p of profileData) {
          profiles[p.id] = p
        }
      }
    }

    // Generate signed URLs for documents
    const enriched = await Promise.all(
      (data || []).map(async (v: any) => {
        const urls: Record<string, string | null> = {}

        for (const field of ['document_front_url', 'document_back_url', 'face_front_url', 'face_left_url', 'face_right_url']) {
          const storedValue = v[field]
          if (storedValue) {
            // If it's already a signed URL, use it; otherwise generate one
            if (storedValue.startsWith('http')) {
              urls[field] = storedValue
            } else {
              // It's a storage path, generate signed URL
              const { data: signedData } = await supabase.storage
                .from('identity-docs')
                .createSignedUrl(storedValue, 60 * 60 * 24) // 24h
              urls[field] = signedData?.signedUrl || null
            }
          } else {
            urls[field] = null
          }
        }

        const profile = profiles[v.user_id]
        return {
          ...v,
          ...urls,
          profiles: profile ? {
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
          } : null,
        }
      })
    )

    return NextResponse.json({ verifications: enriched })
  } catch (err: any) {
    console.error('Admin verifications error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
