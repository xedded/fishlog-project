'use client'

import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps'
import { useState } from 'react'

interface CatchData {
  id: string
  latitude: number
  longitude: number
  location_name: string
  weight: number
  length: number
  caught_at: string
  species: {
    name_swedish: string
    name_latin: string
  }
  notes?: string
}

interface CatchMapProps {
  catches: CatchData[]
  apiKey: string
}

export default function CatchMap({ catches, apiKey }: CatchMapProps) {
  const [selectedCatch, setSelectedCatch] = useState<CatchData | null>(null)

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
              <div className="p-3 max-w-xs bg-white rounded-lg shadow-lg">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {selectedCatch.species.name_swedish}
                </h3>
                <p className="text-sm text-gray-700 italic mb-3">
                  {selectedCatch.species.name_latin}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Vikt:</span>
                    <span className="font-semibold text-gray-900">{selectedCatch.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Längd:</span>
                    <span className="font-semibold text-gray-900">{selectedCatch.length} cm</span>
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
                </div>

                {selectedCatch.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-800 italic bg-gray-50 p-2 rounded">{selectedCatch.notes}</p>
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  )
}