'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Phone, Mail, User, MapPin, ArrowLeft, ArrowRight,
  CheckCircle, Loader, Eye, EyeOff, Calendar, Globe, ChevronDown
} from 'lucide-react'
import LogoFinal from '../components/LogoFinal'
import { useLanguage } from '../../contexts/LanguageContext'

type UserType = 'client' | 'hote' | null
type Step = 1 | 2 | 3

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
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [userType, setUserType] = useState<UserType>(null)
  
  // Étape 1 : Téléphone + SMS
  const [countryCode, setCountryCode] = useState('+223')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [sentPhoneCode, setSentPhoneCode] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [sendingPhone, setSendingPhone] = useState(false)
  
  // Étape 2 : Informations personnelles
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
  
  // Étape 3 : Validation email
  const [emailCode, setEmailCode] = useState('')
  const [sentEmailCode, setSentEmailCode] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)

  const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[0]

  // ========== ÉTAPE 1 : VALIDATION TÉLÉPHONE ==========
  const sendPhoneVerification = async () => {
    if (!phone || phone.length < 6) {
      alert('Veuillez entrer un numéro de téléphone valide')
      return
    }

    setSendingPhone(true)
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    const fullPhone = countryCode + phone.replace(/\s/g, '')
    
    try {
      const response = await fetch('/api/send-sms-orange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code })
      })

      const data = await response.json()

      if (data.success) {
        setSentPhoneCode(data.code || code)
        localStorage.setItem(`phone_verification_${fullPhone}`, data.code || code)
        
        if (data.demo) {
          alert(`📱 Mode démo - Code : ${data.code || code}`)
        } else {
          alert(`📱 SMS envoyé au ${fullPhone}`)
        }
      } else {
        setSentPhoneCode(code)
        localStorage.setItem(`phone_verification_${fullPhone}`, code)
        alert(`📱 Code : ${code}`)
      }
    } catch (error) {
      setSentPhoneCode(code)
      localStorage.setItem(`phone_verification_${countryCode + phone}`, code)
      alert(`📱 Code : ${code}`)
    } finally {
      setSendingPhone(false)
    }
  }

  const verifyPhoneCode = () => {
    const fullPhone = countryCode + phone.replace(/\s/g, '')
    const savedCode = localStorage.getItem(`phone_verification_${fullPhone}`)
    if (phoneCode === savedCode || phoneCode === sentPhoneCode) {
      setPhoneVerified(true)
    } else {
      alert('Code incorrect')
    }
  }

  const canGoToStep2 = phoneVerified && userType !== null

  // ========== ÉTAPE 2 ==========
  const canGoToStep3 = 
    personalData.firstName.trim() !== '' &&
    personalData.lastName.trim() !== '' &&
    personalData.email.trim() !== '' &&
    personalData.email.includes('@') &&
    personalData.password.length >= 8 &&
    personalData.password === personalData.confirmPassword

  // ========== ÉTAPE 3 ==========
  const sendEmailVerification = async () => {
    if (!personalData.email) return

    const existingUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
    const emailExists = existingUsers.some((user: any) => user.email === personalData.email)
    
    if (emailExists) {
      alert('Un compte existe déjà avec cet email.')
      return
    }

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
    if (!emailVerified) return

    setIsLoading(true)

    const userData = {
      userType,
      phone: countryCode + phone,
      countryCode,
      ...personalData,
      emailVerified: true,
      phoneVerified: true,
      memberSince: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      status: 'active',
      createdAt: new Date().toISOString()
    }

    localStorage.setItem('ikasso_user', JSON.stringify(userData))
    
    const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
    allUsers.push(userData)
    localStorage.setItem('ikasso_all_users', JSON.stringify(allUsers))

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
    } catch (error) {}

    setIsLoading(false)
    router.push(userType === 'hote' ? '/dashboard/host' : '/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header Mobile */}
      <header className="border-b border-gray-100 lg:hidden">
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <span className="flex-1 text-center font-semibold text-gray-900 pr-7">{t('nav.signup')}</span>
        </div>
      </header>

      {/* Header Desktop */}
      <header className="hidden lg:block border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <LogoFinal size="md" />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{t('register.already_registered')}</span>
              <Link href="/auth/login" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                {t('nav.login')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 lg:py-10">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
              />
            </div>
            
            {[
              { step: 1, icon: Phone, label: t('register.phone_number'), done: phoneVerified },
              { step: 2, icon: User, label: 'Profil', done: currentStep > 2 },
              { step: 3, icon: Mail, label: t('register.email'), done: emailVerified },
            ].map(({ step, icon: Icon, label, done }) => (
              <div key={step} className="relative flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${
                  currentStep >= step ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                } ${done ? 'bg-green-500' : ''}`}>
                  {done ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`mt-1.5 text-[10px] font-medium ${currentStep >= step ? 'text-gray-900' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ÉTAPE 1 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {t('register.welcome')}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {t('register.verify_phone')}
              </p>
            </div>

            {/* Choix du type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {t('register.i_want_to')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'client', emoji: '🏠', title: t('register.travel'), desc: t('register.book_accommodations') },
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

            {/* Téléphone avec indicatif */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t('register.phone_number')}
              </label>
              <div className="flex gap-2">
                {/* Sélecteur indicatif */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    disabled={phoneVerified}
                    className={`flex items-center gap-1.5 px-3 py-3.5 border rounded-xl transition-all min-w-[90px] ${
                      phoneVerified ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
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
                <div className="relative flex-1">
                  <input
                    type="tel"
                    placeholder="XX XX XX XX"
                    className={`w-full px-4 py-3.5 text-base border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                      phoneVerified ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setPhoneVerified(false)
                      setSentPhoneCode('')
                    }}
                    disabled={phoneVerified}
                  />
                  {phoneVerified && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Boutons */}
            {!phoneVerified && phone.length >= 6 && !sentPhoneCode && (
              <button
                onClick={sendPhoneVerification}
                disabled={sendingPhone}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold transition-all"
              >
                {sendingPhone ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    {t('general.loading')}
                  </span>
                ) : (
                  t('register.receive_code')
                )}
              </button>
            )}

            {!phoneVerified && sentPhoneCode && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {t('register.verification_code')}
                  </label>
                  <input
                    type="text"
                    placeholder="• • • •"
                    className="w-full text-center text-2xl font-mono tracking-[0.5em] py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    maxLength={4}
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <button
                  onClick={verifyPhoneCode}
                  disabled={phoneCode.length !== 4}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold transition-all"
                >
                  {t('register.verify')}
                </button>
                <button
                  onClick={sendPhoneVerification}
                  className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                >
                  {t('register.resend_code')}
                </button>
              </div>
            )}

            {phoneVerified && (
              <button
                onClick={() => canGoToStep2 && setCurrentStep(2)}
                disabled={!canGoToStep2}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {t('register.continue')}
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* ÉTAPE 2 */}
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
                {t('register.complete_profile')}
              </h1>
            </div>

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

            <button
              onClick={() => canGoToStep3 && setCurrentStep(3)}
              disabled={!canGoToStep3}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {t('register.continue')}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ÉTAPE 3 */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <button 
                onClick={() => setCurrentStep(2)}
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

        <p className="mt-6 text-center text-[10px] text-gray-500">
          {t('register.terms_accept')}{' '}
          <a href="#" className="underline">{t('register.terms')}</a>
          {' '}{t('register.and')}{' '}
          <a href="#" className="underline">{t('register.privacy')}</a>
        </p>

        {/* Footer mobile */}
        <div className="mt-4 lg:hidden text-center">
          <span className="text-sm text-gray-600">{t('register.already_registered')} </span>
          <Link href="/auth/login" className="text-sm font-semibold text-primary-600">
            {t('nav.login')}
          </Link>
        </div>
      </div>
    </div>
  )
}
