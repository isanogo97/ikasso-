'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Mail, Phone, Lock, Bell, Globe, CreditCard, Shield, Eye, EyeOff, Save, ArrowLeft, Camera, MapPin } from 'lucide-react'
import Logo from '../components/Logo'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: 'Amadou',
    lastName: 'Diallo',
    email: 'amadou.diallo@email.com',
    phone: '+223 70 12 34 56',
    bio: 'Voyageur passionné qui aime découvrir de nouveaux endroits au Mali et partager des expériences authentiques.',
    location: 'Bamako, Mali',
    dateOfBirth: '1990-05-15',
    language: 'fr'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailBookings: true,
    emailMessages: true,
    emailPromotions: false,
    smsBookings: true,
    smsMessages: false,
    pushNotifications: true
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowReviews: true
  })
  const [nina, setNina] = useState('')
  const [dob, setDob] = useState('')
  const [ninaChecking, setNinaChecking] = useState(false)
  const [ninaVerified, setNinaVerified] = useState(false)
  const [ninaMessage, setNinaMessage] = useState<string | null>(null)

  useEffect(() => {
    import('../lib/ninaStorage').then(mod => {
      const info = mod.getNinaLocal?.()
      if (info) {
        setNina(info.nina || '')
        setDob(info.dob || '')
        setNinaVerified(!!info.verified)
        setNinaMessage(info.message || null)
      }
    }).catch(() => {})
  }, [])

  const isValidNinaFormat = (n: string) => /^\d{14}$/.test((n || '').replace(/\s+/g, ''))
  const verifyNina = async () => {
    setNinaMessage(null)
    setNinaVerified(false)
    if (!isValidNinaFormat(nina)) {
      setNinaMessage('Format NINA invalide (14 chiffres requis).')
      return
    }
    try {
      setNinaChecking(true)
      const res = await fetch('/api/nina/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nina, fullName: `${profileData.firstName} ${profileData.lastName}`, dob }) })
      const data = await res.json()
      setNinaVerified(!!data.verified)
      setNinaMessage(data.message || (data.verified ? 'Identité vérifiée.' : 'Format valide. Vérification externe requise.'))
    } catch {
      setNinaMessage('Erreur de vérification, réessayez plus tard.')
    } finally {
      setNinaChecking(false)
    }
  }
  const saveNina = async () => {
    try {
      const { setNinaLocal } = await import('../lib/ninaStorage')
      setNinaLocal({ nina, dob, verified: ninaVerified, updatedAt: Date.now() })
    } catch {}
    try {
      await fetch('/api/nina/store', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: profileData.email, nina, dob, verified: ninaVerified }) })
      alert('NINA enregistré')
    } catch {
      alert('Impossible dâ€™enregistrer pour le moment (réseau local uniquement).')
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Confidentialité', icon: Eye },
    { id: 'payments', name: 'Paiements', icon: CreditCard },
    { id: 'preferences', name: 'Préférences', icon: Globe }
  ]

  const handleProfileUpdate = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert('Profil mis à jour avec succès !')
    }, 2000)
  }

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas')
      return
    }
    if (passwordData.newPassword.length < 8) {
      alert('Le nouveau mot de passe doit contenir au moins 8 caractères')
      return
    }
    
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert('Mot de passe modifié avec succès !')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }, 2000)
  }

  const handleNotificationUpdate = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert('Préférences de notification mises à jour !')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary-600">Tableau de bord</Link>
              <Link href="/messages" className="text-gray-600 hover:text-primary-600">Messages</Link>
              <div className="flex items-center space-x-2">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
                  alt="Amadou Diallo"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-gray-700 font-medium">Amadou Diallo</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres du compte</h1>
          <p className="text-gray-600 mt-2">Gérez vos informations personnelles et préférences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
                  
                  {/* Profile Picture */}
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <Image
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                        alt="Profile"
                        width={100}
                        height={100}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <button className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-medium text-gray-900">Photo de profil</h3>
                      <p className="text-gray-600">Ajoutez une photo pour personnaliser votre profil</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        className="input-field"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        className="input-field"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        className="input-field"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        className="input-field"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                      <input
                        type="date"
                        className="input-field"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                      <input
                        type="text"
                        className="input-field"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        placeholder="Ville, Pays"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Biographie</label>
                    <textarea
                      rows={4}
                      className="input-field resize-none"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Parlez-nous de vous..."
                    />
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={isLoading}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Sauvegarder les modifications
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Sécurité</h2>
                  
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Vérification d'identité (NINA - Mali)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Numéro NINA</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="14 chiffres"
                          inputMode="numeric"
                          pattern="\d{14}"
                          value={nina}
                          onChange={(e) => setNina(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                        <input
                          type="date"
                          className="input-field"
                          max={new Date().toISOString().split('T')[0]}
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={verifyNina}
                        disabled={ninaChecking || !isValidNinaFormat(nina)}
                        className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                      >
                        {ninaChecking ? 'Vérificationâ€¦' : 'Vérifier NINA'}
                      </button>
                      <button
                        type="button"
                        onClick={saveNina}
                        disabled={!isValidNinaFormat(nina)}
                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        Enregistrer
                      </button>
                      {ninaMessage && (
                        <span className={`text-sm ${ninaVerified ? 'text-green-700' : 'text-gray-700'}`}>{ninaMessage}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Note: stockage local et mémoire serveur de démonstration. Prévoir un stockage sécurisé côté serveur en production.</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className="input-field pr-10"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="input-field pr-10"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="input-field pr-10"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Exigences du mot de passe :</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>â€¢ Au moins 8 caractères</li>
                        <li>â€¢ Au moins une lettre majuscule</li>
                        <li>â€¢ Au moins une lettre minuscule</li>
                        <li>â€¢ Au moins un chiffre</li>
                      </ul>
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={isLoading}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      Changer le mot de passe
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Préférences de notification</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications par email</h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={notificationSettings.emailBookings}
                            onChange={(e) => setNotificationSettings({...notificationSettings, emailBookings: e.target.checked})}
                          />
                          <span className="ml-3 text-gray-700">Confirmations et mises à jour de réservation</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={notificationSettings.emailMessages}
                            onChange={(e) => setNotificationSettings({...notificationSettings, emailMessages: e.target.checked})}
                          />
                          <span className="ml-3 text-gray-700">Nouveaux messages</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={notificationSettings.emailPromotions}
                            onChange={(e) => setNotificationSettings({...notificationSettings, emailPromotions: e.target.checked})}
                          />
                          <span className="ml-3 text-gray-700">Offres promotionnelles et actualités</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications SMS</h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={notificationSettings.smsBookings}
                            onChange={(e) => setNotificationSettings({...notificationSettings, smsBookings: e.target.checked})}
                          />
                          <span className="ml-3 text-gray-700">Confirmations de réservation urgentes</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={notificationSettings.smsMessages}
                            onChange={(e) => setNotificationSettings({...notificationSettings, smsMessages: e.target.checked})}
                          />
                          <span className="ml-3 text-gray-700">Messages importants</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications push</h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={notificationSettings.pushNotifications}
                          onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
                        />
                        <span className="ml-3 text-gray-700">Activer les notifications push sur mobile</span>
                      </label>
                    </div>

                    <button
                      onClick={handleNotificationUpdate}
                      disabled={isLoading}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Bell className="h-4 w-4 mr-2" />
                      )}
                      Sauvegarder les préférences
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Confidentialité</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Visibilité du profil</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value="public"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            checked={privacySettings.profileVisibility === 'public'}
                            onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                          />
                          <span className="ml-3 text-gray-700">Public - Visible par tous les utilisateurs</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value="limited"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            checked={privacySettings.profileVisibility === 'limited'}
                            onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                          />
                          <span className="ml-3 text-gray-700">Limité - Visible uniquement par vos contacts</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value="private"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            checked={privacySettings.profileVisibility === 'private'}
                            onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                          />
                          <span className="ml-3 text-gray-700">Privé - Profil masqué</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de contact</h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={privacySettings.showEmail}
                            onChange={(e) => setPrivacySettings({...privacySettings, showEmail: e.target.checked})}
                          />
                          <span className="ml-3 text-gray-700">Afficher mon email sur mon profil</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={privacySettings.showPhone}
                            onChange={(e) => setPrivacySettings({...privacySettings, showPhone: e.target.checked})}
                          />
                          <span className="ml-3 text-gray-700">Afficher mon téléphone sur mon profil</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Interactions</h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={privacySettings.allowMessages}
                            onChange={(e) => setPrivacySettings({...privacySettings, allowMessages: e.target.checked})}
                          />
                          <span className="ml-3 text-gray-700">Autoriser les messages de nouveaux utilisateurs</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={privacySettings.allowReviews}
                            onChange={(e) => setPrivacySettings({...privacySettings, allowReviews: e.target.checked})}
                          />
                          <span className="ml-3 text-gray-700">Autoriser les avis publics sur mon profil</span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsLoading(true)
                        setTimeout(() => {
                          setIsLoading(false)
                          alert('Paramètres de confidentialité mis à jour !')
                        }, 1000)
                      }}
                      disabled={isLoading}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Shield className="h-4 w-4 mr-2" />
                      )}
                      Sauvegarder les paramètres
                    </button>
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Moyens de paiement</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-orange-100 p-2 rounded-lg mr-3">
                            <Phone className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Orange Money</h3>
                            <p className="text-sm text-gray-600">+223 70 12 34 56</p>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Vérifié
                        </span>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Carte Visa</h3>
                            <p className="text-sm text-gray-600">â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ 1234</p>
                          </div>
                        </div>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Supprimer
                        </button>
                      </div>
                    </div>

                    <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-300 hover:bg-primary-50 transition-colors">
                      <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">Ajouter un moyen de paiement</p>
                      <p className="text-sm text-gray-500">Carte bancaire, PayPal, ou autre</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Préférences</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                      <select
                        className="input-field"
                        value={profileData.language}
                        onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="bm">Bambara</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                      <select className="input-field">
                        <option value="XOF">Franc CFA (FCFA)</option>
                        <option value="EUR">Euro (â‚¬)</option>
                        <option value="USD">Dollar US ($)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
                      <select className="input-field">
                        <option value="GMT">GMT (Bamako, Mali)</option>
                        <option value="CET">CET (Paris, France)</option>
                        <option value="EST">EST (New York, USA)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setIsLoading(true)
                        setTimeout(() => {
                          setIsLoading(false)
                          alert('Préférences mises à jour !')
                        }, 1000)
                      }}
                      disabled={isLoading}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Globe className="h-4 w-4 mr-2" />
                      )}
                      Sauvegarder les préférences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to dashboard */}
        <div className="mt-8 text-center">
          <Link href="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}

