import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Check all verifications (any status)
    const { data, error, count } = await supabase
      .from('identity_verifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10)

    // Check bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketNames = buckets?.map((b: any) => b.name) || []

    // Check files in bucket
    let files: any[] = []
    try {
      const { data: fileData } = await supabase.storage
        .from('identity-docs')
        .list('', { limit: 20 })
      files = fileData || []
    } catch (e: any) {
      files = [{ error: e.message }]
    }

    return NextResponse.json({
      totalVerifications: count,
      verifications: data,
      error: error?.message || null,
      buckets: bucketNames,
      filesInBucket: files,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
