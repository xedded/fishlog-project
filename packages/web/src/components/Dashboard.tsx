'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Catch } from '@/types/catch'
import { useLanguage } from '@/contexts/LanguageContext'
import CatchMap from './CatchMap'
import AddCatchForm from './AddCatchForm'
import EditCatchForm from './EditCatchForm'
import StatisticsView from './StatisticsView'
import {
  Sun,
  Moon,
  LogOut,
  Plus,
  Grid3x3,
  List,
  BarChart3,
  ArrowUpDown,
  MapPin,
  Calendar,
  Ruler,
  Weight,
  Trash2,
  Pencil,
  Fish,
  Wind,
  Gauge,
  StickyNote,
  CloudRain,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Settings,
  Check,
  Filter,
  X,
  Trophy
} from 'lucide-react'

// Convert degrees to compass direction
const degreesToCompass = (degrees: number, lang: 'sv' | 'en'): string => {
  const directionsSv = ['N', 'NNÖ', 'NÖ', 'ÖNÖ', 'Ö', 'ÖSÖ', 'SÖ', 'SSÖ', 'S', 'SSV', 'SV', 'VSV', 'V', 'VNV', 'NV', 'NNV']
  const directionsEn = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const directions = lang === 'sv' ? directionsSv : directionsEn
  const index = Math.round(((degrees % 360) / 22.5))
  return directions[index % 16]
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [catches, setCatches] = useState<Catch[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCatch, setEditingCatch] = useState<Catch | null>(null)
  const [activeTab, setActiveTab] = useState<'catches' | 'statistics' | 'records'>('catches')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showSettings, setShowSettings] = useState(false)
  const [filterSpecies, setFilterSpecies] = useState<string>('')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fishlog-darkmode')
      return saved ? JSON.parse(saved) : true
    }
    return true
  })
  const [units, setUnits] = useState<'metric' | 'imperial'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fishlog-units')
      return (saved as 'metric' | 'imperial') || 'metric'
    }
    return 'metric'
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

  // Save units to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fishlog-units', units)
    }
  }, [units])

  // Conversion functions
  const convertWeight = (kg: number | null): string => {
    if (!kg) return '—'
    if (units === 'imperial') {
      const lbs = kg * 2.20462
      return `${lbs.toFixed(1)} lbs`
    }
    return `${kg} kg`
  }

  const convertLength = (cm: number | null): string => {
    if (!cm) return '—'
    if (units === 'imperial') {
      const inches = cm * 0.393701
      return `${inches.toFixed(1)} in`
    }
    return `${cm} cm`
  }

  const convertTemp = (celsius: number): string => {
    if (units === 'imperial') {
      const fahrenheit = (celsius * 9/5) + 32
      return `${fahrenheit.toFixed(1)}°F`
    }
    return `${celsius}°C`
  }

  const convertWindSpeed = (ms: number): string => {
    if (units === 'imperial') {
      const mph = ms * 2.23694
      return `${mph.toFixed(1)} mph`
    }
    return `${ms} m/s`
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    if (language === 'en') {
      return date.toLocaleDateString('en-US')
    }
    return date.toLocaleDateString('sv-SE')
  }

  const getSpeciesName = (species: { name_swedish: string; name_english: string }): string => {
    return language === 'en' ? species.name_english : species.name_swedish
  }

  const translateWeather = (weatherDesc: string): string => {
    if (language === 'sv') return weatherDesc

    // Translate Swedish weather descriptions to English
    const translations: Record<string, string> = {
      'Klart': 'Clear',
      'Molnigt': 'Cloudy',
      'Lätt molnighet': 'Partly cloudy',
      'Mulet': 'Overcast',
      'Regn': 'Rain',
      'Lätt regn': 'Light rain',
      'Kraftigt regn': 'Heavy rain',
      'Snö': 'Snow',
      'Lätt snö': 'Light snow',
      'Dimma': 'Fog',
      'Åska': 'Thunderstorm',
      'Duggregn': 'Drizzle',
      'Hagel': 'Hail',
      'Delvis molnigt': 'Partly cloudy',
      'Mestadels klart': 'Mostly clear',
      'Mestadels molnigt': 'Mostly cloudy'
    }

    return translations[weatherDesc] || weatherDesc
  }

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
        species (name_swedish, name_english, name_latin, category),
        weather_data (temperature, weather_desc, wind_speed, wind_direction, pressure, humidity),
        photos (id, file_path, file_size, mime_type)
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

  // Get unique species from catches for filter dropdown
  const uniqueSpecies = catches.reduce((acc, catchItem) => {
    if (!acc.find(s => s.id === catchItem.species_id)) {
      acc.push({
        id: catchItem.species_id,
        name_english: catchItem.species.name_english,
        name_swedish: catchItem.species.name_swedish
      })
    }
    return acc
  }, [] as Array<{ id: string; name_english: string; name_swedish: string }>)
  .sort((a, b) => {
    const nameA = language === 'en' ? a.name_english : a.name_swedish
    const nameB = language === 'en' ? b.name_english : b.name_swedish
    return nameA.localeCompare(nameB)
  })

  const filterCatches = (catches: Catch[]) => {
    return catches.filter(catchItem => {
      // Filter by species
      if (filterSpecies && catchItem.species_id !== filterSpecies) {
        return false
      }

      // Filter by date range
      const catchDate = new Date(catchItem.caught_at)
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom)
        if (catchDate < fromDate) return false
      }
      if (filterDateTo) {
        const toDate = new Date(filterDateTo)
        toDate.setHours(23, 59, 59, 999) // Include entire end date
        if (catchDate > toDate) return false
      }

      return true
    })
  }

  // Get combined filtered catches (both map bounds AND manual filters)
  const getFilteredCatches = () => {
    // Start with all catches
    let filtered = catches

    // Apply manual filters (species, date)
    filtered = filterCatches(filtered)

    // If map has bounds filter active, intersect with visible catches
    if (visibleCatches.length > 0) {
      const visibleIds = new Set(visibleCatches.map(c => c.id))
      filtered = filtered.filter(c => visibleIds.has(c.id))
    }

    return filtered
  }

  const clearFilters = () => {
    setFilterSpecies('')
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  const hasActiveFilters = filterSpecies || filterDateFrom || filterDateTo

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
    if (!confirm(t('catch.deleteConfirm'))) {
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

      // Show debug log if available
      if (data.debug && Array.isArray(data.debug)) {
        console.log('=== DEBUG LOG ===')
        data.debug.forEach((msg: string) => console.log(msg))
        console.log('=================')
      }

      if (response.ok) {
        if (data.count === 0 && data.debug) {
          alert(`Inga fångster genererades. Se konsolen för debug-info.`)
        } else {
          alert(`${data.count} demofångster har genererats!`)
        }
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
      <div className="text-xl">{t('common.loading')}</div>
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
              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-2 rounded-lg transition-colors`}
                  title={language === 'sv' ? 'Inställningar' : 'Settings'}
                >
                  <Settings className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>

                {showSettings && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSettings(false)}
                    />

                    {/* Dropdown menu */}
                    <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-20 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                      <div className="p-3">
                        <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {language === 'sv' ? 'Inställningar' : 'Settings'}
                        </h3>

                        {/* Language Setting */}
                        <div className="mb-4">
                          <label className={`text-xs font-medium block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'sv' ? 'Språk' : 'Language'}
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setLanguage('sv')}
                              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                language === 'sv'
                                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                                  : `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`
                              }`}
                            >
                              <span className="text-lg">🇸🇪</span>
                              <span className="text-sm">Svenska</span>
                              {language === 'sv' && <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setLanguage('en')}
                              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                language === 'en'
                                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                                  : `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`
                              }`}
                            >
                              <span className="text-lg">🇬🇧</span>
                              <span className="text-sm">English</span>
                              {language === 'en' && <Check className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Theme Setting */}
                        <div className="mb-4">
                          <label className={`text-xs font-medium block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'sv' ? 'Tema' : 'Theme'}
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDarkMode(false)}
                              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                !darkMode
                                  ? 'bg-blue-500 text-white'
                                  : `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`
                              }`}
                            >
                              <Sun className="w-4 h-4" />
                              <span className="text-sm">{language === 'sv' ? 'Ljust' : 'Light'}</span>
                              {!darkMode && <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setDarkMode(true)}
                              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                darkMode
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              <Moon className="w-4 h-4" />
                              <span className="text-sm">{language === 'sv' ? 'Mörkt' : 'Dark'}</span>
                              {darkMode && <Check className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Units Setting */}
                        <div>
                          <label className={`text-xs font-medium block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'sv' ? 'Enheter' : 'Units'}
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setUnits('metric')}
                              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                units === 'metric'
                                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                                  : `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`
                              }`}
                            >
                              <span className="text-sm">Metric</span>
                              {units === 'metric' && <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setUnits('imperial')}
                              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                units === 'imperial'
                                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                                  : `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`
                              }`}
                            >
                              <span className="text-sm">Imperial</span>
                              {units === 'imperial' && <Check className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('auth.signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Karta */}
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <nav className="flex gap-4">
                <button
                  onClick={() => setActiveTab('catches')}
                  className={`px-4 py-3 border-b-2 font-medium transition-colors ${
                    activeTab === 'catches'
                      ? `${darkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'}`
                      : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <List className="w-5 h-5" />
                    {language === 'en' ? 'My Catches' : 'Mina fångster'}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('statistics')}
                  className={`px-4 py-3 border-b-2 font-medium transition-colors ${
                    activeTab === 'statistics'
                      ? `${darkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'}`
                      : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {language === 'en' ? 'Statistics' : 'Statistik'}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`px-4 py-3 border-b-2 font-medium transition-colors ${
                    activeTab === 'records'
                      ? `${darkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'}`
                      : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {language === 'en' ? 'Personal Bests' : 'Personliga rekord'}
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'catches' ? (
            <>
              {/* Map Section */}
              {catches.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('catch.location')}
                    </h2>
                  </div>
                  <CatchMap
                    catches={filterCatches(catches)}
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
                    onBoundsChange={setVisibleCatches}
                    darkMode={darkMode}
                  />
                </div>
              )}

              {/* Catches Section */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('dashboard.title')}
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
                          title={t('dashboard.viewGrid')}
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
                          title={t('dashboard.viewList')}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                <button
                  onClick={handleGenerateDemo}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  title={t('dashboard.generateDemo')}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('dashboard.generateDemo')}</span>
                  <span className="sm:hidden">Demo</span>
                </button>
                <button
                  onClick={handleAddCatch}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('dashboard.addCatch')}
                </button>
              </div>
            </div>

            {/* Filters */}
            {catches.length > 0 && (
              <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
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
                        <option value="">Alla arter</option>
                        {uniqueSpecies.map(species => (
                          <option key={species.id} value={species.id}>
                            {language === 'en' ? species.name_english : species.name_swedish}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Date from */}
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      placeholder="Från datum"
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
                      placeholder="Till datum"
                      className={`px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />

                    {/* Clear filters button */}
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
                        <span>Rensa</span>
                      </button>
                    )}
                  </div>

                  {/* Active filter count */}
                  {(hasActiveFilters || visibleCatches.length > 0) && (
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getFilteredCatches().length} av {catches.length}
                      {visibleCatches.length > 0 && visibleCatches.length !== catches.length && (
                        <span className="ml-1">({language === 'en' ? 'map filtered' : 'kartfiltrerat'})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {catches.length === 0 ? (
              <div className="text-center py-12">
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-lg`}>{t('dashboard.noCatches')}</p>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('dashboard.noCatchesDesc')}</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortCatches(getFilteredCatches()).map((catch_item) => (
                  <div key={catch_item.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5 relative`}>
                    <div className="absolute top-3 right-3 flex gap-1">
                      <button
                        onClick={() => setEditingCatch(catch_item)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-lg transition-colors"
                        title={t('common.edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCatch(catch_item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4 pr-16">
                      <Fish className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {getSpeciesName(catch_item.species)}
                        {catch_item.quantity > 1 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            ×{catch_item.quantity}
                          </span>
                        )}
                      </h3>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center gap-2">
                        <Weight className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('catch.weight')}:</span>
                        <span className={`ml-auto ${darkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                          {convertWeight(catch_item.weight)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ruler className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('catch.length')}:</span>
                        <span className={`ml-auto ${darkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                          {convertLength(catch_item.length)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('catch.location')}:</span>
                        <span className={`ml-auto ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium text-right max-w-[60%] truncate`}>
                          {catch_item.location_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('catch.date')}:</span>
                        <span className={`ml-auto ${darkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                          {formatDate(catch_item.caught_at)}
                        </span>
                      </div>
                      {catch_item.weather_data && (
                        <>
                          <div className={`pt-2 mt-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
                            <div className="flex items-center gap-2">
                              <CloudRain className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('catch.weather')}:</span>
                              <span className={`ml-auto ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>
                                {convertTemp(catch_item.weather_data.temperature)}
                              </span>
                            </div>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1 ml-6`}>
                              {translateWeather(catch_item.weather_data.weather_desc)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wind className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('catch.windSpeed')}:</span>
                            <span className={`ml-auto ${darkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                              {convertWindSpeed(catch_item.weather_data.wind_speed)} {degreesToCompass(catch_item.weather_data.wind_direction, language)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Gauge className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('catch.pressure')}:</span>
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

                    {catch_item.photos && catch_item.photos.length > 0 && (
                      <div className={`mt-3 pt-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
                        <div className="grid grid-cols-2 gap-2">
                          {catch_item.photos.map((photo) => {
                            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catch-photos/${photo.file_path}`
                            return (
                              <img
                                key={photo.id}
                                src={publicUrl}
                                alt="Catch photo"
                                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => setLightboxPhoto(publicUrl)}
                              />
                            )
                          })}
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
                          <span>{t('catch.species')}</span>
                          <SortIcon column="species" />
                        </div>
                      </th>
                      <th
                        className={`px-3 sm:px-4 py-3.5 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:bg-opacity-80 select-none`}
                        onClick={() => handleColumnSort('weight')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('catch.weight')}</span>
                          <SortIcon column="weight" />
                        </div>
                      </th>
                      <th
                        className={`px-3 sm:px-4 py-3.5 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:bg-opacity-80 select-none`}
                        onClick={() => handleColumnSort('length')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('catch.length')}</span>
                          <SortIcon column="length" />
                        </div>
                      </th>
                      <th className={`hidden md:table-cell px-4 py-3.5 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>{t('catch.location')}</th>
                      <th
                        className={`px-3 sm:px-4 py-3.5 text-left text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:bg-opacity-80 select-none`}
                        onClick={() => handleColumnSort('date')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('catch.date')}</span>
                          <SortIcon column="date" />
                        </div>
                      </th>
                      <th className={`hidden sm:table-cell px-4 py-3.5 text-right text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>{t('common.edit')}</th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    {sortCatches(getFilteredCatches()).map((catch_item) => {
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
                                <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {getSpeciesName(catch_item.species)}
                                </span>
                                {catch_item.quantity > 1 && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    ×{catch_item.quantity}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={`px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {convertWeight(catch_item.weight)}
                            </td>
                            <td className={`px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {convertLength(catch_item.length)}
                            </td>
                            <td className={`hidden md:table-cell px-4 py-4 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium max-w-xs truncate`}>{catch_item.location_name}</td>
                            <td className={`px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formatDate(catch_item.caught_at)}
                            </td>
                            <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-right text-sm" onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setEditingCatch(catch_item)}
                                  className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>{t('common.edit')}</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteCatch(catch_item.id)}
                                  className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{t('common.delete')}</span>
                                </button>
                              </div>
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
                                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('catch.location')}:</span>
                                      <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{catch_item.location_name}</span>
                                    </div>
                                  </div>

                                  {catch_item.weather_data && (
                                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} space-y-2`}>
                                      <h4 className={`font-semibold text-sm mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('catch.weather')}</h4>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                          <CloudRain className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('catch.temperature')}:</span>
                                          <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{convertTemp(catch_item.weather_data.temperature)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Wind className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('catch.windSpeed')}:</span>
                                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{convertWindSpeed(catch_item.weather_data.wind_speed)} {degreesToCompass(catch_item.weather_data.wind_direction, language)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Gauge className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('catch.pressure')}:</span>
                                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{catch_item.weather_data.pressure} hPa</span>
                                        </div>
                                        <div className="col-span-2 md:col-span-3">
                                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{t('catch.weather')}: </span>
                                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{translateWeather(catch_item.weather_data.weather_desc)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {catch_item.notes && (
                                    <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                      <div className="flex items-start gap-2">
                                        <StickyNote className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                        <div>
                                          <h4 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t('catch.notes')}</h4>
                                          <p className={`text-sm italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{catch_item.notes}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {catch_item.photos && catch_item.photos.length > 0 && (
                                    <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                      <h4 className={`font-semibold text-sm mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Foton</h4>
                                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {catch_item.photos.map((photo) => {
                                          const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catch-photos/${photo.file_path}`
                                          return (
                                            <img
                                              key={photo.id}
                                              src={publicUrl}
                                              alt="Catch photo"
                                              className="w-full h-20 sm:h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setLightboxPhoto(publicUrl)
                                              }}
                                            />
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Knappar - visas bara på mobil */}
                                  <div className="sm:hidden flex gap-2 justify-end pt-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => setEditingCatch(catch_item)}
                                      className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors"
                                    >
                                      <Pencil className="w-4 h-4" />
                                      <span>{t('common.edit')}</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCatch(catch_item.id)}
                                      className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>{t('common.delete')}</span>
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
            </>
          ) : activeTab === 'statistics' ? (
            /* Statistics Tab */
            <>
              {/* Filters for Statistics */}
              {catches.length > 0 && (
                <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
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
                              {language === 'en' ? species.name_english : species.name_swedish}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Date from */}
                      <input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        placeholder={language === 'en' ? 'From date' : 'Från datum'}
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
                        placeholder={language === 'en' ? 'To date' : 'Till datum'}
                        className={`px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />

                      {/* Clear filters button */}
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

                    {/* Active filter count */}
                    {hasActiveFilters && (
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {filterCatches(catches).length} {language === 'en' ? 'of' : 'av'} {catches.length}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <StatisticsView catches={filterCatches(catches)} darkMode={darkMode} />
            </>
          ) : (
            /* Personal Records Tab */
            <StatisticsView catches={catches} darkMode={darkMode} showOnlyRecords={true} />
          )}
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

      {/* Edit Catch Form Modal */}
      {editingCatch && (
        <EditCatchForm
          catchData={editingCatch}
          onSuccess={() => {
            setEditingCatch(null)
            fetchCatches()
          }}
          onCancel={() => setEditingCatch(null)}
          darkMode={darkMode}
        />
      )}

      {/* Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxPhoto}
            alt="Fullsize catch photo"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
