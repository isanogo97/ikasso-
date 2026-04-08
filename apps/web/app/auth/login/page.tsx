'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock, Loader, ArrowLeft, MapPin, Shield, Star } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const { t } = useLanguage()
  const { signIn, signInWithOAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError)
      setIsLoading(false)
      return
    }

    const userData = localStorage.getItem('ikasso_user')
    if (userData) {
      const user = JSON.parse(userData)
      if (user?.userType === 'hote' || user?.userType === 'host') {
        window.location.href = '/dashboard/host'
      } else {
        window.location.href = '/dashboard'
      }
    } else {
      window.location.href = '/dashboard'
    }
  }

  const handleOAuth = async (provider: 'google' | 'apple') => {
    const { error } = await signInWithOAuth(provider)
    if (error) alert(error)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE — Hero / Branding (Desktop) */}
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
              Chez toi,<br />au Mali.
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              Decouvrez des hebergements uniques a travers tout le Mali.
              De Bamako a Tombouctou, trouvez votre chez-vous.
            </p>

            {/* Stats */}
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-white/60 mt-1">Logements</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">8</div>
                <div className="text-sm text-white/60 mt-1">Villes</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">4.8</div>
                <div className="text-sm text-white/60 mt-1 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  Note
                </div>
              </div>
            </div>
          </div>

          {/* Bottom trust badges */}
          <div className="flex items-center gap-6 text-white/50 text-xs">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Paiements securises</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> 100% Mali</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — Form */}
      <div className="flex-1 flex flex-col bg-white lg:bg-gray-50/50">
        {/* Mobile Header */}
        <header className="lg:hidden bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center h-14 px-4">
            <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="flex-1 text-center font-semibold pr-7">{t('login.login')}</span>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-end px-10 pt-8">
          <span className="text-sm text-gray-500">{t('login.no_account')}</span>
          <Link href="/auth/register-new" className="ml-3 text-sm font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors">
            {t('nav.signup')}
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:py-0">
          <div className="w-full max-w-[400px]">
            {/* Mobile Logo — Grand et centre */}
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
            <div className="hidden lg:flex flex-col items-center mb-10">
              <img
                src="/images/logos/ikasso-logo-800.png"
                alt="Ikasso"
                className="h-16 object-contain mb-3"
              />
              <p className="text-sm text-gray-500">Entrez, vous etes chez vous</p>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-[28px] font-bold text-gray-900">
                {t('login.welcome_back')}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {t('login.connect_to_account')}
              </p>
            </div>

            {/* Social login first (more prominent) */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all bg-white shadow-sm"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c-.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-gray-700 text-sm">{t('login.continue_google')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('apple')}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all bg-white shadow-sm"
              >
                <svg className="h-5 w-5" fill="#000000" viewBox="0 0 24 24">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                </svg>
                <span className="font-medium text-gray-700 text-sm">{t('login.continue_apple')}</span>
              </button>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('login.or')}</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('login.email_address')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="vous@exemple.com"
                    className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('login.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">{t('login.remember_me')}</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  {t('login.forgot_password')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-300 text-white py-3.5 rounded-xl font-semibold transition-all text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    {t('general.loading')}
                  </span>
                ) : (
                  t('login.login')
                )}
              </button>
            </form>

            {/* Footer mobile */}
            <div className="mt-8 lg:hidden text-center">
              <span className="text-sm text-gray-500">{t('login.no_account')} </span>
              <Link href="/auth/register-new" className="text-sm font-bold text-primary-600">
                {t('nav.signup')}
              </Link>
            </div>

            <p className="mt-6 text-center text-[11px] text-gray-400 leading-relaxed">
              {t('register.terms_accept')}{' '}
              <a href="/terms" className="underline hover:text-gray-600">{t('register.terms')}</a>
              {' '}{t('register.and')}{' '}
              <a href="/privacy" className="underline hover:text-gray-600">{t('register.privacy')}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
