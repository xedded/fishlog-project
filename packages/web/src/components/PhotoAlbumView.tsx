'use client'

import { useState, useMemo } from 'react'
import { Catch } from '@/types/catch'
import { useLanguage } from '@/contexts/LanguageContext'
import { Camera, X, Filter, Calendar, Fish as FishIcon } from 'lucide-react'

interface PhotoAlbumViewProps {
  catches: Catch[]
  darkMode?: boolean
  onPhotoClick?: (photoUrl: string) => void
}

export default function PhotoAlbumView({ catches, darkMode = false, onPhotoClick }: PhotoAlbumViewProps) {
  const { language } = useLanguage()
  const [filterSpecies, setFilterSpecies] = useState<string>('')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')

  // Get all photos with catch context
  const allPhotos = useMemo(() => {
    const photos: Array<{
      url: string
      catchId: string
      speciesName: string
      speciesId: string
      date: string
      location: string
      weight: number | null
      length: number | null
    }> = []

    catches.forEach(catchItem => {
      if (catchItem.photos && catchItem.photos.length > 0) {
        catchItem.photos.forEach(photo => {
          const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catch-photos/${photo.file_path}`
          photos.push({
            url: publicUrl,
            catchId: catchItem.id,
            speciesName: language === 'en' ? catchItem.species.name_english : catchItem.species.name_swedish,
            speciesId: catchItem.species_id,
            date: catchItem.caught_at,
            location: catchItem.location_name,
            weight: catchItem.weight,
            length: catchItem.length
          })
        })
      }
    })

    return photos
  }, [catches, language])

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter(photo => {
      if (filterSpecies && photo.speciesId !== filterSpecies) return false

      const photoDate = new Date(photo.date)
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom)
        if (photoDate < fromDate) return false
      }
      if (filterDateTo) {
        const toDate = new Date(filterDateTo)
        toDate.setHours(23, 59, 59, 999)
        if (photoDate > toDate) return false
      }

      return true
    })
  }, [allPhotos, filterSpecies, filterDateFrom, filterDateTo])

  // Get unique species
  const uniqueSpecies = useMemo(() => {
    const speciesMap = new Map<string, { id: string; name: string }>()
    catches.forEach(catchItem => {
      if (!speciesMap.has(catchItem.species_id)) {
        speciesMap.set(catchItem.species_id, {
          id: catchItem.species_id,
          name: language === 'en' ? catchItem.species.name_english : catchItem.species.name_swedish
        })
      }
    })
    return Array.from(speciesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [catches, language])

  const clearFilters = () => {
    setFilterSpecies('')
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  const hasActiveFilters = filterSpecies || filterDateFrom || filterDateTo

  if (allPhotos.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 text-center`}>
        <Camera className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {language === 'en' ? 'No photos yet - add photos to your catches!' : 'Inga foton än - lägg till foton på dina fångster!'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Filter:
            </span>
          </div>

          <div className="flex flex-wrap gap-3 flex-1">
            {/* Species filter */}
            {uniqueSpecies.length > 0 && (
              <select
                value={filterSpecies}
                onChange={(e) => setFilterSpecies(e.target.value)}
                className={`px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">{language === 'en' ? 'All species' : 'Alla arter'}</option>
                {uniqueSpecies.map(species => (
                  <option key={species.id} value={species.id}>
                    {species.name}
                  </option>
                ))}
              </select>
            )}

            {/* Date from */}
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className={`px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />

            {/* Date to */}
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className={`px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <X className="w-3 h-3" />
                <span>{language === 'en' ? 'Clear' : 'Rensa'}</span>
              </button>
            )}
          </div>

          {/* Photo count */}
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredPhotos.length} {language === 'en' ? 'photos' : 'foton'}
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredPhotos.map((photo, index) => (
          <div
            key={index}
            className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            } hover:shadow-lg transition-shadow`}
            onClick={() => onPhotoClick?.(photo.url)}
          >
            <img
              src={photo.url}
              alt={photo.speciesName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p className="font-semibold text-sm truncate">{photo.speciesName}</p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <FishIcon className="w-3 h-3" />
                  {photo.weight && <span>{photo.weight} kg</span>}
                  {photo.length && <span>{photo.length} cm</span>}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(photo.date).toLocaleDateString(language === 'en' ? 'en-US' : 'sv-SE')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
