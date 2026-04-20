'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Camera, Upload, CheckCircle, Clock, Shield, ArrowLeft, ArrowRight, Building2, User, FileText, Briefcase } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getVerificationStatus, submitVerification } from '../lib/dal/verification'
import type { DocumentType, VerificationStatus } from '../lib/dal/verification'

const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string }[] = [
  { value: 'nina', label: 'NINA', description: "Numero d'Identification Nationale" },
  { value: 'passport', label: 'Passeport', description: 'Passeport en cours de validite' },
  { value: 'id_card', label: "Carte d'identite", description: "Carte nationale d'identite" },
  { value: 'driver_license', label: 'Permis de conduire', description: 'Permis de conduire valide' },
]

const BUSINESS_TYPES = [
  { value: 'hotel', label: 'Hotel', description: 'Hotel, resort ou etablissement hotelier' },
  { value: 'auberge', label: 'Auberge / Maison d\'hotes', description: 'Auberge, chambre d\'hotes ou guesthouse' },
  { value: 'agence', label: 'Agence immobiliere', description: 'Agence de location ou gestion immobiliere' },
  { value: 'autre', label: 'Autre entreprise', description: 'Autre type d\'activite d\'hebergement' },
]

const FACE_DIRECTIONS = [
  { key: 'front' as const, label: 'Face', instruction: 'Regardez directement la camera' },
  { key: 'left' as const, label: 'Profil gauche', instruction: 'Tournez votre tete vers votre droite' },
  { key: 'right' as const, label: 'Profil droit', instruction: 'Tournez votre tete vers votre gauche' },
]

type FaceKey = 'front' | 'left' | 'right'
type VerificationType = 'particulier' | 'professionnel' | null

