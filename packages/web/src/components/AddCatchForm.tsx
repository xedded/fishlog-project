'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'

interface Species {
  id: string
  name_swedish: string
  name_latin: string
}

interface AddCatchFormProps {
  onSuccess: () => void
  onCancel: () => void
  userId: string
}

export default function AddCatchForm({ onSuccess, onCancel, userId }: AddCatchFormProps) {
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(false)
  const [useMapPicker, setUseMapPicker] = useState(false)
  const [formData, setFormData] = useState({
    species_id: '',
    weight: '',
    length: '',
    latitude: '',
    longitude: '',
    location_name: '',
    caught_at: new Date().toISOString().slice(0, 16),
    notes: ''
  })

  useEffect(() => {
    fetchSpecies()
    // Försök hämta nuvarande position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }))
        },
        (error) => {
          console.log('Geolocation error:', error)
          // Fallback till Sverige-centrum om geolocation misslyckas
          setFormData(prev => ({
            ...prev,
            latitude: '62.0',
            longitude: '15.0'
          }))
        }
      )
    }
  }, [])

  const fetchSpecies = async () => {
    const { data } = await supabase
      .from('species')
      .select('id, name_swedish, name_latin')
      .order('name_swedish')

    if (data) setSpecies(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Fetch weather data
      const weatherUrl = `/api/weather?lat=${formData.latitude}&lon=${formData.longitude}&timestamp=${new Date(formData.caught_at).toISOString()}`
      console.log('Fetching weather from:', weatherUrl)
      const weatherResponse = await fetch(weatherUrl)
      let weatherData = null

      if (weatherResponse.ok) {
        weatherData = await weatherResponse.json()
        console.log('Weather data received:', weatherData)
      } else {
        console.warn('Could not fetch weather data:', weatherResponse.status, weatherResponse.statusText)
        const errorText = await weatherResponse.text()
        console.error('Weather API error response:', errorText)
      }

      // 2. Insert weather data first if available
      let weatherId = null
      if (weatherData && weatherData.temperature !== null) {
        console.log('Attempting to insert weather data:', weatherData)
        const { data: insertedWeather, error: weatherError } = await supabase
          .from('weather_data')
          .insert({
            temperature: weatherData.temperature,
            weather_desc: weatherData.weather_desc,
            pressure: weatherData.pressure,
            humidity: weatherData.humidity,
            wind_speed: weatherData.wind_speed,
            wind_direction: weatherData.wind_direction,
            recorded_at: formData.caught_at
          })
          .select()
          .single()

        if (weatherError) {
          console.error('Weather data insert error:', weatherError)
        } else {
          console.log('Weather data inserted successfully:', insertedWeather)
          weatherId = insertedWeather.id
        }
      } else {
        console.log('Weather data not available or invalid:', weatherData)
      }

      // 3. Insert catch with weather_id reference
      const { data: catchData, error: catchError } = await supabase
        .from('catches')
        .insert({
          user_id: userId,
          species_id: formData.species_id,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          length: formData.length ? parseFloat(formData.length) : null,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          location_name: formData.location_name,
          caught_at: formData.caught_at,
          notes: formData.notes || null,
          weather_id: weatherId
        })
        .select()
        .single()

      if (catchError) throw catchError

      onSuccess()
    } catch (error) {
      alert('Fel vid registrering: ' + (error instanceof Error ? error.message : 'Okänt fel'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrera ny fångst</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Art */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiskart *
              </label>
              <select
                required
                value={formData.species_id}
                onChange={(e) => setFormData({ ...formData, species_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Välj art...</option>
                {species.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_swedish} ({s.name_latin})
                  </option>
                ))}
              </select>
            </div>

            {/* Vikt och Längd */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vikt (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="2.5 (eller lämna tom för okänd)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Längd (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="45.5 (eller lämna tom för okänd)"
                />
              </div>
            </div>

            {/* Platsnamn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plats *
              </label>
              <input
                type="text"
                required
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Vänern - Kållandsö"
              />
            </div>

            {/* Platsväljare */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Position:
                </label>
                <button
                  type="button"
                  onClick={() => setUseMapPicker(!useMapPicker)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {useMapPicker ? '📍 Använd automatisk plats' : '🗺️ Välj på karta'}
                </button>
              </div>

              {useMapPicker && (
                <div className="mb-3">
                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                    <div className="h-64 rounded-md overflow-hidden border border-gray-300">
                      <Map
                        defaultCenter={{
                          lat: parseFloat(formData.latitude) || 62.0,
                          lng: parseFloat(formData.longitude) || 15.0
                        }}
                        defaultZoom={6}
                        mapId="add-catch-map"
                        onClick={(e) => {
                          if (e.detail.latLng) {
                            setFormData({
                              ...formData,
                              latitude: e.detail.latLng.lat.toFixed(6),
                              longitude: e.detail.latLng.lng.toFixed(6)
                            })
                          }
                        }}
                      >
                        {formData.latitude && formData.longitude && (
                          <AdvancedMarker
                            position={{
                              lat: parseFloat(formData.latitude),
                              lng: parseFloat(formData.longitude)
                            }}
                          />
                        )}
                      </Map>
                    </div>
                  </APIProvider>
                  <p className="text-xs text-gray-600 mt-1">Klicka på kartan för att välja position</p>
                </div>
              )}

              {/* Koordinater (visas alltid, disabled om map picker används) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Latitud *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    disabled={useMapPicker}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-600"
                    placeholder="59.329323"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Longitud *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    disabled={useMapPicker}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-600"
                    placeholder="18.068581"
                  />
                </div>
              </div>
            </div>

            {/* Datum och tid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum och tid *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.caught_at}
                onChange={(e) => setFormData({ ...formData, caught_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Anteckningar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anteckningar
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Bra fiske med wobbler vid gräsbänk..."
              />
            </div>

            {/* Knappar */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Sparar...' : 'Spara fångst'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
