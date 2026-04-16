import { getStorageMode } from './config'
import { isSupabaseConfigured } from '../supabase/client'

export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected'

export type DocumentType = 'nina' | 'passport' | 'id_card' | 'driver_license'

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

async function uploadFileViaAPI(
  userId: string,
  timestamp: string,
  fileKey: string,
  file: File
): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)
    formData.append('fileKey', fileKey)
    formData.append('timestamp', timestamp)

    // Add auth token for the upload
    let headers: Record<string, string> = {}
    try {
      const { isSupabaseConfigured, createClient } = await import('../supabase/client')
      if (isSupabaseConfigured()) {
        const sb = createClient()
        const { data: { session } } = await sb.auth.getSession()
        if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      }
    } catch {}

    const response = await fetch('/api/upload/identity', {
      method: 'POST',
      headers,
      body: formData,
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      console.error(`Upload error for ${fileKey}:`, result.error)
      return null
    }

    return result.url || result.path || fileKey
  } catch (err: any) {
    console.error(`Upload error for ${fileKey}:`, err.message)
    return null
  }
}

export async function submitVerification(
  data: VerificationSubmission
): Promise<{ success: boolean; error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    try {
      const { createClient } = await import('../supabase/client')
      const supabase = createClient()

      const timestamp = String(Date.now())

      // Upload all files via server-side API route (bypasses Storage RLS)
      const [docFrontUrl, docBackUrl, faceFrontUrl, faceLeftUrl, faceRightUrl] =
        await Promise.all([
          uploadFileViaAPI(data.userId, timestamp, 'document_front', data.documentFront),
          uploadFileViaAPI(data.userId, timestamp, 'document_back', data.documentBack),
          uploadFileViaAPI(data.userId, timestamp, 'face_front', data.faceFront),
          uploadFileViaAPI(data.userId, timestamp, 'face_left', data.faceLeft),
          uploadFileViaAPI(data.userId, timestamp, 'face_right', data.faceRight),
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
