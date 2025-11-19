'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import Logo from '../../components/Logo'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const email = searchParams.get('email')

    if (!code || !email) {
      setStatus('error')
      setMessage('Lien de vérification invalide')
      return
    }

    // Vérifier le code
    const verifyEmail = () => {
      const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
      const userIndex = allUsers.findIndex((u: any) => u.email === email)

      if (userIndex >= 0) {
        const user = allUsers[userIndex]
        
        // Vérifier si le code correspond (en production, vérifier avec la DB)
        const savedCode = localStorage.getItem(`verification_code_${email}`)
        
        if (savedCode === code) {
          // Marquer l'email comme vérifié
          allUsers[userIndex] = {
            ...user,
            emailVerified: true,
            verifiedAt: new Date().toISOString()
          }
          
          localStorage.setItem('ikasso_all_users', JSON.stringify(allUsers))
          localStorage.setItem('ikasso_user', JSON.stringify(allUsers[userIndex]))
          localStorage.removeItem(`verification_code_${email}`)
          
          setStatus('success')
          setMessage('Votre email a été vérifié avec succès !')
          
          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          setStatus('error')
          setMessage('Code de vérification invalide ou expiré')
        }
      } else {
        setStatus('error')
        setMessage('Utilisateur introuvable')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <Link href="/" className="flex justify-center mb-8">
          <Logo size="lg" />
        </Link>

        {status === 'loading' && (
          <div>
            <Loader className="h-16 w-16 text-primary-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Vérification en cours...
            </h1>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email vérifié !
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              Vous allez être redirigé vers votre dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erreur de vérification
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <Link 
              href="/auth/register" 
              className="btn-primary inline-block"
            >
              Retour à l'inscription
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

