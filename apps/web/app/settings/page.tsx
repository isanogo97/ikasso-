"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { User, Mail, Phone, Lock, Bell, Globe, CreditCard, Shield, Eye, EyeOff, Save, ArrowLeft, Camera, MapPin } from "lucide-react"
import Logo from '../components/Logo'
import PhotoCapture from "../components/PhotoCapture"
import AvatarRestorer from "../components/AvatarRestorer"
import { restoreUserAvatar } from "../lib/avatarPersistence"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [profileData, setProfileData] = useState({
    firstName: "Amadou",
    lastName: "Diallo",
    email: "amadou.diallo@email.com",
    phone: "+223 70 12 34 56",
    bio: "Voyageur passionné qui aime découvrir de nouveaux endroits au Mali et partager des expériences authentiques.",
    location: "Bamako, Mali",
    dateOfBirth: "1990-05-15",
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

    // Restaurer l'avatar utilisateur
    const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    if (currentUser.email) {
      const restoredUser = restoreUserAvatar(currentUser)
      setUser(restoredUser)
      if (restoredUser.avatar !== currentUser.avatar) {
        localStorage.setItem('ikasso_user', JSON.stringify(restoredUser))
      }
    }
  }, [])

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
  ]

  const handleProfileUpdate = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert("Profil mis à jour avec succès !")
    }, 1000)
  }

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas")
      return
    }
    if (passwordData.newPassword.length < 8) {
      alert("Le nouveau mot de passe doit contenir au moins 8 caractères")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert("Mot de passe modifié")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Composant de restauration d'avatar */}
      <AvatarRestorer user={user} setUser={setUser} />
      
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
                      <input type="email" className="input-field pl-10" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
                    </div>
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
                  <User className="h-10 w-10 text-gray-400" />
                </div>
                <PhotoCapture
                  onPhotoCapture={(imageUrl) => {
                    try {
                      // La sauvegarde persistante est déjà gérée dans PhotoCapture
                      // Il suffit de mettre à jour l'utilisateur actuel
                      const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
                      currentUser.avatar = imageUrl
                      localStorage.setItem('ikasso_user', JSON.stringify(currentUser))
                      
                      // Recharger pour voir la photo
                      setTimeout(() => {
                        window.location.reload()
                      }, 1000)
                    } catch (error) {
                      console.error('Erreur lors de la sauvegarde:', error)
                      alert('Erreur lors de la sauvegarde de la photo')
                    }
                  }}
                  onError={(error) => {
                    console.error('Erreur photo:', error)
                  }}
                  maxSizeMB={5}
                  acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                />
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
            <div>
              <h2 className="text-xl font-semibold mb-4">Paiements</h2>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3"><CreditCard className="h-5 w-5 text-blue-600" /></div>
                    <div>
                      <h3 className="font-medium text-gray-900">Carte Visa</h3>
                      <p className="text-sm text-gray-600">•••• •••• •••• 1234</p>
                    </div>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">Supprimer</button>
                </div>
              </div>
            </div>
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
        </div>
      </div>
    </div>
  )
}