export default function VerifyIdentityPage() {
  const { user, isLoading: authLoading } = useAuth()

  // Type choice
  const [verificationType, setVerificationType] = useState<VerificationType>(null)

  // Common state
  const [currentStep, setCurrentStep] = useState(0) // 0 = type choice
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingStatus, setExistingStatus] = useState<VerificationStatus | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)

  // Particulier state
  const [documentType, setDocumentType] = useState<DocumentType | null>(null)
  const [documentFront, setDocumentFront] = useState<File | null>(null)
  const [documentBack, setDocumentBack] = useState<File | null>(null)
  const [facePhotos, setFacePhotos] = useState<Record<FaceKey, File | null>>({ front: null, left: null, right: null })

  // Professionnel state
  const [businessType, setBusinessType] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [businessRegistration, setBusinessRegistration] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessDoc, setBusinessDoc] = useState<File | null>(null)
  const [businessLicense, setBusinessLicense] = useState<File | null>(null)
  const [managerIdDoc, setManagerIdDoc] = useState<File | null>(null)

  // Refs
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)
  const businessDocRef = useRef<HTMLInputElement>(null)
  const businessLicenseRef = useRef<HTMLInputElement>(null)
  const managerIdRef = useRef<HTMLInputElement>(null)
  const faceInputRefs = useRef<Record<FaceKey, HTMLInputElement | null>>({ front: null, left: null, right: null })

  const checkExistingStatus = useCallback(async () => {
    if (!user) return
    try {
      const result = await getVerificationStatus(user.id)
      setExistingStatus(result.status)
      if (result.status === 'pending' || result.status === 'approved') setCurrentStep(99)
    } catch {} finally { setCheckingStatus(false) }
  }, [user])

  useEffect(() => {
    if (user) checkExistingStatus()
    else setCheckingStatus(false)
  }, [user, checkExistingStatus])

  // Total steps depend on type
  const totalSteps = verificationType === 'particulier' ? 3 : verificationType === 'professionnel' ? 3 : 0

  const handleSubmitParticulier = async () => {
    if (!user || !documentType || !documentFront || !documentBack || !facePhotos.front || !facePhotos.left || !facePhotos.right) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await submitVerification({
        userId: user.id, documentType, documentFront, documentBack,
        faceFront: facePhotos.front, faceLeft: facePhotos.left, faceRight: facePhotos.right,
      })
      if (result.success) { setExistingStatus('pending'); setCurrentStep(99) }
      else setError(result.error || 'Une erreur est survenue')
    } catch { setError('Erreur lors de la soumission') }
    finally { setSubmitting(false) }
  }

  const handleSubmitProfessionnel = async () => {
    if (!user || !businessType || !businessName || !businessDoc || !managerIdDoc) return
    setSubmitting(true)
    setError(null)
    try {
      // Upload business documents using the same upload API
      const uploadFile = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('userId', user.id)
        const res = await fetch('/api/upload/identity', { method: 'POST', body: formData })
        const data = await res.json()
        return data.signedUrl || data.url || ''
      }

      const businessDocUrl = await uploadFile(businessDoc)
      const businessLicenseUrl = businessLicense ? await uploadFile(businessLicense) : ''
      const managerIdUrl = await uploadFile(managerIdDoc)

      // Submit to Supabase
      const { createClient } = await import('../lib/supabase/client')
      const supabase = createClient()
      const { error: dbError } = await supabase.from('identity_verifications').insert({
        user_id: user.id,
        document_type: 'id_card',
        verification_type: 'professionnel',
        business_name: businessName,
        business_type: businessType,
        business_registration: businessRegistration,
        business_doc_url: businessDocUrl,
        business_license_url: businessLicenseUrl,
        document_front_url: managerIdUrl,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })

      if (dbError) throw dbError
      setExistingStatus('pending')
      setCurrentStep(99)
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la soumission')
    } finally { setSubmitting(false) }
  }

  const nextStep = () => {
    if (verificationType === 'particulier' && currentStep === 3) handleSubmitParticulier()
    else if (verificationType === 'professionnel' && currentStep === 3) handleSubmitProfessionnel()
    else setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    if (currentStep === 1) { setCurrentStep(0); setVerificationType(null) }
    else setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // Can proceed checks
  const canProceed = () => {
    if (verificationType === 'particulier') {
      if (currentStep === 1) return documentType !== null
      if (currentStep === 2) return documentFront !== null && documentBack !== null
      if (currentStep === 3) return facePhotos.front !== null && facePhotos.left !== null && facePhotos.right !== null
    }
    if (verificationType === 'professionnel') {
      if (currentStep === 1) return businessType !== null
      if (currentStep === 2) return businessName.trim() !== '' && businessRegistration.trim() !== ''
      if (currentStep === 3) return businessDoc !== null && managerIdDoc !== null
    }
    return false
  }

  const FileUploadBox = ({ file, inputRef, label, onUpload }: { file: File | null; inputRef: any; label: string; onUpload: (f: File) => void }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
      <button
        onClick={() => inputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-all ${
          file ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white hover:border-primary-400'
        }`}
      >
        {file ? (
          <>
            <CheckCircle className="w-8 h-8 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 truncate max-w-full">{file.name}</span>
            <span className="text-xs text-gray-500">Cliquez pour remplacer</span>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Importer le document</span>
            <span className="text-xs text-gray-400">JPG, PNG, PDF - Max 10 Mo</span>
          </>
        )}
      </button>
    </div>
  )

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
        <p className="text-gray-600 mb-6 text-center">Vous devez etre connecte pour verifier votre identite.</p>
        <Link href="/auth/login" className="bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors">Se connecter</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Verification d&apos;identite</h1>
              <p className="text-sm text-gray-500">Securisez votre compte Ikasso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {currentStep > 0 && currentStep < 99 && (
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex-1">
                <div className={`h-2 rounded-full transition-colors ${step <= currentStep ? 'bg-primary-500' : 'bg-gray-200'}`} />
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Etape {currentStep} sur {totalSteps} — {verificationType === 'particulier' ? 'Particulier' : 'Professionnel'}
          </p>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ============ STEP 0: Type Choice ============ */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quel type de compte souhaitez-vous verifier ?</h2>
              <p className="text-sm text-gray-500">Choisissez selon votre situation pour une verification adaptee.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Particulier */}
              <button
                onClick={() => { setVerificationType('particulier'); setCurrentStep(1) }}
                className="text-left p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-primary-500 hover:bg-primary-50 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <User className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Particulier</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Je suis un particulier qui loue son logement (maison, appartement, chambre).
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">NINA</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">Passeport</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">Carte d'identite</span>
                </div>
              </button>

              {/* Professionnel */}
              <button
                onClick={() => { setVerificationType('professionnel'); setCurrentStep(1) }}
                className="text-left p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-primary-500 hover:bg-primary-50 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                  <Building2 className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Professionnel</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Je suis un hotel, une auberge, une agence immobiliere ou une entreprise.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">RCCM</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">Licence hoteliere</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">Piece d'identite gerant</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ============ PARTICULIER STEPS ============ */}
        {verificationType === 'particulier' && currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Choisissez votre type de document</h2>
              <p className="text-sm text-gray-500">Selectionnez le document officiel que vous allez fournir.</p>
            </div>
            <div className="space-y-3">
              {DOCUMENT_TYPES.map(doc => (
                <button key={doc.value} onClick={() => setDocumentType(doc.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${documentType === doc.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center justify-between">
                    <div><p className="font-semibold text-gray-900">{doc.label}</p><p className="text-sm text-gray-500">{doc.description}</p></div>
                    {documentType === doc.value && <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {verificationType === 'particulier' && currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Photographiez votre document</h2>
              <p className="text-sm text-gray-500">Prenez une photo claire du recto et du verso.</p>
            </div>
            <FileUploadBox file={documentFront} inputRef={frontInputRef} label="Recto du document" onUpload={f => setDocumentFront(f)} />
            <FileUploadBox file={documentBack} inputRef={backInputRef} label="Verso du document" onUpload={f => setDocumentBack(f)} />
          </div>
        )}

        {verificationType === 'particulier' && currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Photos de votre visage</h2>
              <p className="text-sm text-gray-500">Prenez 3 photos sous differents angles.</p>
            </div>
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-primary-800 mb-2 flex items-center gap-2"><Camera className="w-4 h-4" />Conseils</h3>
              <ul className="text-sm text-primary-700 space-y-1">
                <li>- Bon eclairage, fond neutre</li>
                <li>- Pas de lunettes de soleil ni chapeau</li>
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {FACE_DIRECTIONS.map(dir => (
                <div key={dir.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">{dir.label}</label>
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                      <div className="w-8 h-10 bg-gray-300 rounded-t-full" style={{ transform: dir.key === 'left' ? 'rotate(-20deg)' : dir.key === 'right' ? 'rotate(20deg)' : 'rotate(0deg)' }} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mb-2">{dir.instruction}</p>
                  <input ref={el => { faceInputRefs.current[dir.key] = el }} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && setFacePhotos(prev => ({ ...prev, [dir.key]: e.target.files![0] }))} />
                  <button onClick={() => faceInputRefs.current[dir.key]?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${facePhotos[dir.key] ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white hover:border-primary-400'}`}>
                    {facePhotos[dir.key] ? (
                      <><CheckCircle className="w-6 h-6 text-primary-500" /><span className="text-xs text-primary-700 truncate max-w-full">{facePhotos[dir.key]!.name}</span></>
                    ) : (
                      <><Camera className="w-6 h-6 text-gray-400" /><span className="text-xs text-gray-500">Photo</span></>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ PROFESSIONNEL STEPS ============ */}
        {verificationType === 'professionnel' && currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Type d'etablissement</h2>
              <p className="text-sm text-gray-500">Selectionnez le type de votre entreprise.</p>
            </div>
            <div className="space-y-3">
              {BUSINESS_TYPES.map(biz => (
                <button key={biz.value} onClick={() => setBusinessType(biz.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${businessType === biz.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center justify-between">
                    <div><p className="font-semibold text-gray-900">{biz.label}</p><p className="text-sm text-gray-500">{biz.description}</p></div>
                    {businessType === biz.value && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {verificationType === 'professionnel' && currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Informations de l'entreprise</h2>
              <p className="text-sm text-gray-500">Renseignez les informations officielles de votre etablissement.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'etablissement *</label>
                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Ex: Hotel Bamako Palace" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Numero RCCM ou NIF *</label>
                <input type="text" value={businessRegistration} onChange={e => setBusinessRegistration(e.target.value)} placeholder="Ex: ML-BKO-2024-B-12345" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse de l'etablissement</label>
                <input type="text" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} placeholder="Ex: ACI 2000, Bamako" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telephone professionnel</label>
                <input type="tel" value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} placeholder="+223 XX XX XX XX" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 outline-none" />
              </div>
            </div>
          </div>
        )}

        {verificationType === 'professionnel' && currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Documents justificatifs</h2>
              <p className="text-sm text-gray-500">Importez les documents officiels de votre entreprise.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" />Documents acceptes</h3>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>- Registre de commerce (RCCM) ou carte NIF</li>
                <li>- Licence hoteliere / permis d'exploitation</li>
                <li>- Piece d'identite du gerant</li>
              </ul>
            </div>
            <FileUploadBox file={businessDoc} inputRef={businessDocRef} label="Registre de commerce (RCCM) ou NIF *" onUpload={f => setBusinessDoc(f)} />
            <FileUploadBox file={businessLicense} inputRef={businessLicenseRef} label="Licence hoteliere / Permis d'exploitation (optionnel)" onUpload={f => setBusinessLicense(f)} />
            <FileUploadBox file={managerIdDoc} inputRef={managerIdRef} label="Piece d'identite du gerant *" onUpload={f => setManagerIdDoc(f)} />
          </div>
        )}

        {/* ============ CONFIRMATION (both types) ============ */}
        {currentStep === 99 && (
          <div className="text-center py-12 space-y-6">
            {existingStatus === 'approved' ? (
              <>
                <div className="flex justify-center"><div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="w-10 h-10 text-green-600" /></div></div>
                <div><h2 className="text-2xl font-bold text-gray-900 mb-2">Identite verifiee</h2><p className="text-gray-600">Votre identite a ete verifiee avec succes.</p></div>
              </>
            ) : existingStatus === 'rejected' ? (
              <>
                <div className="flex justify-center"><div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center"><Shield className="w-10 h-10 text-red-600" /></div></div>
                <div><h2 className="text-2xl font-bold text-gray-900 mb-2">Verification refusee</h2><p className="text-gray-600">Veuillez soumettre de nouveaux documents.</p></div>
                <button onClick={() => { setCurrentStep(0); setVerificationType(null); setExistingStatus(null) }} className="bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors">Recommencer</button>
              </>
            ) : (
              <>
                <div className="flex justify-center"><div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center"><Clock className="w-10 h-10 text-primary-600" /></div></div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyee !</h2>
                  <p className="text-gray-600 max-w-md mx-auto">Nos equipes examineront vos documents dans un delai de <strong>48 heures</strong>.</p>
                </div>
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 max-w-sm mx-auto">
                  <p className="text-sm text-primary-800">Vous recevrez une notification une fois la verification terminee.</p>
                </div>
              </>
            )}
            <Link href="/dashboard" className="inline-block text-primary-600 font-semibold hover:text-primary-700 transition-colors">Retour au tableau de bord</Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Navigation */}
        {currentStep > 0 && currentStep < 99 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Precedent
            </button>
            <button
              onClick={nextStep}
              disabled={!canProceed() || submitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-colors ${canProceed() && !submitting ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi en cours...</>
              ) : currentStep === totalSteps ? (
                <><CheckCircle className="w-4 h-4" />Soumettre</>
              ) : (
                <>Suivant<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
