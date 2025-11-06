'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Upload, MapPin, Camera, Plus, X, Home, Hotel, Building } from 'lucide-react'

interface PropertyForm {
  title: string
  description: string
  type: 'hotel' | 'maison' | 'appartement'
  location: string
  city: string
  price: number
  guests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  images: string[]
}

const availableAmenities = [
  'WiFi', 'Climatisation', 'Piscine', 'Parking', 'Restaurant', 'Spa', 
  'Salle de sport', 'Vue panoramique', 'Cuisine Ã©quipÃ©e', 'Terrasse',
  'Balcon', 'Proche marchÃ©', 'Transport', 'SÃ©curitÃ© 24h/24'
]

const cities = ['Bamako', 'Sikasso', 'SÃ©gou', 'Mopti', 'Tombouctou', 'Kayes', 'Koutiala', 'Gao']

export default function HostPage() {
  const [formData, setFormData] = useState<PropertyForm>({
    title: '',
    description: '',
    type: 'maison',
    location: '',
    city: '',
    price: 0,
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    images: []
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const handleInputChange = (field: keyof PropertyForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const addImage = () => {
    // Simulation d'ajout d'image
    const sampleImages = [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'
    ]
    
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)]
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, randomImage]
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    console.log('DonnÃ©es du formulaire:', formData)
    alert('Votre hÃ©bergement a Ã©tÃ© soumis avec succÃ¨s! Il sera examinÃ© par notre Ã©quipe.')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">Ikasso</Link>
              <span className="ml-2 text-sm text-gray-500">Chez Toi</span>
            </div>
            <div className="text-sm text-gray-600">
              Ã‰tape {currentStep} sur {totalSteps}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Type et informations de base */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quel type d'hÃ©bergement proposez-vous ?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <button
                  onClick={() => handleInputChange('type', 'maison')}
                  className={`p-6 border-2 rounded-lg text-center transition-all ${
                    formData.type === 'maison' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Home className="h-12 w-12 mx-auto mb-4 text-primary-600" />
                  <h3 className="font-semibold mb-2">Maison</h3>
                  <p className="text-sm text-gray-600">Villa, maison traditionnelle, etc.</p>
                </button>

                <button
                  onClick={() => handleInputChange('type', 'hotel')}
                  className={`p-6 border-2 rounded-lg text-center transition-all ${
                    formData.type === 'hotel' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Hotel className="h-12 w-12 mx-auto mb-4 text-primary-600" />
                  <h3 className="font-semibold mb-2">HÃ´tel</h3>
                  <p className="text-sm text-gray-600">HÃ´tel, auberge, etc.</p>
                </button>

                <button
                  onClick={() => handleInputChange('type', 'appartement')}
                  className={`p-6 border-2 rounded-lg text-center transition-all ${
                    formData.type === 'appartement' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building className="h-12 w-12 mx-auto mb-4 text-primary-600" />
                  <h3 className="font-semibold mb-2">Appartement</h3>
                  <p className="text-sm text-gray-600">Studio, appartement, etc.</p>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de votre hÃ©bergement
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ex: Belle villa avec piscine Ã  Bamako"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="input-field"
                    placeholder="DÃ©crivez votre hÃ©bergement, ses atouts, l'environnement..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Localisation */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">OÃ¹ se trouve votre hÃ©bergement ?</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <select
                    className="input-field"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  >
                    <option value="">Choisir une ville</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse ou quartier
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="input-field pl-10"
                      placeholder="Ex: Quartier du Fleuve, prÃ¨s du marchÃ© central"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de voyageurs
                    </label>
                    <select
                      className="input-field"
                      value={formData.guests}
                      onChange={(e) => handleInputChange('guests', Number(e.target.value))}
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chambres
                    </label>
                    <select
                      className="input-field"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', Number(e.target.value))}
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salles de bain
                    </label>
                    <select
                      className="input-field"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', Number(e.target.value))}
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ã‰quipements et photos */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ã‰quipements et photos</h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Quels Ã©quipements proposez-vous ?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableAmenities.map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-3 border rounded-lg text-sm transition-all ${
                        formData.amenities.includes(amenity)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Photos de votre hÃ©bergement</h3>
                <p className="text-gray-600 mb-4">Ajoutez des photos attrayantes de votre hÃ©bergement</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <Image 
                        src={image} 
                        alt={`Photo ${index + 1}`}
                        width={400}
                        height={256}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={addImage}
                    className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Ajouter une photo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Prix et validation */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Prix et validation</h2>
              
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix par nuit (en Francs CFA)
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="25000"
                  value={formData.price}
                  min={0}
                  step={100}
                  inputMode="numeric"
                  onChange={(e) => handleInputChange('price', Number(e.target.value))}
                />
                {formData.price > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Prix affichÃ©: {formatPrice(formData.price)} par nuit
                  </p>
                )}
              </div>

              {/* RÃ©capitulatif */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">RÃ©capitulatif de votre annonce</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{formData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Titre:</span>
                    <span className="font-medium">{formData.title || 'Non dÃ©fini'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Localisation:</span>
                    <span className="font-medium">{formData.city || 'Non dÃ©finie'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CapacitÃ©:</span>
                    <span className="font-medium">{formData.guests} voyageurs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ã‰quipements:</span>
                    <span className="font-medium">{formData.amenities.length} sÃ©lectionnÃ©s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Photos:</span>
                    <span className="font-medium">{formData.images.length} ajoutÃ©es</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix:</span>
                    <span className="font-medium">{formatPrice(formData.price)}/nuit</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Prochaines Ã©tapes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>â€¢ Votre annonce sera examinÃ©e par notre Ã©quipe (24-48h)</li>
                  <li>â€¢ Vous recevrez une confirmation par email</li>
                  <li>â€¢ Votre hÃ©bergement sera publiÃ© sur Ikasso</li>
                  <li>â€¢ Vous pourrez gÃ©rer vos rÃ©servations depuis votre espace hÃ´te</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              PrÃ©cÃ©dent
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="btn-primary px-6 py-2"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn-primary px-6 py-2"
              >
                Publier mon hÃ©bergement
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

