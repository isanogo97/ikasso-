import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'

const BUCKET = 'identity-docs'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string | null
    const fileKey = formData.get('fileKey') as string | null
    const timestamp = formData.get('timestamp') as string | null

    if (!file || !userId || !fileKey || !timestamp) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10 Mo)' },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Seules les images sont acceptees' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Ensure bucket exists (create if not)
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((b: any) => b.name === BUCKET)
    if (!bucketExists) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
        public: false,
        fileSizeLimit: MAX_SIZE,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
      })
      if (createErr && !createErr.message.includes('already exists')) {
        console.error('Bucket creation error:', createErr)
        return NextResponse.json(
          { error: 'Erreur de configuration du stockage' },
          { status: 500 }
        )
      }
    }

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/${timestamp}/${fileKey}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error(`Upload error for ${path}:`, uploadError)
      return NextResponse.json(
        { error: `Echec upload: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get the URL (signed URL for private bucket)
    const { data: urlData } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year

    const url = urlData?.signedUrl || path

    return NextResponse.json({ success: true, url, path })
  } catch (err: any) {
    console.error('Upload identity error:', err)
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
