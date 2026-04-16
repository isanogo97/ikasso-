'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Phone, Mail, User, MapPin, ArrowLeft, ArrowRight,
  CheckCircle, Loader, Eye, EyeOff, Globe, ChevronDown,
  Search, Home, Building2, Lock, Shield
} from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'

type UserType = 'client' | 'hote' | null
type Step = 1 | 2

interface NominatimResult {
  place_id: number
  display_name: string
  address: {
    road?: string
    house_number?: string
    neighbourhood?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    country_code?: string
    postcode?: string
  }
}

const countryCodes = [
  { code: '+223', country: 'Mali', flag: '\u{1F1F2}\u{1F1F1}' },
  { code: '+33', country: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: '+1', country: 'USA/Canada', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: '+44', country: 'Royaume-Uni', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: '+49', country: 'Allemagne', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: '+34', country: 'Espagne', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: '+39', country: 'Italie', flag: '\u{1F1EE}\u{1F1F9}' },
  { code: '+32', country: 'Belgique', flag: '\u{1F1E7}\u{1F1EA}' },
  { code: '+41', country: 'Suisse', flag: '\u{1F1E8}\u{1F1ED}' },
  { code: '+212', country: 'Maroc', flag: '\u{1F1F2}\u{1F1E6}' },
  { code: '+213', country: 'Alg\u00e9rie', flag: '\u{1F1E9}\u{1F1FF}' },
  { code: '+216', country: 'Tunisie', flag: '\u{1F1F9}\u{1F1F3}' },
  { code: '+221', country: 'S\u00e9n\u00e9gal', flag: '\u{1F1F8}\u{1F1F3}' },
  { code: '+225', country: 'C\u00f4te d\'Ivoire', flag: '\u{1F1E8}\u{1F1EE}' },
  { code: '+226', country: 'Burkina Faso', flag: '\u{1F1E7}\u{1F1EB}' },
  { code: '+227', country: 'Niger', flag: '\u{1F1F3}\u{1F1EA}' },
  { code: '+228', country: 'Togo', flag: '\u{1F1F9}\u{1F1EC}' },
  { code: '+229', country: 'B\u00e9nin', flag: '\u{1F1E7}\u{1F1EF}' },
  { code: '+237', country: 'Cameroun', flag: '\u{1F1E8}\u{1F1F2}' },
  { code: '+86', country: 'Chine', flag: '\u{1F1E8}\u{1F1F3}' },
  { code: '+81', country: 'Japon', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: '+971', country: '\u00c9mirats', flag: '\u{1F1E6}\u{1F1EA}' },
]

