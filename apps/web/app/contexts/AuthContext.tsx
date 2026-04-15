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

        // If URL has hash fragment (OAuth redirect), let Supabase process it first
        if (window.location.hash && window.location.hash.includes('access_token')) {
          // Wait for Supabase to process the hash
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            refreshUser()
          }
        } else {
          refreshUser()
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, _session: any) => {
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
