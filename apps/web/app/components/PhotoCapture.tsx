'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Camera, Upload, X, AlertCircle, CheckCircle } from 'lucide-react'
import DeviceCompatibility, { useDeviceInfo } from './DeviceCompatibility'
import { saveUserAvatar } from '../lib/avatarPersistence'

interface PhotoCaptureProps {
  onPhotoCapture: (photoUrl: string) => void
  onError?: (error: string) => void
  maxSizeMB?: number
  acceptedFormats?: string[]
  className?: string
}

export default function PhotoCapture({ 
  onPhotoCapture, 
  onError,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className = ''
}: PhotoCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCompatibilityInfo, setShowCompatibilityInfo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const deviceInfo = useDeviceInfo()

  // Vérifier si l'appareil supporte la caméra
  const isCameraSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  // Nettoyer les erreurs après un délai
  const clearMessages = () => {
    setTimeout(() => {
      setError(null)
      setSuccess(null)
    }, 5000)
  }

  // Valider le fichier
  const validateFile = (file: File): string | null => {
    // Vérifier le format
    if (!acceptedFormats.includes(file.type)) {
      return `Format non supporté. Formats acceptés: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`
    }

    // Vérifier la taille
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      return `Fichier trop volumineux (${sizeMB.toFixed(1)}MB). Taille maximum: ${maxSizeMB}MB`
    }

    return null
  }

  // Traiter le fichier image
  const processImageFile = async (file: File) => {
    try {
      setError(null)
      
      // Valider le fichier
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        onError?.(validationError)
        clearMessages()
        return
      }

      // Lire le fichier
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imageUrl = event.target?.result as string
          if (imageUrl) {
            // Sauvegarder l'avatar de façon persistante
            const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
            if (currentUser.email) {
              saveUserAvatar(currentUser.email, imageUrl)
            }
            
            onPhotoCapture(imageUrl)
            setSuccess(`Photo "${file.name}" ajoutée avec succès !`)
            clearMessages()
          }
        } catch (err) {
          const errorMsg = 'Erreur lors du traitement de l\'image'
          setError(errorMsg)
          onError?.(errorMsg)
          clearMessages()
        }
      }
      
      reader.onerror = () => {
        const errorMsg = 'Erreur lors de la lecture du fichier'
        setError(errorMsg)
        onError?.(errorMsg)
        clearMessages()
      }
      
      reader.readAsDataURL(file)
    } catch (err) {
      const errorMsg = 'Erreur inattendue lors du traitement de l\'image'
      setError(errorMsg)
      onError?.(errorMsg)
      clearMessages()
    }
  }

  // Gérer la sélection de fichier
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImageFile(file)
    }
    // Reset input pour permettre de sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Démarrer la caméra
  const startCamera = async () => {
    try {
      setError(null)
      setIsCapturing(true)

      // Vérifier le support de la caméra
      if (!isCameraSupported()) {
        throw new Error('Caméra non supportée sur cet appareil')
      }

      // Demander l'accès à la caméra avec gestion d'erreurs spécifique
      // Contraintes adaptées pour iPad
      const constraints: MediaStreamConstraints = {
        video: deviceInfo?.isIPad ? {
          facingMode: 'user',
          width: { ideal: 1024, max: 1920 },
          height: { ideal: 768, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        } : {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setShowCamera(true)
      }
    } catch (err: any) {
      let errorMsg = 'Erreur d\'accès à la caméra'
      
      // Messages d'erreur spécifiques avec support iPad
      if (err.name === 'NotAllowedError') {
        if (deviceInfo?.isIPad) {
          errorMsg = 'Accès à la caméra refusé. Sur iPad: Paramètres > Safari > Caméra > Autoriser'
        } else {
          errorMsg = 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres.'
        }
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'Aucune caméra trouvée sur cet appareil.'
      } else if (err.name === 'NotSupportedError') {
        if (deviceInfo?.isIPad) {
          errorMsg = 'Caméra non supportée. Essayez avec Safari ou mettez à jour iPadOS.'
        } else {
          errorMsg = 'Caméra non supportée sur cet appareil.'
        }
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Caméra utilisée par une autre application. Fermez les autres apps utilisant la caméra.'
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = 'Paramètres de caméra non supportés. Essayez avec des paramètres différents.'
      } else if (err.message) {
        errorMsg = err.message
      }

      setError(errorMsg)
      onError?.(errorMsg)
      setIsCapturing(false)
      clearMessages()
    }
  }

  // Arrêter la caméra
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
    setIsCapturing(false)
  }

  // Capturer la photo
  const capturePhoto = () => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Éléments vidéo non disponibles')
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Impossible d\'obtenir le contexte du canvas')
      }

      // Définir la taille du canvas
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Dessiner l'image vidéo sur le canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convertir en base64
      const imageUrl = canvas.toDataURL('image/jpeg', 0.8)
      
      // Sauvegarder l'avatar de façon persistante
      const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
      if (currentUser.email) {
        saveUserAvatar(currentUser.email, imageUrl)
      }
      
      // Arrêter la caméra
      stopCamera()
      
      // Envoyer l'image
      onPhotoCapture(imageUrl)
      setSuccess('Photo capturée avec succès !')
      clearMessages()
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la capture photo'
      setError(errorMsg)
      onError?.(errorMsg)
      clearMessages()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Informations de compatibilité */}
      {showCompatibilityInfo && deviceInfo && (
        <DeviceCompatibility />
      )}

      {/* Messages d'état */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Interface de capture */}
      {!showCamera ? (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Bouton de sélection de fichier */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              id="photo-file-input"
            />
            <label
              htmlFor="photo-file-input"
              className="btn-secondary cursor-pointer inline-flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Choisir un fichier</span>
            </label>
          </div>

          {/* Bouton de caméra (seulement si supporté) */}
          {isCameraSupported() && deviceInfo?.supportsCamera && (
            <button
              onClick={startCamera}
              disabled={isCapturing}
              className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              <span>{isCapturing ? 'Démarrage...' : 'Prendre une photo'}</span>
            </button>
          )}

          {/* Message pour les appareils non compatibles */}
          {!deviceInfo?.supportsCamera && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p>📱 Caméra non disponible sur cet appareil.</p>
              <p>Utilisez "Choisir un fichier" pour ajouter une photo.</p>
            </div>
          )}

          {/* Bouton d'info compatibilité */}
          <button
            onClick={() => setShowCompatibilityInfo(!showCompatibilityInfo)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {showCompatibilityInfo ? 'Masquer' : 'Voir'} les infos de compatibilité
          </button>
        </div>
      ) : (
        /* Interface de caméra */
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              playsInline
              muted
            />
            <button
              onClick={stopCamera}
              className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={capturePhoto}
              className="btn-primary px-6 py-3"
            >
              Capturer
            </button>
            <button
              onClick={stopCamera}
              className="btn-secondary px-6 py-3"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Canvas caché pour la capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Informations sur les formats acceptés */}
      <p className="text-xs text-gray-500">
        Formats acceptés: {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} • 
        Taille max: {maxSizeMB}MB
      </p>
    </div>
  )
}
