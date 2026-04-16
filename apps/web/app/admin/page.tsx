'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Shield, Users, BarChart3, LogOut, Search, ChevronDown, ChevronUp,
  CheckCircle, CheckCircle2, XCircle, AlertTriangle, Mail, Eye, UserCheck, UserX,
  Flag, RefreshCw, Plus, Trash2, LayoutDashboard, FileCheck, UserCog,
  Loader2, Home, X, CreditCard, Calendar, Clock, Menu, ArrowLeft, Tag, Send, Percent
} from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'
import { getAllUsers, getAdminUsers, adminSignIn, getCurrentAdmin } from '../lib/dal'
import type { AdminUser } from '../lib/dal'
import { createClient, isSupabaseConfigured } from '../lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Tab = 'dashboard' | 'users' | 'verifications' | 'admins' | 'promotions'
type UserFilter = 'all' | 'clients' | 'hosts' | 'suspended' | 'verified'

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
  date_of_birth?: string
  address?: string
  postal_code?: string
  city?: string
  country?: string
  [key: string]: any
}

interface Verification {
  id: string
  user_id: string
  document_type: string
  document_type_label?: string
  status: string
  submitted_at?: string
  created_at?: string
  document_front_url?: string
  document_back_url?: string
  face_front_url?: string
  face_left_url?: string
  face_right_url?: string
  rejection_reason?: string
  user_name?: string
  user_email?: string
  user_phone?: string
  user_type?: string
  profiles?: { first_name?: string; last_name?: string; email?: string } | null
  [key: string]: any
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

interface PromoCode {
  id: string
  code: string
  description?: string
  discount_percent?: number
  discount_amount?: number
  is_active: boolean
  expires_at?: string
  max_uses?: number
  current_uses: number
  created_at: string
}

const TAB_ITEMS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { key: 'users', label: 'Utilisateurs', icon: Users },
  { key: 'verifications', label: 'Verifications', icon: FileCheck },
  { key: 'promotions', label: 'Promotions', icon: Tag },
  { key: 'admins', label: 'Administrateurs', icon: UserCog },
]

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------
function getTabFromUrl(): { tab: Tab; userId: string | null } {
  if (typeof window === 'undefined') return { tab: 'dashboard', userId: null }
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('tab')
  const validTabs: Tab[] = ['dashboard', 'users', 'verifications', 'admins']
  const tab = validTabs.includes(raw as Tab) ? (raw as Tab) : 'dashboard'
  const userId = params.get('user') || null
  return { tab, userId }
}

