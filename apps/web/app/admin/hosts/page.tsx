'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, Eye, User, Building, Phone, Mail, MapPin, Calendar, ArrowLeft } from 'lucide-react'
import LogoFinal from '../components/LogoFinal'

interface PendingHost {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  postalCode: string
  city: string
  country: string
  hostType: 'particulier' | 'professionnel'
  locationDescription: string
  companyName?: string
  siret?: string
  tva?: string
  businessAddress?: string
  businessPhone?: string
  dateOfBirth: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function AdminHostsPage() {
  const [pendingHosts, setPendingHosts] = useState<PendingHost[]>([])
  const [selectedHost, setSelectedHost] = useState<PendingHost | null>(null)

  useEffect(() => {
    // Récupérer les hôtes en attente depuis localStorage
    const loadPendingHosts = () => {
      if (typeof window !== 'undefined') {
        try {
          const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
          const hosts = allUsers.filter((user: any) => 
            user.userType === 'host' && 
            (user.status === 'pending' || !user.status)
          )
          setPendingHosts(hosts)
        } catch (error) {
          console.error('Erreur lors du chargement des hôtes:', error)
          setPendingHosts([])
        }
      }
    }
    
    loadPendingHosts()
  }, [])

  const handleApprove = (hostId: string) => {
    if (typeof window !== 'undefined') {
      // Mettre à jour le statut dans ikasso_all_users
      const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
      const updatedUsers = allUsers.map((user: any) => 
        user.email === hostId ? { ...user, status: 'approved', approvedAt: new Date().toISOString() } : user
      )
      localStorage.setItem('ikasso_all_users', JSON.stringify(updatedUsers))
      
      // Mettre à jour l'état local
      setPendingHosts(prev => prev.filter(host => host.email !== hostId))
      setSelectedHost(null)
      
      alert('Hôte approuvé avec succès !')
    }
  }

  const handleReject = (hostId: string, reason: string) => {
    if (typeof window !== 'undefined') {
      // Mettre à jour le statut dans ikasso_all_users
      const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
      const updatedUsers = allUsers.map((user: any) => 
        user.email === hostId ? { 
          ...user, 
          status: 'rejected', 
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason 
        } : user
      )
      localStorage.setItem('ikasso_all_users', JSON.stringify(updatedUsers))
      
      // Mettre à jour l'état local
      setPendingHosts(prev => prev.filter(host => host.email !== hostId))
      setSelectedHost(null)
      
      alert('Hôte rejeté.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-800" />
              </Link>
              <LogoFinal size="md" />
              <span className="ml-4 text-sm text-gray-500">Administration</span>
            </div>
            <div className="text-sm text-gray-600">
              {pendingHosts.length} hôte(s) en attente
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Validation des hôtes</h1>
          <p className="text-gray-600 mt-2">Examinez et validez les demandes d'inscription des hôtes</p>
        </div>

        {pendingHosts.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune demande en attente</h3>
            <p className="text-gray-600">Toutes les demandes d'hôtes ont été traitées.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Liste des hôtes en attente */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Demandes en attente</h2>
              {pendingHosts.map((host) => (
                <div
                  key={host.email}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer border-2 transition-colors ${
                    selectedHost?.email === host.email 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-transparent hover:border-gray-200'
                  }`}
                  onClick={() => setSelectedHost(host)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {host.hostType === 'professionnel' ? (
                          <Building className="h-5 w-5 text-blue-600 mr-2" />
                        ) : (
                          <User className="h-5 w-5 text-green-600 mr-2" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {host.firstName} {host.lastName}
                        </h3>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {host.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {host.phone}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {host.city}, {host.country}
                        </div>
                        {host.hostType === 'professionnel' && host.companyName && (
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            {host.companyName}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        host.hostType === 'professionnel' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {host.hostType === 'professionnel' ? 'Professionnel' : 'Particulier'}
                      </span>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(host.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Détails de l'hôte sélectionné */}
            {selectedHost && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Détails de la demande</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(selectedHost.email)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Raison du rejet (optionnel):') || 'Non spécifiée'
                        handleReject(selectedHost.email, reason)
                      }}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Informations personnelles */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Informations personnelles</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-gray-700">Prénom</label>
                        <p className="text-gray-900">{selectedHost.firstName}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Nom</label>
                        <p className="text-gray-900">{selectedHost.lastName}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedHost.email}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Téléphone</label>
                        <p className="text-gray-900">{selectedHost.phone}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Date de naissance</label>
                        <p className="text-gray-900">{selectedHost.dateOfBirth || 'Non renseignée'}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Type d'activité</label>
                        <p className="text-gray-900 capitalize">{selectedHost.hostType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Adresse */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Adresse</h3>
                    <div className="text-sm space-y-2">
                      <p className="text-gray-900">{selectedHost.address}</p>
                      <p className="text-gray-900">{selectedHost.postalCode} {selectedHost.city}</p>
                      <p className="text-gray-900">{selectedHost.country}</p>
                    </div>
                  </div>

                  {/* Description de l'emplacement */}
                  {selectedHost.locationDescription && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Description de l'emplacement</h3>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedHost.locationDescription}
                      </p>
                    </div>
                  )}

                  {/* Informations professionnelles */}
                  {selectedHost.hostType === 'professionnel' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Informations professionnelles</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium text-gray-700">Entreprise</label>
                          <p className="text-gray-900">{selectedHost.companyName || 'Non renseignée'}</p>
                        </div>
                        <div>
                          <label className="font-medium text-gray-700">SIRET</label>
                          <p className="text-gray-900 font-mono">{selectedHost.siret || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <label className="font-medium text-gray-700">N° TVA</label>
                          <p className="text-gray-900">{selectedHost.tva || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <label className="font-medium text-gray-700">Tél. professionnel</label>
                          <p className="text-gray-900">{selectedHost.businessPhone || 'Non renseigné'}</p>
                        </div>
                      </div>
                      {selectedHost.businessAddress && (
                        <div className="mt-4">
                          <label className="font-medium text-gray-700">Adresse entreprise</label>
                          <p className="text-gray-900">{selectedHost.businessAddress}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
