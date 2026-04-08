import { getStorageMode } from './config'

export interface AdminUser {
  id: string
  userId?: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator' | 'support'
  permissions: Record<string, boolean>
  isActivated: boolean
  createdAt: string
}

export async function adminSignIn(email: string, password: string): Promise<{ admin: AdminUser | null; error: string | null }> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { admin: null, error: error.message }
    if (!data.user) return { admin: null, error: 'Connexion echouee' }

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', data.user.id)
      .single()

    if (!adminData) return { admin: null, error: 'Acces non autorise' }

    return {
      admin: {
        id: adminData.id,
        userId: adminData.user_id,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        permissions: adminData.permissions || {},
        isActivated: adminData.is_activated,
        createdAt: adminData.created_at,
      },
      error: null,
    }
  }

  // localStorage mode
  const admins = JSON.parse(localStorage.getItem('ikasso_admins') || '[]')
  const found = admins.find((a: any) => a.email === email)
  if (!found) return { admin: null, error: 'Identifiants incorrects' }
  if (found.password && found.password !== password) return { admin: null, error: 'Mot de passe incorrect' }

  const admin: AdminUser = {
    id: found.id || `admin-${Date.now()}`,
    name: found.name || email,
    email: found.email,
    role: found.role || 'admin',
    permissions: found.permissions || {},
    isActivated: found.isActivated ?? true,
    createdAt: found.createdAt || new Date().toISOString(),
  }

  localStorage.setItem('ikasso_logged_admin', JSON.stringify(admin))
  return { admin, error: null }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false })
    return (data || []).map((a: any) => ({
      id: a.id,
      userId: a.user_id,
      name: a.name,
      email: a.email,
      role: a.role,
      permissions: a.permissions || {},
      isActivated: a.is_activated,
      createdAt: a.created_at,
    }))
  }

  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('ikasso_admins') || '[]')
  }
  return []
}

export async function getAllUsers(): Promise<any[]> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    return data || []
  }

  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
  }
  return []
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const mode = getStorageMode()

  if (mode === 'supabase') {
    const { createClient } = await import('../supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase.from('admin_users').select('*').eq('user_id', user.id).single()
    if (!data) return null

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
      permissions: data.permissions || {},
      isActivated: data.is_activated,
      createdAt: data.created_at,
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('ikasso_logged_admin')
    return raw ? JSON.parse(raw) : null
  }
  return null
}
