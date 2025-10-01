'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import CatchMap from './CatchMap'
import AddCatchForm from './AddCatchForm'
import {
  Sun,
  Moon,
  LogOut,
  Plus,
  Grid3x3,
  List,
  ArrowUpDown,
  MapPin,
  Calendar,
  Ruler,
  Weight,
  Trash2,
  Fish,
  Wind,
  Gauge,
  StickyNote,
  CloudRain,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface Catch {
  id: string
  weight: number | null
  length: number | null
  latitude: number
  longitude: number
  location_name: string
  caught_at: string
  notes?: string
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
}

// Convert degrees to compass direction
const degreesToCompass = (degrees: number): string => {
  const directions = ['N', 'NNÖ', 'NÖ', 'ÖNÖ', 'Ö', 'ÖSÖ', 'SÖ', 'SSÖ', 'S', 'SSV', 'SV', 'VSV', 'V', 'VNV', 'NV', 'NNV']
  const index = Math.round(((degrees % 360) / 22.5))
  return directions[index % 16]
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [catches, setCatches] = useState<Catch[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fishlog-darkmode')
      return saved ? JSON.parse(saved) : true
    }
    return true
  })
  const [sortBy, setSortBy] = useState<'date' | 'species' | 'weight' | 'length'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [visibleCatches, setVisibleCatches] = useState<Catch[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [userProfile, setUserProfile] = useState<{
    id: string
    email: string
    profile_name: string
    avatar_url?: string
  } | null>(null)

  // Save darkMode to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fishlog-darkmode', JSON.stringify(darkMode))
    }
  }, [darkMode])

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const handleColumnSort = (column: 'date' | 'species' | 'weight' | 'length') => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new column and default to descending
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const SortIcon = ({ column }: { column: 'date' | 'species' | 'weight' | 'length' }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
  }

  useEffect(() => {
    if (user) {
      fetchCatches()
      fetchUserProfile()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single()

    if (data) {
      setUserProfile(data)
    }
  }

  const fetchCatches = async () => {
    console.log('Fetching catches for user:', user?.id)
    const { data, error } = await supabase
      .from('catches')
      .select(`
        *,
        species (name_swedish, name_latin, category),
        weather_data (temperature, weather_desc, wind_speed, wind_direction, pressure, humidity)
      `)
      .eq('user_id', user?.id)

    if (error) {
      console.error('Error fetching catches:', error)
    } else {
      console.log('Fetched catches:', data?.length || 0, 'items')
      setCatches(data || [])
    }
    setLoading(false)
  }

  const sortCatches = (catches: Catch[]) => {
    const sorted = [...catches].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.caught_at).getTime() - new Date(b.caught_at).getTime()
          break
        case 'species':
          comparison = a.species.name_swedish.localeCompare(b.species.name_swedish, 'sv')
          break
        case 'weight':
          comparison = (a.weight || 0) - (b.weight || 0)
          break
        case 'length':
          comparison = (a.length || 0) - (b.length || 0)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }

  const loadSampleData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data: existingCatches } = await supabase
        .from('catches')
        .select('id')
        .eq('user_id', user.id)

      if (existingCatches && existingCatches.length > 0) {
        alert('Du har redan fångster! Ta bort dem först eller logga in med nytt konto.')
        setLoading(false)
        return
      }

      const { data: species } = await supabase
        .from('species')
        .select('*')
        .limit(10)

      if (!species || species.length === 0) {
        alert('Inga fiskarter hittades i databasen.')
        setLoading(false)
        return
      }

      const sampleCatches = [
        { species: 'Gädda', weight: 4.2, length: 68.5, location: 'Vänern - Kållandsö', notes: 'Fantastisk gädda på wobbler vid gräsbänk!' },
        { species: 'Abborre', weight: 0.8, length: 25.3, location: 'Stockholms skärgård - Sandhamn', notes: 'Fin abborre på jig vid stengrund' },
        { species: 'Öring', weight: 1.6, length: 42.1, location: 'Vättern - Visingsö', notes: 'Vacker öring på spinnare i gryningen' },
        { species: 'Gös', weight: 2.8, length: 55.7, location: 'Vänern - Kållandsö', notes: 'Gös på jigg vid 8 meters djup' },
        { species: 'Lax', weight: 6.5, length: 78.2, location: 'Mörrum - Laxfiske', notes: 'Stor lax på flugfiske! Kamp på 15 minuter.' },
        { species: 'Gädda', weight: 2.1, length: 52.3, location: 'Siljan - Rättvik', notes: 'Mindre gädda men fin fisk på spoon' }
      ]

      for (let i = 0; i < sampleCatches.length; i++) {
        const catchData = sampleCatches[i]
        const matchingSpecies = species.find(s => s.name_swedish === catchData.species) || species[0]

        await supabase
          .from('catches')
          .insert({
            user_id: user.id,
            species_id: matchingSpecies.id,
            weight: catchData.weight,
            length: catchData.length,
            latitude: 58.5923 + (Math.random() - 0.5) * 0.1,
            longitude: 13.0813 + (Math.random() - 0.5) * 0.1,
            location_name: catchData.location,
            caught_at: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
            notes: catchData.notes
          })
      }

      await fetchCatches()
      alert('Provdata laddad! 🎣')
    } catch (error) {
      alert('Ett fel uppstod: ' + (error instanceof Error ? error.message : 'Okänt fel'))
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleAddCatch = () => {
    setShowAddForm(true)
  }

  const handleAddSuccess = () => {
    setShowAddForm(false)
    fetchCatches()
  }

  const handleDeleteCatch = async (catchId: string) => {
    if (!confirm('Är du säker på att du vill radera denna fångst?')) {
      return
    }

    const { error } = await supabase
      .from('catches')
      .delete()
      .eq('id', catchId)

    if (error) {
      alert('Fel vid radering: ' + error.message)
    } else {
      fetchCatches()
    }
  }

  const handleGenerateDemo = async () => {
    if (!user) return

    console.log('Starting demo generation for user:', user.id)
    setLoading(true)
    try {
      const response = await fetch('/api/generate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        alert(`${data.count} demofångster har genererats!`)
        fetchCatches()
      } else {
        console.error('Generation error:', data)
        alert('Fel vid generering: ' + (data.error || 'Okänt fel'))
      }
    } catch (error) {
      console.error('Fetch error:', error)
      alert('Fel vid generering: ' + (error instanceof Error ? error.message : 'Okänt fel'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl">Laddar fångster...</div>
    </div>
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Fish className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>FishLog</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {userProfile?.profile_name || user?.user_metadata?.full_name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-2 rounded-lg transition-colors`}
                title={darkMode ? 'Ljust läge' : 'Mörkt läge'}
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logga ut</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Karta */}
          {catches.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Fångstplatser
                </h2>
              </div>
              <CatchMap
                catches={catches}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                onBoundsChange={setVisibleCatches}
                darkMode={darkMode}
              />
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <List className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Fångster
                  <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({visibleCatches.length > 0 ? visibleCatches.length : catches.length})
                  </span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* View toggle */}
                {catches.length > 0 && (
                  <div className={`flex ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-1`}>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid'
                          ? `${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'} shadow`
                          : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                      }`}
                      title="Gridvy"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list'
                          ? `${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'} shadow`
                          : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                      }`}
                      title="Listvy"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <button
                  onClick={handleGenerateDemo}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  title="Generera 10 slumpmässiga demofångster"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Generera demodata</span>
                  <span className="sm:hidden">Demo</span>
                </button>
                <button
                  onClick={handleAddCatch}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ny fångst
                </button>
              </div>
            </div>

            {catches.length === 0 ? (
              <div className="text-center py-12">
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-lg`}>Inga fångster registrerade än</p>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-4`}>Börja logga dina fångster!</p>
                <button
                  onClick={loadSampleData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  📊 Ladda provdata (6 fångster)
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortCatches(visibleCatches.length > 0 ? visibleCatches : catches).map((catch_item) => (
                  <div key={catch_item.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5 relative`}>
                    <button
                      onClick={() => handleDeleteCatch(catch_item.id)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                      title="Radera fångst"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 mb-4 pr-8">
                      <Fish className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {catch_item.species.name_swedish}
                      </h3>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center gap-2">
                        <Weight className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vikt:</span>
                        <span className={`ml-auto ${darkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                          {catch_item.weight ? `${catch_item.weight} kg` : 'Okänd'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ruler className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Längd:</span>
                        <span className={`ml-auto ${darkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                          {catch_item.length ? `${catch_item.length} cm` : 'Okänd'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Plats:</span>
                        <span className={`ml-auto ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium text-right max-w-[60%] truncate`}>
                          {catch_item.location_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Datum:</span>
                        <span className={`ml-auto ${darkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                          {new Date(catch_item.caught_at).toLocaleDateString('sv-SE')}
                        </span>
                      </div>
                      {catch_item.weather_data && (
                        <>
                          <div className={`pt-2 mt-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
                            <div className="flex items-center gap-2">
                              <CloudRain className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Väder:</span>
                              <span className={`ml-auto ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>
                                {catch_item.weather_data.temperature}°C
                              </span>
                            </div>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1 ml-6`}>
                              {catch_item.weather_data.weather_desc}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wind className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vind:</span>
                            <span className={`ml-auto ${darkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                              {catch_item.weather_data.wind_speed} m/s {degreesToCompass(catch_item.weather_data.wind_direction)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Gauge className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Lufttryck:</span>
                            <span className={`ml-auto ${darkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                              {catch_item.weather_data.pressure} hPa
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {catch_item.notes && (
                      <div className={`mt-3 pt-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
                        <div className="flex items-start gap-2">
                          <StickyNote className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>{catch_item.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
                <table className="min-w-full">
                  <thead className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                    <tr>
                      <th className={`hidden sm:table-cell px-3 sm:px-4 py-3.5 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider w-8 sm:w-12`}></th>
                      <th
                        className={`px-3 sm:px-4 py-3.5 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:bg-opacity-80 select-none`}
                        onClick={() => handleColumnSort('species')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Art</span>
                          <SortIcon column="species" />
                        </div>
                      </th>
                      <th
                        className={`px-3 sm:px-4 py-3.5 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:bg-opacity-80 select-none`}
                        onClick={() => handleColumnSort('weight')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Vikt</span>
                          <SortIcon column="weight" />
                        </div>
                      </th>
                      <th
                        className={`px-3 sm:px-4 py-3.5 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:bg-opacity-80 select-none`}
                        onClick={() => handleColumnSort('length')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Längd</span>
                          <SortIcon column="length" />
                        </div>
                      </th>
                      <th className={`hidden md:table-cell px-4 py-3.5 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>Plats</th>
                      <th
                        className={`px-3 sm:px-4 py-3.5 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:bg-opacity-80 select-none`}
                        onClick={() => handleColumnSort('date')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Datum</span>
                          <SortIcon column="date" />
                        </div>
                      </th>
                      <th className={`hidden sm:table-cell px-4 py-3.5 text-right text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    {sortCatches(visibleCatches.length > 0 ? visibleCatches : catches).map((catch_item) => {
                      const isExpanded = expandedRows.has(catch_item.id)
                      return (
                        <React.Fragment key={catch_item.id}>
                          <tr className={`${darkMode ? 'hover:bg-gray-700/50 border-gray-700/50' : 'hover:bg-gray-50 border-gray-200'} transition-colors border-b cursor-pointer`}
                              onClick={() => toggleRow(catch_item.id)}>
                            <td className="hidden sm:table-cell px-3 sm:px-4 py-3 sm:py-4">
                              {isExpanded ? (
                                <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              ) : (
                                <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              )}
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Fish className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{catch_item.species.name_swedish}</span>
                              </div>
                            </td>
                            <td className={`px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {catch_item.weight ? `${catch_item.weight} kg` : '—'}
                            </td>
                            <td className={`px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {catch_item.length ? `${catch_item.length} cm` : '—'}
                            </td>
                            <td className={`hidden md:table-cell px-4 py-4 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium max-w-xs truncate`}>{catch_item.location_name}</td>
                            <td className={`px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {new Date(catch_item.caught_at).toLocaleDateString('sv-SE')}
                            </td>
                            <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-right text-sm" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDeleteCatch(catch_item.id)}
                                className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Radera</span>
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className={`${darkMode ? 'bg-gray-750 border-gray-700/50' : 'bg-gray-50 border-gray-200'} border-b`}>
                              <td colSpan={6} className="sm:col-span-7 px-3 sm:px-4 py-3 sm:py-4">
                                <div className="pl-6 sm:pl-8 pr-3 sm:pr-4 space-y-3">
                                  {/* Plats - visas bara på mobil */}
                                  <div className={`md:hidden p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                    <div className="flex items-center gap-2">
                                      <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plats:</span>
                                      <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{catch_item.location_name}</span>
                                    </div>
                                  </div>

                                  {catch_item.weather_data && (
                                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} space-y-2`}>
                                      <h4 className={`font-semibold text-sm mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Väderdata</h4>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                          <CloudRain className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Temperatur:</span>
                                          <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{catch_item.weather_data.temperature}°C</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Wind className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Vind:</span>
                                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{catch_item.weather_data.wind_speed} m/s {degreesToCompass(catch_item.weather_data.wind_direction)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Gauge className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Lufttryck:</span>
                                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{catch_item.weather_data.pressure} hPa</span>
                                        </div>
                                        <div className="col-span-2 md:col-span-3">
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Beskrivning: </span>
                                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{catch_item.weather_data.weather_desc}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {catch_item.notes && (
                                    <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                      <div className="flex items-start gap-2">
                                        <StickyNote className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                        <div>
                                          <h4 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Anteckningar</h4>
                                          <p className={`text-sm italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{catch_item.notes}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Radera-knapp - visas bara på mobil */}
                                  <div className="sm:hidden flex justify-end pt-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => handleDeleteCatch(catch_item.id)}
                                      className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Radera fångst</span>
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Catch Form Modal */}
      {showAddForm && (
        <AddCatchForm
          userId={user?.id || ''}
          onSuccess={handleAddSuccess}
          onCancel={() => setShowAddForm(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  )
}
