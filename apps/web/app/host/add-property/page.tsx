"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X, MapPin, Home, Users, Bed, Bath, Wifi, Car, Utensils, Tv, AirVent, Waves } from 'lucide-react'
import LogoFinal from '../components/LogoFinal'

interface PropertyForm {
  title: string
  description: string
  type: 'hotel' | 'maison' | 'appartement'
  address: string
  postalCode: string
  city: string
  country: string
  locationDescription: string
  price: string
  guests: string
  bedrooms: string
  bathrooms: string
  amenities: string[]
  rules: string[]
  checkIn: string
  checkOut: string
  cancellation: string
  photos: File[]
}

const amenitiesList = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'cuisine', label: 'Cuisine équipée', icon: Utensils },
  { id: 'tv', label: 'Télévision', icon: Tv },
  { id: 'climatisation', label: 'Climatisation', icon: AirVent },
  { id: 'piscine', label: 'Piscine', icon: Waves },
]

export default function AddPropertyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState<PropertyForm>({
    title: '',
    description: '',
    type: 'maison',
    address: '',
    postalCode: '',
    city: '',
    country: 'Mali',
    locationDescription: '',
    price: '',
    guests: '2',
    bedrooms: '1',
    bathrooms: '1',
    amenities: [],
    rules: [],
    checkIn: '15:00',
    checkOut: '11:00',
    cancellation: 'flexible',
    photos: []
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...files].slice(0, 10) // Max 10 photos
      }))
    }
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulation de sauvegarde
    setTimeout(() => {
      // Sauvegarder la propriété dans localStorage pour la démo
      const existingProperties = JSON.parse(localStorage.getItem('ikasso_host_properties') || '[]')
      const newProperty = {
        id: Date.now().toString(),
        ...formData,
        photos: formData.photos.map(file => URL.createObjectURL(file)), // Pour la démo
        createdAt: new Date().toISOString(),
        status: 'pending' // En attente de validation
      }
      
      const updatedProperties = [...existingProperties, newProperty]
      localStorage.setItem('ikasso_host_properties', JSON.stringify(updatedProperties))
      
      setIsLoading(false)
      alert('Propriété ajoutée avec succès !\n\nElle sera visible après validation par notre équipe.')
      router.push('/dashboard/host')
    }, 2000)
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard/host" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-800" />
              </Link>
              <LogoFinal size="md" />
            </div>
            <div className="text-sm text-gray-600">
              Étape {currentStep} sur 4
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Informations</span>
            <span>Localisation</span>
            <span>Détails</span>
            <span>Photos</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Informations de base</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Titre de l'annonce *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      className="input-field mt-1"
                      placeholder="Ex: Belle villa avec piscine à Bamako"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Type d'hébergement *
                    </label>
                    <select
                      id="type"
                      name="type"
                      required
                      className="input-field mt-1"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="maison">Maison</option>
                      <option value="appartement">Appartement</option>
                      <option value="hotel">Hôtel</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={4}
                      className="input-field mt-1"
                      placeholder="Décrivez votre hébergement en détail..."
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Prix par nuit (FCFA) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min="1000"
                      className="input-field mt-1"
                      placeholder="25000"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Localisation */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Localisation</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Adresse complète *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      className="input-field mt-1"
                      placeholder="123 Rue de la Paix"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                        Code postal
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        className="input-field mt-1"
                        placeholder="BP 123"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        Ville *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        required
                        className="input-field mt-1"
                        placeholder="Bamako"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Pays *
                    </label>
                    <select
                      id="country"
                      name="country"
                      required
                      className="input-field mt-1"
                      value={formData.country}
                      onChange={handleInputChange}
                    >
                      <option value="Mali">Mali</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Sénégal">Sénégal</option>
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="locationDescription" className="block text-sm font-medium text-gray-700">
                      Description de l'emplacement *
                    </label>
                    <textarea
                      id="locationDescription"
                      name="locationDescription"
                      required
                      rows={3}
                      className="input-field mt-1"
                      placeholder="Décrivez l'emplacement, les transports, les commerces à proximité..."
                      value={formData.locationDescription}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Détails */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Détails de l'hébergement</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="guests" className="block text-sm font-medium text-gray-700">
                        Voyageurs max *
                      </label>
                      <select
                        id="guests"
                        name="guests"
                        required
                        className="input-field mt-1"
                        value={formData.guests}
                        onChange={handleInputChange}
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                        Chambres *
                      </label>
                      <select
                        id="bedrooms"
                        name="bedrooms"
                        required
                        className="input-field mt-1"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                      >
                        {[1,2,3,4,5,6].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                        Salles de bain *
                      </label>
                      <select
                        id="bathrooms"
                        name="bathrooms"
                        required
                        className="input-field mt-1"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                      >
                        {[1,2,3,4].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Équipements disponibles
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {amenitiesList.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleAmenityToggle(id)}
                          className={`flex items-center p-3 border rounded-lg text-sm ${
                            formData.amenities.includes(id)
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700">
                        Heure d'arrivée
                      </label>
                      <input
                        type="time"
                        id="checkIn"
                        name="checkIn"
                        className="input-field mt-1"
                        value={formData.checkIn}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">
                        Heure de départ
                      </label>
                      <input
                        type="time"
                        id="checkOut"
                        name="checkOut"
                        className="input-field mt-1"
                        value={formData.checkOut}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Photos */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Photos de votre hébergement</h2>
                <p className="text-gray-600 mb-6">
                  Ajoutez des photos de qualité pour attirer les voyageurs. Maximum 10 photos.
                </p>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <input
                      type="file"
                      id="photos"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <label htmlFor="photos" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Cliquez pour ajouter des photos
                      </p>
                      <p className="text-sm text-gray-600">
                        PNG, JPG jusqu'à 10MB chacune
                      </p>
                    </label>
                  </div>

                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                              Photo principale
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Précédent
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary px-6 py-2"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || formData.photos.length === 0}
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Création...' : 'Créer l\'annonce'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
