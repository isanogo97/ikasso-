'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, User, Mail, Plus, Edit, Trash2, CheckCircle, XCircle, Link as LinkIcon, Copy } from 'lucide-react'
import Logo from '../../components/Logo'

interface AdminUser {
  id: string
  name: string
  email: string
  password?: string
  role: 'super_admin' | 'admin' | 'moderator' | 'support'
  permissions: {
    viewUsers: boolean
    editUsers: boolean
    deleteUsers: boolean
    viewBookings: boolean
    manageBookings: boolean
    viewProperties: boolean
    manageProperties: boolean
    viewFinances: boolean
    manageAdmins: boolean
  }
  createdAt: string
  lastLogin?: string
  status: 'active' | 'suspended'
  inviteToken?: string
  isActivated?: boolean
}

const defaultPermissions = {
  super_admin: {
    viewUsers: true,
    editUsers: true,
    deleteUsers: true,
    viewBookings: true,
    manageBookings: true,
    viewProperties: true,
    manageProperties: true,
    viewFinances: true,
    manageAdmins: true
  },
  admin: {
    viewUsers: true,
    editUsers: true,
    deleteUsers: false,
    viewBookings: true,
    manageBookings: true,
    viewProperties: true,
    manageProperties: true,
    viewFinances: true,
    manageAdmins: false
  },
  moderator: {
    viewUsers: true,
    editUsers: true,
    deleteUsers: false,
    viewBookings: true,
    manageBookings: false,
    viewProperties: true,
    manageProperties: false,
    viewFinances: false,
    manageAdmins: false
  },
  support: {
    viewUsers: true,
    editUsers: false,
    deleteUsers: false,
    viewBookings: true,
    manageBookings: false,
    viewProperties: true,
    manageProperties: false,
    viewFinances: false,
    manageAdmins: false
  }
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)

  useEffect(() => {
    // Récupérer l'admin connecté
    const loggedAdmin = localStorage.getItem('ikasso_logged_admin')
    if (loggedAdmin) {
      const admin = JSON.parse(loggedAdmin)
      setCurrentAdmin(admin)
    }

    // Charger les administrateurs
    const storedAdmins = JSON.parse(localStorage.getItem('ikasso_admins') || '[]')
    
    // Si aucun admin, créer le super admin par défaut
    if (storedAdmins.length === 0) {
      const superAdmin: AdminUser = {
        id: '1',
        name: 'Super Administrateur',
        email: 'admin@ikasso.ml',
        password: 'Admin@2024',
        role: 'super_admin',
        permissions: defaultPermissions.super_admin,
        createdAt: new Date().toISOString(),
        status: 'active',
        isActivated: true
      }
      storedAdmins.push(superAdmin)
      localStorage.setItem('ikasso_admins', JSON.stringify(storedAdmins))
    } else {
      // Vérifier et activer le super admin s'il existe mais n'est pas activé
      const superAdminIndex = storedAdmins.findIndex((a: AdminUser) => a.email === 'admin@ikasso.ml')
      if (superAdminIndex !== -1 && !storedAdmins[superAdminIndex].isActivated) {
        storedAdmins[superAdminIndex].isActivated = true
        storedAdmins[superAdminIndex].password = 'Admin@2024'
        localStorage.setItem('ikasso_admins', JSON.stringify(storedAdmins))
      }
    }
    
    setAdmins(storedAdmins)
  }, [])

  const handleSaveAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const role = formData.get('role') as AdminUser['role']
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    
    // Générer un token unique pour l'invitation
    const inviteToken = Date.now().toString() + Math.random().toString(36)
    
    const newAdmin: AdminUser = {
      id: editingAdmin?.id || Date.now().toString(),
      name,
      email,
      role,
      permissions: defaultPermissions[role],
      createdAt: editingAdmin?.createdAt || new Date().toISOString(),
      status: 'active',
      inviteToken: editingAdmin ? undefined : inviteToken,
      isActivated: editingAdmin ? true : false
    }

    let updatedAdmins
    if (editingAdmin) {
      updatedAdmins = admins.map(a => a.id === editingAdmin.id ? newAdmin : a)
    } else {
      updatedAdmins = [...admins, newAdmin]
    }

    setAdmins(updatedAdmins)
    localStorage.setItem('ikasso_admins', JSON.stringify(updatedAdmins))
    
    // Envoyer l'email d'invitation pour les nouveaux admins
    if (!editingAdmin) {
      try {
        const response = await fetch('/api/send-admin-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            token: inviteToken
          })
        })

        if (response.ok) {
          alert(`✅ Administrateur créé avec succès !\n\n📧 Un email d'invitation a été envoyé à ${email} avec un lien pour créer son mot de passe.`)
        } else {
          alert(`✅ Administrateur créé mais l'email n'a pas pu être envoyé.\n\nVeuillez partager manuellement le lien de création de mot de passe.`)
        }
      } catch (error) {
        console.error('Erreur envoi email:', error)
        alert(`✅ Administrateur créé mais l'email n'a pas pu être envoyé.\n\nVeuillez partager manuellement le lien de création de mot de passe.`)
      }
    } else {
      alert('✅ Administrateur modifié avec succès')
    }
    
    setShowModal(false)
    setEditingAdmin(null)
  }

  const handleDeleteAdmin = (adminId: string) => {
    if (adminId === '1') {
      alert('❌ Impossible de supprimer le super administrateur principal')
      return
    }

    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      return
    }

    const updatedAdmins = admins.filter(a => a.id !== adminId)
    setAdmins(updatedAdmins)
    localStorage.setItem('ikasso_admins', JSON.stringify(updatedAdmins))
    alert('✅ Administrateur supprimé')
  }

  const handleToggleStatus = (adminId: string) => {
    if (adminId === '1') {
      alert('❌ Impossible de suspendre le super administrateur principal')
      return
    }

    const updatedAdmins = admins.map(a => 
      a.id === adminId 
        ? { ...a, status: a.status === 'active' ? 'suspended' as const : 'active' as const }
        : a
    )
    setAdmins(updatedAdmins)
    localStorage.setItem('ikasso_admins', JSON.stringify(updatedAdmins))
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-purple-100 text-purple-800',
      moderator: 'bg-blue-100 text-blue-800',
      support: 'bg-green-100 text-green-800'
    }
    return styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getRoleText = (role: string) => {
    const texts = {
      super_admin: 'Super Admin',
      admin: 'Administrateur',
      moderator: 'Modérateur',
      support: 'Support'
    }
    return texts[role as keyof typeof texts] || role
  }

  const getPermissionText = (key: string) => {
    const texts: Record<string, string> = {
      viewUsers: 'Voir les utilisateurs',
      editUsers: 'Modifier les utilisateurs',
      deleteUsers: 'Supprimer les utilisateurs',
      viewBookings: 'Voir les réservations',
      manageBookings: 'Gérer les réservations',
      viewProperties: 'Voir les propriétés',
      manageProperties: 'Gérer les propriétés',
      viewFinances: 'Voir les finances',
      manageAdmins: 'Gérer les administrateurs'
    }
    return texts[key] || key
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Logo size="md" />
              </Link>
              <span className="text-lg font-semibold text-gray-900">Administration</span>
            </div>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des administrateurs</h1>
            <p className="text-gray-600 mt-2">
              {currentAdmin?.role === 'super_admin' 
                ? 'Gérez les comptes administrateurs et leurs permissions' 
                : 'Consultez votre compte administrateur'}
            </p>
          </div>
          {currentAdmin?.role === 'super_admin' && (
            <button
              onClick={() => {
                setEditingAdmin(null)
                setShowModal(true)
              }}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvel administrateur
            </button>
          )}
        </div>

        {/* Message pour les admins non super_admin */}
        {currentAdmin && currentAdmin.role !== 'super_admin' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Accès limité
                </h3>
                <p className="text-blue-800">
                  Vous pouvez uniquement consulter votre propre compte administrateur. 
                  Seuls les super administrateurs peuvent voir et gérer tous les comptes administrateurs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des administrateurs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {admins
            .filter(admin => {
              // Si super_admin, voir tous les admins
              if (currentAdmin?.role === 'super_admin') return true
              // Sinon, voir seulement son propre compte
              return admin.id === currentAdmin?.id
            })
            .map((admin) => (
            <div key={admin.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {currentAdmin?.role === 'super_admin' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingAdmin(admin)
                          setShowModal(true)
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {admin.id !== '1' && (
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                  {currentAdmin?.role !== 'super_admin' && admin.id === currentAdmin?.id && (
                    <span className="text-xs text-gray-500 italic px-2 py-1">
                      Consultation uniquement
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(admin.role)}`}>
                  {getRoleText(admin.role)}
                </span>
                <button
                  onClick={() => handleToggleStatus(admin.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    admin.status === 'active' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition-colors`}
                >
                  {admin.status === 'active' ? 'Actif' : 'Suspendu'}
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Permissions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(admin.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2 text-xs">
                      {value ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-300" />
                      )}
                      <span className={value ? 'text-gray-700' : 'text-gray-400'}>
                        {getPermissionText(key)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t mt-4 pt-4 text-xs text-gray-500">
                <p>Créé le {new Date(admin.createdAt).toLocaleDateString('fr-FR')}</p>
                {admin.lastLogin && (
                  <p>Dernière connexion: {new Date(admin.lastLogin).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Créer/Modifier Admin */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingAdmin ? 'Modifier l\'administrateur' : 'Nouvel administrateur'}
            </h2>
            <form onSubmit={handleSaveAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingAdmin?.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={editingAdmin?.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="jean@ikasso.ml"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  name="role"
                  required
                  defaultValue={editingAdmin?.role || 'support'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="super_admin">Super Administrateur (tous les droits)</option>
                  <option value="admin">Administrateur (gestion complète sauf admins)</option>
                  <option value="moderator">Modérateur (modération contenu)</option>
                  <option value="support">Support (consultation uniquement)</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Permissions selon le rôle sélectionné
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Les permissions sont automatiquement définies selon le rôle choisi
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingAdmin(null)
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingAdmin ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

