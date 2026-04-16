'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Camera, Upload, CheckCircle, Clock, Shield, ArrowLeft, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getVerificationStatus, submitVerification } from '../lib/dal/verification'
import type { DocumentType, VerificationStatus } from '../lib/dal/verification'

const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string }[] = [
  { value: 'nina', label: 'NINA', description: "Numero d'Identification Nationale" },
  { value: 'passport', label: 'Passeport', description: 'Passeport en cours de validite' },
  { value: 'carte_identite', label: "Carte d'identite", description: "Carte nationale d'identite" },
  { value: 'permis_conduire', label: 'Permis de conduire', description: 'Permis de conduire valide' },
]

const FACE_DIRECTIONS = [
  { key: 'front' as const, label: 'Face', instruction: 'Regardez directement la camera' },
  { key: 'left' as const, label: 'Gauche', instruction: 'Tournez legerement la tete vers la gauche' },
  { key: 'right' as const, label: 'Droite', instruction: 'Tournez legerement la tete vers la droite' },
]

type FaceKey = 'front' | 'left' | 'right'

export default function VerifyIdentityPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [documentType, setDocumentType] = useState<DocumentType | null>(null)
  const [documentFront, setDocumentFront] = useState<File | null>(null)
  const [documentBack, setDocumentBack] = useState<File | null>(null)
  const [facePhotos, setFacePhotos] = useState<Record<FaceKey, File | null>>({
    front: null,
    left: null,
    right: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingStatus, setExistingStatus] = useState<VerificationStatus | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)

  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)
  const faceInputRefs = useRef<Record<FaceKey, HTMLInputElement | null>>({
    front: null,
    left: null,
    right: null,
  })

  const checkExistingStatus = useCallback(async () => {
    if (!user) return
    try {
      const result = await getVerificationStatus(user.id)
      setExistingStatus(result.status)
      if (result.status === 'pending') setCurrentStep(4)
      if (result.status === 'approved') setCurrentStep(4)
    } catch {
      // ignore
    } finally {
      setCheckingStatus(false)
    }
  }, [user])

  useEffect(() => {
    if (user) checkExistingStatus()
    else setCheckingStatus(false)
  }, [user, checkExistingStatus])

  const handleDocumentUpload = (side: 'front' | 'back', file: File | null) => {
    if (!file) return
    if (side === 'front') setDocumentFront(file)
    else setDocumentBack(file)
  }

  const handleFaceUpload = (key: FaceKey, file: File | null) => {
    if (!file) return
    setFacePhotos(prev => ({ ...prev, [key]: file }))
  }

  const canProceedStep1 = documentType !== null
  const canProceedStep2 = documentFront !== null && documentBack !== null
  const canProceedStep3 = facePhotos.front !== null && facePhotos.left !== null && facePhotos.right !== null

  const handleSubmit = async () => {
    if (!user || !documentType || !documentFront || !documentBack || !facePhotos.front || !facePhotos.left || !facePhotos.right) return

    setSubmitting(true)
    setError(null)

    try {
      const result = await submitVerification({
        userId: user.id,
        documentType,
        documentFront,
        documentBack,
        faceFront: facePhotos.front,
        faceLeft: facePhotos.left,
        faceRight: facePhotos.right,
      })

      if (result.success) {
        setExistingStatus('pending')
        setCurrentStep(4)
      } else {
        setError(result.error || 'Une erreur est survenue')
      }
    } catch {
      setError('Une erreur est survenue lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 3) {
      handleSubmit()
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  if (authLoading || checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Shield className="w-16 h-16 text-primary-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Connexion requise</h1>
        <p className="text-gray-600 mb-6 text-center">
          Vous devez etre connecte pour verifier votre identite.
        </p>
        <Link
          href="/login"
          className="bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Verification d&apos;identite</h1>
              <p className="text-sm text-gray-500">Securisez votre compte Ikasso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {currentStep < 4 && (
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex-1">
                <div
                  className={`h-2 rounded-full transition-colors ${
                    step <= currentStep ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">Etape {currentStep} sur 3</p>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: Document Type */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Choisissez votre type de document
              </h2>
              <p className="text-sm text-gray-500">
                Selectionnez le document officiel que vous allez fournir pour la verification.
              </p>
            </div>

            <div className="space-y-3">
              {DOCUMENT_TYPES.map(doc => (
                <button
                  key={doc.value}
                  onClick={() => setDocumentType(doc.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    documentType === doc.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{doc.label}</p>
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    </div>
                    {documentType === doc.value && (
                      <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Document Upload */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Photographiez votre document
              </h2>
              <p className="text-sm text-gray-500">
                Prenez une photo claire du recto et du verso de votre document.
                Assurez-vous que toutes les informations sont lisibles.
              </p>
            </div>

            {/* Front */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recto du document
              </label>
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleDocumentUpload('front', e.target.files?.[0] || null)}
              />
              <button
                onClick={() => frontInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all ${
                  documentFront
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                {documentFront ? (
                  <>
                    <CheckCircle className="w-10 h-10 text-primary-500" />
                    <span className="text-sm font-medium text-primary-700">{documentFront.name}</span>
                    <span className="text-xs text-gray-500">Cliquez pour remplacer</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Prendre une photo ou importer
                    </span>
                    <span className="text-xs text-gray-400">JPG, PNG - Max 10 Mo</span>
                  </>
                )}
              </button>
            </div>

            {/* Back */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verso du document
              </label>
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleDocumentUpload('back', e.target.files?.[0] || null)}
              />
              <button
                onClick={() => backInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all ${
                  documentBack
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                {documentBack ? (
                  <>
                    <CheckCircle className="w-10 h-10 text-primary-500" />
                    <span className="text-sm font-medium text-primary-700">{documentBack.name}</span>
                    <span className="text-xs text-gray-500">Cliquez pour remplacer</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Prendre une photo ou importer
                    </span>
                    <span className="text-xs text-gray-400">JPG, PNG - Max 10 Mo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Face Photos */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Photos de votre visage
              </h2>
              <p className="text-sm text-gray-500">
                Prenez 3 photos de votre visage sous differents angles.
                Assurez-vous d&apos;etre dans un endroit bien eclaire.
              </p>
            </div>

            {/* Tips */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-primary-800 mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Conseils pour de bonnes photos
              </h3>
              <ul className="text-sm text-primary-700 space-y-1">
                <li>- Bon eclairage, fond neutre</li>
                <li>- Visage entierement visible</li>
                <li>- Pas de lunettes de soleil ni de chapeau</li>
                <li>- Expression neutre</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {FACE_DIRECTIONS.map(dir => (
                <div key={dir.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    {dir.label}
                  </label>
                  {/* Visual guide */}
                  <div className="flex justify-center mb-3">
                    <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                      <div
                        className="w-10 h-12 bg-gray-300 rounded-t-full"
                        style={{
                          transform:
                            dir.key === 'left'
                              ? 'rotate(-20deg)'
                              : dir.key === 'right'
                              ? 'rotate(20deg)'
                              : 'rotate(0deg)',
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mb-3">{dir.instruction}</p>
                  <input
                    ref={el => { faceInputRefs.current[dir.key] = el }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFaceUpload(dir.key, e.target.files?.[0] || null)}
                  />
                  <button
                    onClick={() => faceInputRefs.current[dir.key]?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
                      facePhotos[dir.key]
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 bg-white hover:border-primary-400'
                    }`}
                  >
                    {facePhotos[dir.key] ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-primary-500" />
                        <span className="text-xs text-primary-700 truncate max-w-full">
                          {facePhotos[dir.key]!.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500">Prendre la photo</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="text-center py-12 space-y-6">
            {existingStatus === 'approved' ? (
              <>
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Identite verifiee</h2>
                  <p className="text-gray-600">
                    Votre identite a ete verifiee avec succes. Vous pouvez maintenant
                    effectuer des reservations et ajouter des proprietes.
                  </p>
                </div>
              </>
            ) : existingStatus === 'rejected' ? (
              <>
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-red-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification refusee</h2>
                  <p className="text-gray-600">
                    Votre demande de verification a ete refusee.
                    Veuillez soumettre de nouveaux documents.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurrentStep(1)
                    setDocumentType(null)
                    setDocumentFront(null)
                    setDocumentBack(null)
                    setFacePhotos({ front: null, left: null, right: null })
                    setExistingStatus(null)
                  }}
                  className="bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
                >
                  Recommencer
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <Clock className="w-10 h-10 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Demande envoyee !
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Votre demande est en cours de verification.
                    Nos equipes examineront vos documents dans un delai de <strong>48 heures</strong>.
                  </p>
                </div>
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 max-w-sm mx-auto">
                  <p className="text-sm text-primary-800">
                    Vous recevrez une notification une fois la verification terminee.
                  </p>
                </div>
              </>
            )}

            <Link
              href="/"
              className="inline-block text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              Retour a l&apos;accueil
            </Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                currentStep === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Precedent
            </button>

            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !canProceedStep1) ||
                (currentStep === 2 && !canProceedStep2) ||
                (currentStep === 3 && !canProceedStep3) ||
                submitting
              }
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-colors ${
                ((currentStep === 1 && canProceedStep1) ||
                  (currentStep === 2 && canProceedStep2) ||
                  (currentStep === 3 && canProceedStep3)) &&
                !submitting
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : currentStep === 3 ? (
                <>
                  Soumettre
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