function pushUrl(tab: Tab, userId?: string | null) {
  const params = new URLSearchParams()
  params.set('tab', tab)
  if (userId) params.set('user', userId)
  const url = `${window.location.pathname}?${params.toString()}`
  window.history.pushState({ tab, userId: userId || null }, '', url)
}

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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Dashboard
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalHosts: 0, totalClients: 0, pendingVerifications: 0, approvedVerifications: 0, rejectedVerifications: 0, activeProperties: 0, pendingProperties: 0, suspendedUsers: 0, activeUsers: 0, verifiedUsers: 0, totalBookings: 0, paidBookings: 0, totalRevenue: 0, monthRevenue: 0 })
  const [statsLoading, setStatsLoading] = useState(false)

  // Users
  const [users, setUsers] = useState<UserRow[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState<UserFilter>('all')
  const [userDocs, setUserDocs] = useState<Record<string, Verification[]>>({})
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

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

  // Email modal
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [emailSending, setEmailSending] = useState(false)

  // Promotions
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [promosLoading, setPromosLoading] = useState(false)
  const [showAddPromo, setShowAddPromo] = useState(false)
  const [newPromoCode, setNewPromoCode] = useState('')
  const [newPromoDesc, setNewPromoDesc] = useState('')
  const [newPromoPercent, setNewPromoPercent] = useState('')
  const [newPromoAmount, setNewPromoAmount] = useState('')
  const [newPromoExpires, setNewPromoExpires] = useState('')
  const [newPromoMaxUses, setNewPromoMaxUses] = useState('')
  const [promoError, setPromoError] = useState('')

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
  // Navigation: tab change with pushState
  // ---------------------------------------------------------------------------
  const navigateToTab = useCallback((tab: Tab) => {
    setActiveTab(tab)
    setSelectedUserId(null)
    pushUrl(tab)
    setSidebarOpen(false)
  }, [])

  const navigateToUser = useCallback((userId: string) => {
    setSelectedUserId(userId)
    pushUrl('users', userId)
  }, [])

  const navigateBackFromUser = useCallback(() => {
    setSelectedUserId(null)
    pushUrl('users')
  }, [])

  // Read URL on mount
  useEffect(() => {
    const { tab, userId } = getTabFromUrl()
    setActiveTab(tab)
    setSelectedUserId(userId)
  }, [])

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    const handler = () => {
      const { tab, userId } = getTabFromUrl()
      setActiveTab(tab)
      setSelectedUserId(userId)
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
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
      const res = await fetch('/api/admin/verifications')
      const json = await res.json()
      if (res.ok && json.verifications) {
        setVerifications(json.verifications)
      } else {
        setVerifications([])
        flash('error', json.error || 'Impossible de charger les verifications')
      }
    } catch {
      flash('error', 'Impossible de charger les verifications')
    } finally {
      setVerificationsLoading(false)
    }
  }, [flash])

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

  const fetchPromoCodes = useCallback(async () => {
    setPromosLoading(true)
    try {
      const res = await fetch('/api/admin/promo-codes')
      const json = await res.json()
      setPromoCodes(json.codes || [])
    } catch {
      flash('error', 'Impossible de charger les codes promo')
    } finally {
      setPromosLoading(false)
    }
  }, [flash])

  const sendAdminEmail = async () => {
    if (!emailTo || !emailSubject || !emailMessage) {
      flash('error', 'Remplissez tous les champs')
      return
    }
    setEmailSending(true)
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          message: emailMessage,
          senderName: currentAdmin?.name || 'Admin Ikasso',
        }),
      })
      const json = await res.json()
      if (res.ok) {
        flash('success', `Email envoye a ${emailTo}`)
        setShowEmailModal(false)
        setEmailTo('')
        setEmailSubject('')
        setEmailMessage('')
      } else {
        flash('error', json.error || 'Erreur envoi email')
      }
    } catch {
      flash('error', 'Erreur envoi email')
    } finally {
      setEmailSending(false)
    }
  }

  const createPromoCode = async () => {
    if (!newPromoCode || (!newPromoPercent && !newPromoAmount)) {
      setPromoError('Code et reduction requis')
      return
    }
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newPromoCode,
          description: newPromoDesc || null,
          discount_percent: newPromoPercent ? parseInt(newPromoPercent) : null,
          discount_amount: newPromoAmount ? parseInt(newPromoAmount) : null,
          expires_at: newPromoExpires || null,
          max_uses: newPromoMaxUses ? parseInt(newPromoMaxUses) : null,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        flash('success', `Code "${newPromoCode.toUpperCase()}" cree`)
        setShowAddPromo(false)
        setNewPromoCode('')
        setNewPromoDesc('')
        setNewPromoPercent('')
        setNewPromoAmount('')
        setNewPromoExpires('')
        setNewPromoMaxUses('')
        setPromoError('')
        fetchPromoCodes()
      } else {
        setPromoError(json.error || 'Erreur creation')
        if (json.needsMigration && json.sql) {
          setPromoError('Table non creee. Executez ce SQL dans Supabase SQL Editor: ' + json.sql)
        }
      }
    } catch {
      setPromoError('Erreur creation')
    }
  }

  const togglePromoCode = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive }),
      })
      fetchPromoCodes()
    } catch { flash('error', 'Erreur') }
  }

  const deletePromoCode = async (id: string) => {
    try {
      await fetch('/api/admin/promo-codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      flash('success', 'Code supprime')
      fetchPromoCodes()
    } catch { flash('error', 'Erreur suppression') }
  }

  // Fetch data when tab changes
  useEffect(() => {
    if (!isAdmin) return
    if (activeTab === 'dashboard') fetchStats()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'verifications') fetchVerifications()
    if (activeTab === 'admins') fetchAdmins()
    if (activeTab === 'promotions') fetchPromoCodes()
  }, [activeTab, isAdmin, fetchStats, fetchUsers, fetchVerifications, fetchAdmins, fetchPromoCodes])

  // Load user docs when a user is selected
  useEffect(() => {
    if (selectedUserId && activeTab === 'users') {
      loadUserDocs(selectedUserId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId])

  // ---------------------------------------------------------------------------
  // User actions
  // ---------------------------------------------------------------------------
  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!res.ok) {
        flash('error', json.error || 'Erreur lors de la mise a jour')
        return
      }
      // Send email notification
      const targetUser = users.find(u => u.id === userId)
      if (targetUser?.email) {
        try {
          const obs = userObservations[userId] || ''
          await fetch('/api/send-verification-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: targetUser.email,
              name: `${targetUser.first_name || ''} ${targetUser.last_name || ''}`.trim(),
              status: status === 'suspended' ? 'suspended' : 'reactivated',
              reason: obs,
            }),
          })
        } catch {}
      }
      flash('success', status === 'suspended' ? 'Compte suspendu — email envoye' : 'Compte reactive — email envoye')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u))
    } catch {
      flash('error', 'Erreur reseau lors de la mise a jour')
    }
  }

  const loadUserDocs = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users?docs=' + userId)
      const json = await res.json()
      if (res.ok) {
        setUserDocs(prev => ({ ...prev, [userId]: json.verifications || json.docs || [] }))
      }
    } catch {
      // silently fail
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        flash('error', json.error || 'Erreur lors de la suppression')
        return
      }
      flash('success', 'Utilisateur supprime')
      setUsers(prev => prev.filter(u => u.id !== userId))
      setDeleteConfirmId(null)
      if (selectedUserId === userId) {
        navigateBackFromUser()
      }
    } catch {
      flash('error', 'Erreur reseau lors de la suppression')
    }
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
      try {
        await fetch('/api/send-verification-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v.profiles?.email || v.user_email, name: v.user_name || `${v.profiles?.first_name || ''} ${v.profiles?.last_name || ''}`.trim(), status: 'approved' }) })
      } catch {}
      flash('success', 'Identite approuvee — email envoye')
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
      try {
        await fetch('/api/send-verification-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v.profiles?.email || v.user_email, name: v.user_name || `${v.profiles?.first_name || ''} ${v.profiles?.last_name || ''}`.trim(), status: 'rejected', reason: rejectionReason }) })
      } catch {}
      flash('success', 'Verification rejetee — email envoye')
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
    // Text search
    if (userSearch) {
      const q = userSearch.toLowerCase()
      const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase()
      if (!name.includes(q) && !(u.email || '').toLowerCase().includes(q)) return false
    }
    // Filter pills
    if (userFilter === 'clients') return u.user_type === 'client'
    if (userFilter === 'hosts') return u.user_type === 'host' || u.user_type === 'hote'
    if (userFilter === 'suspended') return u.status === 'suspended'
    if (userFilter === 'verified') return u.identity_verified === true
    return true
  })

  // Selected user object
  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) || null : null

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

  // =========================================================================
  // ADMIN DASHBOARD LAYOUT
  // =========================================================================
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
              onClick={() => navigateToTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === key ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => setShowEmailModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <Send className="h-4 w-4" />
            Envoyer un email
          </button>
          <div className="pt-2 border-t border-gray-100">
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
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded hover:bg-gray-100">
            <Menu className="h-5 w-5 text-gray-700" />
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
                <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de la plateforme Ikasso</p>
              </div>

              {statsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
              ) : (
                <>
                {/* Section: Utilisateurs */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Utilisateurs</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Total inscrits', value: stats.totalUsers, icon: Users, bg: 'bg-blue-100', fg: 'text-blue-600' },
                    { label: 'Comptes actifs', value: stats.activeUsers, icon: UserCheck, bg: 'bg-green-100', fg: 'text-green-600' },
                    { label: 'Clients', value: stats.totalClients, icon: Users, bg: 'bg-indigo-100', fg: 'text-indigo-600' },
                    { label: 'Hotes', value: stats.totalHosts, icon: Home, bg: 'bg-purple-100', fg: 'text-purple-600' },
                    { label: 'Comptes verifies', value: stats.verifiedUsers, icon: Shield, bg: 'bg-emerald-100', fg: 'text-emerald-600' },
                    { label: 'Comptes bloques', value: stats.suspendedUsers, icon: AlertTriangle, bg: 'bg-red-100', fg: 'text-red-600' },
                  ].map((card, i) => (
                    <div
                      key={i}
                      onClick={() => navigateToTab('users')}
                      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full ${card.bg} flex items-center justify-center flex-shrink-0`}>
                          {React.createElement(card.icon, { className: `h-6 w-6 ${card.fg}` })}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section: Verifications */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Verifications d&apos;identite</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'En attente', value: stats.pendingVerifications, icon: FileCheck, bg: 'bg-amber-100', fg: 'text-amber-600' },
                    { label: 'Approuvees', value: stats.approvedVerifications, icon: CheckCircle2, bg: 'bg-green-100', fg: 'text-green-600' },
                    { label: 'Refusees', value: stats.rejectedVerifications, icon: XCircle, bg: 'bg-red-100', fg: 'text-red-600' },
                  ].map((card, i) => (
                    <div
                      key={i}
                      onClick={() => navigateToTab('verifications')}
                      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full ${card.bg} flex items-center justify-center flex-shrink-0`}>
                          {React.createElement(card.icon, { className: `h-6 w-6 ${card.fg}` })}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section: Finances */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Finances & Reservations</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Revenus total', value: stats.totalRevenue.toLocaleString('fr-FR') + ' FCFA', icon: CreditCard, gradient: 'from-emerald-500 to-emerald-600' },
                    { label: 'Revenus ce mois', value: stats.monthRevenue.toLocaleString('fr-FR') + ' FCFA', icon: CreditCard, gradient: 'from-blue-500 to-blue-600' },
                    { label: 'Reservations total', value: String(stats.totalBookings), icon: Calendar, gradient: 'from-purple-500 to-purple-600' },
                    { label: 'Reservations payees', value: String(stats.paidBookings), icon: CheckCircle2, gradient: 'from-green-500 to-green-600' },
                  ].map((card, i) => (
                    <div key={i} className={`rounded-xl p-5 shadow-sm bg-gradient-to-br ${card.gradient} text-white`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          {React.createElement(card.icon, { className: 'h-5 w-5 text-white' })}
                        </div>
                      </div>
                      <p className="text-lg font-bold">{card.value}</p>
                      <p className="text-xs text-white/80 mt-0.5">{card.label}</p>
                    </div>
                  ))}
                </div>

                {/* Section: Proprietes */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Proprietes</h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: 'Actives', value: stats.activeProperties, icon: Home, bg: 'bg-green-100', fg: 'text-green-600' },
                    { label: 'En attente', value: stats.pendingProperties, icon: Clock, bg: 'bg-amber-100', fg: 'text-amber-600' },
                  ].map((card, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full ${card.bg} flex items-center justify-center flex-shrink-0`}>
                          {React.createElement(card.icon, { className: `h-6 w-6 ${card.fg}` })}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions rapides */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions rapides</h3>
                <div className="flex flex-wrap gap-3 mb-8">
                  <button
                    onClick={() => { navigateToTab('verifications') }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <FileCheck className="h-4 w-4" />
                    {stats.pendingVerifications} verification(s) en attente
                  </button>
                  <button
                    onClick={() => { navigateToTab('users'); setUserFilter('suspended') }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <UserX className="h-4 w-4" />
                    {stats.suspendedUsers} utilisateur(s) suspendu(s)
                  </button>
                </div>
                </>
              )}

              <div className="mt-4 bg-primary-50 border border-primary-200 rounded-xl p-5">
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
          {activeTab === 'users' && !selectedUserId && (
            <div>
              {/* Search bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    className="pl-12 pr-4 py-3 w-full rounded-xl border border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {([
                  { key: 'all' as UserFilter, label: 'Tous' },
                  { key: 'clients' as UserFilter, label: 'Clients' },
                  { key: 'hosts' as UserFilter, label: 'Hotes' },
                  { key: 'suspended' as UserFilter, label: 'Suspendus' },
                  { key: 'verified' as UserFilter, label: 'Verifies' },
                ]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setUserFilter(f.key)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      userFilter === f.key
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                <span className="flex items-center text-xs text-gray-400 ml-2">{filteredUsers.length} resultat(s)</span>
              </div>

              {usersLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Aucun utilisateur trouve</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map(u => {
                    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Sans nom'
                    const initials = `${(u.first_name || '?')[0]}${(u.last_name || '?')[0]}`.toUpperCase()
                    return (
                      <div
                        key={u.id}
                        onClick={() => navigateToUser(u.id)}
                        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-primary-300 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-11 w-11 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary-600">{initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email || '-'}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.user_type === 'host' || u.user_type === 'hote'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {u.user_type === 'host' || u.user_type === 'hote' ? 'Hote' : 'Client'}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : u.status === 'suspended'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}>
                            {u.status === 'active' ? 'Actif' : u.status === 'suspended' ? 'Suspendu' : u.status || 'Inconnu'}
                          </span>
                          {u.identity_verified && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              <CheckCircle className="h-3 w-3" /> Verifie
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* =============== USER DETAIL VIEW =============== */}
          {activeTab === 'users' && selectedUserId && (
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={navigateBackFromUser}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                {selectedUser ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-600">
                        {`${(selectedUser.first_name || '?')[0]}${(selectedUser.last_name || '?')[0]}`.toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl font-bold text-gray-900 truncate">
                        {`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || 'Sans nom'}
                      </h1>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.user_type === 'host' || selectedUser.user_type === 'hote'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {selectedUser.user_type === 'host' || selectedUser.user_type === 'hote' ? 'Hote' : 'Client'}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : selectedUser.status === 'suspended'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {selectedUser.status === 'active' ? 'Actif' : selectedUser.status === 'suspended' ? 'Suspendu' : selectedUser.status || 'Inconnu'}
                        </span>
                        {selectedUser.identity_verified && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle className="h-3 w-3" /> Verifie
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Utilisateur introuvable</p>
                )}
              </div>

              {selectedUser && (
                <>
                  {/* Two-column info grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Personal info card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary-600" />
                        </div>
                        Informations personnelles
                      </h4>
                      <div className="space-y-3 text-sm">
                        {[
                          { label: 'Prenom', value: selectedUser.first_name },
                          { label: 'Nom', value: selectedUser.last_name },
                          { label: 'Email', value: selectedUser.email },
                          { label: 'Telephone', value: selectedUser.phone },
                          { label: 'Date de naissance', value: selectedUser.date_of_birth ? new Date(selectedUser.date_of_birth).toLocaleDateString('fr-FR') : undefined },
                          { label: 'Adresse', value: selectedUser.address },
                          { label: 'Ville', value: selectedUser.city },
                          { label: 'Pays', value: selectedUser.country },
                        ].map((row, i) => (
                          <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                            <span className="text-gray-500">{row.label}</span>
                            <span className="text-gray-900 font-medium text-right">{row.value || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Account status card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <Shield className="h-4 w-4 text-primary-600" />
                        </div>
                        Statut du compte
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-gray-500">ID</span>
                          <span className="text-gray-900 text-xs font-mono break-all text-right max-w-[200px]">{selectedUser.id}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-gray-500">Type</span>
                          <span className="text-gray-900 font-medium">{selectedUser.user_type === 'host' || selectedUser.user_type === 'hote' ? 'Hote' : 'Client'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-gray-500">Statut</span>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${selectedUser.status === 'active' ? 'bg-green-100 text-green-700' : selectedUser.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            {selectedUser.status === 'active' ? 'Actif' : selectedUser.status === 'suspended' ? 'Suspendu' : selectedUser.status || 'Inconnu'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-gray-500">Identite verifiee</span>
                          {selectedUser.identity_verified
                            ? <span className="text-green-600 font-medium">Oui</span>
                            : <span className="text-red-500 font-medium">Non</span>
                          }
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-50">
                          <span className="text-gray-500">Inscription</span>
                          <span className="text-gray-900">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-500">Membre depuis</span>
                          <span className="text-gray-900">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <FileCheck className="h-4 w-4 text-primary-600" />
                      </div>
                      Documents d&apos;identite
                    </h4>
                    {userDocs[selectedUser.id] && userDocs[selectedUser.id].length > 0 ? (
                      <div className="space-y-4">
                        {userDocs[selectedUser.id].map(doc => (
                          <div key={doc.id} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm font-medium text-gray-700">{doc.document_type_label || doc.document_type}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${doc.status === 'approved' ? 'bg-green-100 text-green-700' : doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {doc.status === 'approved' ? 'Approuve' : doc.status === 'rejected' ? 'Rejete' : 'En attente'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                              {[
                                { key: 'document_front_url', label: 'Document Recto' },
                                { key: 'document_back_url', label: 'Document Verso' },
                                { key: 'face_front_url', label: 'Visage Face' },
                                { key: 'face_left_url', label: 'Visage Gauche' },
                                { key: 'face_right_url', label: 'Visage Droite' },
                              ].map(({ key, label }) => {
                                const url = doc[key] as string | undefined
                                return (
                                  <div key={key} className="text-center">
                                    <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
                                    {url ? (
                                      <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
                                        <div className="relative w-full h-28 rounded-lg border border-gray-200 group-hover:border-primary-400 overflow-hidden transition-colors">
                                          <img
                                            src={url}
                                            alt={label}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="flex items-center justify-center h-full text-xs text-red-400">Erreur chargement</span>' }}
                                          />
                                        </div>
                                      </a>
                                    ) : (
                                      <div className="w-full h-28 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                        <span className="text-xs text-gray-400">Manquant</span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Aucun document soumis</p>
                    )}
                  </div>

                  {/* Actions bar */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Actions</h4>
                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
                      {selectedUser.status !== 'suspended' ? (
                        <button
                          onClick={() => updateUserStatus(selectedUser.id, 'suspended')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors w-full sm:w-auto justify-center"
                        >
                          <UserX className="h-4 w-4" /> Suspendre
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserStatus(selectedUser.id, 'active')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors w-full sm:w-auto justify-center"
                        >
                          <UserCheck className="h-4 w-4" /> Reactiver
                        </button>
                      )}

                      {!selectedUser.identity_verified && (
                        <button
                          onClick={async () => {
                            const sb = supabase()
                            if (!sb) return
                            const { error } = await sb.from('profiles').update({ identity_verified: true }).eq('id', selectedUser.id)
                            if (error) { flash('error', error.message) } else {
                              flash('success', 'Utilisateur valide')
                              setUsers(prev => prev.map(x => x.id === selectedUser.id ? { ...x, identity_verified: true } : x))
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors w-full sm:w-auto justify-center"
                        >
                          <CheckCircle className="h-4 w-4" /> Valider identite
                        </button>
                      )}

                      {selectedUser.email && (
                        <a
                          href={`mailto:${selectedUser.email}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
                        >
                          <Mail className="h-4 w-4" /> Contacter
                        </a>
                      )}

                      {/* Delete button and confirmation */}
                      {deleteConfirmId === selectedUser.id ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto border border-red-200 rounded-lg p-3 bg-red-50">
                          <p className="text-sm text-red-800">Etes-vous sur ? Cette action est irreversible.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => deleteUser(selectedUser.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" /> Confirmer la suppression
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(selectedUser.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors w-full sm:w-auto justify-center"
                        >
                          <Trash2 className="h-4 w-4" /> Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* =============== VERIFICATIONS TAB =============== */}
          {activeTab === 'verifications' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Verifications d&apos;identite</h1>
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
                <div className="space-y-6">
                  {verifications.map(v => (
                    <div key={v.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Header with user info */}
                      <div className="bg-gray-50 border-b border-gray-200 px-5 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary-600">
                                {(v.user_name || '?')[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{v.user_name || 'Utilisateur inconnu'}</p>
                              <p className="text-xs text-gray-500">{v.user_email || '-'}{v.user_phone ? ` | ${v.user_phone}` : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-medium">{v.user_type === 'hote' ? 'Hote' : 'Client'}</span>
                            <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 font-medium">{v.document_type_label || v.document_type}</span>
                            <span>Soumis le {v.submitted_at || v.created_at ? new Date(v.submitted_at || v.created_at!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Documents grid */}
                      <div className="px-5 py-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documents soumis</p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {[
                            { key: 'document_front_url', label: 'Document Recto' },
                            { key: 'document_back_url', label: 'Document Verso' },
                            { key: 'face_front_url', label: 'Visage Face' },
                            { key: 'face_left_url', label: 'Visage Gauche' },
                            { key: 'face_right_url', label: 'Visage Droite' },
                          ].map(({ key, label }) => {
                            const url = v[key] as string | undefined
                            return (
                              <div key={key} className="text-center">
                                <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
                                {url ? (
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
                                    <div className="relative w-full h-28 rounded-lg border border-gray-200 group-hover:border-primary-400 overflow-hidden transition-colors">
                                      <img
                                        src={url}
                                        alt={label}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="flex items-center justify-center h-full text-xs text-red-400">Erreur chargement</span>' }}
                                      />
                                    </div>
                                  </a>
                                ) : (
                                  <div className="w-full h-28 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                    <span className="text-xs text-gray-400">Manquant</span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="bg-gray-50 border-t border-gray-200 px-5 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => approveVerification(v)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                          >
                            <CheckCircle className="h-4 w-4" /> Approuver
                          </button>
                          {rejectingId === v.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                placeholder="Motif du rejet..."
                                className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-red-500 focus:ring-red-500"
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                autoFocus
                              />
                              <button onClick={() => rejectVerification(v)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">
                                Confirmer le rejet
                              </button>
                              <button onClick={() => { setRejectingId(null); setRejectionReason('') }} className="p-2 rounded-lg hover:bg-gray-200 text-gray-500">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRejectingId(v.id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                            >
                              <XCircle className="h-4 w-4" /> Rejeter
                            </button>
                          )}
                          {v.user_email && v.user_email !== '-' && (
                            <a href={`mailto:${v.user_email}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors ml-auto" title="Contacter l'utilisateur">
                              <Mail className="h-4 w-4" /> Contacter
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =============== PROMOTIONS TAB =============== */}
          {activeTab === 'promotions' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Codes promotionnels</h1>
                  <p className="text-gray-500 text-sm mt-1">Gerez les bons de reduction pour Ikasso</p>
                </div>
                <button
                  onClick={() => setShowAddPromo(!showAddPromo)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Nouveau code promo
                </button>
              </div>

              {/* Add promo form */}
              {showAddPromo && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Creer un code promotionnel</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 uppercase"
                        value={newPromoCode}
                        onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                        placeholder="ex: BIENVENUE20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reduction en %</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                          value={newPromoPercent}
                          onChange={e => { setNewPromoPercent(e.target.value); if (e.target.value) setNewPromoAmount('') }}
                          placeholder="ex: 20"
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ou reduction fixe (FCFA)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                        value={newPromoAmount}
                        onChange={e => { setNewPromoAmount(e.target.value); if (e.target.value) setNewPromoPercent('') }}
                        placeholder="ex: 5000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                        value={newPromoDesc}
                        onChange={e => setNewPromoDesc(e.target.value)}
                        placeholder="Offre de bienvenue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;expiration</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                        value={newPromoExpires}
                        onChange={e => setNewPromoExpires(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Utilisations max</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                        value={newPromoMaxUses}
                        onChange={e => setNewPromoMaxUses(e.target.value)}
                        placeholder="Illimite si vide"
                      />
                    </div>
                  </div>

                  {promoError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{promoError}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button onClick={createPromoCode} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors">
                      Creer le code
                    </button>
                    <button onClick={() => { setShowAddPromo(false); setPromoError('') }} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Promo codes list */}
              {promosLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
              ) : promoCodes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucun code promotionnel</p>
                  <p className="text-gray-400 text-sm mt-1">Creez votre premier code promo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {promoCodes.map(pc => (
                    <div key={pc.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${pc.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${pc.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Tag className={`h-6 w-6 ${pc.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-lg text-gray-900">{pc.code}</span>
                              {pc.is_active ? (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Actif</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactif</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{pc.description || 'Pas de description'}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              <span className="font-semibold text-primary-600">
                                {pc.discount_percent ? `-${pc.discount_percent}%` : pc.discount_amount ? `-${pc.discount_amount.toLocaleString()} FCFA` : '-'}
                              </span>
                              {pc.max_uses && <span>{pc.current_uses}/{pc.max_uses} utilisations</span>}
                              {pc.expires_at && <span>Expire le {new Date(pc.expires_at).toLocaleDateString('fr-FR')}</span>}
                              <span>Cree le {new Date(pc.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePromoCode(pc.id, pc.is_active)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pc.is_active ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}
                          >
                            {pc.is_active ? 'Desactiver' : 'Reactiver'}
                          </button>
                          <button
                            onClick={() => deletePromoCode(pc.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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

      {/* =============== EMAIL MODAL =============== */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Send className="h-5 w-5 text-primary-500" />
                Envoyer un email
              </h3>
              <button onClick={() => setShowEmailModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                    value={emailTo}
                    onChange={e => setEmailTo(e.target.value)}
                    placeholder="utilisateur@email.com"
                    list="user-emails"
                  />
                  <datalist id="user-emails">
                    {users.filter(u => u.email).map(u => (
                      <option key={u.id} value={u.email!}>{u.first_name} {u.last_name}</option>
                    ))}
                  </datalist>
                </div>
                <p className="text-xs text-gray-400 mt-1">Commencez a taper pour voir les suggestions</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Objet de l'email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 resize-none"
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  placeholder="Votre message..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={sendAdminEmail}
                disabled={emailSending || !emailTo || !emailSubject || !emailMessage}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 transition-colors"
              >
                {emailSending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</>
                ) : (
                  <><Send className="h-4 w-4" /> Envoyer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
