'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, User, Mail, MapPin, Calendar, ArrowRight, ArrowLeft, CheckCircle, Loader } from 'lucide-react'
import Logo from '../../components/Logo'

type UserType = 'traveler' | 'host'
type Step = 1 | 2 | 3

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [userType, setUserType] = useState<UserType>('traveler')
  const [isLoading, setIsLoading] = useState(false)

  // Étape 1: Téléphone
  const [phone, setPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [sentPhoneCode, setSentPhoneCode] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false)

  // Étape 2: Informations personnelles
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'Mali',
    email: ''
  })

  // Étape 3: Validation email
  const [emailCode, setEmailCode] = useState('')
  const [sentEmailCode, setSentEmailCode] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [sendingEmailCode, setSendingEmailCode] = useState(false)

  // ÉTAPE 1: Envoyer code SMS/appel
  const sendPhoneVerification = () => {
    if (!phone || phone.length < 8) {
      alert('❌ Veuillez entrer un numéro de téléphone valide')
      return
    }

    setSendingPhoneCode(true)
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    
    setTimeout(() => {
      setSentPhoneCode(code)
      localStorage.setItem(`phone_verification_${phone}`, code)
      alert(`📱 CODE DE VÉRIFICATION\n\nVotre code: ${code}\n\n(En production, ce code sera envoyé par SMS ou appel vocal)`)
      setSendingPhoneCode(false)
    }, 1500)
  }

  // ÉTAPE 1: Vérifier le code téléphone
  const verifyPhoneCode = () => {
    const savedCode = localStorage.getItem(`phone_verification_${phone}`)
    if (phoneCode === savedCode || phoneCode === sentPhoneCode) {
      setPhoneVerified(true)
      alert('✅ Numéro de téléphone vérifié !')
      // Passer automatiquement à l'étape 2
      setTimeout(() => setCurrentStep(2), 1000)
    } else {
      alert('❌ Code incorrect. Veuillez réessayer.')
    }
  }

  // ÉTAPE 3: Envoyer code email
  const sendEmailVerification = () => {
    if (!formData.email) {
      alert('❌ Veuillez entrer votre adresse email')
      return
    }

    setSendingEmailCode(true)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    setTimeout(() => {
      setSentEmailCode(code)
      localStorage.setItem(`email_verification_${formData.email}`, code)
      alert(`📧 CODE DE VÉRIFICATION EMAIL\n\nVotre code: ${code}\n\n(En production, ce code sera envoyé par email)`)
      setSendingEmailCode(false)
    }, 1500)
  }

  // ÉTAPE 3: Vérifier le code email
  const verifyEmailCode = () => {
    const savedCode = localStorage.getItem(`email_verification_${formData.email}`)
    if (emailCode === savedCode || emailCode === sentEmailCode) {
      setEmailVerified(true)
      alert('✅ Email vérifié avec succès !')
      // Finaliser l'inscription
      finalizeRegistration()
    } else {
      alert('❌ Code incorrect. Veuillez réessayer.')
    }
  }

  // Finaliser l'inscription
  const finalizeRegistration = () => {
    setIsLoading(true)

    const userData = {
      phone: phone,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address,
      postalCode: formData.postalCode,
      city: formData.city,
      country: formData.country,
      email: formData.email,
      userType: userType,
      phoneVerified: true,
      emailVerified: true,
      avatar: null,
      memberSince: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      totalBookings: 0,
      totalSpent: 0,
      status: userType === 'host' ? 'pending' : 'approved',
      createdAt: new Date().toISOString()
    }

    // Sauvegarder l'utilisateur
    localStorage.setItem('ikasso_user', JSON.stringify(userData))
    
    const existingUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
    const updatedUsers = [...existingUsers, userData]
    localStorage.setItem('ikasso_all_users', JSON.stringify(updatedUsers))

    setTimeout(() => {
      setIsLoading(false)
      
      if (userType === 'host') {
        alert('🎉 Inscription réussie !\n\nVotre compte hôte est en cours de validation.\nVous pourrez ajouter vos annonces une fois votre compte approuvé.')
        router.push('/')
      } else {
        alert('🎉 Bienvenue sur Ikasso !\n\nVotre compte est activé.')
        router.push('/dashboard')
      }
    }, 1500)
  }

  // Passer à l'étape suivante (avec validation)
  const goToStep2 = () => {
    if (!phoneVerified) {
      alert('❌ Veuillez d\'abord vérifier votre numéro de téléphone')
      return
    }
    setCurrentStep(2)
  }

  const goToStep3 = () => {
    // Valider que tous les champs sont remplis
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || 
        !formData.address || !formData.postalCode || !formData.city || !formData.email) {
      alert('❌ Veuillez remplir tous les champs obligatoires')
      return
    }
    
    // Envoyer automatiquement le code email
    setCurrentStep(3)
    setTimeout(() => sendEmailVerification(), 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Logo size="lg" />
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Créer votre compte
          </h1>
          <p className="mt-2 text-gray-600">
            Rejoignez la communauté Ikasso
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep === step 
                      ? 'bg-primary-600 text-white ring-4 ring-primary-200' 
                      : currentStep > step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {currentStep > step ? <CheckCircle className="h-6 w-6" /> : step}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    currentStep >= step ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {step === 1 ? 'Téléphone' : step === 2 ? 'Informations' : 'Email'}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Choix du type d'utilisateur */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Je m'inscris en tant que :
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUserType('traveler')}
              className={`p-4 border-2 rounded-lg transition-all ${
                userType === 'traveler'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="h-6 w-6 mx-auto mb-2" />
              <span className="font-medium">Voyageur</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('host')}
              className={`p-4 border-2 rounded-lg transition-all ${
                userType === 'host'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPin className="h-6 w-6 mx-auto mb-2" />
              <span className="font-medium">Hôte</span>
            </button>
          </div>
        </div>

        {/* Formulaire selon l'étape */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* ÉTAPE 1: Vérification téléphone */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Vérification du numéro de téléphone
                </h2>
                <p className="text-sm text-gray-600">
                  Nous allons vous envoyer un code par SMS ou appel pour vérifier votre numéro.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="+223 XX XX XX XX"
                    className={`input-field pl-10 ${phoneVerified ? 'border-green-500 bg-green-50' : ''}`}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setPhoneVerified(false)
                    }}
                    disabled={phoneVerified}
                  />
                  {phoneVerified && (
                    <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>

              {!phoneVerified && (
                <button
                  type="button"
                  onClick={sendPhoneVerification}
                  disabled={sendingPhoneCode || !phone}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {sendingPhoneCode ? (
                    <span className="flex items-center justify-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Envoi en cours...
                    </span>
                  ) : (
                    '📱 Recevoir le code de vérification'
                  )}
                </button>
              )}

              {sentPhoneCode && !phoneVerified && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entrez le code reçu
                    </label>
                    <input
                      type="text"
                      placeholder="Code à 4 chiffres"
                      className="input-field text-center text-2xl font-mono tracking-widest"
                      maxLength={4}
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={verifyPhoneCode}
                    className="w-full btn-primary py-3"
                  >
                    Vérifier le code
                  </button>
                  <button
                    type="button"
                    onClick={sendPhoneVerification}
                    className="w-full text-sm text-primary-600 hover:text-primary-700"
                  >
                    Renvoyer le code
                  </button>
                </div>
              )}

              {phoneVerified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">
                      Numéro de téléphone vérifié avec succès !
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 2: Informations personnelles */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Informations personnelles
                </h2>
                <p className="text-sm text-gray-600">
                  Remplissez vos informations pour créer votre compte.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Prénom"
                    className="input-field"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nom"
                    className="input-field"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    className="input-field pl-10"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Adresse complète"
                  className="input-field"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Code postal"
                    className="input-field"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ville"
                    className="input-field"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input-field"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  >
                    <option value="Mali">Mali</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
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
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 inline mr-2" />
                  Retour
                </button>
                <button
                  type="button"
                  onClick={goToStep3}
                  className="flex-1 btn-primary py-3"
                >
                  Continuer
                  <ArrowRight className="h-5 w-5 inline ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3: Vérification email */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Vérification de l'email
                </h2>
                <p className="text-sm text-gray-600">
                  Un code de vérification a été envoyé à <strong>{formData.email}</strong>
                </p>
              </div>

              {!sentEmailCode && (
                <button
                  type="button"
                  onClick={sendEmailVerification}
                  disabled={sendingEmailCode}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {sendingEmailCode ? (
                    <span className="flex items-center justify-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Envoi en cours...
                    </span>
                  ) : (
                    '📧 Envoyer le code de vérification'
                  )}
                </button>
              )}

              {sentEmailCode && !emailVerified && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entrez le code reçu par email
                    </label>
                    <input
                      type="text"
                      placeholder="Code à 6 chiffres"
                      className="input-field text-center text-2xl font-mono tracking-widest"
                      maxLength={6}
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={verifyEmailCode}
                    disabled={isLoading}
                    className="w-full btn-primary py-3 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader className="animate-spin h-5 w-5 mr-2" />
                        Finalisation...
                      </span>
                    ) : (
                      'Vérifier et créer mon compte'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={sendEmailVerification}
                    className="w-full text-sm text-primary-600 hover:text-primary-700"
                  >
                    Renvoyer le code
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 inline mr-2" />
                Modifier mes informations
              </button>
            </div>
          )}
        </div>

        {/* Lien vers connexion */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
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
