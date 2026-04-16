import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const docsFor = req.nextUrl.searchParams.get('docs')

    // If requesting docs for a specific user
    if (docsFor) {
      const { data, error } = await supabase
        .from('identity_verifications')
        .select('*')
        .eq('user_id', docsFor)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Generate fresh signed URLs
      const enriched = await Promise.all(
        (data || []).map(async (v: any) => {
          const urlFields = ['document_front_url', 'document_back_url', 'face_front_url', 'face_left_url', 'face_right_url']
          const freshUrls: Record<string, string | null> = {}

          for (const field of urlFields) {
            const stored = v[field]
            if (!stored) { freshUrls[field] = null; continue }

            if (stored.startsWith('http')) {
              const match = stored.match(/\/identity-docs\/(.+?)(?:\?|$)/)
              if (match) {
                const { data: sd } = await supabase.storage
                  .from('identity-docs')
                  .createSignedUrl(match[1], 60 * 60 * 24)
                freshUrls[field] = sd?.signedUrl || stored
              } else {
                freshUrls[field] = stored
              }
            } else {
              const { data: sd } = await supabase.storage
                .from('identity-docs')
                .createSignedUrl(stored, 60 * 60 * 24)
              freshUrls[field] = sd?.signedUrl || null
            }
          }

          return { ...v, ...freshUrls }
        })
      )

      return NextResponse.json({ docs: enriched })
    }

    // Default: return all users with profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users: profiles || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
