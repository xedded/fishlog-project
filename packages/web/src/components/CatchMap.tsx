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
  darkMode?: boolean
}

function MapContent({ catches, onBoundsChange, darkMode }: { catches: CatchData[], onBoundsChange?: (visibleCatches: CatchData[]) => void, darkMode: boolean }) {
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
          <div className={`p-3 max-w-xs rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`font-bold text-lg mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedCatch.species.name_swedish}
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Vikt:</span>
                <span className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedCatch.weight ? `${selectedCatch.weight} kg` : 'Okänd'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Längd:</span>
                <span className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedCatch.length ? `${selectedCatch.length} cm` : 'Okänd'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Plats:</span>
                <span className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>{selectedCatch.location_name}</span>
              </div>
              <div className="flex justify-between">
                <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Datum:</span>
                <span className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {new Date(selectedCatch.caught_at).toLocaleDateString('sv-SE')}
                </span>
              </div>
              {selectedCatch.weather_data && (
                <>
                  <div className="flex justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Väder:</span>
                    <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      {selectedCatch.weather_data.temperature}°C, {selectedCatch.weather_data.weather_desc}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Vind:</span>
                    <span className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedCatch.weather_data.wind_speed} m/s {degreesToCompass(selectedCatch.weather_data.wind_direction)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Lufttryck:</span>
                    <span className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedCatch.weather_data.pressure} hPa
                    </span>
                  </div>
                </>
              )}
            </div>

            {selectedCatch.notes && (
              <div className={`mt-3 pt-3 ${darkMode ? 'border-gray-700' : 'border-gray-300'} border-t`}>
                <p className={`text-xs italic p-2 rounded ${darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-800 bg-gray-50'}`}>{selectedCatch.notes}</p>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  )
}

// Dark mode map styles
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
]

// Convert degrees to compass direction
const degreesToCompass = (degrees: number): string => {
  const directions = ['N', 'NNÖ', 'NÖ', 'ÖNÖ', 'Ö', 'ÖSÖ', 'SÖ', 'SSÖ', 'S', 'SSV', 'SV', 'VSV', 'V', 'VNV', 'NV', 'NNV']
  const index = Math.round(((degrees % 360) / 22.5))
  return directions[index % 16]
}

export default function CatchMap({ catches, apiKey, onBoundsChange, darkMode = false }: CatchMapProps) {
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
          styles={darkMode ? darkMapStyles : undefined}
        >
          <MapContent catches={catches} onBoundsChange={onBoundsChange} darkMode={darkMode} />
        </Map>
      </APIProvider>
    </div>
  )
}