import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAuth } from '../../../lib/api-auth'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const BUCKET = 'avatars'
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireAuth(req)
  if (authError) return authError

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string | null

    if (!file || !userId) {
      return NextResponse.json({ error: 'Fichier et userId requis' }, { status: 400 })
    }

    // Verify the userId matches the authenticated user to prevent impersonation
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorise. Seuls JPEG, PNG et WebP sont acceptes.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((b: any) => b.name === BUCKET)
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_SIZE,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      })
    }

    // Upload file
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const avatarUrl = urlData.publicUrl + '?t=' + Date.now()

    // Update profile in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
    }

    return NextResponse.json({ success: true, avatarUrl })
  } catch (err: any) {
    console.error('Avatar upload error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
