'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Catch } from '@/types/catch'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { useLanguage } from '@/contexts/LanguageContext'
import { detectContinent } from '@/lib/continentDetection'
import imageCompression from 'browser-image-compression'
import { X } from 'lucide-react'

interface Species {
  id: string
  name_swedish: string
  name_english: string
  name_latin: string
  category: string
  continent: string
}

interface EditCatchFormProps {
  catchData: Catch
  onSuccess: () => void
  onCancel: () => void
  darkMode?: boolean
}

export default function EditCatchForm({ catchData, onSuccess, onCancel, darkMode = false }: EditCatchFormProps) {
  const { language } = useLanguage()
  const [species, setSpecies] = useState<Species[]>([])
  const [userRegion, setUserRegion] = useState<string>('Europe')
  const [loading, setLoading] = useState(false)
  const [useMapPicker, setUseMapPicker] = useState(false)
  const [existingPhotos, setExistingPhotos] = useState(catchData.photos || [])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    species_id: catchData.species_id,
    weight: catchData.weight?.toString() || '',
    length: catchData.length?.toString() || '',
    quantity: catchData.quantity?.toString() || '1',
    latitude: catchData.latitude.toString(),
    longitude: catchData.longitude.toString(),
    location_name: catchData.location_name,
    caught_at: new Date(catchData.caught_at).toISOString().slice(0, 16),
    notes: catchData.notes || ''
  })

  useEffect(() => {
    fetchSpecies()

    // Detect user region from existing catch coordinates
    const region = detectContinent(catchData.latitude, catchData.longitude)
    setUserRegion(region)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catchData.user_id])

  const fetchLocationName = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`)
      const data = await response.json()

      if (data.location_name && data.status === 'OK') {
        setFormData(prev => ({
          ...prev,
          location_name: data.location_name
        }))
      }
    } catch (error) {
      console.error('Failed to fetch location name:', error)
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

  const deletePhoto = async (photoId: string, filePath: string) => {
    try {
      const response = await fetch('/api/upload-photo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, filePath })
      })

      if (!response.ok) {
        throw new Error('Failed to delete photo')
      }

      // Remove from local state
      setExistingPhotos(existingPhotos.filter(p => p.id !== photoId))
    } catch (error) {
      console.error('Photo delete error:', error)
      alert('Kunde inte radera foto')
    }
  }

  const uploadPhotos = async (catchId: string) => {
    if (selectedFiles.length === 0) return

    for (const file of selectedFiles) {
      try {
        // Compress image before upload - more aggressive settings
        const options = {
          maxSizeMB: 0.5, // Max 500KB
          maxWidthOrHeight: 1200, // Max dimension 1200px
          useWebWorker: true,
          fileType: 'image/jpeg',
          initialQuality: 0.7 // Lower quality for smaller size
        }

        console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)
        const compressedFile = await imageCompression(file, options)
        console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`)

        const formData = new FormData()
        formData.append('file', compressedFile)
        formData.append('catchId', catchId)
        formData.append('userId', catchData.user_id)

        const response = await fetch('/api/upload-photo', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Photo upload failed:', response.status, errorText)
        } else {
          const result = await response.json()
          console.log('Photo uploaded successfully:', result.photo.id)
        }
      } catch (error) {
        console.error('Photo upload error:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('catches')
        .update({
          species_id: formData.species_id,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          length: formData.length ? parseFloat(formData.length) : null,
          quantity: formData.quantity ? parseInt(formData.quantity) : 1,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          location_name: formData.location_name,
          caught_at: formData.caught_at,
          notes: formData.notes || null
        })
        .eq('id', catchData.id)

      if (error) {
        console.error('Update error:', error)
        throw new Error(error.message || 'Kunde inte uppdatera fångsten')
      }

      // Upload new photos if any
      if (selectedFiles.length > 0) {
        await uploadPhotos(catchData.id)
      }

      onSuccess()
    } catch (error) {
      console.error('Full error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Okänt fel'
      alert('Fel vid uppdatering: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Redigera fångst</h2>

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  placeholder="2.5"
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
                  placeholder="45.5"
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
                placeholder="t.ex. Vänern, Mörrum"
              />
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
                  {useMapPicker ? '📍 Dölj karta' : '🗺️ Välj på karta'}
                </button>
              </div>

              {useMapPicker && (
                <div className="mb-3">
                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                    <div className="h-64 rounded-md overflow-hidden border border-gray-300">
                      <Map
                        defaultCenter={{
                          lat: parseFloat(formData.latitude),
                          lng: parseFloat(formData.longitude)
                        }}
                        defaultZoom={10}
                        mapId="edit-catch-map"
                        onClick={async (e) => {
                          if (e.detail.latLng) {
                            const lat = e.detail.latLng.lat
                            const lon = e.detail.latLng.lng

                            setFormData({
                              ...formData,
                              latitude: lat.toFixed(6),
                              longitude: lon.toFixed(6)
                            })

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
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Klicka på kartan för att ändra position</p>
                </div>
              )}
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

            {/* Befintliga foton */}
            {existingPhotos.length > 0 && (
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Befintliga foton
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {existingPhotos.map((photo) => {
                    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catch-photos/${photo.file_path}`
                    return (
                      <div key={photo.id} className="relative group">
                        <img
                          src={publicUrl}
                          className="w-full h-24 object-cover rounded-lg"
                          alt="Catch photo"
                        />
                        <button
                          type="button"
                          onClick={() => deletePhoto(photo.id, photo.file_path)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Ladda upp nya foton */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Lägg till foton
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFiles(Array.from(e.target.files))
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              {selectedFiles.length > 0 && (
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedFiles.length} fil(er) valda
                </p>
              )}
            </div>

            {/* Knappar */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Uppdaterar...' : 'Spara ändringar'}
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
