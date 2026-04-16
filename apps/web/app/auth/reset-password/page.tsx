'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, ArrowLeft, CheckCircle, Loader, Eye, EyeOff } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '../../lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()

    // Supabase sends user here with hash fragment or code
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session) setSessionReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(true)
      }
    })

    const timer = setTimeout(() => {
      setSessionReady(prev => {
        if (!prev) setError('Lien invalide ou expire. Veuillez refaire une demande.')
        return prev
      })
    }, 8000)

    return () => { subscription.unsubscribe(); clearTimeout(timer) }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caracteres'); return }
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) setError(err.message)
      else setSuccess(true)
    } catch { setError('Erreur lors de la mise a jour') }
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe modifie</h1>
          <p className="text-gray-500 text-sm mb-8">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
          <Link href="/auth/login" className="block w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold text-center">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center">
          <Link href="/auth/login" className="p-2 -ml-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="h-5 w-5 text-gray-600" /></Link>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full">
          <div className="flex justify-center mb-6">
            <img src="/images/logos/ikasso-logo-800.png" alt="Ikasso" className="h-12 object-contain" />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
            <p className="mt-2 text-sm text-gray-500">Choisissez un nouveau mot de passe pour votre compte.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} required placeholder="8 caracteres minimum" className="w-full pl-11 pr-12 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white shadow-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                <input type="password" required placeholder="Confirmez" className={`w-full pl-11 pr-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-primary-500/20 bg-white shadow-sm ${confirmPassword && password !== confirmPassword ? 'border-red-300' : 'border-gray-200'}`} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={isLoading || !sessionReady} className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary-500/25">
              {isLoading ? <span className="flex items-center justify-center gap-2"><Loader className="h-4 w-4 animate-spin" />Modification...</span> : !sessionReady ? 'Verification du lien...' : 'Modifier le mot de passe'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Renvoyer un lien</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
