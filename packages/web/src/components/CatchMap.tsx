'use client'

import { APIProvider, Map, Marker, InfoWindow, useMap } from '@vis.gl/react-google-maps'
import { useState, useEffect } from 'react'

interface CatchData {
  id: string
  latitude: number
  longitude: number
  location_name: string
  weight: number | null
  length: number | null
  caught_at: string
  species: {
    name_swedish: string
    name_latin: string
    category: string
  }
  weather_data?: {
    temperature: number
    weather_desc: string
    wind_speed: number
    wind_direction: number
    pressure: number
    humidity: number
  }
  notes?: string
}

interface CatchMapProps {
  catches: CatchData[]
  apiKey: string
  onBoundsChange?: (visibleCatches: CatchData[]) => void
}

function MapContent({ catches, onBoundsChange }: { catches: CatchData[], onBoundsChange?: (visibleCatches: CatchData[]) => void }) {
  const map = useMap()
  const [selectedCatch, setSelectedCatch] = useState<CatchData | null>(null)

  // Funktion för att kolla vilka fångster som är synliga
  const updateVisibleCatches = () => {
    if (!map || !onBoundsChange) return

    const bounds = map.getBounds()
    if (!bounds) return

    const visibleCatches = catches.filter(catch_item => {
      const pos = new google.maps.LatLng(catch_item.latitude, catch_item.longitude)
      return bounds.contains(pos)
    })

    onBoundsChange(visibleCatches)
  }

  // Initial update när kartan laddas och när bounds ändras
  useEffect(() => {
    if (map && onBoundsChange) {
      // Ge kartan lite tid att ladda
      const timer = setTimeout(() => {
        updateVisibleCatches()
      }, 100)

      // Lyssna på bounds_changed event
      const listener = map.addListener('bounds_changed', () => {
        updateVisibleCatches()
      })

      return () => {
        clearTimeout(timer)
        if (listener) {
          google.maps.event.removeListener(listener)
        }
      }
    }
  }, [map, catches]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {catches.map((catch_item) => (
        <Marker
          key={catch_item.id}
          position={{ lat: catch_item.latitude, lng: catch_item.longitude }}
          onClick={() => setSelectedCatch(catch_item)}
          title={`${catch_item.species.name_swedish} - ${catch_item.location_name}`}
        />
      ))}

      {selectedCatch && (
        <InfoWindow
          position={{ lat: selectedCatch.latitude, lng: selectedCatch.longitude }}
          onCloseClick={() => setSelectedCatch(null)}
        >
          <div className="p-2 max-w-xs bg-white rounded-lg shadow-lg">
            <h3 className="font-bold text-lg text-gray-900 mb-3">
              {selectedCatch.species.name_swedish}
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Vikt:</span>
                <span className="font-semibold text-gray-900">
                  {selectedCatch.weight ? `${selectedCatch.weight} kg` : 'Okänd'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Längd:</span>
                <span className="font-semibold text-gray-900">
                  {selectedCatch.length ? `${selectedCatch.length} cm` : 'Okänd'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Plats:</span>
                <span className="font-semibold text-blue-700">{selectedCatch.location_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Datum:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(selectedCatch.caught_at).toLocaleDateString('sv-SE')}
                </span>
              </div>
              {selectedCatch.weather_data && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Väder:</span>
                    <span className="font-semibold text-green-700">
                      {selectedCatch.weather_data.temperature}°C, {selectedCatch.weather_data.weather_desc}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Vind:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedCatch.weather_data.wind_speed} m/s, {selectedCatch.weather_data.wind_direction}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Lufttryck:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedCatch.weather_data.pressure} hPa
                    </span>
                  </div>
                </>
              )}
            </div>

            {selectedCatch.notes && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-xs text-gray-800 italic bg-gray-50 p-2 rounded">{selectedCatch.notes}</p>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  )
}

export default function CatchMap({ catches, apiKey, onBoundsChange }: CatchMapProps) {
  // Beräkna center baserat på fångster
  const center = catches.length > 0 ? {
    lat: catches.reduce((sum, c) => sum + c.latitude, 0) / catches.length,
    lng: catches.reduce((sum, c) => sum + c.longitude, 0) / catches.length
  } : { lat: 59.3293, lng: 18.0686 } // Stockholm som default

  // Marker color function (not used yet but will be for future features)
  // const getMarkerColor = (species: string) => {
  //   const colors: { [key: string]: string } = {
  //     'Gädda': '#10B981', // green
  //     'Abborre': '#F59E0B', // yellow
  //     'Öring': '#8B5CF6', // purple
  //     'Gös': '#3B82F6', // blue
  //     'Lax': '#EF4444', // red
  //     'Torsk': '#6B7280', // gray
  //     'Makrill': '#06B6D4', // cyan
  //   }
  //   return colors[species] || '#6B7280'
  // }

  if (!apiKey) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Google Maps API-nyckel krävs</p>
          <p className="text-sm text-gray-500">Konfigurera NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden shadow-lg">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={6}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId="fishlog-map"
        >
          <MapContent catches={catches} onBoundsChange={onBoundsChange} />
        </Map>
      </APIProvider>
    </div>
  )
}