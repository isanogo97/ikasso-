import { getStorageMode } from './config'
import { isSupabaseConfigured } from '../supabase/client'

export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected'

export type DocumentType = 'nina' | 'passport' | 'carte_identite' | 'permis_conduire'

export interface VerificationResult {
  verified: boolean
  status: VerificationStatus
  submittedAt?: string
  reviewedAt?: string
  rejectionReason?: string
}

export interface VerificationSubmission {
  userId: string
  documentType: DocumentType
  documentFront: File
  documentBack: File
  faceFront: File
  faceLeft: File
  faceRight: File
}

const LOCAL_STORAGE_KEY = 'ikasso_verification'

function getLocalVerifications(): Record<string, { status: VerificationStatus; submittedAt: string }> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveLocalVerification(userId: string, status: VerificationStatus): void {
  const verifications = getLocalVerifications()
  verifications[userId] = { status, submittedAt: new Date().toISOString() }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(verifications))
}

export async function getVerificationStatus(userId: string): Promise<VerificationResult> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    try {
      const { createClient } = await import('../supabase/client')
      const supabase = createClient()

      const { data, error } = await supabase
        .from('identity_verifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        return { verified: false, status: 'none' }
      }

      return {
        verified: data.status === 'approved',
        status: data.status as VerificationStatus,
        submittedAt: data.created_at,
        reviewedAt: data.reviewed_at || undefined,
        rejectionReason: data.rejection_reason || undefined,
      }
    } catch {
      return { verified: false, status: 'none' }
    }
  }

  // localStorage fallback
  const verifications = getLocalVerifications()
  const record = verifications[userId]
  if (!record) {
    return { verified: false, status: 'none' }
  }
  return {
    verified: record.status === 'approved',
    status: record.status,
    submittedAt: record.submittedAt,
  }
}

export async function isVerified(userId: string): Promise<boolean> {
  const result = await getVerificationStatus(userId)
  return result.verified
}

async function uploadFile(
  supabase: any,
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    console.error(`Upload error for ${path}:`, error.message)
    return null
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return urlData?.publicUrl || null
}

export async function submitVerification(
  data: VerificationSubmission
): Promise<{ success: boolean; error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    try {
      const { createClient } = await import('../supabase/client')
      const supabase = createClient()

      const bucket = 'identity-docs'
      const basePath = `${data.userId}/${Date.now()}`

      // Upload all files in parallel
      const [docFrontUrl, docBackUrl, faceFrontUrl, faceLeftUrl, faceRightUrl] =
        await Promise.all([
          uploadFile(supabase, bucket, `${basePath}/document_front`, data.documentFront),
          uploadFile(supabase, bucket, `${basePath}/document_back`, data.documentBack),
          uploadFile(supabase, bucket, `${basePath}/face_front`, data.faceFront),
          uploadFile(supabase, bucket, `${basePath}/face_left`, data.faceLeft),
          uploadFile(supabase, bucket, `${basePath}/face_right`, data.faceRight),
        ])

      const failedUploads = [
        !docFrontUrl && 'document recto',
        !docBackUrl && 'document verso',
        !faceFrontUrl && 'photo face',
        !faceLeftUrl && 'photo gauche',
        !faceRightUrl && 'photo droite',
      ].filter(Boolean)

      if (failedUploads.length > 0) {
        return {
          success: false,
          error: `Echec du telechargement: ${failedUploads.join(', ')}`,
        }
      }

      const { error: insertError } = await supabase
        .from('identity_verifications')
        .insert({
          user_id: data.userId,
          document_type: data.documentType,
          document_front_url: docFrontUrl,
          document_back_url: docBackUrl,
          face_front_url: faceFrontUrl,
          face_left_url: faceLeftUrl,
          face_right_url: faceRightUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
        })

      if (insertError) {
        return { success: false, error: insertError.message }
      }

      return { success: true, error: null }
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur inconnue' }
    }
  }

  // localStorage fallback
  saveLocalVerification(data.userId, 'pending')
  return { success: true, error: null }
}
