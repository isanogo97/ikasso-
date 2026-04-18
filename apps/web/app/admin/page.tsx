'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Shield, Users, BarChart3, LogOut, Search, ChevronDown, ChevronUp,
  CheckCircle, CheckCircle2, XCircle, AlertTriangle, Mail, Eye, UserCheck, UserX,
  Flag, RefreshCw, Plus, Trash2, LayoutDashboard, FileCheck, UserCog,
  Loader2, Home, X, CreditCard, Calendar, Clock, Menu, ArrowLeft, Tag, Send, Percent,
  MessageSquare, Gift, FileText, DollarSign, ChevronRight, Lock
} from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'
import { getAllUsers, getAdminUsers, adminSignIn, getCurrentAdmin } from '../lib/dal'
import type { AdminUser } from '../lib/dal'
import { createClient, isSupabaseConfigured } from '../lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Tab = 'dashboard' | 'users' | 'verifications' | 'admins' | 'promotions' | 'incidents' | 'publicite'
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
  openIncidents: number
  activeSponsors: number
  deletedUsers: number
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
  target_type?: 'all' | 'hote' | 'client'
  target_emails?: string[]
  created_at: string
}

const TAB_ITEMS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { key: 'users', label: 'Utilisateurs', icon: Users },
  { key: 'verifications', label: 'Verifications', icon: FileCheck },
  { key: 'promotions', label: 'Promotions', icon: Tag },
  { key: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { key: 'publicite', label: 'Publicite', icon: Eye },
  { key: 'admins', label: 'Administrateurs', icon: UserCog },
]

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------
function getTabFromUrl(): { tab: Tab; userId: string | null } {
  if (typeof window === 'undefined') return { tab: 'dashboard', userId: null }
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('tab')
  const validTabs: Tab[] = ['dashboard', 'users', 'verifications', 'admins', 'promotions', 'incidents', 'publicite']
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
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalHosts: 0, totalClients: 0, pendingVerifications: 0, approvedVerifications: 0, rejectedVerifications: 0, activeProperties: 0, pendingProperties: 0, suspendedUsers: 0, activeUsers: 0, verifiedUsers: 0, totalBookings: 0, paidBookings: 0, totalRevenue: 0, monthRevenue: 0, openIncidents: 0, activeSponsors: 0, deletedUsers: 0 })
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
  const [newPromoTarget, setNewPromoTarget] = useState<'all' | 'hote' | 'client'>('all')
  const [newPromoEmails, setNewPromoEmails] = useState('')
  const [promoError, setPromoError] = useState('')

  // Incidents
  const [incidents, setIncidents] = useState<any[]>([])
  const [incidentsLoading, setIncidentsLoading] = useState(false)
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'open' | 'pending' | 'on_hold' | 'closed'>('all')
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [incidentMessages, setIncidentMessages] = useState<any[]>([])
  const [incidentReply, setIncidentReply] = useState('')
  const [incidentSendEmail, setIncidentSendEmail] = useState(true)
  const [userIncidents, setUserIncidents] = useState<any[]>([])
  const [userIncidentsLoading, setUserIncidentsLoading] = useState(false)
  // Sponsors / Publicite
  const [sponsors, setSponsors] = useState<any[]>([])
  const [sponsorsLoading, setSponsorsLoading] = useState(false)
  const [showAddSponsor, setShowAddSponsor] = useState(false)
  const [sponsorForm, setSponsorForm] = useState({ business_name: '', contact_name: '', contact_email: '', contact_phone: '', plan: 'standard', amount_paid: '', payment_method: '', payment_reference: '', start_date: '', end_date: '', notes: '' })
  const [sponsorTransactions, setSponsorTransactions] = useState<Record<string, any[]>>({})
  const [expandedSponsor, setExpandedSponsor] = useState<string | null>(null)
  // Referrals
  const [referralCodes, setReferralCodes] = useState<any[]>([])
  const [allReferrals, setAllReferrals] = useState<any[]>([])
  const [referralsLoading, setReferralsLoading] = useState(false)
  const [showAddReferral, setShowAddReferral] = useState(false)
  const [referralHostId, setReferralHostId] = useState('')
  const [referralRewardMonths, setReferralRewardMonths] = useState('3')
  const [referralMaxUses, setReferralMaxUses] = useState('10')

  const [showAddHistory, setShowAddHistory] = useState(false)
  const [historySubject, setHistorySubject] = useState('')
  const [historyMessage, setHistoryMessage] = useState('')
  const [historyChannel, setHistoryChannel] = useState<'email' | 'phone' | 'other'>('email')
  const [historyStatus, setHistoryStatus] = useState<'open' | 'pending' | 'closed'>('open')

  // Action feedback
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const flash = useCallback((type: 'success' | 'error', text: string) => {
    setActionMsg({ type, text })
    setTimeout(() => setActionMsg(null), 4000)
  }, [])

  // Authenticated fetch helper: sends Supabase token with every admin API call
  const adminFetch = useCallback(async (url: string, options?: RequestInit) => {
    const headers: Record<string, string> = { ...(options?.headers as Record<string, string> || {}) }
    try {
      const sb = isSupabaseConfigured() ? createClient() : null
      if (sb) {
        const { data: { session } } = await sb.auth.getSession()
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
      }
    } catch {}
    return fetch(url, { ...options, headers })
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
      // Use server-side API route for accurate stats (bypasses RLS)
      const res = await adminFetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalUsers: data.totalUsers ?? 0,
          totalHosts: data.totalHosts ?? 0,
          totalClients: data.totalClients ?? 0,
          pendingVerifications: data.pendingVerifications ?? 0,
          approvedVerifications: data.approvedVerifications ?? 0,
          rejectedVerifications: data.rejectedVerifications ?? 0,
          activeProperties: data.activeProperties ?? 0,
          pendingProperties: data.pendingProperties ?? 0,
          suspendedUsers: data.suspendedUsers ?? 0,
          activeUsers: data.activeUsers ?? 0,
          verifiedUsers: data.verifiedUsers ?? 0,
          totalBookings: data.totalBookings ?? 0,
          paidBookings: data.paidBookings ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          monthRevenue: data.monthRevenue ?? 0,
          openIncidents: data.openIncidents ?? 0,
          activeSponsors: data.activeSponsors ?? 0,
          deletedUsers: data.deletedUsers ?? 0,
        })
      }
    } catch {
      flash('error', 'Impossible de charger les statistiques')
    } finally {
      setStatsLoading(false)
    }
  }, [flash])

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
      const res = await adminFetch('/api/admin/verifications')
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
      const res = await adminFetch('/api/admin/promo-codes')
      const json = await res.json()
      setPromoCodes(json.codes || [])
    } catch {
      flash('error', 'Impossible de charger les codes promo')
    } finally {
      setPromosLoading(false)
    }
  }, [flash])

  const fetchIncidents = useCallback(async () => {
    setIncidentsLoading(true)
    try {
      const res = await adminFetch('/api/admin/incidents?status=' + incidentFilter)
      const json = await res.json()
      setIncidents(json.incidents || [])
    } catch {
      flash('error', 'Impossible de charger les incidents')
    } finally {
      setIncidentsLoading(false)
    }
  }, [flash, incidentFilter])

  const loadIncidentDetail = async (incidentId: string) => {
    try {
      const res = await adminFetch('/api/admin/incidents/' + incidentId)
      const json = await res.json()
      if (res.ok) {
        setSelectedIncident(json.incident)
        setIncidentMessages(json.messages || [])
      }
    } catch {}
  }

  const updateIncidentStatus = async (incidentId: string, status: string) => {
    try {
      await adminFetch('/api/admin/incidents/' + incidentId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminName: currentAdmin?.name }),
      })
      flash('success', 'Statut mis a jour')
      loadIncidentDetail(incidentId)
      fetchIncidents()
    } catch { flash('error', 'Erreur') }
  }

  const sendIncidentReply = async () => {
    if (!incidentReply.trim() || !selectedIncident) return
    try {
      const res = await adminFetch('/api/admin/incidents/' + selectedIncident.id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: incidentReply,
          adminName: currentAdmin?.name,
          sendEmail: incidentSendEmail,
          userEmail: selectedIncident.user_email,
          subject: selectedIncident.subject,
        }),
      })
      if (res.ok) {
        flash('success', incidentSendEmail ? 'Reponse envoyee + email' : 'Reponse enregistree')
        setIncidentReply('')
        loadIncidentDetail(selectedIncident.id)
      }
    } catch { flash('error', 'Erreur envoi') }
  }

  const createIncidentFromUser = async (userId: string, userEmail: string, subject: string, message: string) => {
    try {
      const res = await adminFetch('/api/admin/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, subject, message,
          adminName: currentAdmin?.name,
          sendEmail: true,
          userEmail,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        flash('success', 'Incident cree + email envoye')
        return json.incident
      }
    } catch {}
    return null
  }

  const fetchUserIncidents = async (userId: string) => {
    setUserIncidentsLoading(true)
    try {
      const res = await adminFetch('/api/admin/incidents?userId=' + userId)
      const json = await res.json()
      setUserIncidents(json.incidents || [])
    } catch {
      setUserIncidents([])
    } finally {
      setUserIncidentsLoading(false)
    }
  }

  const addHistoryEntry = async () => {
    if (!historySubject.trim() || !selectedUserId) return
    try {
      const res = await adminFetch('/api/admin/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          subject: `[${historyChannel === 'email' ? 'Email' : historyChannel === 'phone' ? 'Telephone' : 'Autre'}] ${historySubject}`,
          message: historyMessage || null,
          adminName: currentAdmin?.name,
          sendEmail: false,
        }),
      })
      if (res.ok) {
        // If status is not open, update it
        if (historyStatus !== 'open') {
          const json = await res.json()
          if (json.incident?.id) {
            await adminFetch('/api/admin/incidents/' + json.incident.id, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: historyStatus, adminName: currentAdmin?.name }),
            })
          }
        }
        flash('success', 'Entree ajoutee a l\'historique')
        setShowAddHistory(false)
        setHistorySubject('')
        setHistoryMessage('')
        setHistoryChannel('email')
        setHistoryStatus('open')
        fetchUserIncidents(selectedUserId)
      }
    } catch { flash('error', 'Erreur') }
  }

  const fetchSponsors = useCallback(async () => {
    setSponsorsLoading(true)
    try {
      const res = await adminFetch('/api/admin/sponsors')
      const json = await res.json()
      setSponsors(json.sponsors || [])
    } catch {
      flash('error', 'Impossible de charger les sponsors')
    } finally {
      setSponsorsLoading(false)
    }
  }, [flash])

  const createSponsor = async () => {
    if (!sponsorForm.business_name || !sponsorForm.start_date || !sponsorForm.end_date) {
      flash('error', 'Nom, date debut et date fin requis')
      return
    }
    try {
      const res = await adminFetch('/api/admin/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sponsorForm, amount_paid: parseInt(sponsorForm.amount_paid) || 0, created_by: currentAdmin?.name }),
      })
      if (res.ok) {
        flash('success', 'Sponsor ajoute')
        setShowAddSponsor(false)
        setSponsorForm({ business_name: '', contact_name: '', contact_email: '', contact_phone: '', plan: 'standard', amount_paid: '', payment_method: '', payment_reference: '', start_date: '', end_date: '', notes: '' })
        fetchSponsors()
      } else {
        const json = await res.json()
        flash('error', json.error || 'Erreur creation')
      }
    } catch { flash('error', 'Erreur creation') }
  }

  const toggleSponsor = async (id: string, isActive: boolean) => {
    await adminFetch('/api/admin/sponsors', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_active: !isActive }) })
    fetchSponsors()
  }

  const deleteSponsor = async (id: string) => {
    await adminFetch('/api/admin/sponsors', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    flash('success', 'Sponsor supprime')
    fetchSponsors()
  }

  const loadSponsorTransactions = async (sponsorId: string) => {
    try {
      const res = await adminFetch('/api/admin/sponsors/' + sponsorId + '/transactions')
      const json = await res.json()
      setSponsorTransactions(prev => ({ ...prev, [sponsorId]: json.transactions || [] }))
    } catch {}
  }

  const addSponsorTransaction = async (sponsorId: string, type: string, amount: number, desc: string, payMethod?: string, payRef?: string) => {
    try {
      await adminFetch('/api/admin/sponsors/' + sponsorId + '/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount, description: desc, payment_method: payMethod, payment_reference: payRef, created_by: currentAdmin?.name }),
      })
      flash('success', type === 'paiement' ? 'Paiement enregistre + sponsor active' : 'Transaction ajoutee')
      loadSponsorTransactions(sponsorId)
      if (type === 'paiement') fetchSponsors()
    } catch { flash('error', 'Erreur') }
  }

  const sendSponsorInvoice = async (sponsorId: string) => {
    try {
      const res = await adminFetch('/api/admin/sponsors/' + sponsorId + '/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ created_by: currentAdmin?.name }),
      })
      const json = await res.json()
      if (res.ok) {
        flash('success', 'Facture ' + json.invoiceNumber + ' generee et envoyee')
        loadSponsorTransactions(sponsorId)
      } else flash('error', json.error || 'Erreur')
    } catch { flash('error', 'Erreur envoi facture') }
  }

  const fetchReferrals = useCallback(async () => {
    setReferralsLoading(true)
    try {
      const res = await adminFetch('/api/admin/referrals')
      const json = await res.json()
      setReferralCodes(json.codes || [])
      setAllReferrals(json.referrals || [])
    } catch {}
    finally { setReferralsLoading(false) }
  }, [])

  const createReferralCode = async () => {
    if (!referralHostId) { flash('error', 'Selectionnez un hote'); return }
    try {
      const res = await adminFetch('/api/admin/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_id: referralHostId, reward_months: parseInt(referralRewardMonths) || 3, max_referrals: parseInt(referralMaxUses) || 10 }),
      })
      if (res.ok) {
        const json = await res.json()
        flash('success', 'Code ' + json.referralCode.code + ' cree')
        setShowAddReferral(false)
        setReferralHostId('')
        fetchReferrals()
      }
    } catch { flash('error', 'Erreur') }
  }

  const toggleReferralCode = async (id: string, isActive: boolean) => {
    await adminFetch('/api/admin/referrals', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_active: !isActive }) })
    fetchReferrals()
  }

  const sendAdminEmail = async () => {
    if (!emailTo || !emailSubject || !emailMessage) {
      flash('error', 'Remplissez tous les champs')
      return
    }
    setEmailSending(true)
    try {
      const res = await adminFetch('/api/admin/send-email', {
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
        // Auto-create incident if sending to a known user
        const matchedUser = users.find(u => u.email === emailTo)
        if (matchedUser) {
          await createIncidentFromUser(matchedUser.id, emailTo, emailSubject, emailMessage)
        }
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
      const res = await adminFetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newPromoCode,
          description: newPromoDesc || null,
          discount_percent: newPromoPercent ? parseInt(newPromoPercent) : null,
          discount_amount: newPromoAmount ? parseInt(newPromoAmount) : null,
          expires_at: newPromoExpires || null,
          max_uses: newPromoMaxUses ? parseInt(newPromoMaxUses) : null,
          target_type: newPromoTarget,
          target_emails: newPromoEmails || null,
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
        setNewPromoTarget('all')
        setNewPromoEmails('')
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
      await adminFetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive }),
      })
      fetchPromoCodes()
    } catch { flash('error', 'Erreur') }
  }

  const deletePromoCode = async (id: string) => {
    try {
      await adminFetch('/api/admin/promo-codes', {
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
    if (activeTab === 'promotions') { fetchPromoCodes(); fetchReferrals() }
    if (activeTab === 'incidents') fetchIncidents()
    if (activeTab === 'publicite') fetchSponsors()
  }, [activeTab, isAdmin, fetchStats, fetchUsers, fetchVerifications, fetchAdmins, fetchPromoCodes, fetchIncidents, fetchSponsors, fetchReferrals])

  // Load user docs when a user is selected
  useEffect(() => {
    if (selectedUserId && activeTab === 'users') {
      loadUserDocs(selectedUserId)
      fetchUserIncidents(selectedUserId)
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
      const res = await adminFetch('/api/admin/users?docs=' + userId)
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
    try {
      // Use API routes to bypass RLS
      const res1 = await adminFetch('/api/admin/users/' + v.user_id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity_verified: true }),
      })
      // Update verification status via admin API
      const res2 = await adminFetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: v.id, status: 'approved' }),
      })
      if (!res1.ok || !res2.ok) {
        flash('error', 'Erreur lors de la validation')
        return
      }
      try {
        await fetch('/api/send-verification-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v.user_email || v.profiles?.email, name: v.user_name || `${v.profiles?.first_name || ''} ${v.profiles?.last_name || ''}`.trim(), status: 'approved' }) })
      } catch {}
      flash('success', 'Identite approuvee — email envoye')
      setVerifications(prev => prev.filter(x => x.id !== v.id))
      // Refresh user docs if viewing this user
      if (selectedUser?.id === v.user_id) loadUserDocs(v.user_id)
    } catch {
      flash('error', 'Erreur lors de la validation')
    }
  }

  const rejectVerification = async (v: Verification) => {
    if (!rejectionReason.trim()) return
    try {
      const res = await adminFetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: v.id, status: 'rejected', rejection_reason: rejectionReason }),
      })
      if (!res.ok) {
        flash('error', 'Erreur lors du rejet')
        return
      }
      try {
        await fetch('/api/send-verification-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v.user_email || v.profiles?.email, name: v.user_name || `${v.profiles?.first_name || ''} ${v.profiles?.last_name || ''}`.trim(), status: 'rejected', reason: rejectionReason }) })
      } catch {}
      flash('success', 'Verification rejetee — email envoye')
      setVerifications(prev => prev.filter(x => x.id !== v.id))
      setRejectingId(null)
      setRejectionReason('')
      // Refresh user docs if viewing this user
      if (selectedUser?.id === v.user_id) loadUserDocs(v.user_id)
    } catch {
      flash('error', 'Erreur lors du rejet')
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
                    { label: 'Comptes supprimes', value: stats.deletedUsers, icon: Trash2, bg: 'bg-gray-100', fg: 'text-gray-600' },
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

                {/* Section: Incidents & Sponsors */}
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Incidents & Sponsors</h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: 'Incidents ouverts', value: stats.openIncidents, icon: AlertTriangle, bg: 'bg-orange-100', fg: 'text-orange-600' },
                    { label: 'Sponsors actifs', value: stats.activeSponsors, icon: Gift, bg: 'bg-cyan-100', fg: 'text-cyan-600' },
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
                          <div key={doc.id} className={`border rounded-lg p-4 ${doc.status === 'rejected' ? 'border-red-200 bg-red-50/30' : doc.status === 'approved' ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="text-sm font-medium text-gray-700">{(doc as any).document_type_label || doc.document_type}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${doc.status === 'approved' ? 'bg-green-100 text-green-700' : doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {(doc as any).status_label || (doc.status === 'approved' ? 'Approuve' : doc.status === 'rejected' ? 'Refuse' : 'En attente')}
                              </span>
                              {doc.created_at && <span className="text-xs text-gray-400">Soumis le {new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                            </div>
                            {doc.rejection_reason && (
                              <div className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                                <strong>Motif du rejet :</strong> {doc.rejection_reason}
                              </div>
                            )}
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

                  {/* Historique complet */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                        Historique
                      </h4>
                      <button
                        onClick={() => setShowAddHistory(!showAddHistory)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" /> Ajouter
                      </button>
                    </div>

                    {/* Add history form */}
                    {showAddHistory && (
                      <div className="mb-4 p-4 rounded-xl border border-primary-200 bg-primary-50/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Canal</label>
                            <select
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                              value={historyChannel}
                              onChange={e => setHistoryChannel(e.target.value as any)}
                            >
                              <option value="email">Email</option>
                              <option value="phone">Telephone</option>
                              <option value="other">Autre</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
                            <select
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                              value={historyStatus}
                              onChange={e => setHistoryStatus(e.target.value as any)}
                            >
                              <option value="open">Ouvert</option>
                              <option value="pending">En attente</option>
                              <option value="closed">Cloture / Resolu</option>
                            </select>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Sujet / Motif</label>
                          <input
                            type="text"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                            value={historySubject}
                            onChange={e => setHistorySubject(e.target.value)}
                            placeholder="Ex: Demande de remboursement, Probleme de connexion..."
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Details (optionnel)</label>
                          <textarea
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 resize-none"
                            value={historyMessage}
                            onChange={e => setHistoryMessage(e.target.value)}
                            placeholder="Details de la demande, resolution, notes..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={addHistoryEntry} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors">
                            Enregistrer
                          </button>
                          <button onClick={() => { setShowAddHistory(false); setHistorySubject(''); setHistoryMessage('') }} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}

                    {/* History entries */}
                    {userIncidentsLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
                    ) : userIncidents.length === 0 ? (
                      <div className="text-center py-6">
                        <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Aucun historique pour cet utilisateur</p>
                        <p className="text-xs text-gray-300 mt-1">Cliquez sur + Ajouter pour creer une entree</p>
                      </div>
                    ) : (
                      <div className="space-y-0 relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />
                        {userIncidents.map((inc: any, idx: number) => {
                          const isEmail = inc.subject?.includes('[Email]')
                          const isPhone = inc.subject?.includes('[Telephone]')
                          const cleanSubject = inc.subject?.replace(/^\[(Email|Telephone|Autre)\]\s*/, '') || inc.subject
                          return (
                            <div key={inc.id} className="relative pl-10 pb-4">
                              {/* Timeline dot */}
                              <div className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-white ${
                                inc.status === 'open' ? 'bg-green-500' :
                                inc.status === 'pending' ? 'bg-amber-500' :
                                inc.status === 'on_hold' ? 'bg-blue-500' :
                                'bg-gray-400'
                              }`} />
                              <div
                                onClick={() => { navigateToTab('incidents'); loadIncidentDetail(inc.id); }}
                                className="p-3 rounded-lg border border-gray-100 hover:border-primary-300 hover:bg-gray-50 cursor-pointer transition-all"
                              >
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                    isEmail ? 'bg-blue-100 text-blue-700' :
                                    isPhone ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {isEmail ? 'Email' : isPhone ? 'Tel' : 'Note'}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                    inc.status === 'open' ? 'bg-green-100 text-green-700' :
                                    inc.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    inc.status === 'on_hold' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {inc.status === 'open' ? 'Ouvert' :
                                     inc.status === 'pending' ? 'En attente' :
                                     inc.status === 'on_hold' ? 'En pause' : 'Resolu'}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {inc.created_at ? new Date(inc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{cleanSubject}</p>
                                {inc.message_count > 0 && (
                                  <p className="text-xs text-gray-400 mt-0.5">{inc.message_count} message(s)</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
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

                      <button
                        onClick={() => {
                          setEmailTo(selectedUser.email || '')
                          setEmailSubject('')
                          setEmailMessage('')
                          setShowEmailModal(true)
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
                      >
                        <Mail className="h-4 w-4" /> Contacter
                      </button>

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

          {/* =============== INCIDENTS TAB =============== */}
          {activeTab === 'incidents' && (
            <div>
              {selectedIncident ? (
                /* ---------- INCIDENT DETAIL VIEW ---------- */
                <div>
                  <button
                    onClick={() => { setSelectedIncident(null); setIncidentMessages([]); setIncidentReply('') }}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4"
                  >
                    <ArrowLeft className="h-4 w-4" /> Retour aux incidents
                  </button>

                  {/* Header */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedIncident.subject}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-sm text-gray-600">{selectedIncident.user_name || 'Utilisateur'}</span>
                          <span className="text-sm text-gray-400">{selectedIncident.user_email}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedIncident.status === 'open' ? 'bg-green-100 text-green-700' :
                            selectedIncident.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            selectedIncident.status === 'on_hold' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {selectedIncident.status === 'open' ? 'Ouvert' :
                             selectedIncident.status === 'pending' ? 'En attente' :
                             selectedIncident.status === 'on_hold' ? 'En pause' : 'Cloture'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedIncident.status !== 'pending' && (
                          <button onClick={() => updateIncidentStatus(selectedIncident.id, 'pending')} className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors">
                            En attente
                          </button>
                        )}
                        {selectedIncident.status !== 'on_hold' && (
                          <button onClick={() => updateIncidentStatus(selectedIncident.id, 'on_hold')} className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                            En pause
                          </button>
                        )}
                        {selectedIncident.status !== 'closed' && (
                          <button onClick={() => updateIncidentStatus(selectedIncident.id, 'closed')} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                            Cloturer
                          </button>
                        )}
                        {selectedIncident.status === 'closed' && (
                          <button onClick={() => updateIncidentStatus(selectedIncident.id, 'open')} className="px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                            Rouvrir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages timeline */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-4 max-h-[500px] overflow-y-auto">
                    {incidentMessages.length === 0 ? (
                      <p className="text-sm text-gray-400 italic text-center py-4">Aucun message</p>
                    ) : (
                      incidentMessages.map((msg: any, i: number) => (
                        <div key={i} className={`flex ${(msg.sender_type || 'user') === 'admin' ? 'justify-end' : (msg.sender_type || 'user') === 'system' ? 'justify-center' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-xl px-4 py-3 ${
                            (msg.sender_type || 'user') === 'admin' ? 'bg-blue-500 text-white' :
                            (msg.sender_type || 'user') === 'system' ? 'bg-gray-100 text-gray-500 italic text-center' :
                            'bg-white border border-gray-200 text-gray-900'
                          }`}>
                            {msg.sender_name && (
                              <p className={`text-xs font-medium mb-1 ${(msg.sender_type || 'user') === 'admin' ? 'opacity-80' : 'text-primary-600'}`}>{msg.sender_name}</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.content || ''}</p>
                            <p className={`text-xs mt-1 ${(msg.sender_type || 'user') === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>
                              {msg.created_at ? new Date(msg.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply input */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 resize-none mb-3"
                      placeholder="Votre reponse..."
                      value={incidentReply}
                      onChange={e => setIncidentReply(e.target.value)}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                          checked={incidentSendEmail}
                          onChange={e => setIncidentSendEmail(e.target.checked)}
                        />
                        Envoyer aussi par email
                      </label>
                      <button
                        onClick={sendIncidentReply}
                        disabled={!incidentReply.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 transition-colors"
                      >
                        <Send className="h-4 w-4" /> Envoyer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ---------- INCIDENTS LIST VIEW ---------- */
                <div>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
                    <p className="text-gray-500 text-sm mt-1">Gerez les demandes et reclamations des utilisateurs</p>
                  </div>

                  {/* Filter pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {([
                      { key: 'all' as const, label: 'Tous' },
                      { key: 'open' as const, label: 'Ouvert' },
                      { key: 'pending' as const, label: 'En attente' },
                      { key: 'on_hold' as const, label: 'En pause' },
                      { key: 'closed' as const, label: 'Clos' },
                    ]).map(f => (
                      <button
                        key={f.key}
                        onClick={() => setIncidentFilter(f.key)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          incidentFilter === f.key
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                    <span className="flex items-center text-xs text-gray-400 ml-2">{incidents.length} incident(s)</span>
                  </div>

                  {incidentsLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
                  ) : incidents.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                      <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Aucun incident</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {incidents.map((inc: any) => {
                        const initials = (inc.user_name || '??').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                        return (
                          <div
                            key={inc.id}
                            onClick={() => { loadIncidentDetail(inc.id); }}
                            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-primary-300 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary-600">{initials}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-900 truncate">{inc.user_name || 'Utilisateur'}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    inc.status === 'open' ? 'bg-green-100 text-green-700' :
                                    inc.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    inc.status === 'on_hold' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {inc.status === 'open' ? 'Ouvert' :
                                     inc.status === 'pending' ? 'En attente' :
                                     inc.status === 'on_hold' ? 'En pause' : 'Cloture'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-0.5 truncate">{inc.subject}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                  {inc.created_at && <span>{new Date(inc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                  {inc.message_count != null && (
                                    <span className="inline-flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" /> {inc.message_count}
                                    </span>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Destinataires</label>
                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                        value={newPromoTarget}
                        onChange={e => setNewPromoTarget(e.target.value as any)}
                      >
                        <option value="all">Tous (hotes + clients)</option>
                        <option value="hote">Hotes uniquement</option>
                        <option value="client">Clients uniquement</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emails specifiques <span className="text-gray-400 font-normal">(optionnel - separes par des virgules)</span>
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                        value={newPromoEmails}
                        onChange={e => setNewPromoEmails(e.target.value)}
                        placeholder="jean@email.com, marie@email.com (laissez vide pour tout le monde)"
                      />
                      <p className="text-xs text-gray-400 mt-1">Si rempli, seuls ces emails pourront utiliser ce code. Le nombre max d&apos;utilisations sera automatiquement ajuste.</p>
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
                              {pc.target_type && pc.target_type !== 'all' && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${pc.target_type === 'hote' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                  {pc.target_type === 'hote' ? 'Hotes' : 'Clients'}
                                </span>
                              )}
                              {pc.target_emails && pc.target_emails.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
                                  {pc.target_emails.length} personne(s)
                                </span>
                              )}
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

              {/* =============== REFERRAL SECTION =============== */}
              <div className="border-t border-gray-200 mt-8 pt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Programme de parrainage</h2>
                    <p className="text-gray-500 text-sm mt-1">Gerez les codes de parrainage des hotes</p>
                  </div>
                  <button onClick={() => setShowAddReferral(!showAddReferral)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-sm">
                    <Plus className="h-4 w-4" /> Nouveau code
                  </button>
                </div>

                {/* Add referral form */}
                {showAddReferral && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Creer un code de parrainage</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hote</label>
                        <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={referralHostId} onChange={e => setReferralHostId(e.target.value)}>
                          <option value="">-- Selectionnez un hote --</option>
                          {users.filter(u => u.user_type === 'hote').map(u => (
                            <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mois offerts</label>
                        <input type="number" min="1" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={referralRewardMonths} onChange={e => setReferralRewardMonths(e.target.value)} placeholder="3" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Utilisations max</label>
                        <input type="number" min="1" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={referralMaxUses} onChange={e => setReferralMaxUses(e.target.value)} placeholder="10" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={createReferralCode} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors">Creer le code</button>
                      <button onClick={() => { setShowAddReferral(false); setReferralHostId('') }} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">Annuler</button>
                    </div>
                  </div>
                )}

                {/* Referral codes list */}
                {referralsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
                ) : referralCodes.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Aucun code de parrainage</p>
                    <p className="text-gray-400 text-sm mt-1">Creez un code pour permettre aux hotes de parrainer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referralCodes.map(rc => {
                      const codeReferrals = allReferrals.filter(r => r.referral_code_id === rc.id)
                      return (
                        <div key={rc.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${rc.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                          <div className="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${rc.is_active ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                  <Gift className={`h-6 w-6 ${rc.is_active ? 'text-purple-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono font-bold text-lg text-gray-900">{rc.code}</span>
                                    {rc.is_active ? (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Actif</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactif</span>
                                    )}
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Parrainage</span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-0.5">Hote: {rc.host_name || rc.host_id}</p>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                    <span className="font-semibold text-purple-600">{rc.reward_months || 3} mois offerts</span>
                                    <span>{codeReferrals.length}/{rc.max_referrals || 10} utilisations</span>
                                    <span>Cree le {new Date(rc.created_at).toLocaleDateString('fr-FR')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleReferralCode(rc.id, rc.is_active)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${rc.is_active ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}>
                                  {rc.is_active ? 'Desactiver' : 'Reactiver'}
                                </button>
                              </div>
                            </div>
                            {/* Referrals for this code */}
                            {codeReferrals.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Parrainages ({codeReferrals.length})</p>
                                <div className="space-y-1.5">
                                  {codeReferrals.map((ref: any, idx: number) => (
                                    <div key={ref.id || idx} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-xs">
                                      <UserCheck className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                                      <span className="text-gray-700">{ref.referrer_name || ref.referrer_id}</span>
                                      <ChevronRight className="h-3 w-3 text-gray-300" />
                                      <span className="text-gray-700">{ref.referred_name || ref.referred_id}</span>
                                      <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium ${ref.status === 'completed' ? 'bg-green-100 text-green-700' : ref.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {ref.status || 'pending'}
                                      </span>
                                      {ref.commission_free_until && (
                                        <span className="text-[10px] text-gray-400">sans commission jusqu&apos;au {new Date(ref.commission_free_until).toLocaleDateString('fr-FR')}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============== PUBLICITE TAB =============== */}
          {activeTab === 'publicite' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Publicite &amp; Sponsors</h1>
                  <p className="text-gray-500 text-sm mt-1">Gerez les annonceurs et mises en avant</p>
                </div>
                <button onClick={() => setShowAddSponsor(!showAddSponsor)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-sm">
                  <Plus className="h-4 w-4" /> Nouveau sponsor
                </button>
              </div>

              {/* Add sponsor form */}
              {showAddSponsor && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un sponsor</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nom de l&apos;entreprise / Hotel *</label>
                      <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={sponsorForm.business_name} onChange={e => setSponsorForm(p => ({ ...p, business_name: e.target.value }))} placeholder="Hotel Bamako Palace" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nom du contact</label>
                      <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={sponsorForm.contact_name} onChange={e => setSponsorForm(p => ({ ...p, contact_name: e.target.value }))} placeholder="Amadou Diallo" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={sponsorForm.contact_email} onChange={e => setSponsorForm(p => ({ ...p, contact_email: e.target.value }))} placeholder="contact@hotel.ml" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Telephone</label>
                      <input type="tel" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={sponsorForm.contact_phone} onChange={e => setSponsorForm(p => ({ ...p, contact_phone: e.target.value }))} placeholder="+223 XX XX XX XX" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Formule</label>
                      <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={sponsorForm.plan} onChange={e => setSponsorForm(p => ({ ...p, plan: e.target.value }))}>
                        <option value="standard">Standard - Mise en avant basique</option>
                        <option value="premium">Premium - Top de liste + badge</option>
                        <option value="elite">Elite - Banniere + top + badge + newsletter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Montant paye (FCFA)</label>
                      <input type="number" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={sponsorForm.amount_paid} onChange={e => setSponsorForm(p => ({ ...p, amount_paid: e.target.value }))} placeholder="50000" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Mode de paiement</label>
                      <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={sponsorForm.payment_method} onChange={e => setSponsorForm(p => ({ ...p, payment_method: e.target.value }))}>
                        <option value="">-- Choisir --</option>
                        <option value="orange_money">Orange Money</option>
                        <option value="virement">Virement bancaire</option>
                        <option value="especes">Especes</option>
                        <option value="carte">Carte bancaire</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Reference paiement</label>
                      <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={sponsorForm.payment_reference} onChange={e => setSponsorForm(p => ({ ...p, payment_reference: e.target.value }))} placeholder="REF-XXXX" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date debut *</label>
                      <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={sponsorForm.start_date} onChange={e => setSponsorForm(p => ({ ...p, start_date: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date fin *</label>
                      <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500" value={sponsorForm.end_date} onChange={e => setSponsorForm(p => ({ ...p, end_date: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                      <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 resize-none" value={sponsorForm.notes} onChange={e => setSponsorForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes internes..." />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={createSponsor} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors">Enregistrer</button>
                    <button onClick={() => setShowAddSponsor(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">Annuler</button>
                  </div>
                </div>
              )}

              {/* Stats cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Sponsors actifs', value: sponsors.filter(s => s.is_active).length, color: 'text-green-600 bg-green-100' },
                  { label: 'Sponsors inactifs', value: sponsors.filter(s => !s.is_active).length, color: 'text-gray-600 bg-gray-100' },
                  { label: 'Revenus pub total', value: sponsors.reduce((sum, s) => sum + (s.amount_paid || 0), 0).toLocaleString('fr-FR') + ' FCFA', color: 'text-primary-600 bg-primary-100' },
                  { label: 'En cours', value: sponsors.filter(s => s.is_active && new Date(s.end_date) >= new Date()).length, color: 'text-blue-600 bg-blue-100' },
                ].map((card, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* Sponsors list */}
              {sponsorsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
              ) : sponsors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <Eye className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucun sponsor</p>
                  <p className="text-gray-400 text-sm mt-1">Ajoutez votre premier annonceur</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sponsors.map(s => {
                    const isExpired = new Date(s.end_date) < new Date()
                    const daysLeft = Math.ceil((new Date(s.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    return (
                      <div key={s.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${!s.is_active || isExpired ? 'opacity-60 border-gray-100' : 'border-gray-200'}`}>
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.plan === 'elite' ? 'bg-purple-100' : s.plan === 'premium' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                                <Eye className={`h-6 w-6 ${s.plan === 'elite' ? 'text-purple-600' : s.plan === 'premium' ? 'text-amber-600' : 'text-blue-600'}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-gray-900">{s.business_name}</p>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.plan === 'elite' ? 'bg-purple-100 text-purple-700' : s.plan === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {s.plan}
                                  </span>
                                  {s.is_active && !isExpired ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">Actif</span>
                                  ) : isExpired ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">Expire</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">Inactif</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{s.contact_name || '-'} | {s.contact_email || '-'} | {s.contact_phone || '-'}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                                  <span><strong className="text-primary-600">{(s.amount_paid || 0).toLocaleString('fr-FR')} FCFA</strong></span>
                                  <span>{s.payment_method || '-'} {s.payment_reference ? `(${s.payment_reference})` : ''}</span>
                                  <span>Du {new Date(s.start_date).toLocaleDateString('fr-FR')} au {new Date(s.end_date).toLocaleDateString('fr-FR')}</span>
                                  {!isExpired && s.is_active && <span className="font-medium text-green-600">{daysLeft}j restants</span>}
                                </div>
                                {s.notes && <p className="text-xs text-gray-400 mt-1 italic">{s.notes}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => toggleSponsor(s.id, s.is_active)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${s.is_active ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}>
                                {s.is_active ? 'Desactiver' : 'Reactiver'}
                              </button>
                              <button onClick={() => deleteSponsor(s.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </div>
                          {/* Transaction action buttons */}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <button onClick={() => sendSponsorInvoice(s.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                              <FileText className="h-3.5 w-3.5" /> Facture
                            </button>
                            <button onClick={() => { const amt = prompt('Montant du paiement (FCFA):'); if (amt) { const ref = prompt('Reference paiement (optionnel):'); addSponsorTransaction(s.id, 'paiement', parseInt(amt) || 0, 'Paiement sponsor', s.payment_method, ref || undefined) } }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                              <DollarSign className="h-3.5 w-3.5" /> Paiement
                            </button>
                            <button onClick={() => { if (expandedSponsor !== s.id) { setExpandedSponsor(s.id); loadSponsorTransactions(s.id) } else setExpandedSponsor(null) }} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${expandedSponsor === s.id ? 'text-gray-900 bg-gray-200' : 'text-gray-600 bg-gray-50 hover:bg-gray-100'}`}>
                              <Clock className="h-3.5 w-3.5" /> Historique
                              <ChevronRight className={`h-3 w-3 transition-transform ${expandedSponsor === s.id ? 'rotate-90' : ''}`} />
                            </button>
                          </div>
                          {/* Expanded transaction timeline */}
                          {expandedSponsor === s.id && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <h4 className="text-xs font-semibold text-gray-700 mb-3">Historique des transactions</h4>
                              {!sponsorTransactions[s.id] ? (
                                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
                              ) : sponsorTransactions[s.id].length === 0 ? (
                                <p className="text-xs text-gray-400 py-2">Aucune transaction</p>
                              ) : (
                                <div className="space-y-2">
                                  {sponsorTransactions[s.id].map((tx: any, idx: number) => (
                                    <div key={tx.id || idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                                      <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${tx.type === 'paiement' ? 'bg-green-500' : tx.type === 'facture' ? 'bg-blue-500' : tx.type === 'remboursement' ? 'bg-red-500' : 'bg-gray-400'}`} />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${tx.type === 'paiement' ? 'bg-green-100 text-green-700' : tx.type === 'facture' ? 'bg-blue-100 text-blue-700' : tx.type === 'remboursement' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {tx.type}
                                          </span>
                                          <span className="text-xs font-semibold text-gray-900">{(tx.amount || 0).toLocaleString('fr-FR')} FCFA</span>
                                          {tx.invoice_number && <span className="text-[10px] text-blue-600 font-mono">{tx.invoice_number}</span>}
                                          {tx.status && <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tx.status === 'paid' ? 'bg-green-100 text-green-700' : tx.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{tx.status}</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{tx.description || '-'}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{tx.created_at ? new Date(tx.created_at).toLocaleString('fr-FR') : '-'}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
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

              {/* Backup & Security section */}
              {currentAdmin?.role === 'super_admin' && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Sauvegarde &amp; Securite</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Backup */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Sauvegardes
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">Exportez toutes les donnees de la plateforme en JSON. Recommande : 1x par semaine minimum.</p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={async () => {
                            flash('success', 'Telechargement en cours...')
                            try {
                              const res = await adminFetch('/api/admin/backup?format=download')
                              if (res.ok) {
                                const blob = await res.blob()
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `ikasso_backup_${new Date().toISOString().split('T')[0]}.json`
                                a.click()
                                URL.revokeObjectURL(url)
                                flash('success', 'Backup telecharge !')
                              } else flash('error', 'Erreur backup')
                            } catch { flash('error', 'Erreur backup') }
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                          <Shield className="h-4 w-4" /> Telecharger le backup complet
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const res = await adminFetch('/api/admin/backup')
                              const json = await res.json()
                              if (json.summary) {
                                const summary = Object.entries(json.summary).map(([t, c]) => `${t}: ${c}`).join('\n')
                                alert(`Statistiques backup:\n\nTotal: ${json.metadata?.totalRecords} enregistrements\n\n${summary}`)
                              }
                            } catch { flash('error', 'Erreur') }
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          Verifier les donnees
                        </button>
                      </div>
                    </div>

                    {/* 2FA */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-purple-600" />
                        Authentification 2FA
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">Securisez votre compte admin avec Google Authenticator ou une app TOTP compatible.</p>
                      <button
                        onClick={async () => {
                          try {
                            const res = await adminFetch('/api/admin/2fa')
                            const json = await res.json()
                            if (json.enabled) {
                              const code = prompt('2FA actif. Entrez un code pour desactiver :')
                              if (code) {
                                const res2 = await adminFetch('/api/admin/2fa', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ code, action: 'disable' }),
                                })
                                const json2 = await res2.json()
                                flash(json2.success ? 'success' : 'error', json2.message || json2.error || 'Erreur')
                              }
                            } else if (json.qrCode) {
                              // Show QR code in a new window
                              const w = window.open('', '_blank', 'width=400,height=500')
                              if (w) {
                                w.document.write(`<html><head><title>Ikasso 2FA</title></head><body style="font-family:sans-serif;text-align:center;padding:20px;">
                                  <h2>Scanner ce QR code</h2>
                                  <p style="color:#666;">Avec Google Authenticator ou Authy</p>
                                  <img src="${json.qrCode}" style="width:250px;margin:20px auto;" />
                                  <p style="font-size:12px;color:#999;">Code secret : ${json.secret}</p>
                                  <p style="margin-top:20px;">Entrez le code affiche dans l'app pour activer.</p>
                                </body></html>`)
                              }
                              const code = prompt('Entrez le code a 6 chiffres affiche dans votre app :')
                              if (code) {
                                const res2 = await adminFetch('/api/admin/2fa', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ code, action: 'enable' }),
                                })
                                const json2 = await res2.json()
                                flash(json2.success ? 'success' : 'error', json2.message || json2.error || 'Erreur')
                              }
                            }
                          } catch { flash('error', 'Erreur 2FA') }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                      >
                        <Lock className="h-4 w-4" /> Configurer 2FA
                      </button>
                    </div>
                  </div>
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
