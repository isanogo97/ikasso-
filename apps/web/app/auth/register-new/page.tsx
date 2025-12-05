'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Phone, Mail, User, MapPin, Calendar, ArrowLeft, ArrowRight,
  CheckCircle, Loader, Home, Building 
} from 'lucide-react'
import Logo from '../../components/Logo'

type UserType = 'client' | 'hote' | null
type Step = 1 | 2

export default function RegisterNewPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [userType, setUserType] = useState<UserType>(null)
  
  // Informations personnelles (incluant téléphone)
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'Mali',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  // Validation email
  const [emailCode, setEmailCode] = useState('')
  const [sentEmailCode, setSentEmailCode] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)

  // ========== ÉTAPE 1 : INFORMATIONS PERSONNELLES ==========
  const canGoToStep2 = () => {
    return (
      userType !== null &&
      personalData.firstName.trim() !== '' &&
      personalData.lastName.trim() !== '' &&
      personalData.phone.trim() !== '' &&
      personalData.phone.length >= 8 &&
      personalData.dateOfBirth !== '' &&
      personalData.address.trim() !== '' &&
      personalData.postalCode.trim() !== '' &&
      personalData.city.trim() !== '' &&
      personalData.country.trim() !== '' &&
      personalData.email.trim() !== '' &&
      personalData.email.includes('@') &&
      personalData.password.length >= 8 &&
      personalData.password === personalData.confirmPassword
    )
  }

  // ========== ÉTAPE 2 : VALIDATION EMAIL ==========
  const sendEmailVerification = async () => {
    if (!personalData.email) {
      alert('❌ Veuillez entrer votre adresse email')
      return
    }

    // Vérifier si l'email existe déjà
    const existingUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
    const emailExists = existingUsers.some((user: any) => user.email === personalData.email)
    
    if (emailExists) {
      alert('❌ Un compte existe déjà avec cet email.\n\nVeuillez vous connecter ou utiliser un autre email.')
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
        alert(`✅ Email envoyé à ${personalData.email}\n\nVérifiez votre boîte de réception et entrez le code à 6 chiffres.`)
      } else {
        alert(`❌ Erreur lors de l'envoi: ${data.message}\n\nCode temporaire (démo): ${code}`)
        setSentEmailCode(code)
        localStorage.setItem(`email_verification_${personalData.email}`, code)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert(`⚠️ Impossible d'envoyer l'email.\n\nCode temporaire (démo): ${code}`)
      setSentEmailCode(code)
      localStorage.setItem(`email_verification_${personalData.email}`, code)
    } finally {
      setSendingEmail(false)
    }
  }

  const verifyEmailCode = () => {
    const savedCode = localStorage.getItem(`email_verification_${personalData.email}`)
    if (emailCode === savedCode || emailCode === sentEmailCode) {
      setEmailVerified(true)
      alert('✅ Email vérifié avec succès !')
    } else {
      alert('❌ Code incorrect. Veuillez réessayer.')
    }
  }

  // ========== FINALISER L'INSCRIPTION ==========
  const handleFinalSubmit = async () => {
    if (!emailVerified) {
      alert('❌ Veuillez vérifier votre email avant de continuer')
      return
    }

    setIsLoading(true)

    const userData = {
      userType: userType,
      phone: personalData.phone,
      firstName: personalData.firstName,
      lastName: personalData.lastName,
      dateOfBirth: personalData.dateOfBirth,
      address: personalData.address,
      postalCode: personalData.postalCode,
      city: personalData.city,
      country: personalData.country,
      email: personalData.email,
      password: personalData.password,
      emailVerified: true,
      memberSince: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      avatar: null,
      totalBookings: 0,
      totalSpent: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    // Sauvegarder l'utilisateur
    localStorage.setItem('ikasso_user', JSON.stringify(userData))
    
    const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
    allUsers.push(userData)
    localStorage.setItem('ikasso_all_users', JSON.stringify(allUsers))

    // Envoyer l'email de bienvenue
    try {
      await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: personalData.email,
          name: `${personalData.firstName} ${personalData.lastName}`,
          userType: userType
        })
      })
      console.log('✅ Email de bienvenue envoyé')
    } catch (error) {
      console.error('⚠️ Erreur envoi email de bienvenue:', error)
    }

    setIsLoading(false)
    
    // Redirection selon le type
    if (userType === 'hote') {
      alert('✅ Inscription réussie !\n\nVous pouvez maintenant créer vos annonces.\n\nUn email de bienvenue vous a été envoyé.')
      router.push('/dashboard/host')
    } else {
      alert('✅ Inscription réussie !\n\nBienvenue sur Ikasso !\n\nUn email de bienvenue vous a été envoyé.')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Logo size="lg" />
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Créer votre compte
          </h1>
          <p className="mt-2 text-gray-600">
            Rejoignez Ikasso en quelques étapes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 1 ? <CheckCircle className="h-6 w-6" /> : '1'}
              </div>
              <span className="ml-2 font-medium hidden sm:block">Informations</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                {emailVerified ? <CheckCircle className="h-6 w-6" /> : '2'}
              </div>
              <span className="ml-2 font-medium hidden sm:block">Vérification email</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          {/* ÉTAPE 1 : INFORMATIONS PERSONNELLES */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Vos informations
                </h2>
                <p className="text-gray-600">
                  Remplissez tous les champs pour continuer
                </p>
              </div>

              {/* Choix du type de compte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Je souhaite <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType('client')}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      userType === 'client'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <Home className={`h-8 w-8 mx-auto mb-2 ${userType === 'client' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <div className="font-medium text-gray-900">Client</div>
                    <div className="text-xs text-gray-500 mt-1">Réserver des hébergements</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('hote')}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      userType === 'hote'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <Building className={`h-8 w-8 mx-auto mb-2 ${userType === 'hote' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <div className="font-medium text-gray-900">Hôte</div>
                    <div className="text-xs text-gray-500 mt-1">Proposer des logements</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={personalData.firstName}
                    onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={personalData.lastName}
                    onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})}
                  />
                </div>
              </div>

              {/* Numéro de téléphone (sans validation) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="+223 XX XX XX XX"
                    className="input-field pl-10"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Nous vous contacterons uniquement si nécessaire</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={personalData.dateOfBirth}
                  onChange={(e) => setPersonalData({...personalData, dateOfBirth: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Rue, quartier..."
                  value={personalData.address}
                  onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={personalData.postalCode}
                    onChange={(e) => setPersonalData({...personalData, postalCode: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Bamako"
                    value={personalData.city}
                    onChange={(e) => setPersonalData({...personalData, city: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={personalData.country}
                  onChange={(e) => setPersonalData({...personalData, country: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="input-field pl-10"
                    value={personalData.email}
                    onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 caractères"
                  className="input-field"
                  value={personalData.password}
                  onChange={(e) => setPersonalData({...personalData, password: e.target.value})}
                  minLength={8}
                />
                <p className="mt-1 text-xs text-gray-500">Au moins 8 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  className="input-field"
                  value={personalData.confirmPassword}
                  onChange={(e) => setPersonalData({...personalData, confirmPassword: e.target.value})}
                  minLength={8}
                />
                {personalData.password && personalData.confirmPassword && personalData.password !== personalData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">⚠️ Les mots de passe ne correspondent pas</p>
                )}
              </div>

              <button
                onClick={() => {
                  if (canGoToStep2()) {
                    setCurrentStep(2)
                  } else {
                    alert('❌ Veuillez remplir tous les champs obligatoires')
                  }
                }}
                disabled={!canGoToStep2()}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                Continuer
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}

          {/* ÉTAPE 2 : VALIDATION EMAIL */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Vérifiez votre email
                </h2>
                <p className="text-gray-600">
                  Dernière étape : confirmez votre adresse email
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900 font-medium">{personalData.email}</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Un code de vérification sera envoyé à cette adresse
                    </p>
                  </div>
                </div>
              </div>

              {!emailVerified && !sentEmailCode && (
                <button
                  onClick={sendEmailVerification}
                  disabled={sendingEmail}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <span className="flex items-center justify-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Envoi en cours...
                    </span>
                  ) : (
                    '📧 Envoyer le code de vérification'
                  )}
                </button>
              )}

              {!emailVerified && sentEmailCode && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code de vérification
                    </label>
                    <input
                      type="text"
                      placeholder="Entrez le code à 6 chiffres"
                      className="input-field text-center text-2xl font-mono tracking-widest"
                      maxLength={6}
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <button
                    onClick={verifyEmailCode}
                    className="w-full btn-primary py-3"
                  >
                    Vérifier le code
                  </button>
                  <button
                    onClick={sendEmailVerification}
                    disabled={sendingEmail}
                    className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Renvoyer le code
                  </button>
                </div>
              )}

              {emailVerified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <p className="text-sm text-green-900 font-medium">
                      Email vérifié avec succès !
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Retour
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={!emailVerified || isLoading}
                  className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Finalisation...
                    </span>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
