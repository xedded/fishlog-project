'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { useLanguage } from '@/contexts/LanguageContext'
import { detectContinent } from '@/lib/continentDetection'

interface Species {
  id: string
  name_swedish: string
  name_english: string
  name_latin: string
  category: string
  continent: string
}

interface AddCatchFormProps {
  onSuccess: () => void
  onCancel: () => void
  userId: string
  darkMode?: boolean
}

export default function AddCatchForm({ onSuccess, onCancel, userId, darkMode = false }: AddCatchFormProps) {
  const { language } = useLanguage()
  const [species, setSpecies] = useState<Species[]>([])
  const [userRegion, setUserRegion] = useState<string>('Europe')
  const [loading, setLoading] = useState(false)
  const [useMapPicker, setUseMapPicker] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    species_id: '',
    weight: '',
    length: '',
    latitude: '',
    longitude: '',
    location_name: '',
    caught_at: new Date().toISOString().slice(0, 16),
    notes: '',
    quantity: '1'
  })

  useEffect(() => {
    fetchSpecies()
    // Försök hämta nuvarande position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toFixed(6)
          const lon = position.coords.longitude.toFixed(6)

          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon
          }))

          // Detect user region from coordinates
          const region = detectContinent(parseFloat(lat), parseFloat(lon))
          setUserRegion(region)

          // Hämta platsnamn från koordinater
          await fetchLocationName(parseFloat(lat), parseFloat(lon))
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
  }, [userId])

  const fetchLocationName = async (lat: number, lon: number) => {
    try {
      // Använd server-side API route för geocoding
      const response = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`)
      const data = await response.json()

      console.log('Geocoding response:', data)

      if (data.location_name && data.status === 'OK') {
        setFormData(prev => ({
          ...prev,
          location_name: data.location_name
        }))
      } else {
        // Om geocoding failar, låt användaren fylla i manuellt
        console.warn('Geocoding not available, user must enter location manually')
        setFormData(prev => ({
          ...prev,
          location_name: ''
        }))
      }
    } catch (error) {
      console.error('Failed to fetch location name:', error)
      // Låt användaren fylla i manuellt
      setFormData(prev => ({
        ...prev,
        location_name: ''
      }))
    }
  }


  const fetchSpecies = async () => {
    const { data } = await supabase
      .from('species')
      .select('id, name_swedish, name_english, name_latin, category, continent')
      .order('name_english', { ascending: true })

    if (data) setSpecies(data)
  }

  const getSortedSpecies = (): Array<Species | { id: string; name_english: string; disabled: true }> => {
    if (species.length === 0) return []

    // Filter by region but keep alphabetical order
    const regionalSpecies = species
      .filter(s => s.continent === userRegion || s.continent === 'Global')
      .sort((a, b) => {
        const nameA = language === 'en' ? a.name_english : a.name_swedish
        const nameB = language === 'en' ? b.name_english : b.name_swedish
        return nameA.localeCompare(nameB)
      })

    const otherSpecies = species
      .filter(s => s.continent !== userRegion && s.continent !== 'Global')
      .sort((a, b) => {
        const nameA = language === 'en' ? a.name_english : a.name_swedish
        const nameB = language === 'en' ? b.name_english : b.name_swedish
        return nameA.localeCompare(nameB)
      })

    const result: Array<Species | { id: string; name_english: string; disabled: true }> = []

    // Add regional species (alphabetically sorted)
    result.push(...regionalSpecies)

    // Add separator and other species if there are any
    if (otherSpecies.length > 0) {
      result.push({ id: 'separator', name_english: '──────────────', disabled: true })
      result.push(...otherSpecies)
    }

    return result
  }

  const uploadPhotos = async (catchId: string) => {
    if (selectedFiles.length === 0) return

    for (const file of selectedFiles) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('catchId', catchId)
      formData.append('userId', userId)

      try {
        const response = await fetch('/api/upload-photo', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Photo upload failed:', response.status, errorText)
          // Try to parse as JSON if possible
          try {
            const errorJson = JSON.parse(errorText)
            console.error('Error details:', errorJson)
          } catch {
            console.error('Non-JSON error:', errorText)
          }
        } else {
          const result = await response.json()
          console.log('Photo uploaded successfully:', result.photo.id)
        }
      } catch (error) {
        console.error('Photo upload error:', error)
      }
    }
  }

  const saveCatch = async () => {
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
          weather_id: weatherId,
          quantity: formData.quantity ? parseInt(formData.quantity) : 1
        })
        .select()
        .single()

      if (catchError) {
        console.error('Catch insert error:', catchError)
        throw new Error(catchError.message || 'Kunde inte spara fångsten')
      }

      // 4. Upload photos if any
      if (catchData && selectedFiles.length > 0) {
        await uploadPhotos(catchData.id)
      }

      onSuccess()
    } catch (error) {
      console.error('Full error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Okänt fel'
      alert('Fel vid registrering: ' + errorMessage + '\n\nKontrollera att alla fält är korrekt ifyllda.')
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await saveCatch()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Registrera ny fångst</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Art */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Fiskart *
              </label>
              <select
                required
                value={formData.species_id}
                onChange={(e) => setFormData({ ...formData, species_id: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="">Välj art...</option>
                {getSortedSpecies().map((s) => {
                  if ('disabled' in s && s.disabled) {
                    return <option key={s.id} disabled>────────────────</option>
                  }

                  const species = s as Species
                  const displayName = language === 'en' ? species.name_english : species.name_swedish
                  return (
                    <option key={species.id} value={species.id}>
                      {displayName} ({species.name_latin})
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Vikt, Längd och Antal */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Vikt (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="2.5 (eller lämna tom för okänd)"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Längd (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="45.5 (eller lämna tom för okänd)"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Antal
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>

            {/* Platsnamn */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Plats *
              </label>
              <input
                type="text"
                required
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="t.ex. Vänern, Mörrum, eller valfritt namn"
              />
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                Platsnamn hämtas automatiskt från din position, men du kan redigera det
              </p>
            </div>

            {/* Platsväljare */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Position:
                </label>
                <button
                  type="button"
                  onClick={() => setUseMapPicker(!useMapPicker)}
                  className={`text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
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
                        onClick={async (e) => {
                          if (e.detail.latLng) {
                            const lat = e.detail.latLng.lat
                            const lon = e.detail.latLng.lng

                            setFormData({
                              ...formData,
                              latitude: lat.toFixed(6),
                              longitude: lon.toFixed(6)
                            })

                            // Hämta platsnamn för den nya platsen
                            await fetchLocationName(lat, lon)
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
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Klicka på kartan för att välja position</p>
                </div>
              )}

              {/* Koordinater (dolda) */}
              <input type="hidden" value={formData.latitude} />
              <input type="hidden" value={formData.longitude} />
            </div>

            {/* Datum och tid */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Datum och tid *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.caught_at}
                onChange={(e) => setFormData({ ...formData, caught_at: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            {/* Anteckningar */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Anteckningar
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="Bra fiske med wobbler vid gräsbänk..."
              />
            </div>

            {/* Foto-upload */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Foton 📸
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setSelectedFiles(files)
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2`}>
                      <span>📷 {file.name}</span>
                      <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ))}
                </div>
              )}
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                Max 5 MB per fil. Flera bilder kan väljas.
              </p>
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
                onClick={async () => {
                  setLoading(true)

                  try {
                    // Save current catch first
                    await saveCatch()

                    // Reset only species, weight, length, quantity, notes, photos - keep location and time
                    setFormData(prev => ({
                      ...prev,
                      species_id: '',
                      weight: '',
                      length: '',
                      quantity: '1',
                      notes: ''
                    }))
                    setSelectedFiles([])
                  } catch {
                    // Error already handled in saveCatch
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 text-sm"
              >
                Registrera fler här
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium"
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
