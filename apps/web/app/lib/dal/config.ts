import { isSupabaseConfigured } from '../supabase/client'

export type StorageMode = 'supabase' | 'localStorage'

export function getStorageMode(): StorageMode {
  if (typeof window === 'undefined') return 'localStorage'
  return isSupabaseConfigured() ? 'supabase' : 'localStorage'
}

export function isServer(): boolean {
  return typeof window === 'undefined'
}
