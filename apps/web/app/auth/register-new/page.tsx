'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Phone, Mail, User, MapPin, ArrowLeft, ArrowRight,
  CheckCircle, Loader, Home, Building, Eye, EyeOff, Calendar, Globe
} from 'lucide-react'
import Logo from '../../components/Logo'

type UserType = 'client' | 'hote' | null
type Step = 1 | 2 | 3

export default function RegisterNewPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [userType, setUserType] = useState<UserType>(null)
  
  // Étape 1 : Téléphone + SMS
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

  // ========== ÉTAPE 1 : VALIDATION TÉLÉPHONE ==========
  const sendPhoneVerification = async () => {
    if (!phone || phone.length < 8) {
      alert('Veuillez entrer un numéro de téléphone valide')
      return
    }

    setSendingPhone(true)
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    
    try {
      const response = await fetch('/api/send-sms-orange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      })

      const data = await response.json()

      if (data.success) {
        setSentPhoneCode(data.code || code)
        localStorage.setItem(`phone_verification_${phone}`, data.code || code)
        
        if (data.demo) {
          alert(`📱 Mode démo - Code de vérification : ${data.code || code}\n\n(En production, ce code sera envoyé par SMS)`)
        } else {
          alert(`📱 Un SMS a été envoyé au ${phone}\n\nEntrez le code à 4 chiffres reçu.`)
        }
      } else {
        setSentPhoneCode(code)
        localStorage.setItem(`phone_verification_${phone}`, code)
        alert(`📱 Code de vérification : ${code}\n\n(L'API SMS est en cours de validation)`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSentPhoneCode(code)
      localStorage.setItem(`phone_verification_${phone}`, code)
      alert(`📱 Code de vérification : ${code}`)
    } finally {
      setSendingPhone(false)
    }
  }

  const verifyPhoneCode = () => {
    const savedCode = localStorage.getItem(`phone_verification_${phone}`)
    if (phoneCode === savedCode || phoneCode === sentPhoneCode) {
      setPhoneVerified(true)
    } else {
      alert('Code incorrect. Veuillez réessayer.')
    }
  }

  const canGoToStep2 = phoneVerified && userType !== null

  // ========== ÉTAPE 2 : INFORMATIONS PERSONNELLES ==========
  const canGoToStep3 = 
    personalData.firstName.trim() !== '' &&
    personalData.lastName.trim() !== '' &&
    personalData.dateOfBirth !== '' &&
    personalData.address.trim() !== '' &&
    personalData.city.trim() !== '' &&
    personalData.country.trim() !== '' &&
    personalData.email.trim() !== '' &&
    personalData.email.includes('@') &&
    personalData.password.length >= 8 &&
    personalData.password === personalData.confirmPassword

  // ========== ÉTAPE 3 : VALIDATION EMAIL ==========
  const sendEmailVerification = async () => {
    if (!personalData.email) return

    // Vérifier si l'email existe déjà
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
          code: code
        })
      })

      const data = await response.json()

      if (data.success) {
        setSentEmailCode(code)
        localStorage.setItem(`email_verification_${personalData.email}`, code)
        alert(`✉️ Email envoyé à ${personalData.email}`)
      } else {
        setSentEmailCode(code)
        localStorage.setItem(`email_verification_${personalData.email}`, code)
        alert(`Code de vérification : ${code}`)
      }
    } catch (error) {
      setSentEmailCode(code)
      localStorage.setItem(`email_verification_${personalData.email}`, code)
      alert(`Code de vérification : ${code}`)
    } finally {
      setSendingEmail(false)
    }
  }

  const verifyEmailCode = () => {
    const savedCode = localStorage.getItem(`email_verification_${personalData.email}`)
    if (emailCode === savedCode || emailCode === sentEmailCode) {
      setEmailVerified(true)
    } else {
      alert('Code incorrect.')
    }
  }

  // ========== FINALISER L'INSCRIPTION ==========
  const handleFinalSubmit = async () => {
    if (!emailVerified) return

    setIsLoading(true)

    const userData = {
      userType,
      phone,
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
    } catch (error) {
      console.error('Erreur envoi email:', error)
    }

    setIsLoading(false)
    router.push(userType === 'hote' ? '/dashboard/host' : '/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Déjà inscrit ?</span>
              <Link href="/auth/login" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Ligne de progression */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
              />
            </div>
            
            {/* Étape 1 */}
            <div className="relative flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              } ${phoneVerified ? 'bg-green-500' : ''}`}>
                {phoneVerified ? <CheckCircle className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
              </div>
              <span className={`mt-2 text-xs font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                Téléphone
              </span>
            </div>

            {/* Étape 2 */}
            <div className="relative flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              } ${currentStep > 2 ? 'bg-green-500' : ''}`}>
                {currentStep > 2 ? <CheckCircle className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <span className={`mt-2 text-xs font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                Profil
              </span>
            </div>

            {/* Étape 3 */}
            <div className="relative flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                currentStep >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              } ${emailVerified ? 'bg-green-500' : ''}`}>
                {emailVerified ? <CheckCircle className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
              </div>
              <span className={`mt-2 text-xs font-medium ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                Email
              </span>
            </div>
          </div>
        </div>

        {/* ÉTAPE 1 : TÉLÉPHONE */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenue sur Ikasso
              </h1>
              <p className="mt-2 text-gray-600">
                Commençons par vérifier votre numéro de téléphone
              </p>
            </div>

            {/* Choix du type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Je souhaite
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('client')}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    userType === 'client'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {userType === 'client' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="h-5 w-5 text-primary-500" />
                    </div>
                  )}
                  <div className="text-4xl mb-3">🏠</div>
                  <div className="font-semibold text-gray-900">Voyager</div>
                  <div className="text-sm text-gray-500 mt-1">Réserver des logements</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('hote')}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    userType === 'hote'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {userType === 'hote' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="h-5 w-5 text-primary-500" />
                    </div>
                  )}
                  <div className="text-4xl mb-3">🏡</div>
                  <div className="font-semibold text-gray-900">Héberger</div>
                  <div className="text-sm text-gray-500 mt-1">Proposer mon logement</div>
                </button>
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-lg">🇲🇱</span>
                  <span className="text-gray-500">+223</span>
                </div>
                <input
                  type="tel"
                  placeholder="XX XX XX XX"
                  className={`w-full pl-24 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-0 focus:border-primary-500 transition-all ${
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
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-green-500" />
                )}
              </div>
            </div>

            {/* Bouton envoi code */}
            {!phoneVerified && phone.length >= 8 && !sentPhoneCode && (
              <button
                onClick={sendPhoneVerification}
                disabled={sendingPhone}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold transition-all"
              >
                {sendingPhone ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </span>
                ) : (
                  'Recevoir le code par SMS'
                )}
              </button>
            )}

            {/* Saisie du code */}
            {!phoneVerified && sentPhoneCode && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    placeholder="• • • •"
                    className="w-full text-center text-3xl font-mono tracking-[1em] py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                    maxLength={4}
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <button
                  onClick={verifyPhoneCode}
                  disabled={phoneCode.length !== 4}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold transition-all"
                >
                  Vérifier
                </button>
                <button
                  onClick={sendPhoneVerification}
                  className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                >
                  Renvoyer le code
                </button>
              </div>
            )}

            {/* Bouton continuer */}
            {phoneVerified && (
              <button
                onClick={() => canGoToStep2 && setCurrentStep(2)}
                disabled={!canGoToStep2}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                Continuer
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* ÉTAPE 2 : INFORMATIONS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <button 
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Complétez votre profil
              </h1>
              <p className="mt-2 text-gray-600">
                Ces informations nous aident à sécuriser votre compte
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.firstName}
                  onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.lastName}
                  onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.dateOfBirth}
                  onChange={(e) => setPersonalData({...personalData, dateOfBirth: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rue, quartier..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.address}
                  onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  placeholder="Bamako"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.city}
                  onChange={(e) => setPersonalData({...personalData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                    value={personalData.country}
                    onChange={(e) => setPersonalData({...personalData, country: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.email}
                  onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                  value={personalData.password}
                  onChange={(e) => setPersonalData({...personalData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:border-primary-500 ${
                  personalData.confirmPassword && personalData.password !== personalData.confirmPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
                value={personalData.confirmPassword}
                onChange={(e) => setPersonalData({...personalData, confirmPassword: e.target.value})}
              />
              {personalData.confirmPassword && personalData.password !== personalData.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button
              onClick={() => canGoToStep3 && setCurrentStep(3)}
              disabled={!canGoToStep3}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Continuer
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ÉTAPE 3 : EMAIL */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <button 
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Vérifiez votre email
              </h1>
              <p className="mt-2 text-gray-600">
                Dernière étape avant de commencer !
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{personalData.email}</p>
                  <p className="text-sm text-gray-500">Un code sera envoyé à cette adresse</p>
                </div>
              </div>
            </div>

            {!emailVerified && !sentEmailCode && (
              <button
                onClick={sendEmailVerification}
                disabled={sendingEmail}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold transition-all"
              >
                {sendingEmail ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer le code de vérification'
                )}
              </button>
            )}

            {!emailVerified && sentEmailCode && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    placeholder="• • • • • •"
                    className="w-full text-center text-2xl font-mono tracking-[0.5em] py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500"
                    maxLength={6}
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <button
                  onClick={verifyEmailCode}
                  disabled={emailCode.length !== 6}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold transition-all"
                >
                  Vérifier
                </button>
                <button
                  onClick={sendEmailVerification}
                  className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                >
                  Renvoyer le code
                </button>
              </div>
            )}

            {emailVerified && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <p className="font-medium text-green-800">Email vérifié avec succès !</p>
                  </div>
                </div>

                <button
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      Création du compte...
                    </span>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          En vous inscrivant, vous acceptez nos{' '}
          <a href="#" className="underline">Conditions d'utilisation</a>
          {' '}et notre{' '}
          <a href="#" className="underline">Politique de confidentialité</a>
        </p>
      </div>
    </div>
  )
}
