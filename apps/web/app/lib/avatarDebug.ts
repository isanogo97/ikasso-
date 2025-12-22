/**
 * Utilitaires de debug pour la persistance des avatars
 */

export const debugAvatarState = () => {
  console.log('=== DEBUG AVATAR STATE ===')
  
  // Utilisateur actuel
  const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
  console.log('Utilisateur actuel:', {
    email: currentUser.email,
    hasAvatar: !!currentUser.avatar,
    avatarLength: currentUser.avatar?.length || 0,
    avatarPreview: currentUser.avatar?.substring(0, 50) + '...'
  })
  
  // Avatars sauvegardés
  const savedAvatars = JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
  console.log('Avatars sauvegardés:', Object.keys(savedAvatars).map(email => ({
    email,
    hasAvatar: !!savedAvatars[email]?.avatar,
    lastUpdated: savedAvatars[email]?.lastUpdated,
    avatarLength: savedAvatars[email]?.avatar?.length || 0
  })))
  
  // Vérifier la correspondance
  if (currentUser.email && savedAvatars[currentUser.email]) {
    const saved = savedAvatars[currentUser.email].avatar
    const current = currentUser.avatar
    console.log('Correspondance:', {
      emailMatch: true,
      avatarMatch: saved === current,
      savedLength: saved?.length || 0,
      currentLength: current?.length || 0
    })
  }
  
  console.log('=== FIN DEBUG ===')
}

export const forceAvatarSync = () => {
  console.log('=== FORCE AVATAR SYNC ===')
  
  try {
    const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    if (!currentUser.email) {
      console.log('Aucun utilisateur connecté')
      return false
    }
    
    const savedAvatars = JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
    const savedAvatar = savedAvatars[currentUser.email]?.avatar
    
    if (savedAvatar) {
      console.log('Avatar trouvé, synchronisation...')
      currentUser.avatar = savedAvatar
      localStorage.setItem('ikasso_user', JSON.stringify(currentUser))
      
      // Mettre à jour aussi dans la liste globale
      const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
      const updatedUsers = allUsers.map((u: any) => 
        u.email === currentUser.email ? { ...u, avatar: savedAvatar } : u
      )
      localStorage.setItem('ikasso_all_users', JSON.stringify(updatedUsers))
      
      console.log('Synchronisation réussie')
      return true
    } else {
      console.log('Aucun avatar sauvegardé trouvé')
      return false
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error)
    return false
  }
}

export const clearAllAvatarData = () => {
  console.log('=== CLEAR ALL AVATAR DATA ===')
  localStorage.removeItem('ikasso_saved_avatars')
  
  const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
  if (currentUser.avatar) {
    delete currentUser.avatar
    localStorage.setItem('ikasso_user', JSON.stringify(currentUser))
  }
  
  console.log('Toutes les données d\'avatar supprimées')
}

// Ajouter les fonctions au window pour debug depuis la console
if (typeof window !== 'undefined') {
  (window as any).debugAvatar = debugAvatarState;
  (window as any).forceAvatarSync = forceAvatarSync;
  (window as any).clearAllAvatarData = clearAllAvatarData;
}
