"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Upload, MapPin, Camera, Plus, X, Home, Hotel, Building } from "lucide-react"

interface PropertyForm {
  title: string
  description: string
  type: "hotel" | "maison" | "appartement"
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
  "WiFi", "Climatisation", "Piscine", "Parking", "Restaurant", "Spa",
  "Salle de sport", "Vue panoramique", "Cuisine équipée", "Terrasse",
  "Balcon", "Proche marché", "Transport", "Sécurité 24h/24"
]

const cities = ["Bamako", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Kayes", "Koutiala", "Gao"]

export default function HostPage() {
  const [formData, setFormData] = useState<PropertyForm>({
    title: "",
    description: "",
    type: "maison",
    location: "",
    city: "",
    price: 0,
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    images: [],
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const handleInputChange = (field: keyof PropertyForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const addImage = () => {
    const sampleImages = [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    ]
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)]
    setFormData((prev) => ({ ...prev, images: [...prev.images, randomImage] }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const nextStep = () => currentStep < totalSteps && setCurrentStep(currentStep + 1)
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1)

  const handleSubmit = () => {
    alert("Votre hébergement a été soumis avec succès ! Il sera examiné par notre équipe.")
  }

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(price)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">Ikasso</Link>
              <span className="ml-2 text-sm text-gray-500">Chez Toi</span>
            </div>
            <div className="text-sm text-gray-600">Étape {currentStep} sur {totalSteps}</div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quel type d'hébergement proposez-vous ?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <button onClick={() => handleInputChange("type", "maison")} className={`p-6 border-2 rounded-lg text-left hover:border-primary-400 ${formData.type === "maison" ? "border-primary-500 bg-primary-50" : "border-gray-200"}`}>
                  <Home className="h-6 w-6 mb-2" />
                  <div className="font-semibold">Maison</div>
                  <div className="text-sm text-gray-600">Maisons individuelles, villas, riads</div>
                </button>
                <button onClick={() => handleInputChange("type", "appartement")} className={`p-6 border-2 rounded-lg text-left hover:border-primary-400 ${formData.type === "appartement" ? "border-primary-500 bg-primary-50" : "border-gray-200"}`}>
                  <Building className="h-6 w-6 mb-2" />
                  <div className="font-semibold">Appartement</div>
                  <div className="text-sm text-gray-600">Studios, appartements privés</div>
                </button>
                <button onClick={() => handleInputChange("type", "hotel")} className={`p-6 border-2 rounded-lg text-left hover:border-primary-400 ${formData.type === "hotel" ? "border-primary-500 bg-primary-50" : "border-gray-200"}`}>
                  <Hotel className="h-6 w-6 mb-2" />
                  <div className="font-semibold">Hôtel</div>
                  <div className="text-sm text-gray-600">Hôtels, auberges, résidences</div>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titre de votre hébergement</label>
                  <input className="input-field mt-1" placeholder="Ex: Villa moderne avec piscine" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Voyageurs (capacité)</label>
                  <input type="number" min={1} className="input-field mt-1" value={formData.guests} onChange={(e) => handleInputChange("guests", Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chambres</label>
                  <input type="number" min={0} className="input-field mt-1" value={formData.bedrooms} onChange={(e) => handleInputChange("bedrooms", Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salles de bain</label>
                  <input type="number" min={0} className="input-field mt-1" value={formData.bathrooms} onChange={(e) => handleInputChange("bathrooms", Number(e.target.value))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea rows={4} className="input-field mt-1" placeholder="Décrivez votre hébergement, ses atouts, l'environnement..." value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Où se trouve votre hébergement ?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ville</label>
                  <select className="input-field mt-1" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)}>
                    <option value="">Sélectionnez une ville</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <input className="input-field mt-1" placeholder="Quartier, rue, point de repère" value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} />
                </div>
              </div>
              <div className="mt-6 p-4 border rounded-lg bg-gray-50 flex items-center text-gray-600"><MapPin className="h-5 w-5 mr-2" /> Carte interactive à venir</div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos de votre hébergement</h2>
              <p className="text-gray-600 mb-4">Ajoutez des photos attrayantes de votre hébergement</p>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={addImage} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><Plus className="h-4 w-4 mr-2" />Ajouter une photo</button>
                <button className="inline-flex items-center px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"><Upload className="h-4 w-4 mr-2" />Importer</button>
              </div>
              {formData.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((src, i) => (
                    <div key={i} className="relative">
                      <Image src={src} alt={`Photo ${i + 1}`} width={400} height={300} className="w-full h-40 object-cover rounded" />
                      <button onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-gray-600">
                  <Camera className="h-8 w-8 mx-auto mb-2" />
                  Aucune photo pour le moment
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Prix et validation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix par nuit (FCFA)</label>
                  <input type="number" min={1000} step={500} className="input-field mt-1" value={formData.price} onChange={(e) => handleInputChange("price", Number(e.target.value))} />
                  <div className="text-sm text-gray-600 mt-2">Prix affiché: {formatPrice(formData.price)} par nuit</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Récapitulatif</h3>
                  <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-medium capitalize">{formData.type}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Ville:</span><span className="font-medium">{formData.city || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Voyageurs:</span><span className="font-medium">{formData.guests}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Chambres:</span><span className="font-medium">{formData.bedrooms}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Photos:</span><span className="font-medium">{formData.images.length} ajoutées</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Prix:</span><span className="font-medium">{formatPrice(formData.price)}/nuit</span></div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-blue-900 mb-2">Prochaines étapes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Votre annonce sera examinée par notre équipe (24-48h)</li>
                  <li>• Vous recevrez une confirmation par email</li>
                  <li>• Votre hébergement sera publié sur Ikasso</li>
                  <li>• Vous pourrez gérer vos réservations depuis votre espace hôte</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button onClick={prevStep} disabled={currentStep === 1} className={`px-6 py-2 rounded-lg font-medium ${currentStep === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>Retour</button>
            {currentStep < totalSteps ? (
              <button onClick={nextStep} className="px-6 py-2 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700">Continuer</button>
            ) : (
              <button onClick={handleSubmit} className="px-6 py-2 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700">Publier mon hébergement</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

