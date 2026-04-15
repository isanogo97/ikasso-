'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getCurrentUser, signIn as dalSignIn, signUp as dalSignUp, signOut as dalSignOut, updateProfile as dalUpdateProfile, signInWithOAuth as dalSignInWithOAuth } from '../lib/dal'
import type { UserProfile } from '../lib/dal'
import { isSupabaseConfigured } from '../lib/supabase/client'
import type { RegisterInput, ProfileUpdateInput } from '../lib/validations'

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (data: RegisterInput) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<ProfileUpdateInput>) => Promise<{ error: string | null }>
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: string | null }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Subscribe to Supabase auth changes when configured
    if (isSupabaseConfigured()) {
      import('../lib/supabase/client').then(async ({ createClient }) => {
        const supabase = createClient()

        // Process OAuth hash fragments and get session
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Clean up URL hash if present
          if (window.location.hash && window.location.hash.includes('access_token')) {
            window.history.replaceState(null, '', window.location.pathname)
          }
        }
        // Always refresh - will use localStorage fallback if no Supabase session
        await refreshUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, _session: any) => {
          if (_event === 'SIGNED_IN' && _session?.user) {
            // After OAuth sign in, update profile with Apple/Google data
            const meta = _session.user.user_metadata || {}
            const profileData: Record<string, any> = {}
            if (meta.full_name) {
              const parts = meta.full_name.split(' ')
              profileData.first_name = parts[0] || ''
              profileData.last_name = parts.slice(1).join(' ') || ''
            } else if (meta.name) {
              const parts = meta.name.split(' ')
              profileData.first_name = parts[0] || ''
              profileData.last_name = parts.slice(1).join(' ') || ''
            }
            if (meta.email) profileData.email = meta.email

            // Update profile in Supabase if we have data
            if (Object.keys(profileData).length > 0) {
              const hasName = profileData.first_name && profileData.first_name.length > 0
              if (hasName) {
                await supabase.from('profiles').update(profileData).eq('id', _session.user.id)
              }
            }

            // Also update localStorage for immediate use
            const localUser = {
              id: _session.user.id,
              email: _session.user.email || meta.email || '',
              firstName: profileData.first_name || meta.full_name?.split(' ')[0] || '',
              lastName: profileData.last_name || meta.full_name?.split(' ').slice(1).join(' ') || '',
              userType: 'client',
              status: 'active',
              memberSince: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
            }
            localStorage.setItem('ikasso_user', JSON.stringify(localUser))
          }
          refreshUser()
        })
        return () => subscription.unsubscribe()
      })
    } else {
      refreshUser()
      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'ikasso_user') refreshUser()
      }
      window.addEventListener('storage', handleStorage)
      return () => window.removeEventListener('storage', handleStorage)
    }
  }, [refreshUser])

  const signIn = async (email: string, password: string) => {
    const result = await dalSignIn(email, password)
    if (result.user) setUser(result.user)
    return { error: result.error }
  }

  const signUp = async (data: RegisterInput) => {
    const result = await dalSignUp(data)
    if (result.user) setUser(result.user)
    return { error: result.error }
  }

  const signOut = async () => {
    await dalSignOut()
    setUser(null)
  }

  const updateProfile = async (data: Partial<ProfileUpdateInput>) => {
    const result = await dalUpdateProfile(data)
    if (!result.error) await refreshUser()
    return result
  }

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    return dalSignInWithOAuth(provider)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      updateProfile,
      signInWithOAuth,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
