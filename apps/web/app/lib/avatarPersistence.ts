/**
 * Utilitaires pour la persistance des avatars utilisateur
 * Permet de conserver les photos de profil même après déconnexion/reconnexion
 */

export interface UserAvatarData {
  email: string
  avatar: string
  lastUpdated: string
}

/**
 * Sauvegarder l'avatar d'un utilisateur
 */
export const saveUserAvatar = (email: string, avatarUrl: string): void => {
  try {
    if (!email || !avatarUrl) return

    const savedAvatars = JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
    savedAvatars[email] = {
      avatar: avatarUrl,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem('ikasso_saved_avatars', JSON.stringify(savedAvatars))

    // Mettre à jour aussi l'utilisateur actuel s'il correspond
    const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    if (currentUser.email === email) {
      currentUser.avatar = avatarUrl
      localStorage.setItem('ikasso_user', JSON.stringify(currentUser))
    }

    // Mettre à jour dans la liste globale des utilisateurs
    const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
    const updatedUsers = allUsers.map((u: any) => 
      u.email === email ? { ...u, avatar: avatarUrl } : u
    )
    localStorage.setItem('ikasso_all_users', JSON.stringify(updatedUsers))

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'avatar:', error)
  }
}

/**
 * Récupérer l'avatar sauvegardé d'un utilisateur
 */
export const getUserAvatar = (email: string): string | null => {
  try {
    if (!email) return null

    const savedAvatars = JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
    const avatarData = savedAvatars[email]
    
    return avatarData?.avatar || null
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'avatar:', error)
    return null
  }
}

/**
 * Restaurer l'avatar d'un utilisateur lors de la connexion
 */
export const restoreUserAvatar = (user: any): any => {
  try {
    if (!user?.email) return user

    const savedAvatar = getUserAvatar(user.email)
    if (savedAvatar) {
      // Toujours restaurer l'avatar sauvegardé s'il existe
      user.avatar = savedAvatar
      console.log(`Avatar restauré pour ${user.email}`)
    }

    return user
  } catch (error) {
    console.error('Erreur lors de la restauration de l\'avatar:', error)
    return user
  }
}

/**
 * Forcer la restauration de l'avatar pour l'utilisateur actuel
 */
export const forceRestoreCurrentUserAvatar = (): boolean => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    if (!currentUser?.email) return false

    const savedAvatar = getUserAvatar(currentUser.email)
    if (savedAvatar) {
      // TOUJOURS restaurer l'avatar sauvegardé, même s'il semble identique
      currentUser.avatar = savedAvatar
      localStorage.setItem('ikasso_user', JSON.stringify(currentUser))
      console.log(`Avatar forcé pour ${currentUser.email}: ${savedAvatar.substring(0, 50)}...`)
      return true
    }

    return false
  } catch (error) {
    console.error('Erreur lors de la restauration forcée:', error)
    return false
  }
}

/**
 * Fonction pour forcer la mise à jour de l'état utilisateur avec l'avatar
 */
export const forceRestoreUserAvatar = (user: any, setUser?: (user: any) => void): any => {
  try {
    if (!user?.email) return user

    const savedAvatar = getUserAvatar(user.email)
    if (savedAvatar) {
      const updatedUser = { ...user, avatar: savedAvatar }
      
      // Mettre à jour localStorage
      localStorage.setItem('ikasso_user', JSON.stringify(updatedUser))
      
      // Mettre à jour l'état si la fonction est fournie
      if (setUser) {
        setUser(updatedUser)
      }
      
      console.log(`Avatar restauré et état mis à jour pour ${user.email}`)
      return updatedUser
    }

    return user
  } catch (error) {
    console.error('Erreur lors de la restauration avec état:', error)
    return user
  }
}

/**
 * Nettoyer les avatars anciens (plus de 30 jours)
 */
export const cleanupOldAvatars = (): void => {
  try {
    const savedAvatars = JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const cleanedAvatars: {[key: string]: any} = {}
    
    Object.keys(savedAvatars).forEach(email => {
      const avatarData = savedAvatars[email]
      const lastUpdated = new Date(avatarData.lastUpdated || '2020-01-01')
      
      // Garder les avatars récents
      if (lastUpdated > thirtyDaysAgo) {
        cleanedAvatars[email] = avatarData
      }
    })

    localStorage.setItem('ikasso_saved_avatars', JSON.stringify(cleanedAvatars))
  } catch (error) {
    console.error('Erreur lors du nettoyage des avatars:', error)
  }
}

/**
 * Obtenir la liste de tous les avatars sauvegardés
 */
export const getAllSavedAvatars = (): {[key: string]: UserAvatarData} => {
  try {
    return JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
  } catch (error) {
    console.error('Erreur lors de la récupération des avatars:', error)
    return {}
  }
}

/**
 * Supprimer l'avatar d'un utilisateur
 */
export const removeUserAvatar = (email: string): void => {
  try {
    if (!email) return

    const savedAvatars = JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
    delete savedAvatars[email]
    localStorage.setItem('ikasso_saved_avatars', JSON.stringify(savedAvatars))

    // Supprimer aussi de l'utilisateur actuel
    const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    if (currentUser.email === email) {
      delete currentUser.avatar
      localStorage.setItem('ikasso_user', JSON.stringify(currentUser))
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avatar:', error)
  }
}
