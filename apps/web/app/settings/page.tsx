"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { User, Mail, Phone, Lock, Bell, Globe, CreditCard, Shield, Eye, EyeOff, Save, ArrowLeft, Camera, MapPin, Tag, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Logo from '../components/Logo'
import { useAuth } from "../contexts/AuthContext"
import { authFetch } from "../lib/auth-fetch"

function PromoCodeSection({ userId }: { userId?: string }) {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<any>(null)
  const [checking, setChecking] = useState(false)
  const [applied, setApplied] = useState(false)

  const validateAndApply = async () => {
    if (!code.trim() || !userId) return
    setChecking(true)
    setResult(null)
    try {
      const res = await fetch('/api/validate-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), userId }),
      })
      const json = await res.json()
      setResult(json)
      if (json.valid) setApplied(true)
    } catch {
      setResult({ valid: false, error: 'Erreur de connexion' })
    }
    setChecking(false)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Code promotionnel</h2>
      <p className="text-sm text-gray-500 mb-6">Entrez un code promo ou de parrainage pour beneficier d&apos;avantages (commission reduite, reduction, etc.)</p>

      {applied ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <p className="text-green-800 font-semibold text-lg mb-1">Code applique !</p>
          <p className="text-green-600 text-sm">{result?.reward}</p>
        </div>
      ) : (
        <div className="max-w-md">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: WELCOMEIKASSO"
              className={`flex-1 px-4 py-3 border rounded-xl text-base uppercase focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${result && !result.valid ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setResult(null) }}
            />
            <button
              onClick={validateAndApply}
              disabled={checking || code.trim().length < 3}
              className="px-5 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-gray-300 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
              Appliquer
            </button>
          </div>
          {result && !result.valid && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              {result.error}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">Un seul code par compte. Le code sera applique immediatement.</p>
        </div>
      )}
    </div>
  )
}

function PaymentSection() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addingCard, setAddingCard] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [setupResult, setSetupResult] = useState<string | null>(null)

  // Check URL params for setup result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('setup') === 'success') {
      setSetupResult('success')
      // Clean URL
      const url = new URL(window.location.href)
      url.searchParams.delete('setup')
      window.history.replaceState({}, '', url.toString())
    } else if (params.get('setup') === 'cancel') {
      setSetupResult('cancel')
    }
  }, [])

  const fetchCards = async () => {
    setLoading(true)
    try {
      const res = await authFetch('/api/payment/stripe/cards')
      const data = await res.json()
      setCards(data.cards || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchCards() }, [])

  const handleAddCard = async () => {
    setAddingCard(true)
    try {
      const res = await authFetch('/api/payment/stripe/save-card', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erreur lors de l\'ajout de carte')
        setAddingCard(false)
      }
    } catch {
      alert('Erreur reseau')
      setAddingCard(false)
    }
  }

  const handleDeleteCard = async (pmId: string) => {
    if (!confirm('Supprimer cette carte ?')) return
    setDeletingId(pmId)
    try {
      await authFetch('/api/payment/stripe/cards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: pmId }),
      })
      setCards(prev => prev.filter(c => c.id !== pmId))
    } catch {}
    setDeletingId(null)
  }

  const brandIcon = (brand: string) => {
    const b = brand.toLowerCase()
    if (b === 'visa') return '💳 Visa'
    if (b === 'mastercard') return '💳 Mastercard'
    if (b === 'amex') return '💳 Amex'
    return '💳 ' + brand
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Moyens de paiement</h2>

      {setupResult === 'success' && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 border border-green-200 text-sm">
          <CheckCircle className="inline h-4 w-4 mr-1" /> Carte ajoutee avec succes !
        </div>
      )}

      {/* Saved cards */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Cartes enregistrees</h3>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-200">
            <CreditCard className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucune carte enregistree</p>
            <p className="text-xs text-gray-400 mt-1">Ajoutez une carte pour des paiements plus rapides</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map(card => (
              <div key={card.id} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold">
                    {card.brand === 'visa' ? 'V' : card.brand === 'mastercard' ? 'MC' : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{brandIcon(card.brand)}</p>
                    <p className="text-xs text-gray-500">**** **** **** {card.last4} &middot; Exp. {String(card.expMonth).padStart(2, '0')}/{card.expYear}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  disabled={deletingId === card.id}
                  className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  {deletingId === card.id ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleAddCard}
          disabled={addingCard}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
        >
          {addingCard ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          {addingCard ? 'Redirection vers Stripe...' : 'Ajouter une carte bancaire'}
        </button>
      </div>

      {/* Other payment methods */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Autres moyens de paiement disponibles</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white text-lg">

            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Apple Pay</p>
              <p className="text-xs text-gray-500">Disponible lors du paiement sur Safari / iPhone</p>
            </div>
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Actif</span>
          </div>

          <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-lg">
              G
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Google Pay</p>
              <p className="text-xs text-gray-500">Disponible lors du paiement sur Chrome / Android</p>
            </div>
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Actif</span>
          </div>

          <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              OM
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Orange Money</p>
              <p className="text-xs text-gray-500">Paiement mobile - recommande au Mali</p>
            </div>
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Actif</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Apple Pay, Google Pay et la carte enregistree seront proposes automatiquement lors du paiement d'une reservation.
        </p>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user: authUser, updateProfile, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    dateOfBirth: "",
    language: "fr",
  })

  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })

  const [notificationSettings, setNotificationSettings] = useState({
    emailBookings: true,
    emailMessages: true,
    emailPromotions: false,
    smsBookings: true,
    smsMessages: false,
    pushNotifications: true,
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowReviews: true,
  })

  // NINA settings kept for profile verification (inscription n'en a plus besoin)
  const [nina, setNina] = useState("")
  const [dob, setDob] = useState("")
  const [ninaChecking, setNinaChecking] = useState(false)
  const [ninaVerified, setNinaVerified] = useState(false)
  const [ninaMessage, setNinaMessage] = useState<string | null>(null)

  useEffect(() => {
    // Charger les données NINA
    import("../lib/ninaStorage").then((mod) => {
      const info = mod.getNinaLocal?.()
      if (info) {
        setNina(info.nina || "")
        setDob(info.dob || "")
        setNinaVerified(!!info.verified)
        setNinaMessage(info.message || null)
      }
    }).catch(() => {})
  }, [])

  // Charger les vraies donnees utilisateur depuis authUser
  useEffect(() => {
    if (authUser) {
      setUser(authUser)
      setProfileData(prev => ({
        ...prev,
        firstName: authUser.firstName || '',
        lastName: authUser.lastName || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        bio: authUser.bio || '',
        location: authUser.city ? `${authUser.city}, ${authUser.country || 'Mali'}` : '',
        dateOfBirth: authUser.dateOfBirth || '',
      }))
    } else {
      // Fallback localStorage
      const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
      if (currentUser.email) {
        setUser(currentUser)
        setProfileData(prev => ({
          ...prev,
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          bio: currentUser.bio || '',
          location: currentUser.city ? `${currentUser.city}, ${currentUser.country || 'Mali'}` : '',
          dateOfBirth: currentUser.dateOfBirth || '',
        }))
      }
    }
  }, [authUser])

  const isValidNinaFormat = (n: string) => /^\d{14}$/.test((n || "").replace(/\s+/g, ""))

  const verifyNina = async () => {
    setNinaMessage(null)
    setNinaVerified(false)
    if (!isValidNinaFormat(nina)) {
      setNinaMessage("Format NINA invalide (14 chiffres requis).")
      return
    }
    try {
      setNinaChecking(true)
      const res = await fetch("/api/nina/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nina, fullName: `${profileData.firstName} ${profileData.lastName}`, dob }) })
      const data = await res.json()
      setNinaVerified(!!data.verified)
      setNinaMessage(data.message || (data.verified ? "Identité vérifiée." : "Format valide. Vérification externe requise."))
    } catch {
      setNinaMessage("Erreur de vérification, réessayez plus tard.")
    } finally {
      setNinaChecking(false)
    }
  }

  const saveNina = async () => {
    try {
      const { setNinaLocal } = await import("../lib/ninaStorage")
      setNinaLocal({ nina, dob, verified: ninaVerified, updatedAt: Date.now() })
    } catch {}
    try {
      await fetch("/api/nina/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: profileData.email, nina, dob, verified: ninaVerified }) })
      alert("NINA enregistré")
    } catch {
      alert("Impossible d’enregistrer pour le moment (stockage local uniquement).")
    }
  }

  const tabs = [
    { id: "profile", name: "Profil", icon: User },
    { id: "security", name: "Sécurité", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "privacy", name: "Confidentialité", icon: Eye },
    { id: "payments", name: "Paiements", icon: CreditCard },
    { id: "preferences", name: "Préférences", icon: Globe },
    { id: "promo", name: "Code promo", icon: Tag },
  ]

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      const result = await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || undefined,
        dateOfBirth: profileData.dateOfBirth || undefined,
        bio: profileData.bio || undefined,
        city: profileData.location.split(',')[0]?.trim() || undefined,
        country: profileData.location.split(',')[1]?.trim() || 'Mali',
      })
      if (result.error) {
        alert('Erreur: ' + result.error)
      } else {
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
        currentUser.firstName = profileData.firstName
        currentUser.lastName = profileData.lastName
        currentUser.phone = profileData.phone
        currentUser.dateOfBirth = profileData.dateOfBirth
        currentUser.bio = profileData.bio
        localStorage.setItem('ikasso_user', JSON.stringify(currentUser))
        await refreshUser()
        alert('Profil mis a jour !')
      }
    } catch {
      alert('Erreur lors de la mise a jour')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas")
      return
    }
    if (passwordData.newPassword.length < 8) {
      alert("8 caracteres minimum")
      return
    }
    setIsLoading(true)
    try {
      const { isSupabaseConfigured, createClient } = await import('../lib/supabase/client')
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword })
        if (error) { alert('Erreur: ' + error.message); return }
      }
      alert('Mot de passe modifie !')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      alert('Erreur')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Composant de restauration d'avatar */}
      {/* Avatar managed by AuthContext */}
      
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Paramètres du compte</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`inline-flex items-center gap-2 px-3 py-2 rounded border text-sm ${activeTab === t.id ? "border-primary-500 text-primary-700 bg-primary-50" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                <t.icon className="h-4 w-4" /> {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700">Prénom</label>
                    <div className="mt-1 relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input className="input-field pl-10" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Nom</label>
                    <div className="mt-1 relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input className="input-field pl-10" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Email</label>
                    <div className="mt-1 relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input type="email" className="input-field pl-10 bg-gray-100 cursor-not-allowed" value={profileData.email} readOnly />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut pas etre modifie</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Téléphone</label>
                    <div className="mt-1 relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input className="input-field pl-10" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700">Bio</label>
                    <textarea rows={3} className="input-field" value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} />
                  </div>
                </div>

                <div className="mt-4">
                  <button onClick={handleProfileUpdate} disabled={isLoading} className="btn-primary px-6 py-2 disabled:opacity-50">{isLoading ? "Enregistrement…" : "Enregistrer"}</button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Photo de profil</h3>
                <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-3">
                  {(user?.avatar || user?.avatarUrl) ? (
                    <img src={user.avatar || user.avatarUrl} alt="Photo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                      {(profileData.firstName?.[0] || '').toUpperCase()}{(profileData.lastName?.[0] || '').toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg cursor-pointer text-sm font-medium transition-colors">
                  <Camera className="h-4 w-4" />
                  Choisir une photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 5 * 1024 * 1024) {
                        alert('La photo ne doit pas depasser 5 MB')
                        return
                      }

                      try {
                        // Upload via server-side API (bypasses Storage RLS)
                        const formData = new FormData()
                        formData.append('file', file)
                        formData.append('userId', authUser?.id || '')

                        const res = await authFetch('/api/upload/avatar', {
                          method: 'POST',
                          body: formData,
                        })
                        const json = await res.json()

                        if (res.ok && json.avatarUrl) {
                          // Update local state
                          const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
                          currentUser.avatar = json.avatarUrl
                          currentUser.avatarUrl = json.avatarUrl
                          localStorage.setItem('ikasso_user', JSON.stringify(currentUser))
                          setUser({ ...user, avatar: json.avatarUrl, avatarUrl: json.avatarUrl })
                          alert('Photo enregistree !')
                        } else {
                          alert(json.error || 'Erreur lors de l\'upload')
                        }
                      } catch {
                        alert('Erreur lors de l\'upload de la photo')
                      }
                    }}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">JPEG, PNG, WEBP - Max 5MB</p>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Sécurité du compte</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700">Mot de passe actuel</label>
                    <div className="mt-1 relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input type={showCurrentPassword ? "text" : "password"} className="input-field pl-10 pr-10" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                      <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Nouveau mot de passe</label>
                    <div className="mt-1 relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input type={showNewPassword ? "text" : "password"} className="input-field pl-10 pr-10" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                      <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Confirmer le mot de passe</label>
                    <div className="mt-1 relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input type={showConfirmPassword ? "text" : "password"} className="input-field pl-10 pr-10" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                      <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Exigences du mot de passe :</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Au moins 8 caractères</li>
                    <li>• Au moins une lettre majuscule</li>
                    <li>• Au moins une lettre minuscule</li>
                    <li>• Au moins un chiffre</li>
                  </ul>
                </div>
                <button onClick={handlePasswordChange} disabled={isLoading} className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 inline-flex items-center">{isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> : <Lock className="h-4 w-4 mr-2" />}Changer le mot de passe</button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Vérification d'identité (NINA - Mali)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700">Numéro NINA</label>
                    <input className="input-field" placeholder="14 chiffres" inputMode="numeric" pattern="\d{14}" value={nina} onChange={(e) => setNina(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Date de naissance</label>
                    <input type="date" className="input-field" value={dob} max={new Date().toISOString().split("T")[0]} onChange={(e) => setDob(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button type="button" onClick={verifyNina} disabled={ninaChecking || !isValidNinaFormat(nina)} className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">{ninaChecking ? "Vérification…" : "Vérifier NINA"}</button>
                  {ninaMessage && (<span className={`text-sm ${ninaVerified ? "text-green-700" : "text-gray-700"}`}>{ninaMessage}</span>)}
                  <button type="button" onClick={saveNina} disabled={!isValidNinaFormat(nina)} className="px-4 py-2 rounded border">Enregistrer</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3"><input type="checkbox" checked={notificationSettings.emailBookings} onChange={(e) => setNotificationSettings({ ...notificationSettings, emailBookings: e.target.checked })} /> Emails: réservations</label>
                <label className="flex items-center gap-3"><input type="checkbox" checked={notificationSettings.emailMessages} onChange={(e) => setNotificationSettings({ ...notificationSettings, emailMessages: e.target.checked })} /> Emails: messages</label>
                <label className="flex items-center gap-3"><input type="checkbox" checked={notificationSettings.emailPromotions} onChange={(e) => setNotificationSettings({ ...notificationSettings, emailPromotions: e.target.checked })} /> Emails: promotions</label>
                <label className="flex items-center gap-3"><input type="checkbox" checked={notificationSettings.smsBookings} onChange={(e) => setNotificationSettings({ ...notificationSettings, smsBookings: e.target.checked })} /> SMS: réservations</label>
                <label className="flex items-center gap-3"><input type="checkbox" checked={notificationSettings.smsMessages} onChange={(e) => setNotificationSettings({ ...notificationSettings, smsMessages: e.target.checked })} /> SMS: messages</label>
                <label className="flex items-center gap-3"><input type="checkbox" checked={notificationSettings.pushNotifications} onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })} /> Notifications push</label>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Confidentialité</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700">Visibilité du profil</label>
                  <select className="input-field mt-1" value={privacySettings.profileVisibility} onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}>
                    <option value="public">Public</option>
                    <option value="private">Privé</option>
                    <option value="contacts">Contacts uniquement</option>
                  </select>
                </div>
                <label className="flex items-center gap-3"><input type="checkbox" checked={privacySettings.showEmail} onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })} /> Afficher mon email sur le profil</label>
                <label className="flex items-center gap-3"><input type="checkbox" checked={privacySettings.showPhone} onChange={(e) => setPrivacySettings({ ...privacySettings, showPhone: e.target.checked })} /> Afficher mon téléphone sur le profil</label>
                <label className="flex items-center gap-3"><input type="checkbox" checked={privacySettings.allowMessages} onChange={(e) => setPrivacySettings({ ...privacySettings, allowMessages: e.target.checked })} /> Autoriser la messagerie</label>
                <label className="flex items-center gap-3"><input type="checkbox" checked={privacySettings.allowReviews} onChange={(e) => setPrivacySettings({ ...privacySettings, allowReviews: e.target.checked })} /> Autoriser les avis</label>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <PaymentSection />
          )}

          {activeTab === "preferences" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Préférences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700">Langue</label>
                  <select className="input-field mt-1" value={profileData.language} onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Localisation</label>
                  <div className="mt-1 relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input className="input-field pl-10" value={profileData.location} onChange={(e) => setProfileData({ ...profileData, location: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "promo" && (
            <PromoCodeSection userId={authUser?.id} />
          )}
        </div>
      </div>
    </div>
  )
}

