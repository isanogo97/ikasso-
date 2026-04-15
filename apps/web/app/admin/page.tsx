'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Shield, Users, BarChart3, LogOut, Search, ChevronDown, ChevronUp,
  CheckCircle, CheckCircle2, XCircle, AlertTriangle, Mail, Eye, UserCheck, UserX,
  Flag, RefreshCw, Plus, Trash2, LayoutDashboard, FileCheck, UserCog,
  Loader2, Home, X, CreditCard, Calendar, Clock
} from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'
import { getAllUsers, getAdminUsers, adminSignIn, getCurrentAdmin } from '../lib/dal'
import type { AdminUser } from '../lib/dal'
import { createClient, isSupabaseConfigured } from '../lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Tab = 'dashboard' | 'users' | 'verifications' | 'admins'

interface DashboardStats {
  totalUsers: number
  totalHosts: number
  totalClients: number
  pendingVerifications: number
  approvedVerifications: number
  rejectedVerifications: number
  activeProperties: number
  pendingProperties: number
  suspendedUsers: number
  activeUsers: number
  verifiedUsers: number
  totalBookings: number
  paidBookings: number
  totalRevenue: number
  monthRevenue: number
}

interface UserRow {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  user_type?: string
  status?: string
  identity_verified?: boolean
  created_at?: string
  phone?: string
  city?: string
  [key: string]: any
}

interface Verification {
  id: string
  user_id: string
  document_type: string
  status: string
  submitted_at?: string
  created_at?: string
  document_url?: string
  selfie_url?: string
  rejection_reason?: string
  profiles?: { first_name?: string; last_name?: string; email?: string }
}

interface NewAdminForm {
  email: string
  name: string
  role: AdminUser['role']
  can_manage_users: boolean
  can_verify_identity: boolean
  can_refund: boolean
  can_delete_accounts: boolean
  can_manage_admins: boolean
}

const defaultNewAdmin: NewAdminForm = {
  email: '',
  name: '',
  role: 'admin',
  can_manage_users: true,
  can_verify_identity: false,
  can_refund: false,
  can_delete_accounts: false,
  can_manage_admins: false,
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrateur',
  moderator: 'Moderateur',
  support: 'Support',
}

