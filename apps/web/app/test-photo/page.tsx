'use client'

import React, { useState } from 'react'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import PhotoCapture from '../components/PhotoCapture'
import DeviceCompatibility from '../components/DeviceCompatibility'

export default function TestPhotoPage() {
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({})

  const handlePhotoCapture = (photoUrl: string) => {
    setCapturedPhotos(prev => [...prev, photoUrl])
    setTestResults(prev => ({ ...prev, photoCapture: true }))
  }

  const handleError = (error: string) => {
    setErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: ${error}`])
    setTestResults(prev => ({ ...prev, errorHandling: true }))
  }

  const runCompatibilityTest = () => {
    setTestResults(prev => ({ ...prev, compatibility: true }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <a href="/dashboard" className="flex items-center text-gray-600 hover:text-primary-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au dashboard
            </a>
            <h1 className="ml-6 text-xl font-semibold text-gray-900">Test Photo - iPad Compatibility</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Résultats des tests */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Résultats des tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              {testResults.compatibility ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <span className="text-sm">Test de compatibilité</span>
            </div>
            <div className="flex items-center space-x-2">
              {testResults.photoCapture ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <span className="text-sm">Capture de photo</span>
            </div>
            <div className="flex items-center space-x-2">
              {testResults.errorHandling ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <span className="text-sm">Gestion d'erreurs</span>
            </div>
          </div>
        </div>

        {/* Test de compatibilité */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">1. Test de compatibilité de l'appareil</h2>
          <DeviceCompatibility onCompatibilityCheck={runCompatibilityTest} />
        </div>

        {/* Test de capture photo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">2. Test de capture photo</h2>
          <p className="text-gray-600 mb-4">
            Testez la fonctionnalité de capture photo qui causait le crash sur iPad.
          </p>
          <PhotoCapture
            onPhotoCapture={handlePhotoCapture}
            onError={handleError}
            maxSizeMB={5}
            acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
          />
        </div>

        {/* Photos capturées */}
        {capturedPhotos.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Photos capturées ({capturedPhotos.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {capturedPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Journal des erreurs */}
        {errors.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
              Journal des erreurs ({errors.length})
            </h2>
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions pour les tests */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions de test pour iPad</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Vérifiez que les informations de compatibilité s'affichent correctement</li>
            <li>Testez l'upload de fichier avec "Choisir un fichier"</li>
            <li>Si disponible, testez la capture avec "Prendre une photo"</li>
            <li>Vérifiez que les erreurs sont gérées gracieusement (pas de crash)</li>
            <li>Confirmez que les photos s'affichent après capture/upload</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
