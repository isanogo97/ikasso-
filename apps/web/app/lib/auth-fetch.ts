import { createClient, isSupabaseConfigured } from './supabase/client'

/**
 * Authenticated fetch: adds Supabase Bearer token to requests.
 * Use this for any API call that requires authentication.
 */
export async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = { ...(options?.headers as Record<string, string> || {}) }

  try {
    if (isSupabaseConfigured()) {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
    }
  } catch {}

  return fetch(url, { ...options, headers })
}
