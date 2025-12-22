'use client'

import { useEffect } from 'react'
import { forceRestoreUserAvatar } from '../lib/avatarPersistence'

interface AvatarRestorerProps {
  user?: any
  setUser?: (user: any) => void
  onAvatarRestored?: () => void
}

/**
 * Composant qui force la restauration de l'avatar au chargement de la page
 * À utiliser dans toutes les pages où l'avatar doit être affiché
 */
export default function AvatarRestorer({ user, setUser, onAvatarRestored }: AvatarRestorerProps) {
  useEffect(() => {
    // Attendre un peu que la page soit chargée
    const timer = setTimeout(() => {
      if (user && setUser) {
        // Utiliser la nouvelle fonction qui met à jour l'état
        const updatedUser = forceRestoreUserAvatar(user, setUser)
        if (updatedUser.avatar !== user.avatar) {
          console.log('Avatar restauré et état mis à jour')
          onAvatarRestored?.()
        }
      } else {
        // Fallback pour l'ancienne méthode
        const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
        if (currentUser?.email) {
          const updatedUser = forceRestoreUserAvatar(currentUser)
          if (updatedUser.avatar !== currentUser.avatar) {
            console.log('Avatar restauré via fallback')
            onAvatarRestored?.()
            // Recharger seulement si nécessaire
            window.location.reload()
          }
        }
      }
    }, 100) // Réduire le délai

    return () => clearTimeout(timer)
  }, [user, setUser, onAvatarRestored])

  // Ce composant ne rend rien visuellement
  return null
}