const TAB_ITEMS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { key: 'users', label: 'Utilisateurs', icon: Users },
  { key: 'verifications', label: 'Verifications', icon: FileCheck },
  { key: 'admins', label: 'Administrateurs', icon: UserCog },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdminPage() {
  const { user } = useAuth()

  // Auth state
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  // Navigation
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Dashboard
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalHosts: 0, totalClients: 0, pendingVerifications: 0, approvedVerifications: 0, rejectedVerifications: 0, activeProperties: 0, pendingProperties: 0, suspendedUsers: 0, activeUsers: 0, verifiedUsers: 0, totalBookings: 0, paidBookings: 0, totalRevenue: 0, monthRevenue: 0 })
  const [statsLoading, setStatsLoading] = useState(false)

  // Users
  const [users, setUsers] = useState<UserRow[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [userDocs, setUserDocs] = useState<Record<string, Verification[]>>({})

  // User observations (admin notes)
  const [userObservations, setUserObservations] = useState<Record<string, string>>({})

  // Verifications
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [verificationsLoading, setVerificationsLoading] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Admins
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState<NewAdminForm>(defaultNewAdmin)
  const [addAdminError, setAddAdminError] = useState('')

  // Action feedback
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const flash = useCallback((type: 'success' | 'error', text: string) => {
    setActionMsg({ type, text })
    setTimeout(() => setActionMsg(null), 4000)
  }, [])

  const supabase = useCallback(() => {
    if (!isSupabaseConfigured()) return null
    return createClient()
  }, [])

  // ---------------------------------------------------------------------------
  // Auth check on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    ;(async () => {
      try {
        const admin = await getCurrentAdmin()
        if (admin && admin.isActivated) {
          setCurrentAdmin(admin)
          setIsAdmin(true)
        }
      } catch {
        // not admin
      } finally {
        setAuthChecking(false)
      }
    })()
  }, [])

  // ---------------------------------------------------------------------------
  // Login handler
  // ---------------------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const { admin, error } = await adminSignIn(email, password)
      if (error || !admin) {
        setLoginError(error || 'Connexion echouee')
        return
      }
      if (!admin.isActivated) {
        setLoginError("Votre compte administrateur n'est pas encore active.")
        return
      }
      setCurrentAdmin(admin)
      setIsAdmin(true)
    } catch {
      setLoginError('Erreur de connexion. Veuillez reessayer.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ikasso_logged_admin')
    }
    setCurrentAdmin(null)
    setIsAdmin(false)
    setEmail('')
    setPassword('')
  }

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const sb = supabase()
      if (sb) {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const [usersRes, hostsRes, clientsRes, suspendedRes, activeRes, verifiedRes,
               pendingVerifRes, approvedVerifRes, rejectedVerifRes,
               activePropsRes, pendingPropsRes,
               totalBookingsRes, paidBookingsRes, revenueRes, monthRevenueRes] = await Promise.all([
          sb.from('profiles').select('id', { count: 'exact', head: true }),
          sb.from('profiles').select('id', { count: 'exact', head: true }).eq('user_type', 'hote'),
          sb.from('profiles').select('id', { count: 'exact', head: true }).eq('user_type', 'client'),
          sb.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
          sb.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          sb.from('profiles').select('id', { count: 'exact', head: true }).eq('identity_verified', true),
          sb.from('identity_verifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          sb.from('identity_verifications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
          sb.from('identity_verifications').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
          sb.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          sb.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          sb.from('bookings').select('id', { count: 'exact', head: true }),
          sb.from('bookings').select('id', { count: 'exact', head: true }).eq('payment_status', 'paid'),
          sb.from('bookings').select('total').eq('payment_status', 'paid'),
          sb.from('bookings').select('total').eq('payment_status', 'paid').gte('created_at', monthStart),
        ])

        const totalRev = (revenueRes.data || []).reduce((sum: number, b: any) => sum + (b.total || 0), 0)
        const monthRev = (monthRevenueRes.data || []).reduce((sum: number, b: any) => sum + (b.total || 0), 0)

        setStats({
          totalUsers: usersRes.count ?? 0,
          totalHosts: hostsRes.count ?? 0,
          totalClients: clientsRes.count ?? 0,
          pendingVerifications: pendingVerifRes.count ?? 0,
          approvedVerifications: approvedVerifRes.count ?? 0,
          rejectedVerifications: rejectedVerifRes.count ?? 0,
          activeProperties: activePropsRes.count ?? 0,
          pendingProperties: pendingPropsRes.count ?? 0,
          suspendedUsers: suspendedRes.count ?? 0,
          activeUsers: activeRes.count ?? 0,
          verifiedUsers: verifiedRes.count ?? 0,
          totalBookings: totalBookingsRes.count ?? 0,
          paidBookings: paidBookingsRes.count ?? 0,
          totalRevenue: totalRev,
          monthRevenue: monthRev,
        })
      } else {
        const allUsers = await getAllUsers()
        setStats({
          totalUsers: allUsers.length,
          totalHosts: allUsers.filter((u: any) => u.user_type === 'hote' || u.user_type === 'host').length,
          totalClients: allUsers.filter((u: any) => u.user_type === 'client').length,
          pendingVerifications: 0, approvedVerifications: 0, rejectedVerifications: 0,
          activeProperties: 0, pendingProperties: 0,
          suspendedUsers: allUsers.filter((u: any) => u.status === 'suspended').length,
          activeUsers: allUsers.filter((u: any) => u.status === 'active').length,
          verifiedUsers: 0, totalBookings: 0, paidBookings: 0, totalRevenue: 0, monthRevenue: 0,
        })
      }
    } catch {
      flash('error', 'Impossible de charger les statistiques')
    } finally {
      setStatsLoading(false)
    }
  }, [supabase, flash])

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const all = await getAllUsers()
      setUsers(all)
    } catch {
      flash('error', 'Impossible de charger les utilisateurs')
    } finally {
      setUsersLoading(false)
    }
  }, [flash])

  const fetchVerifications = useCallback(async () => {
    setVerificationsLoading(true)
    try {
      const sb = supabase()
      if (sb) {
        const { data } = await sb
          .from('identity_verifications')
          .select('*, profiles(first_name, last_name, email)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
        setVerifications(data || [])
      } else {
        setVerifications([])
      }
    } catch {
      flash('error', 'Impossible de charger les verifications')
    } finally {
      setVerificationsLoading(false)
    }
  }, [supabase, flash])

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true)
    try {
      const list = await getAdminUsers()
      setAdmins(list)
    } catch {
      flash('error', 'Impossible de charger les administrateurs')
    } finally {
      setAdminsLoading(false)
    }
  }, [flash])

  // Fetch data when tab changes
  useEffect(() => {
    if (!isAdmin) return
    if (activeTab === 'dashboard') fetchStats()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'verifications') fetchVerifications()
    if (activeTab === 'admins') fetchAdmins()
  }, [activeTab, isAdmin, fetchStats, fetchUsers, fetchVerifications, fetchAdmins])

  // ---------------------------------------------------------------------------
  // User actions
  // ---------------------------------------------------------------------------
  const updateUserStatus = async (userId: string, status: string) => {
    const sb = supabase()
    if (!sb) {
      flash('error', 'Supabase non configure')
      return
    }
    const { error } = await sb.from('profiles').update({ status }).eq('id', userId)
    if (error) {
      flash('error', `Erreur: ${error.message}`)
    } else {
      flash('success', status === 'suspended' ? 'Compte suspendu' : 'Compte reactive')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u))
    }
  }

  const loadUserDocs = async (userId: string) => {
    const sb = supabase()
    if (!sb) return
    const { data } = await sb.from('identity_verifications').select('*').eq('user_id', userId)
    setUserDocs(prev => ({ ...prev, [userId]: data || [] }))
  }

  // ---------------------------------------------------------------------------
  // Verification actions
  // ---------------------------------------------------------------------------
  const approveVerification = async (v: Verification) => {
    const sb = supabase()
    if (!sb) return
    const { error: e1 } = await sb.from('identity_verifications').update({ status: 'approved' }).eq('id', v.id)
    const { error: e2 } = await sb.from('profiles').update({ identity_verified: true }).eq('id', v.user_id)
    if (e1 || e2) {
      flash('error', 'Erreur lors de la validation')
    } else {
      // TODO: Send email notification to user about approval
      // await fetch('/api/send-email-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v.profiles?.email, name: `${v.profiles?.first_name || ''} ${v.profiles?.last_name || ''}`.trim(), status: 'approved' }) })
      flash('success', 'Identite approuvee')
      setVerifications(prev => prev.filter(x => x.id !== v.id))
    }
  }

  const rejectVerification = async (v: Verification) => {
    if (!rejectionReason.trim()) return
    const sb = supabase()
    if (!sb) return
    const { error } = await sb.from('identity_verifications').update({ status: 'rejected', rejection_reason: rejectionReason }).eq('id', v.id)
    if (error) {
      flash('error', 'Erreur lors du rejet')
    } else {
      // TODO: Send email notification to user about rejection with reason
      // await fetch('/api/send-email-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v.profiles?.email, name: `${v.profiles?.first_name || ''} ${v.profiles?.last_name || ''}`.trim(), status: 'rejected', reason: rejectionReason }) })
      flash('success', 'Verification rejetee')
      setVerifications(prev => prev.filter(x => x.id !== v.id))
      setRejectingId(null)
      setRejectionReason('')
    }
  }

  // ---------------------------------------------------------------------------
  // Admin management
  // ---------------------------------------------------------------------------
  const addAdmin = async () => {
    setAddAdminError('')
    if (!newAdmin.email || !newAdmin.name) {
      setAddAdminError('Email et nom requis')
      return
    }
    const sb = supabase()
    if (sb) {
      const { error } = await sb.from('admin_users').insert({
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        is_activated: true,
        permissions: {
          can_manage_users: newAdmin.can_manage_users,
          can_verify_identity: newAdmin.can_verify_identity,
          can_refund: newAdmin.can_refund,
          can_delete_accounts: newAdmin.can_delete_accounts,
          can_manage_admins: newAdmin.can_manage_admins,
        },
      })
      if (error) {
        setAddAdminError(error.message)
        return
      }
    } else {
      const existing = JSON.parse(localStorage.getItem('ikasso_admins') || '[]')
      existing.push({ ...newAdmin, id: `admin-${Date.now()}`, isActivated: true, createdAt: new Date().toISOString(), permissions: { can_manage_users: newAdmin.can_manage_users, can_verify_identity: newAdmin.can_verify_identity, can_refund: newAdmin.can_refund, can_delete_accounts: newAdmin.can_delete_accounts, can_manage_admins: newAdmin.can_manage_admins } })
      localStorage.setItem('ikasso_admins', JSON.stringify(existing))
    }
    flash('success', 'Administrateur ajoute')
    setNewAdmin(defaultNewAdmin)
    setShowAddAdmin(false)
    fetchAdmins()
  }

  const removeAdmin = async (adminId: string) => {
    const sb = supabase()
    if (sb) {
      const { error } = await sb.from('admin_users').delete().eq('id', adminId)
      if (error) { flash('error', error.message); return }
    } else {
      const existing = JSON.parse(localStorage.getItem('ikasso_admins') || '[]')
      localStorage.setItem('ikasso_admins', JSON.stringify(existing.filter((a: any) => a.id !== adminId)))
    }
    flash('success', 'Administrateur supprime')
    fetchAdmins()
  }

  const updateAdminPermission = async (adminId: string, key: string, value: boolean) => {
    const sb = supabase()
    const target = admins.find(a => a.id === adminId)
    if (!target) return
    const updated = { ...target.permissions, [key]: value }
    if (sb) {
      const { error } = await sb.from('admin_users').update({ permissions: updated }).eq('id', adminId)
      if (error) { flash('error', error.message); return }
    }
    setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, permissions: updated } : a))
  }

  // ---------------------------------------------------------------------------
  // Filtered users
  // ---------------------------------------------------------------------------
  const filteredUsers = users.filter(u => {
    if (!userSearch) return true
    const q = userSearch.toLowerCase()
    const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase()
    return name.includes(q) || (u.email || '').toLowerCase().includes(q)
  })

  // ---------------------------------------------------------------------------
  // Loading / Auth gate
  // ---------------------------------------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Login screen
  // ---------------------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Administration Ikasso
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acces reserve aux administrateurs
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
                  Email administrateur
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@ikasso.ml"
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                />
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
              >
                {loginLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Se connecter'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-primary-500 hover:text-primary-600 font-medium inline-flex items-center gap-1">
                <Home className="h-4 w-4" /> Retour au site
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-semibold text-gray-900 text-sm">Admin Ikasso</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {TAB_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === key ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900 truncate">{currentAdmin?.name}</p>
            <p className="text-xs text-gray-500">{ROLE_LABELS[currentAdmin?.role || 'admin']}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Deconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded hover:bg-gray-100">
            <LayoutDashboard className="h-5 w-5 text-gray-700" />
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {TAB_ITEMS.find(t => t.key === activeTab)?.label}
          </span>
          <div className="w-6" />
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Action feedback toast */}
          {actionMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${actionMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {actionMsg.text}
            </div>
          )}

          {/* =============== DASHBOARD TAB =============== */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la plateforme Ikasso</p>
              </div>

              {statsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
              ) : (
                <>
                {/* Section: Utilisateurs */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Utilisateurs</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Total inscrits', value: stats.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Comptes actifs', value: stats.activeUsers, icon: UserCheck, color: 'text-green-600 bg-green-50' },
                    { label: 'Clients', value: stats.totalClients, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
                    { label: 'Hotes', value: stats.totalHosts, icon: Home, color: 'text-primary-600 bg-primary-50' },
                    { label: 'Comptes verifies', value: stats.verifiedUsers, icon: Shield, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Comptes bloques', value: stats.suspendedUsers, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
                  ].map((card, i) => (
                    <div key={i} onClick={() => setActiveTab('users')} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${card.color}`}>{React.createElement(card.icon, { className: 'h-5 w-5' })}</div>
                        <div>
                          <p className="text-xs text-gray-500">{card.label}</p>
                          <p className="text-xl font-bold text-gray-900">{card.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section: Verifications */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Verifications d'identite</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'En attente', value: stats.pendingVerifications, icon: FileCheck, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Approuvees', value: stats.approvedVerifications, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
                    { label: 'Refusees', value: stats.rejectedVerifications, icon: XCircle, color: 'text-red-600 bg-red-50' },
                  ].map((card, i) => (
                    <div key={i} onClick={() => setActiveTab('verifications')} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${card.color}`}>{React.createElement(card.icon, { className: 'h-5 w-5' })}</div>
                        <div>
                          <p className="text-xs text-gray-500">{card.label}</p>
                          <p className="text-xl font-bold text-gray-900">{card.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section: Finances */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Finances & Reservations</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Revenus total', value: stats.totalRevenue.toLocaleString('fr-FR') + ' FCFA', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Revenus ce mois', value: stats.monthRevenue.toLocaleString('fr-FR') + ' FCFA', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Reservations total', value: stats.totalBookings, icon: Calendar, color: 'text-purple-600 bg-purple-50' },
                    { label: 'Reservations payees', value: stats.paidBookings, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
                  ].map((card, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${card.color}`}>{React.createElement(card.icon, { className: 'h-5 w-5' })}</div>
                        <div>
                          <p className="text-xs text-gray-500">{card.label}</p>
                          <p className="text-lg font-bold text-gray-900">{card.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section: Proprietes */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Proprietes</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Actives', value: stats.activeProperties, icon: Home, color: 'text-green-600 bg-green-50' },
                    { label: 'En attente', value: stats.pendingProperties, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                  ].map((card, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${card.color}`}>{React.createElement(card.icon, { className: 'h-5 w-5' })}</div>
                        <div>
                          <p className="text-xs text-gray-500">{card.label}</p>
                          <p className="text-xl font-bold text-gray-900">{card.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </>
              )}

              <div className="mt-8 bg-primary-50 border border-primary-200 rounded-xl p-5">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-primary-900">Acces administrateur</h3>
                    <p className="text-sm text-primary-800 mt-1">
                      Connecte en tant que <strong>{currentAdmin?.name}</strong> ({ROLE_LABELS[currentAdmin?.role || 'admin']}). Toutes les actions sont enregistrees.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============== USERS TAB =============== */}
          {activeTab === 'users' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
                  <p className="text-gray-500 text-sm mt-1">{users.length} comptes enregistres</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    className="pl-10 pr-4 py-2 w-full sm:w-72 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                </div>
              </div>

              {usersLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Aucun utilisateur trouve</div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Table header - hidden on mobile */}
                  <div className="hidden md:grid md:grid-cols-7 gap-2 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                    <div className="col-span-2">Nom</div>
                    <div>Type</div>
                    <div>Statut</div>
                    <div>Identite</div>
                    <div>Inscription</div>
                    <div className="text-right">Actions</div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {filteredUsers.map(u => {
                      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Sans nom'
                      const isExpanded = expandedUser === u.id
                      return (
                        <div key={u.id}>
                          {/* Row */}
                          <div className="px-4 py-3 md:grid md:grid-cols-7 md:gap-2 md:items-center">
                            <div className="col-span-2">
                              <p className="text-sm font-medium text-gray-900">{fullName}</p>
                              <p className="text-xs text-gray-500 truncate">{u.email || '-'}</p>
                            </div>
                            <div className="mt-1 md:mt-0">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${u.user_type === 'host' ? 'bg-primary-100 text-primary-700' : 'bg-blue-100 text-blue-700'}`}>
                                {u.user_type === 'host' ? 'Hote' : 'Client'}
                              </span>
                            </div>
                            <div className="mt-1 md:mt-0">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-700' : u.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                {u.status === 'active' ? 'Actif' : u.status === 'suspended' ? 'Suspendu' : u.status || 'Inconnu'}
                              </span>
                            </div>
                            <div className="mt-1 md:mt-0">
                              {u.identity_verified ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                            <div className="mt-1 md:mt-0 text-xs text-gray-500">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '-'}
                            </div>
                            <div className="mt-2 md:mt-0 flex items-center justify-end gap-1 flex-wrap">
                              <button
                                onClick={() => {
                                  setExpandedUser(isExpanded ? null : u.id)
                                  if (!isExpanded) loadUserDocs(u.id)
                                }}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                                title="Voir details"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                              {u.status !== 'suspended' ? (
                                <button onClick={() => updateUserStatus(u.id, 'suspended')} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Suspendre">
                                  <UserX className="h-4 w-4" />
                                </button>
                              ) : (
                                <button onClick={() => updateUserStatus(u.id, 'active')} className="p-1.5 rounded hover:bg-green-50 text-green-500" title="Reactiver">
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              )}
                              <button onClick={() => updateUserStatus(u.id, 'suspended')} className="p-1.5 rounded hover:bg-amber-50 text-amber-500" title="Signaler comme suspect">
                                <Flag className="h-4 w-4" />
                              </button>
                              {u.email && (
                                <a href={`mailto:${u.email}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-500" title="Contacter">
                                  <Mail className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Expanded details - comprehensive card layout */}
                          {isExpanded && (
                            <div className="px-4 py-5 bg-gray-50 border-t border-gray-100">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Personal info card */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary-500" /> Informations personnelles
                                  </h4>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div><span className="text-gray-500">Prenom:</span> <span className="text-gray-900 font-medium">{u.first_name || '-'}</span></div>
                                    <div><span className="text-gray-500">Nom:</span> <span className="text-gray-900 font-medium">{u.last_name || '-'}</span></div>
                                    <div><span className="text-gray-500">Email:</span> <span className="text-gray-900">{u.email || '-'}</span></div>
                                    <div><span className="text-gray-500">Telephone:</span> <span className="text-gray-900">{u.phone || '-'}</span></div>
                                    <div><span className="text-gray-500">Date de naissance:</span> <span className="text-gray-900">{u.date_of_birth ? new Date(u.date_of_birth).toLocaleDateString('fr-FR') : '-'}</span></div>
                                    <div><span className="text-gray-500">Adresse:</span> <span className="text-gray-900">{u.address || '-'}</span></div>
                                    <div><span className="text-gray-500">Code postal:</span> <span className="text-gray-900">{u.postal_code || '-'}</span></div>
                                    <div><span className="text-gray-500">Ville:</span> <span className="text-gray-900">{u.city || '-'}</span></div>
                                    <div><span className="text-gray-500">Pays:</span> <span className="text-gray-900">{u.country || '-'}</span></div>
                                  </div>
                                </div>

                                {/* Account status card */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary-500" /> Statut du compte
                                  </h4>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div><span className="text-gray-500">ID:</span> <span className="text-gray-900 break-all text-xs">{u.id}</span></div>
                                    <div><span className="text-gray-500">Type:</span> <span className="text-gray-900 font-medium">{u.user_type === 'host' || u.user_type === 'hote' ? 'Hote' : 'Client'}</span></div>
                                    <div><span className="text-gray-500">Statut:</span>{' '}
                                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-700' : u.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {u.status === 'active' ? 'Actif' : u.status === 'suspended' ? 'Suspendu' : u.status || 'Inconnu'}
                                      </span>
                                    </div>
                                    <div><span className="text-gray-500">Identite verifiee:</span>{' '}
                                      {u.identity_verified ? <span className="text-green-600 font-medium">Oui</span> : <span className="text-red-500 font-medium">Non</span>}
                                    </div>
                                    <div><span className="text-gray-500">Inscription:</span> <span className="text-gray-900">{u.created_at ? new Date(u.created_at).toLocaleString('fr-FR') : '-'}</span></div>
                                    <div><span className="text-gray-500">Membre depuis:</span> <span className="text-gray-900">{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '-'}</span></div>
                                  </div>
                                </div>

                                {/* Identity documents card */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileCheck className="h-4 w-4 text-primary-500" /> Documents d'identite
                                  </h4>
                                  {userDocs[u.id] && userDocs[u.id].length > 0 ? (
                                    <div className="space-y-2">
                                      {userDocs[u.id].map(doc => (
                                        <div key={doc.id} className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg p-3 border border-gray-100">
                                          <Eye className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                          <span className="text-gray-700">{doc.document_type}</span>
                                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${doc.status === 'approved' ? 'bg-green-100 text-green-700' : doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {doc.status === 'approved' ? 'Approuve' : doc.status === 'rejected' ? 'Rejete' : 'En attente'}
                                          </span>
                                          {doc.document_url && (
                                            <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 text-xs underline ml-auto">
                                              Voir le document
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-400 italic">Aucun document soumis</p>
                                  )}
                                </div>

                                {/* Observations card */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Flag className="h-4 w-4 text-primary-500" /> Observations de l'administrateur
                                  </h4>
                                  <textarea
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 resize-none"
                                    rows={3}
                                    placeholder="Ajouter des notes ou observations sur cet utilisateur..."
                                    value={userObservations[u.id] || ''}
                                    onChange={e => setUserObservations(prev => ({ ...prev, [u.id]: e.target.value }))}
                                  />
                                  <p className="text-xs text-gray-400 mt-1">Ces notes sont locales a cette session.</p>
                                </div>
                              </div>

                              {/* Actions row */}
                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                {u.status !== 'suspended' ? (
                                  <button onClick={() => updateUserStatus(u.id, 'suspended')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                                    <UserX className="h-4 w-4" /> Suspendre
                                  </button>
                                ) : (
                                  <button onClick={() => updateUserStatus(u.id, 'active')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
                                    <UserCheck className="h-4 w-4" /> Reactiver
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    const obs = userObservations[u.id] || ''
                                    const reason = obs.trim() ? ` (Observation: ${obs.trim()})` : ''
                                    updateUserStatus(u.id, 'suspended')
                                    flash('success', `Utilisateur marque comme suspect${reason}`)
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 transition-colors"
                                >
                                  <Flag className="h-4 w-4" /> Marquer suspect
                                </button>
                                {!u.identity_verified && (
                                  <button
                                    onClick={async () => {
                                      const sb = supabase()
                                      if (!sb) return
                                      const { error } = await sb.from('profiles').update({ identity_verified: true }).eq('id', u.id)
                                      if (error) { flash('error', error.message) } else {
                                        flash('success', 'Utilisateur valide')
                                        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, identity_verified: true } : x))
                                      }
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                                  >
                                    <CheckCircle className="h-4 w-4" /> Valider identite
                                  </button>
                                )}
                                {u.email && (
                                  <a href={`mailto:${u.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                                    <Mail className="h-4 w-4" /> Contacter par email
                                  </a>
                                )}
                              </div>

                              {/* Bookings section */}
                              <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-primary-500" /> Reservations de cet utilisateur
                                </h4>
                                <p className="text-sm text-gray-400 italic">Aucune reservation pour le moment.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =============== VERIFICATIONS TAB =============== */}
          {activeTab === 'verifications' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Verifications d'identite</h1>
                <p className="text-gray-500 text-sm mt-1">{verifications.length} verification(s) en attente</p>
              </div>

              {verificationsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
              ) : verifications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune verification en attente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verifications.map(v => {
                    const userName = v.profiles ? `${v.profiles.first_name || ''} ${v.profiles.last_name || ''}`.trim() : v.user_id
                    return (
                      <div key={v.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{userName}</p>
                            <p className="text-xs text-gray-500">{v.profiles?.email || '-'}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span>Type: <strong className="text-gray-700">{v.document_type}</strong></span>
                              <span>Soumis le: <strong className="text-gray-700">{v.submitted_at || v.created_at ? new Date(v.submitted_at || v.created_at!).toLocaleDateString('fr-FR') : '-'}</strong></span>
                            </div>
                            {v.document_url && (
                              <a href={v.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 mt-2">
                                <Eye className="h-3 w-3" /> Voir le document
                              </a>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => approveVerification(v)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="h-4 w-4" /> Approuver
                              </button>
                              {rejectingId === v.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Motif du rejet..."
                                    className="w-48 px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    autoFocus
                                  />
                                  <button onClick={() => rejectVerification(v)} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                                    Confirmer
                                  </button>
                                  <button onClick={() => { setRejectingId(null); setRejectionReason('') }} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setRejectingId(v.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                  <XCircle className="h-4 w-4" /> Rejeter
                                </button>
                              )}
                              {v.profiles?.email && (
                                <a href={`mailto:${v.profiles.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors" title="Contacter l'utilisateur">
                                  <Mail className="h-4 w-4" /> Contacter
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* =============== ADMINS TAB =============== */}
          {activeTab === 'admins' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Administrateurs</h1>
                  <p className="text-gray-500 text-sm mt-1">{admins.length} administrateur(s)</p>
                </div>
                {(currentAdmin?.role === 'super_admin' || currentAdmin?.permissions?.can_manage_admins) && (
                  <button
                    onClick={() => setShowAddAdmin(!showAddAdmin)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Ajouter un admin
                  </button>
                )}
              </div>

              {/* Add admin form */}
              {showAddAdmin && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvel administrateur</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                        value={newAdmin.email}
                        onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))}
                        placeholder="admin@ikasso.ml"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                        value={newAdmin.name}
                        onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))}
                        placeholder="Prenom Nom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                        value={newAdmin.role}
                        onChange={e => setNewAdmin(p => ({ ...p, role: e.target.value as AdminUser['role'] }))}
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Administrateur</option>
                        <option value="moderator">Moderateur</option>
                        <option value="support">Support</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { key: 'can_manage_users', label: 'Gerer les utilisateurs' },
                        { key: 'can_verify_identity', label: 'Verifier les identites' },
                        { key: 'can_refund', label: 'Effectuer des remboursements' },
                        { key: 'can_delete_accounts', label: 'Supprimer des comptes' },
                        { key: 'can_manage_admins', label: 'Gerer les admins' },
                      ].map(p => (
                        <label key={p.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                            checked={(newAdmin as any)[p.key]}
                            onChange={e => setNewAdmin(prev => ({ ...prev, [p.key]: e.target.checked }))}
                          />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {addAdminError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{addAdminError}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button onClick={addAdmin} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors">
                      Ajouter
                    </button>
                    <button onClick={() => { setShowAddAdmin(false); setNewAdmin(defaultNewAdmin); setAddAdminError('') }} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Admins list */}
              {adminsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
              ) : admins.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-500">
                  Aucun administrateur trouve
                </div>
              ) : (
                <div className="space-y-4">
                  {admins.map(a => (
                    <div key={a.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{a.name}</p>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : a.role === 'admin' ? 'bg-primary-100 text-primary-700' : a.role === 'moderator' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                              {ROLE_LABELS[a.role]}
                            </span>
                            {!a.isActivated && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">Non active</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{a.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Ajoute le {new Date(a.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>

                        {(currentAdmin?.role === 'super_admin' || currentAdmin?.permissions?.can_manage_admins) && a.id !== currentAdmin?.id && (
                          <button
                            onClick={() => removeAdmin(a.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" /> Retirer
                          </button>
                        )}
                      </div>

                      {/* Permissions toggles */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Permissions</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          {[
                            { key: 'can_manage_users', label: 'Utilisateurs' },
                            { key: 'can_verify_identity', label: 'Identites' },
                            { key: 'can_refund', label: 'Remboursements' },
                            { key: 'can_delete_accounts', label: 'Suppression' },
                            { key: 'can_manage_admins', label: 'Admins' },
                          ].map(p => {
                            const canEdit = (currentAdmin?.role === 'super_admin' || currentAdmin?.permissions?.can_manage_admins) && a.id !== currentAdmin?.id
                            return (
                              <label key={p.key} className={`flex items-center gap-1.5 text-xs ${canEdit ? 'cursor-pointer text-gray-700' : 'cursor-default text-gray-400'}`}>
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 h-3.5 w-3.5"
                                  checked={!!a.permissions?.[p.key]}
                                  disabled={!canEdit}
                                  onChange={e => updateAdminPermission(a.id, p.key, e.target.checked)}
                                />
                                {p.label}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
