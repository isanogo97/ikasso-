import { getStorageMode } from './config'
import { TEST_ACCOUNTS } from './seed-data'
import type { RegisterInput, ProfileUpdateInput } from '../validations'

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  countryCode: string
  phoneVerified: boolean
  emailVerified: boolean
  dateOfBirth: string
  address: string
  postalCode: string
  city: string
  country: string
  userType: 'client' | 'hote'
  avatar: string | null
  avatarUrl: string | null
  bio: string
  status: string
  memberSince: string
  hostType: string | null
  companyName: string | null
  responseRate: number
  responseTime: string
  createdAt: string
}

function mapSupabaseProfile(profile: any, email: string): UserProfile {
  return {
    id: profile.id,
    email,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    phone: profile.phone || '',
    countryCode: profile.country_code || '+223',
    phoneVerified: profile.phone_verified || false,
    emailVerified: profile.email_verified || false,
    dateOfBirth: profile.date_of_birth || '',
    address: profile.address || '',
    postalCode: profile.postal_code || '',
    city: profile.city || 'Bamako',
    country: profile.country || 'Mali',
    userType: profile.user_type || 'client',
    avatar: profile.avatar_url,
    avatarUrl: profile.avatar_url,
    bio: profile.bio || '',
    status: profile.status || 'active',
    memberSince: profile.member_since || '',
    hostType: profile.host_type,
    companyName: profile.company_name,
    responseRate: profile.response_rate || 0,
    responseTime: profile.response_time || '1 heure',
    createdAt: profile.created_at || new Date().toISOString(),
  }
}

function getLocalUser(): UserProfile | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('ikasso_user')
  if (!raw) return null
  try {
    const u = JSON.parse(raw)
    return {
      id: u.id || 'local-user',
      email: u.email || '',
      firstName: u.firstName || u.first_name || '',
      lastName: u.lastName || u.last_name || '',
      phone: u.phone || '',
      countryCode: u.countryCode || '+223',
      phoneVerified: u.phoneVerified ?? false,
      emailVerified: u.emailVerified ?? false,
      dateOfBirth: u.dateOfBirth || '',
      address: u.address || '',
      postalCode: u.postalCode || '',
      city: u.city || '',
      country: u.country || 'Mali',
      userType: u.userType || 'client',
      avatar: u.avatar || u.avatarUrl || null,
      avatarUrl: u.avatar || u.avatarUrl || null,
      bio: u.bio || '',
      status: u.status || 'active',
      memberSince: u.memberSince || '',
      hostType: u.hostType || null,
      companyName: u.companyName || null,
      responseRate: u.responseRate || 0,
      responseTime: u.responseTime || '1 heure',
      createdAt: u.createdAt || new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export async function signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { user: null, error: error.message }
    if (!data.user) return { user: null, error: 'Connexion echouee' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    const user = mapSupabaseProfile(profile || { id: data.user.id }, data.user.email || email)
    return { user, error: null }
  }

  // localStorage mode
  // Check test accounts first (dev only, no passwords in test accounts)
  const testUser = TEST_ACCOUNTS.find(u => u.email === email)
  if (testUser) {
    const user: UserProfile = {
      id: `test-${testUser.email}`,
      email: testUser.email,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      phone: testUser.phone,
      countryCode: '+33',
      phoneVerified: true,
      emailVerified: true,
      dateOfBirth: '',
      address: '',
      postalCode: '',
      city: 'Bamako',
      country: 'Mali',
      userType: testUser.userType,
      avatar: null,
      avatarUrl: null,
      bio: '',
      status: 'active',
      memberSince: 'Janvier 2024',
      hostType: null,
      companyName: null,
      responseRate: 0,
      responseTime: '1 heure',
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('ikasso_user', JSON.stringify(user))
    return { user, error: null }
  }

  // Check registered users
  const existingUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
  let found = existingUsers.find((u: any) => u.email === email)

  if (!found) {
    const currentUser = localStorage.getItem('ikasso_user')
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      if (userData.email === email) found = userData
    }
  }

  if (found) {
    if (found.password && found.password !== password) {
      return { user: null, error: 'Email ou mot de passe incorrect' }
    }
    // Restore avatar if available
    try {
      const { restoreUserAvatar } = await import('../../lib/avatarPersistence')
      found = restoreUserAvatar(found)
    } catch {}
    localStorage.setItem('ikasso_user', JSON.stringify(found))
    return { user: getLocalUser(), error: null }
  }

  return { user: null, error: 'Aucun compte trouve avec cet email' }
}

export async function signUp(data: RegisterInput): Promise<{ user: UserProfile | null; error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    })
    if (error) return { user: null, error: error.message }
    if (!authData.user) return { user: null, error: "Erreur lors de l'inscription" }

    // Update the auto-created profile with additional fields
    await supabase.from('profiles').update({
      phone: data.countryCode + data.phone,
      country_code: data.countryCode,
      user_type: data.userType,
      date_of_birth: data.dateOfBirth || null,
      address: data.address || '',
      postal_code: data.postalCode || '',
      city: data.city || 'Bamako',
      country: data.country || 'Mali',
      phone_verified: true,
      email_verified: true,
      member_since: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    }).eq('id', authData.user.id)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    return { user: mapSupabaseProfile(profile || { id: authData.user.id }, data.email), error: null }
  }

  // localStorage mode
  const existingUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
  if (existingUsers.some((u: any) => u.email === data.email)) {
    return { user: null, error: 'Un compte existe deja avec cet email' }
  }

  const userData = {
    id: `local-${Date.now()}`,
    userType: data.userType,
    phone: data.countryCode + data.phone,
    countryCode: data.countryCode,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    dateOfBirth: data.dateOfBirth || '',
    address: data.address || '',
    postalCode: data.postalCode || '',
    city: data.city || '',
    country: data.country || 'Mali',
    emailVerified: true,
    phoneVerified: true,
    memberSince: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    status: 'active',
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem('ikasso_user', JSON.stringify(userData))
  existingUsers.push(userData)
  localStorage.setItem('ikasso_all_users', JSON.stringify(existingUsers))

  return { user: getLocalUser(), error: null }
}

