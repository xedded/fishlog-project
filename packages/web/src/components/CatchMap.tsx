'use client'

import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps'
import { useState, useEffect } from 'react'
import { Fish, Flame } from 'lucide-react'
import { Catch } from '@/types/catch'

interface CatchMapProps {
  catches: Catch[]
  apiKey: string
  onBoundsChange?: (visibleCatches: Catch[]) => void
  darkMode?: boolean
  showHeatmap?: boolean
}

function MapContent({ catches, onBoundsChange, darkMode, showHeatmap }: { catches: Catch[], onBoundsChange?: (visibleCatches: Catch[]) => void, darkMode: boolean, showHeatmap: boolean }) {
  const map = useMap()
  const [selectedCatch, setSelectedCatch] = useState<Catch | null>(null)
  const [heatmapLayer, setHeatmapLayer] = useState<google.maps.visualization.HeatmapLayer | null>(null)

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

      // Lyssna på klick på kartan för att stänga InfoWindow
      const clickListener = map.addListener('click', () => {
        setSelectedCatch(null)
      })

      return () => {
        clearTimeout(timer)
        if (listener) {
          google.maps.event.removeListener(listener)
        }
        if (clickListener) {
          google.maps.event.removeListener(clickListener)
        }
      }
    }
  }, [map, catches]) // eslint-disable-line react-hooks/exhaustive-deps

  // Heatmap effect
  useEffect(() => {
    if (!map || !showHeatmap) {
      // Remove heatmap if it exists
      if (heatmapLayer) {
        heatmapLayer.setMap(null)
        setHeatmapLayer(null)
      }
      return
    }

    // Create heatmap data
    const heatmapData = catches.map(c => ({
      location: new google.maps.LatLng(c.latitude, c.longitude),
      weight: c.quantity || 1
    }))

    // Create or update heatmap layer
    if (heatmapLayer) {
      heatmapLayer.setData(heatmapData)
    } else {
      const newHeatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        radius: 30,
        opacity: 0.6,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      })
      newHeatmap.setMap(map)
      setHeatmapLayer(newHeatmap)
    }

    return () => {
      if (heatmapLayer) {
        heatmapLayer.setMap(null)
      }
    }
  }, [map, showHeatmap, catches]) // eslint-disable-line react-hooks/exhaustive-deps

  // Get color based on species category
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Rovfisk': '#EF4444', // red
      'Öring/Lax': '#8B5CF6', // purple
      'Saltvattensfisk': '#3B82F6', // blue
      'Karpfisk': '#F59E0B', // yellow
      'Vitfisk': '#10B981', // green
    }
    return colors[category] || '#6B7280' // gray default
  }

  return (
    <>
      {!showHeatmap && catches.map((catch_item) => (
        <AdvancedMarker
          key={catch_item.id}
          position={{ lat: catch_item.latitude, lng: catch_item.longitude }}
          onClick={() => setSelectedCatch(catch_item)}
          title={`${catch_item.species.name_swedish} - ${catch_item.location_name}`}
        >
          <div
            className="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
            style={{
              backgroundColor: getCategoryColor(catch_item.species.category),
              border: '3px solid white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Fish className="w-5 h-5 text-white" />
          </div>
        </AdvancedMarker>
      ))}

      {selectedCatch && (
        <InfoWindow
          position={{ lat: selectedCatch.latitude, lng: selectedCatch.longitude }}
          onCloseClick={() => setSelectedCatch(null)}
          headerDisabled
        >
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 min-w-[250px]`}>
            <h3 className={`font-bold text-base mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedCatch.species.name_swedish}
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-3">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vikt:</span>
                <span className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedCatch.weight ? `${selectedCatch.weight} kg` : 'Okänd'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Längd:</span>
                <span className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedCatch.length ? `${selectedCatch.length} cm` : 'Okänd'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Plats:</span>
                <span className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>{selectedCatch.location_name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Datum:</span>
                <span className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {new Date(selectedCatch.caught_at).toLocaleDateString('sv-SE')}
                </span>
              </div>
              {selectedCatch.weather_data && (
                <>
                  <div className="flex justify-between gap-3">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Väder:</span>
                    <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      {selectedCatch.weather_data.temperature}°C, {selectedCatch.weather_data.weather_desc}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vind:</span>
                    <span className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {selectedCatch.weather_data.wind_speed} m/s {degreesToCompass(selectedCatch.weather_data.wind_direction)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {selectedCatch.notes && (
              <div className={`mt-2 pt-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'} border-t`}>
                <p className={`text-xs italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedCatch.notes}</p>
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

export default function CatchMap({ catches, apiKey, onBoundsChange, darkMode = false, showHeatmap = false }: CatchMapProps) {
  // Beräkna center baserat på fångster
  const center = catches.length > 0 ? {
    lat: catches.reduce((sum, c) => sum + c.latitude, 0) / catches.length,
    lng: catches.reduce((sum, c) => sum + c.longitude, 0) / catches.length
  } : { lat: 59.3293, lng: 18.0686 } // Stockholm som default


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
      <APIProvider apiKey={apiKey} libraries={['visualization']}>
        <Map
          defaultCenter={center}
          defaultZoom={6}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId="fishlog-map"
          styles={darkMode ? darkMapStyles : undefined}
        >
          <MapContent catches={catches} onBoundsChange={onBoundsChange} darkMode={darkMode} showHeatmap={showHeatmap} />
        </Map>
      </APIProvider>
    </div>
  )
}