export default function RegisterNewPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { signUp } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [userType, setUserType] = useState<UserType>(null)

  // Step 1: Personal info + user type
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Address autocomplete
  const [addressSuggestions, setAddressSuggestions] = useState<NominatimResult[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addressContainerRef = useRef<HTMLDivElement>(null)

  // Step 2: Email verification
  const [emailCode, setEmailCode] = useState('')
  const [sentEmailCode, setSentEmailCode] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[0]

  // Close address suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addressContainerRef.current && !addressContainerRef.current.contains(e.target as Node)) {
        setShowAddressSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Address autocomplete handler
  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
      return
    }

    setAddressLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ml,fr,ci,sn&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr' } }
      )
      const data: NominatimResult[] = await res.json()
      setAddressSuggestions(data)
      setShowAddressSuggestions(data.length > 0)
    } catch {
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
    } finally {
      setAddressLoading(false)
    }
  }, [])

  const handleAddressChange = (value: string) => {
    setPersonalData(prev => ({ ...prev, address: value }))
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current)
    addressDebounceRef.current = setTimeout(() => fetchAddressSuggestions(value), 500)
  }

  const selectAddressSuggestion = (result: NominatimResult) => {
    const addr = result.address
    const street = [addr.house_number, addr.road, addr.neighbourhood, addr.suburb]
      .filter(Boolean)
      .join(', ')
    const city = addr.city || addr.town || addr.village || ''
    const country = addr.country || ''

    setPersonalData(prev => ({
      ...prev,
      address: street || result.display_name.split(',')[0],
      city,
      country,
      postalCode: addr.postcode || prev.postalCode,
    }))
    setShowAddressSuggestions(false)
  }

  // Password strength check
  const isPasswordStrong =
    personalData.password.length >= 8 &&
    /[A-Z]/.test(personalData.password) &&
    /[a-z]/.test(personalData.password) &&
    /[0-9]/.test(personalData.password)

  // Validation
  const canGoToStep2 =
    userType !== null &&
    personalData.firstName.trim() !== '' &&
    personalData.lastName.trim() !== '' &&
    personalData.email.trim() !== '' &&
    personalData.email.includes('@') &&
    isPasswordStrong &&
    personalData.password === personalData.confirmPassword

  // Email verification
  const sendEmailVerification = async () => {
    if (!personalData.email) return

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
        alert(`\u2709\uFE0F Email envoye a ${personalData.email}`)
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

  // Final submit
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

    if (referralCode.trim()) {
      try {
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

  // OAuth handlers
  const handleOAuth = async (provider: 'google' | 'apple') => {
    try {
      const { isSupabaseConfigured, createClient } = await import('../../lib/supabase/client')
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${window.location.origin}/auth/callback` }
        })
      }
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE -- Hero / Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80"
            alt="Villa au Mali"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-primary-900/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Logo top */}
          <Link href="/">
            <img
              src="/images/logos/ikasso-logo-800.png"
              alt="Ikasso"
              className="h-14 object-contain brightness-0 invert"
            />
          </Link>

          {/* Center content */}
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              Creez votre<br />compte Ikasso
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Rejoignez des milliers d'utilisateurs au Mali.
              Hotels, maisons et appartements dans les principales villes du Mali.
            </p>
          </div>

          {/* Bottom trust badges */}
          <div className="flex items-center gap-6 text-white/50 text-xs">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Paiements securises</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> 100% Mali</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE -- Form */}
      <div className="flex-1 flex flex-col bg-white lg:bg-gray-50/50">
        {/* Mobile Header */}
        <header className="lg:hidden bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center h-14 px-4">
            <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="flex-1 text-center font-semibold pr-7">Creer un compte</span>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-end px-10 pt-8">
          <span className="text-sm text-gray-500">Deja un compte ?</span>
          <Link href="/auth/login" className="ml-3 text-sm font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors">
            Se connecter
          </Link>
        </div>

        {/* Scrollable form container */}
        <div className="flex-1 overflow-y-auto px-6 py-8 lg:py-0">
          <div className="w-full max-w-[440px] mx-auto pb-8">
            {/* Mobile Logo */}
            <div className="flex flex-col items-center mb-8 lg:mb-0">
              <div className="lg:hidden mb-2">
                <img
                  src="/images/logos/ikasso-logo-800.png"
                  alt="Ikasso"
                  className="h-20 object-contain"
                />
              </div>
            </div>

            {/* Desktop Logo */}
            <div className="hidden lg:flex flex-col items-center mb-10 mt-6">
              <img
                src="/images/logos/ikasso-logo-800.png"
                alt="Ikasso"
                className="h-16 object-contain mb-3"
              />
              <p className="text-sm text-gray-500">Plateforme de reservation au Mali</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-0 mb-6">
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                currentStep >= 1 ? 'bg-primary-500 scale-110' : 'bg-gray-300'
              } ${currentStep > 1 ? 'bg-green-500' : ''}`} />
              <div className="w-16 h-0.5 mx-1">
                <div className={`h-full rounded-full transition-all duration-500 ${
                  currentStep > 1 ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              </div>
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                currentStep >= 2 ? 'bg-primary-500 scale-110' : 'bg-gray-300'
              } ${emailVerified ? 'bg-green-500' : ''}`} />
            </div>

            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Title */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-[28px] font-bold text-gray-900">
                    Creer un compte
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Rejoignez Ikasso
                  </p>
                </div>

                {/* Social signup */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleOAuth('apple')}
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-black hover:bg-gray-900 text-white rounded-xl transition-all shadow-sm"
                  >
                    <svg className="h-5 w-5" fill="white" viewBox="0 0 24 24">
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                    </svg>
                    <span className="font-medium text-sm">Continuer avec Apple</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuth('google')}
                    className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all bg-white shadow-sm"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium text-gray-700 text-sm">Continuer avec Google</span>
                  </button>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">OU</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* User type selection -- pills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vous souhaitez *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType('client')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                        userType === 'client'
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <Search className="h-4 w-4" />
                      Je cherche un logement
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('hote')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                        userType === 'hote'
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      Je propose un logement
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* First name + Last name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.first_name')} *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                        <input
                          type="text"
                          placeholder="Ibrahim"
                          className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
                          value={personalData.firstName}
                          onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.last_name')} *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                        <input
                          type="text"
                          placeholder="Traore"
                          className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
                          value={personalData.lastName}
                          onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.email')} *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                      <input
                        type="email"
                        placeholder="vous@exemple.com"
                        className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
                        value={personalData.email}
                        onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.password')} *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 8 caracteres"
                        className="w-full pl-11 pr-12 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
                        value={personalData.password}
                        onChange={(e) => setPersonalData({ ...personalData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {personalData.password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          <div className={`h-1 flex-1 rounded-full transition-colors ${personalData.password.length >= 8 ? 'bg-green-400' : 'bg-gray-200'}`} />
                          <div className={`h-1 flex-1 rounded-full transition-colors ${/[A-Z]/.test(personalData.password) ? 'bg-green-400' : 'bg-gray-200'}`} />
                          <div className={`h-1 flex-1 rounded-full transition-colors ${/[a-z]/.test(personalData.password) ? 'bg-green-400' : 'bg-gray-200'}`} />
                          <div className={`h-1 flex-1 rounded-full transition-colors ${/[0-9]/.test(personalData.password) ? 'bg-green-400' : 'bg-gray-200'}`} />
                        </div>
                        {!isPasswordStrong && (
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {personalData.password.length < 8 && <p className="text-amber-600">Min. 8 caracteres</p>}
                            {!/[A-Z]/.test(personalData.password) && <p className="text-amber-600">Une majuscule</p>}
                            {!/[a-z]/.test(personalData.password) && <p className="text-amber-600">Une minuscule</p>}
                            {!/[0-9]/.test(personalData.password) && <p className="text-amber-600">Un chiffre</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.confirm_password')} *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirmez votre mot de passe"
                        className={`w-full pl-11 pr-12 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm ${
                          personalData.confirmPassword && personalData.password !== personalData.confirmPassword
                            ? 'border-red-300'
                            : 'border-gray-200'
                        }`}
                        value={personalData.confirmPassword}
                        onChange={(e) => setPersonalData({ ...personalData, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {personalData.confirmPassword && personalData.password !== personalData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>

                  {/* Phone (optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('register.phone_number')} <span className="text-gray-400 font-normal">(optionnel)</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="flex items-center gap-1.5 px-3 py-3 border border-gray-200 hover:border-gray-300 rounded-xl transition-all min-w-[100px] bg-white text-sm shadow-sm"
                        >
                          <span className="text-base">{selectedCountry.flag}</span>
                          <span className="font-medium text-gray-700">{countryCode}</span>
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </button>

                        {showCountryDropdown && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                              {countryCodes.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setCountryCode(c.code)
                                    setShowCountryDropdown(false)
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left text-sm transition-colors ${
                                    countryCode === c.code ? 'bg-primary-50' : ''
                                  }`}
                                >
                                  <span className="text-base">{c.flag}</span>
                                  <span className="flex-1 text-gray-900">{c.country}</span>
                                  <span className="text-gray-400">{c.code}</span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                        <input
                          type="tel"
                          placeholder="XX XX XX XX"
                          className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address with autocomplete */}
                  <div ref={addressContainerRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.address')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rue, quartier..."
                        className="w-full pl-11 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
                        value={personalData.address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        onFocus={() => {
                          if (addressSuggestions.length > 0) setShowAddressSuggestions(true)
                        }}
                      />
                      {addressLoading && (
                        <Loader className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                      )}
                    </div>

                    {/* Suggestions dropdown */}
                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {addressSuggestions.map((result) => (
                          <button
                            key={result.place_id}
                            type="button"
                            onClick={() => selectAddressSuggestion(result)}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <MapPin className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 leading-snug line-clamp-2">{result.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-400 mt-1">Powered by OpenStreetMap</p>
                  </div>

                  {/* City + Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.city')}</label>
                      <div className="relative">
                        <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                        <input
                          type="text"
                          placeholder="Bamako"
                          className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
                          value={personalData.city}
                          onChange={(e) => setPersonalData({ ...personalData, city: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('register.country')}</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                        <input
                          type="text"
                          className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
                          value={personalData.country}
                          onChange={(e) => setPersonalData({ ...personalData, country: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Referral code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Code de parrainage <span className="text-gray-400 font-normal">(optionnel)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: WELCOMEIKASSO"
                        className={`flex-1 px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm uppercase ${
                          referralValid?.valid
                            ? 'border-green-400 bg-green-50'
                            : referralValid && !referralValid.valid
                            ? 'border-red-400 bg-red-50'
                            : 'border-gray-200'
                        }`}
                        value={referralCode}
                        onChange={(e) => {
                          setReferralCode(e.target.value.toUpperCase())
                          setReferralValid(null)
                        }}
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
                            } catch {
                              setReferralValid({ valid: false, error: 'Erreur' })
                            }
                            setCheckingReferral(false)
                          }}
                          disabled={checkingReferral}
                          className="px-5 py-3 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:bg-gray-300 transition-colors whitespace-nowrap"
                        >
                          {checkingReferral ? <Loader className="h-4 w-4 animate-spin" /> : 'Verifier'}
                        </button>
                      )}
                    </div>
                    {referralValid?.valid && (
                      <p className="text-xs text-green-600 mt-1.5 font-medium flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {referralValid.reward}
                      </p>
                    )}
                    {referralValid && !referralValid.valid && (
                      <p className="text-xs text-red-500 mt-1.5">{referralValid.error}</p>
                    )}
                  </div>
                </div>

                {/* Continue button */}
                <button
                  onClick={() => canGoToStep2 && setCurrentStep(2)}
                  disabled={!canGoToStep2}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-400 text-white py-3.5 rounded-xl font-semibold transition-all text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Footer mobile */}
                <div className="mt-2 lg:hidden text-center">
                  <span className="text-sm text-gray-500">Deja un compte ? </span>
                  <Link href="/auth/login" className="text-sm font-bold text-primary-600">
                    Se connecter
                  </Link>
                </div>

                <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                  {t('register.terms_accept')}{' '}
                  <a href="/terms" className="underline hover:text-gray-600">{t('register.terms')}</a>
                  {' '}{t('register.and')}{' '}
                  <a href="/privacy" className="underline hover:text-gray-600">{t('register.privacy')}</a>
                </p>
              </div>
            )}

            {/* STEP 2 -- Email verification */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 mb-4 text-sm transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </button>

                  <div className="text-center">
                    <h2 className="text-2xl lg:text-[28px] font-bold text-gray-900">
                      Verification email
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Code envoye a {personalData.email}
                    </p>
                  </div>
                </div>

                {/* Email display */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{personalData.email}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t('register.code_will_be_sent')}</p>
                    </div>
                  </div>
                </div>

                {!emailVerified && !sentEmailCode && (
                  <button
                    onClick={sendEmailVerification}
                    disabled={sendingEmail}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-300 text-white py-3.5 rounded-xl font-semibold transition-all text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:shadow-none"
                  >
                    {sendingEmail ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        {t('general.loading')}
                      </span>
                    ) : (
                      'Envoyer le code'
                    )}
                  </button>
                )}

                {!emailVerified && sentEmailCode && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                        Entrez le code a 6 chiffres
                      </label>
                      <input
                        type="text"
                        placeholder="000000"
                        className="w-full text-center text-2xl font-mono tracking-[0.4em] py-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none shadow-sm"
                        maxLength={6}
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <button
                      onClick={verifyEmailCode}
                      disabled={emailCode.length !== 6}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-400 text-white py-3.5 rounded-xl font-semibold transition-all text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:shadow-none"
                    >
                      Verifier
                    </button>
                    <button
                      onClick={sendEmailVerification}
                      className="w-full text-gray-500 hover:text-gray-900 py-2 text-sm font-medium transition-colors"
                    >
                      {t('register.resend_code')}
                    </button>
                  </div>
                )}

                {emailVerified && (
                  <div className="space-y-5">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <p className="font-medium text-green-800 text-sm">{t('register.email_verified')}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleFinalSubmit}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-300 text-white py-3.5 rounded-xl font-semibold transition-all text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:shadow-none"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader className="h-4 w-4 animate-spin" />
                          {t('general.loading')}
                        </span>
                      ) : (
                        'Creer mon compte'
                      )}
                    </button>
                  </div>
                )}

                <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                  {t('register.terms_accept')}{' '}
                  <a href="/terms" className="underline hover:text-gray-600">{t('register.terms')}</a>
                  {' '}{t('register.and')}{' '}
                  <a href="/privacy" className="underline hover:text-gray-600">{t('register.privacy')}</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
