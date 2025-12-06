'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Phone, Mail, User, MapPin, ArrowLeft, ArrowRight,
  CheckCircle, Loader, Eye, EyeOff, Calendar, Globe, ChevronDown
} from 'lucide-react'
import Logo from '../../components/Logo'

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
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  { code: '+242', country: 'Congo', flag: '🇨🇬' },
  { code: '+243', country: 'RD Congo', flag: '🇨🇩' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+86', country: 'Chine', flag: '🇨🇳' },
  { code: '+81', country: 'Japon', flag: '🇯🇵' },
  { code: '+971', country: 'Émirats', flag: '🇦🇪' },
]

export default function RegisterNewPage() {
  const router = useRouter()
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
    <div className="min-h-screen bg-white">
      {/* Header - Responsive */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-sm text-gray-600">Déjà inscrit ?</span>
              <Link href="/auth/login" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 sm:py-12">
        {/* Progress Steps - Responsive */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
              />
            </div>
            
            {[
              { step: 1, icon: Phone, label: 'Téléphone', done: phoneVerified },
              { step: 2, icon: User, label: 'Profil', done: currentStep > 2 },
              { step: 3, icon: Mail, label: 'Email', done: emailVerified },
            ].map(({ step, icon: Icon, label, done }) => (
              <div key={step} className="relative flex flex-col items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                  currentStep >= step ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                } ${done ? 'bg-green-500' : ''}`}>
                  {done ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" /> : <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
                </div>
                <span className={`mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium ${currentStep >= step ? 'text-gray-900' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ÉTAPE 1 */}
        {currentStep === 1 && (
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Bienvenue sur Ikasso
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Commençons par vérifier votre numéro
              </p>
            </div>

            {/* Choix du type - Responsive */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Je souhaite
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { type: 'client', emoji: '🏠', title: 'Voyager', desc: 'Réserver des logements' },
                  { type: 'hote', emoji: '🏡', title: 'Héberger', desc: 'Proposer mon logement' },
                ].map(({ type, emoji, title, desc }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type as UserType)}
                    className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all text-left ${
                      userType === type
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {userType === type && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                      </div>
                    )}
                    <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">{emoji}</div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{title}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Téléphone avec indicatif - Responsive */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Numéro de téléphone
              </label>
              <div className="flex gap-2">
                {/* Sélecteur indicatif */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    disabled={phoneVerified}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 sm:py-4 border-2 rounded-xl transition-all min-w-[80px] sm:min-w-[100px] ${
                      phoneVerified ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg sm:text-xl">{selectedCountry.flag}</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{countryCode}</span>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  </button>
                  
                  {showCountryDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                      <div className="absolute top-full left-0 mt-1 w-56 sm:w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                        {countryCodes.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCountryCode(c.code)
                              setShowCountryDropdown(false)
                            }}
                            className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 text-left ${
                              countryCode === c.code ? 'bg-primary-50' : ''
                            }`}
                          >
                            <span className="text-lg sm:text-xl">{c.flag}</span>
                            <span className="flex-1 text-xs sm:text-sm text-gray-900">{c.country}</span>
                            <span className="text-xs sm:text-sm text-gray-500">{c.code}</span>
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
                    className={`w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all ${
                      phoneVerified ? 'border-green-500 bg-green-50' : 'border-gray-200'
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
                    <CheckCircle className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Boutons - Responsive */}
            {!phoneVerified && phone.length >= 6 && !sentPhoneCode && (
              <button
                onClick={sendPhoneVerification}
                disabled={sendingPhone}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white py-3 sm:py-4 rounded-xl font-semibold transition-all text-sm sm:text-base"
              >
                {sendingPhone ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Envoi...
                  </span>
                ) : (
                  'Recevoir le code par SMS'
                )}
              </button>
            )}

            {!phoneVerified && sentPhoneCode && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    placeholder="• • • •"
                    className="w-full text-center text-2xl sm:text-3xl font-mono tracking-[0.5em] sm:tracking-[1em] py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                    maxLength={4}
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <button
                  onClick={verifyPhoneCode}
                  disabled={phoneCode.length !== 4}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3 sm:py-4 rounded-xl font-semibold transition-all text-sm sm:text-base"
                >
                  Vérifier
                </button>
                <button
                  onClick={sendPhoneVerification}
                  className="w-full text-gray-600 hover:text-gray-900 py-2 text-xs sm:text-sm font-medium"
                >
                  Renvoyer le code
                </button>
              </div>
            )}

            {phoneVerified && (
              <button
                onClick={() => canGoToStep2 && setCurrentStep(2)}
                disabled={!canGoToStep2}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3 sm:py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Continuer
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        )}

        {/* ÉTAPE 2 - Responsive */}
        {currentStep === 2 && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <button 
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Complétez votre profil
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.firstName}
                  onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.lastName}
                  onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <div className="relative">
                <Calendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.dateOfBirth}
                  onChange={(e) => setPersonalData({...personalData, dateOfBirth: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <div className="relative">
                <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rue, quartier..."
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.address}
                  onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  placeholder="Bamako"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.city}
                  onChange={(e) => setPersonalData({...personalData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Pays</label>
                <div className="relative">
                  <Globe className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                    value={personalData.country}
                    onChange={(e) => setPersonalData({...personalData, country: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.email}
                  onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.password}
                  onChange={(e) => setPersonalData({...personalData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Confirmer *</label>
              <input
                type="password"
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-xl focus:ring-0 focus:border-primary-500 ${
                  personalData.confirmPassword && personalData.password !== personalData.confirmPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
                value={personalData.confirmPassword}
                onChange={(e) => setPersonalData({...personalData, confirmPassword: e.target.value})}
              />
            </div>

            <button
              onClick={() => canGoToStep3 && setCurrentStep(3)}
              disabled={!canGoToStep3}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3 sm:py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Continuer
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        )}

        {/* ÉTAPE 3 - Responsive */}
        {currentStep === 3 && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <button 
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Vérifiez votre email
              </h1>
            </div>

            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{personalData.email}</p>
                  <p className="text-xs sm:text-sm text-gray-500">Un code sera envoyé</p>
                </div>
              </div>
            </div>

            {!emailVerified && !sentEmailCode && (
              <button
                onClick={sendEmailVerification}
                disabled={sendingEmail}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white py-3 sm:py-4 rounded-xl font-semibold transition-all text-sm sm:text-base"
              >
                {sendingEmail ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Envoi...
                  </span>
                ) : (
                  'Envoyer le code'
                )}
              </button>
            )}

            {!emailVerified && sentEmailCode && (
              <div className="space-y-3 sm:space-y-4">
                <input
                  type="text"
                  placeholder="• • • • • •"
                  className="w-full text-center text-xl sm:text-2xl font-mono tracking-[0.3em] sm:tracking-[0.5em] py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  maxLength={6}
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                />
                <button
                  onClick={verifyEmailCode}
                  disabled={emailCode.length !== 6}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3 sm:py-4 rounded-xl font-semibold transition-all text-sm sm:text-base"
                >
                  Vérifier
                </button>
                <button
                  onClick={sendEmailVerification}
                  className="w-full text-gray-600 hover:text-gray-900 py-2 text-xs sm:text-sm font-medium"
                >
                  Renvoyer
                </button>
              </div>
            )}

            {emailVerified && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    <p className="font-medium text-green-800 text-sm sm:text-base">Email vérifié !</p>
                  </div>
                </div>

                <button
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3 sm:py-4 rounded-xl font-semibold transition-all text-sm sm:text-base"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Création...
                    </span>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 sm:mt-8 text-center text-[10px] sm:text-xs text-gray-500">
          En vous inscrivant, vous acceptez nos{' '}
          <a href="#" className="underline">Conditions</a>
          {' '}et notre{' '}
          <a href="#" className="underline">Politique de confidentialité</a>
        </p>
      </div>
    </div>
  )
}
