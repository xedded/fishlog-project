'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import CatchMap from './CatchMap'
import AddCatchForm from './AddCatchForm'

interface Catch {
  id: string
  weight: number
  length: number
  latitude: number
  longitude: number
  location_name: string
  caught_at: string
  notes: string
  species: {
    name_swedish: string
    name_latin: string
    category: string
  }
  weather_data?: {
    temperature: number
    weather_desc: string
  }
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [catches, setCatches] = useState<Catch[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [userProfile, setUserProfile] = useState<{
    id: string
    email: string
    profile_name: string
    avatar_url?: string
  } | null>(null)

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
        weather_data (temperature, weather_desc)
      `)
      .eq('user_id', user?.id)
      .order('caught_at', { ascending: false })

    if (error) {
      console.error('Error fetching catches:', error)
    } else {
      console.log('Fetched catches:', data?.length || 0, 'items')
      setCatches(data || [])
    }
    setLoading(false)
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl">Laddar fångster...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎣 FishLog</h1>
              <p className="text-gray-600">
                Välkommen, {userProfile?.profile_name || user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Logga ut
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Karta */}
          {catches.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🗺️ Fångstplatser
              </h2>
              <CatchMap
                catches={catches}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
              />
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                📋 Dina fångster ({catches.length})
              </h2>
              <div className="flex gap-2">
                {/* View toggle */}
                {catches.length > 0 && (
                  <div className="flex bg-gray-200 rounded-md p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        viewMode === 'grid'
                          ? 'bg-white text-gray-900 shadow'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        viewMode === 'list'
                          ? 'bg-white text-gray-900 shadow'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Lista
                    </button>
                  </div>
                )}
                <button
                  onClick={handleAddCatch}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  + Ny fångst
                </button>
              </div>
            </div>

            {catches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Inga fångster registrerade än</p>
                <p className="text-gray-400 mb-4">Börja logga dina fångster!</p>
                <button
                  onClick={loadSampleData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  📊 Ladda provdata (6 fångster)
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {catches.map((catch_item) => (
                  <div key={catch_item.id} className="bg-white rounded-lg shadow p-6 relative">
                    <button
                      onClick={() => handleDeleteCatch(catch_item.id)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-2"
                      title="Radera fångst"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pr-8">
                      {catch_item.species.name_swedish}
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Vikt:</span>
                        <span className="text-gray-900 font-semibold">
                          {catch_item.weight ? `${catch_item.weight} kg` : 'Okänd'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Längd:</span>
                        <span className="text-gray-900 font-semibold">
                          {catch_item.length ? `${catch_item.length} cm` : 'Okänd'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Plats:</span>
                        <span className="text-blue-700 font-semibold text-right max-w-[60%]">{catch_item.location_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Datum:</span>
                        <span className="text-gray-900 font-semibold">
                          {new Date(catch_item.caught_at).toLocaleDateString('sv-SE')}
                        </span>
                      </div>
                      {catch_item.weather_data && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Väder:</span>
                          <span className="text-green-700 font-semibold">
                            {catch_item.weather_data.temperature}°C, {catch_item.weather_data.weather_desc}
                          </span>
                        </div>
                      )}
                    </div>

                    {catch_item.notes && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-800 italic bg-gray-50 p-2 rounded">{catch_item.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Art</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vikt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Längd</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plats</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Väder</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {catches.map((catch_item) => (
                      <tr key={catch_item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{catch_item.species.name_swedish}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {catch_item.weight ? `${catch_item.weight} kg` : 'Okänd'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {catch_item.length ? `${catch_item.length} cm` : 'Okänd'}
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-700 font-medium max-w-xs truncate">{catch_item.location_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(catch_item.caught_at).toLocaleDateString('sv-SE')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                          {catch_item.weather_data
                            ? `${catch_item.weather_data.temperature}°C`
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteCatch(catch_item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Radera
                          </button>
                        </td>
                      </tr>
                    ))}
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
        />
      )}
    </div>
  )
}
