'use client'

import React from 'react'
import { AlertCircle, Smartphone, Monitor, Tablet } from 'lucide-react'

interface DeviceInfo {
  isIOS: boolean
  isIPad: boolean
  isIPhone: boolean
  isSafari: boolean
  userAgent: string
  supportsCamera: boolean
  supportsFileUpload: boolean
}

export const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {
      isIOS: false,
      isIPad: false,
      isIPhone: false,
      isSafari: false,
      userAgent: '',
      supportsCamera: false,
      supportsFileUpload: false
    }
  }

  const userAgent = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(userAgent)
  const isIPad = /iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isIPhone = /iPhone/.test(userAgent)
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
  
  // Vérifier le support de la caméra
  const supportsCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  
  // Vérifier le support de l'upload de fichiers
  const supportsFileUpload = !!(window.File && window.FileReader && window.FileList && window.Blob)

  return {
    isIOS,
    isIPad,
    isIPhone,
    isSafari,
    userAgent,
    supportsCamera,
    supportsFileUpload
  }
}

interface DeviceCompatibilityProps {
  onCompatibilityCheck?: (info: DeviceInfo) => void
}

export default function DeviceCompatibility({ onCompatibilityCheck }: DeviceCompatibilityProps) {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo | null>(null)

  React.useEffect(() => {
    const info = getDeviceInfo()
    setDeviceInfo(info)
    onCompatibilityCheck?.(info)
  }, [onCompatibilityCheck])

  if (!deviceInfo) return null

  const getDeviceIcon = () => {
    if (deviceInfo.isIPad) return <Tablet className="h-5 w-5" />
    if (deviceInfo.isIPhone) return <Smartphone className="h-5 w-5" />
    return <Monitor className="h-5 w-5" />
  }

  const getDeviceName = () => {
    if (deviceInfo.isIPad) return 'iPad'
    if (deviceInfo.isIPhone) return 'iPhone'
    if (deviceInfo.isIOS) return 'Appareil iOS'
    return 'Appareil'
  }

  const hasIssues = !deviceInfo.supportsCamera || !deviceInfo.supportsFileUpload

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getDeviceIcon()}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-900">
            Compatibilité {getDeviceName()}
          </h4>
          <div className="mt-2 space-y-1 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${deviceInfo.supportsFileUpload ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>Upload de fichiers: {deviceInfo.supportsFileUpload ? 'Supporté' : 'Non supporté'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${deviceInfo.supportsCamera ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>Caméra: {deviceInfo.supportsCamera ? 'Supportée' : 'Non supportée'}</span>
            </div>
          </div>
          
          {hasIssues && (
            <div className="mt-3 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-700">
                <p className="font-medium">Recommandations:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  {!deviceInfo.supportsFileUpload && (
                    <li>Mettez à jour votre navigateur pour l'upload de fichiers</li>
                  )}
                  {!deviceInfo.supportsCamera && (
                    <li>Utilisez l'option "Choisir un fichier" pour ajouter des photos</li>
                  )}
                  {deviceInfo.isIPad && (
                    <li>Assurez-vous d'autoriser l'accès à la caméra dans les paramètres Safari</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook utilitaire pour utiliser les informations de l'appareil
export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo | null>(null)

  React.useEffect(() => {
    setDeviceInfo(getDeviceInfo())
  }, [])

  return deviceInfo
}
