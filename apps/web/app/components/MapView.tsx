'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import Link from 'next/link'

// Mali cities with coordinates
const MALI_CITIES = [
  { name: 'Bamako', lat: 12.6392, lng: -8.0029, description: 'Capitale du Mali' },
  { name: 'Sikasso', lat: 11.3175, lng: -5.6664, description: 'Region sud' },
  { name: 'Segou', lat: 13.4317, lng: -5.6794, description: 'Cite des Balanzans' },
  { name: 'Mopti', lat: 14.4843, lng: -4.1870, description: 'Venise du Mali' },
  { name: 'Tombouctou', lat: 16.7666, lng: -3.0026, description: 'Cite historique' },
  { name: 'Kayes', lat: 14.4469, lng: -11.4414, description: 'Region ouest' },
  { name: 'Koutiala', lat: 12.3833, lng: -5.4667, description: 'Centre agricole' },
  { name: 'Gao', lat: 16.2667, lng: -0.0500, description: 'Region nord-est' },
]

interface MapViewProps {
  properties?: { id: string; title: string; city: string; price: number; latitude?: number; longitude?: number }[]
  height?: string
  showCities?: boolean
}

export default function MapView({ properties = [], height = '400px', showCities = true }: MapViewProps) {
  const [MapComponent, setMapComponent] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Dynamic import of Leaflet (SSR-safe)
    Promise.all([
      import('leaflet'),
      import('react-leaflet'),
    ]).then(([L, RL]) => {
      // Fix Leaflet default icon issue with webpack
      delete (L.default.Icon.Default.prototype as any)._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      setMapComponent({ L: L.default, ...RL })
    }).catch(() => {})
  }, [])

  if (!isClient || !MapComponent) {
    // Loading state / SSR fallback
    return (
      <div style={{ height }} className="rounded-2xl bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponent

  // Center on Mali
  const center: [number, number] = [14.0, -5.0]
  const zoom = 6

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        crossOrigin=""
      />
      <div style={{ height }} className="rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow-sm">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Property markers */}
          {properties.map(prop => {
            if (!prop.latitude || !prop.longitude) return null
            return (
              <Marker key={prop.id} position={[prop.latitude, prop.longitude]}>
                <Popup>
                  <div className="text-center p-1">
                    <p className="font-semibold text-sm">{prop.title}</p>
                    <p className="text-xs text-gray-500">{prop.city}</p>
                    <p className="text-sm font-bold text-primary-600 mt-1">{prop.price.toLocaleString('fr-FR')} FCFA/nuit</p>
                    <Link href={`/property/${prop.id}`} className="text-xs text-primary-500 underline mt-1 block">
                      Voir le logement
                    </Link>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* City markers (when no properties) */}
          {showCities && properties.length === 0 && MALI_CITIES.map(city => (
            <Marker key={city.name} position={[city.lat, city.lng]}>
              <Popup>
                <div className="text-center p-1">
                  <p className="font-semibold text-sm">{city.name}</p>
                  <p className="text-xs text-gray-500">{city.description}</p>
                  <Link href={`/search?location=${city.name}`} className="text-xs text-primary-500 underline mt-1 block">
                    Rechercher ici
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  )
}