export async function signOut(): Promise<void> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    try {
      const { createClient } = await import('../supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
  }

  // Nuclear cleanup: remove ALL ikasso and Supabase keys (preserve saved avatars)
  if (typeof window !== 'undefined') {
    const keysToRemove = Object.keys(localStorage).filter(key =>
      (key.startsWith('ikasso') || key.startsWith('sb-')) && key !== 'ikasso_saved_avatars'
    )
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()

    let user: any = null
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user = session?.user
    } catch {}

    // No Supabase session = not authenticated. Clean up stale localStorage.
    if (!user) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ikasso_user')
      }
      return null
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      const mapped = mapSupabaseProfile(profile, user.email || '')
      // Also keep localStorage in sync
      if (typeof window !== 'undefined') {
        localStorage.setItem('ikasso_user', JSON.stringify(mapped))
      }
      return mapped
    }

    // Profile not found yet (new OAuth user) - use metadata
    const meta = user.user_metadata || {}
    const fallback: UserProfile = {
      id: user.id,
      email: user.email || '',
      firstName: meta.full_name?.split(' ')[0] || meta.name?.split(' ')[0] || '',
      lastName: meta.full_name?.split(' ').slice(1).join(' ') || meta.name?.split(' ').slice(1).join(' ') || '',
      phone: '',
      countryCode: '+223',
      phoneVerified: false,
      emailVerified: true,
      dateOfBirth: '',
      address: '',
      postalCode: '',
      city: '',
      country: 'Mali',
      userType: 'client',
      avatar: meta.avatar_url || meta.picture || null,
      avatarUrl: meta.avatar_url || meta.picture || null,
      bio: '',
      status: 'active',
      memberSince: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      hostType: null,
      companyName: null,
      responseRate: 0,
      responseTime: '1 heure',
      createdAt: new Date().toISOString(),
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('ikasso_user', JSON.stringify(fallback))
    }
    return fallback
  }

  return getLocalUser()
}

export async function updateProfile(updates: Partial<ProfileUpdateInput>): Promise<{ error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non connecte' }

    const dbUpdates: Record<string, any> = {}
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone
    if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth || null
    if (updates.address !== undefined) dbUpdates.address = updates.address
    if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode
    if (updates.city !== undefined) dbUpdates.city = updates.city
    if (updates.country !== undefined) dbUpdates.country = updates.country
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id)
    return { error: error?.message || null }
  }

  // localStorage mode
  const raw = localStorage.getItem('ikasso_user')
  if (!raw) return { error: 'Non connecte' }
  const user = JSON.parse(raw)
  Object.assign(user, updates)
  localStorage.setItem('ikasso_user', JSON.stringify(user))
  return { error: null }
}

export async function resetPassword(email: string): Promise<{ error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error: error?.message || null }
  }

  // localStorage fallback — generate token and use existing email API
  const token = Math.random().toString(36).substring(2, 15)
  localStorage.setItem(`reset_token_${email}`, JSON.stringify({
    token,
    expiresAt: Date.now() + 3600000,
  }))

  try {
    await fetch('/api/send-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    })
  } catch {}

  return { error: null }
}

export async function signInWithOAuth(provider: 'google' | 'apple'): Promise<{ error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    return { error: error?.message || null }
  }

  return { error: 'OAuth non disponible en mode demo' }
}
