'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Phone, Mail, User, MapPin, ArrowLeft, ArrowRight,
  CheckCircle, Loader, Eye, EyeOff, Calendar, Globe, ChevronDown
} from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'

type UserType = 'client' | 'hote' | null
type Step = 1 | 2

// Liste des indicatifs téléphoniques
const countryCodes = [
  { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'Royaume-Uni', flag: '🇬🇧' },
  { code: '+49', country: 'Allemagne', flag: '🇩🇪' },
  { code: '+34', country: 'Espagne', flag: '🇪🇸' },
  { code: '+39', country: 'Italie', flag: '🇮🇹' },
  { code: '+32', country: 'Belgique', flag: '🇧🇪' },
  { code: '+41', country: 'Suisse', flag: '🇨🇭' },
  { code: '+212', country: 'Maroc', flag: '🇲🇦' },
  { code: '+213', country: 'Algérie', flag: '🇩🇿' },
  { code: '+216', country: 'Tunisie', flag: '🇹🇳' },
  { code: '+221', country: 'Sénégal', flag: '🇸🇳' },
  { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+229', country: 'Bénin', flag: '🇧🇯' },
  { code: '+237', country: 'Cameroun', flag: '🇨🇲' },
  { code: '+86', country: 'Chine', flag: '🇨🇳' },
  { code: '+81', country: 'Japon', flag: '🇯🇵' },
  { code: '+971', country: 'Émirats', flag: '🇦🇪' },
]

export default function RegisterNewPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { signUp } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [userType, setUserType] = useState<UserType>(null)

  // Étape 1 : Informations personnelles + type utilisateur
  const [countryCode, setCountryCode] = useState('+223')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [phone, setPhone] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [referralValid, setReferralValid] = useState<null | { valid: boolean; reward?: string; error?: string }>(null)
  const [checkingReferral, setCheckingReferral] = useState(false)

  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'Mali',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  // Étape 2 : Validation email
  const [emailCode, setEmailCode] = useState('')
  const [sentEmailCode, setSentEmailCode] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[0]

  // ========== ÉTAPE 1 : VALIDATION ==========
  const canGoToStep2 =
    userType !== null &&
    personalData.firstName.trim() !== '' &&
    personalData.lastName.trim() !== '' &&
    personalData.email.trim() !== '' &&
    personalData.email.includes('@') &&
    personalData.password.length >= 8 &&
    personalData.password === personalData.confirmPassword

  // ========== ÉTAPE 2 : EMAIL ==========
  const sendEmailVerification = async () => {
    if (!personalData.email) return

    // Check if email already exists in Supabase
    try {
      const { isSupabaseConfigured, createClient } = await import('../../lib/supabase/client')
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        const { data } = await supabase.from('profiles').select('id').eq('email', personalData.email).limit(1) as any
        if (data && data.length > 0) {
          alert('Un compte existe deja avec cet email.')
          return
        }
      }
    } catch {}

    setSendingEmail(true)
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    try {
      const response = await fetch('/api/send-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: personalData.email,
          name: `${personalData.firstName} ${personalData.lastName}`,
          code
        })
      })

      const data = await response.json()
      setSentEmailCode(code)
      localStorage.setItem(`email_verification_${personalData.email}`, code)

      if (data.success) {
        alert(`✉️ Email envoyé à ${personalData.email}`)
      } else {
        alert(`Code : ${code}`)
      }
    } catch (error) {
      setSentEmailCode(code)
      localStorage.setItem(`email_verification_${personalData.email}`, code)
      alert(`Code : ${code}`)
    } finally {
      setSendingEmail(false)
    }
  }

  const verifyEmailCode = () => {
    const savedCode = localStorage.getItem(`email_verification_${personalData.email}`)
    if (emailCode === savedCode || emailCode === sentEmailCode) {
      setEmailVerified(true)
    } else {
      alert('Code incorrect')
    }
  }

  // ========== FINALISER ==========
  const handleFinalSubmit = async () => {
    if (!emailVerified || !userType) return

    setIsLoading(true)

    const { error } = await signUp({
      firstName: personalData.firstName,
      lastName: personalData.lastName,
      email: personalData.email,
      password: personalData.password,
      phone: phone.replace(/\s/g, ''),
      countryCode,
      userType,
      dateOfBirth: personalData.dateOfBirth,
      address: personalData.address,
      postalCode: personalData.postalCode,
      city: personalData.city,
      country: personalData.country,
    })

    if (error) {
      alert(error)
      setIsLoading(false)
      return
    }

    // Apply referral/promo code if provided
    if (referralCode.trim()) {
      try {
        // Get the newly created user ID from localStorage
        const savedUser = localStorage.getItem('ikasso_user')
        const userId = savedUser ? JSON.parse(savedUser).id : null
        await fetch('/api/validate-referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: referralCode.trim(),
            userId,
            userEmail: personalData.email,
          }),
        })
      } catch {}
    }

    try {
      await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: personalData.email,
          name: `${personalData.firstName} ${personalData.lastName}`,
          userType
        })
      })
    } catch {}

    setIsLoading(false)
    router.push(userType === 'hote' ? '/dashboard/host' : '/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE — Hero (Desktop only) */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"
            alt="Hebergement au Mali"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/70 via-primary-800/50 to-black/60" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <Link href="/">
            <img src="/images/logos/ikasso-logo-800.png" alt="Ikasso" className="h-14 object-contain brightness-0 invert" />
          </Link>
          <div className="max-w-sm">
            <h1 className="text-4xl font-bold text-white leading-tight mb-3">
              Rejoignez<br />la communaute Ikasso
            </h1>
            <p className="text-base text-white/75 leading-relaxed">
              Creez votre compte en quelques minutes et decouvrez les meilleurs hebergements du Mali.
            </p>
          </div>
          <div className="flex items-center gap-4 text-white/50 text-xs">
            <span>Inscription gratuite</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Verification securisee</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col bg-white lg:bg-gray-50/50">
        {/* Mobile Header */}
        <header className="lg:hidden bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center h-14 px-4">
            <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="flex-1 text-center font-semibold pr-7">{t('nav.signup')}</span>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-end px-10 pt-8">
          <span className="text-sm text-gray-500">{t('register.already_registered')}</span>
          <Link href="/auth/login" className="ml-3 text-sm font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors">
            {t('nav.login')}
          </Link>
        </div>

      <div className="flex-1 flex items-start lg:items-center justify-center px-6 py-6 lg:py-0">
      <div className="w-full max-w-lg">
        {/* Mobile logo */}
        <div className="flex justify-center mb-6 lg:hidden">
          <img src="/images/logos/ikasso-logo-800.png" alt="Ikasso" className="h-16 object-contain" />
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
              <div
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: currentStep === 1 ? '0%' : '100%' }}
              />
            </div>

            {[
              { step: 1, icon: User, label: 'Profil', done: currentStep > 1 },
              { step: 2, icon: Mail, label: t('register.email'), done: emailVerified },
            ].map(({ step, icon: Icon, label, done }) => (
              <div key={step} className="relative flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all shadow-sm ${
                  currentStep >= step ? 'bg-primary-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'
                } ${done ? 'bg-green-500 border-green-500' : ''}`}>
                  {done ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`mt-1.5 text-[10px] font-medium ${currentStep >= step ? 'text-gray-900' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ÉTAPE 1 — Type utilisateur + Informations personnelles */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {t('register.welcome')}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {t('register.complete_profile')}
              </p>
            </div>

            {/* Choix du type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {t('register.i_want_to')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'client', emoji: '🔍', title: t('register.travel'), desc: t('register.book_accommodations') },
                  { type: 'hote', emoji: '🏡', title: t('register.host'), desc: t('register.offer_accommodation') },
                ].map(({ type, emoji, title, desc }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type as UserType)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      userType === type
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {userType === type && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-4 w-4 text-primary-500" />
                      </div>
                    )}
                    <div className="text-2xl mb-2">{emoji}</div>
                    <div className="font-semibold text-gray-900 text-sm">{title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nom / Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('register.first_name')} *</label>
                <input
                  type="text"
                  className="w-full px-3 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={personalData.firstName}
                  onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('register.last_name')} *</label>
                <input
                  type="text"
                  className="w-full px-3 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={personalData.lastName}
                  onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('register.email')} *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={personalData.email}
                  onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('register.password')} *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('register.min_8_chars')}
                  className="w-full px-3 py-3 pr-12 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={personalData.password}
                  onChange={(e) => setPersonalData({...personalData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('register.confirm_password')} *</label>
              <input
                type="password"
                className={`w-full px-3 py-3 text-base border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  personalData.confirmPassword && personalData.password !== personalData.confirmPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                value={personalData.confirmPassword}
                onChange={(e) => setPersonalData({...personalData, confirmPassword: e.target.value})}
              />
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('register.date_of_birth')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={personalData.dateOfBirth}
                  onChange={(e) => setPersonalData({...personalData, dateOfBirth: e.target.value})}
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('register.address')}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rue, quartier..."
                  className="w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={personalData.address}
                  onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                />
              </div>
            </div>

            {/* Ville / Pays */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('register.city')}</label>
                <input
                  type="text"
                  placeholder="Bamako"
                  className="w-full px-3 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={personalData.city}
                  onChange={(e) => setPersonalData({...personalData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('register.country')}</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={personalData.country}
                    onChange={(e) => setPersonalData({...personalData, country: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Téléphone (optionnel) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('register.phone_number')} <span className="text-gray-400">(optionnel)</span>
              </label>
              <div className="flex gap-2">
                {/* Sélecteur indicatif */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-1.5 px-3 py-3.5 border border-gray-300 hover:border-gray-400 rounded-xl transition-all min-w-[90px]"
                  >
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span className="text-sm font-medium text-gray-700">{countryCode}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {showCountryDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                      <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                        {countryCodes.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCountryCode(c.code)
                              setShowCountryDropdown(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left ${
                              countryCode === c.code ? 'bg-primary-50' : ''
                            }`}
                          >
                            <span className="text-lg">{c.flag}</span>
                            <span className="flex-1 text-sm text-gray-900">{c.country}</span>
                            <span className="text-sm text-gray-500">{c.code}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Numéro */}
                <input
                  type="tel"
                  placeholder="XX XX XX XX"
                  className="flex-1 px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Code de parrainage (optionnel) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Code de parrainage <span className="text-gray-400">(optionnel)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: WELCOMEIKASSO"
                  className={`flex-1 px-3 py-3 text-base border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase ${referralValid?.valid ? 'border-green-400 bg-green-50' : referralValid && !referralValid.valid ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  value={referralCode}
                  onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setReferralValid(null) }}
                />
                {referralCode.trim().length >= 3 && (
                  <button
                    type="button"
                    onClick={async () => {
                      setCheckingReferral(true)
                      try {
                        const res = await fetch('/api/validate-referral', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ code: referralCode.trim() }),
                        })
                        const json = await res.json()
                        setReferralValid(json)
                      } catch { setReferralValid({ valid: false, error: 'Erreur' }) }
                      setCheckingReferral(false)
                    }}
                    disabled={checkingReferral}
                    className="px-4 py-3 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:bg-gray-300 transition-colors whitespace-nowrap"
                  >
                    {checkingReferral ? '...' : 'Verifier'}
                  </button>
                )}
              </div>
              {referralValid?.valid && (
                <p className="text-xs text-green-600 mt-1 font-medium">✓ {referralValid.reward}</p>
              )}
              {referralValid && !referralValid.valid && (
                <p className="text-xs text-red-500 mt-1">✗ {referralValid.error}</p>
              )}
            </div>

            {/* Bouton continuer */}
            <button
              onClick={() => canGoToStep2 && setCurrentStep(2)}
              disabled={!canGoToStep2}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {t('register.continue')}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ÉTAPE 2 — Vérification email */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('register.back')}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('register.verify_email')}
              </h1>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{personalData.email}</p>
                  <p className="text-xs text-gray-500">{t('register.code_will_be_sent')}</p>
                </div>
              </div>
            </div>

            {!emailVerified && !sentEmailCode && (
              <button
                onClick={sendEmailVerification}
                disabled={sendingEmail}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold transition-all"
              >
                {sendingEmail ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    {t('general.loading')}
                  </span>
                ) : (
                  t('register.send_code')
                )}
              </button>
            )}

            {!emailVerified && sentEmailCode && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="• • • • • •"
                  className="w-full text-center text-xl font-mono tracking-[0.3em] py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  maxLength={6}
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                />
                <button
                  onClick={verifyEmailCode}
                  disabled={emailCode.length !== 6}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold transition-all"
                >
                  {t('register.verify')}
                </button>
                <button
                  onClick={sendEmailVerification}
                  className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                >
                  {t('register.resend_code')}
                </button>
              </div>
            )}

            {emailVerified && (
              <div className="space-y-5">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="font-medium text-green-800 text-sm">{t('register.email_verified')}</p>
                  </div>
                </div>

                <button
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      {t('general.loading')}
                    </span>
                  ) : (
                    t('register.create_account')
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-[10px] text-gray-400 leading-relaxed">
          {t('register.terms_accept')}{' '}
          <a href="/terms" className="underline hover:text-gray-600">{t('register.terms')}</a>
          {' '}{t('register.and')}{' '}
          <a href="/privacy" className="underline hover:text-gray-600">{t('register.privacy')}</a>
        </p>

        {/* Footer mobile */}
        <div className="mt-4 lg:hidden text-center">
          <span className="text-sm text-gray-500">{t('register.already_registered')} </span>
          <Link href="/auth/login" className="text-sm font-bold text-primary-600">
            {t('nav.login')}
          </Link>
        </div>
      </div>
      </div>
      </div>
    </div>
  )
}
