'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import CatchMap from './CatchMap'

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
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchCatches()
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    const { data, error } = await supabase
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
      console.log('Catch data:', data)
      setCatches(data || [])
    }
    setLoading(false)
  }

  const loadSampleData = async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log('Starting to load sample data for user:', user.id)

      // Skapa provdata direkt istället för att kopiera
      console.log('Creating sample data directly...')

      // Först, kolla om vi redan har data
      const { data: existingCatches } = await supabase
        .from('catches')
        .select('id')
        .eq('user_id', user.id)

      if (existingCatches && existingCatches.length > 0) {
        alert('Du har redan fångster! Ta bort dem först eller logga in med nytt konto.')
        setLoading(false)
        return
      }

      // Hitta species först
      const { data: species, error: speciesError } = await supabase
        .from('species')
        .select('*')
        .limit(10)

      if (speciesError || !species || species.length === 0) {
        alert('Inga fiskarter hittades i databasen. Kör seed-data.sql först.')
        setLoading(false)
        return
      }

      console.log('Found species:', species.length)

      // Skapa favorite locations
      const sampleLocations = [
        { name: 'Vänern - Kållandsö', lat: 58.5923, lng: 13.0813, desc: 'Bra gös- och gäddvatten vid Kållandsö' },
        { name: 'Vättern - Visingsö', lat: 57.9833, lng: 14.3833, desc: 'Öringfiske runt Visingsö' },
        { name: 'Stockholms skärgård - Sandhamn', lat: 59.2917, lng: 18.9167, desc: 'Havsfiske efter torsk och abborre' }
      ]

      for (const loc of sampleLocations) {
        const { error: insertError } = await supabase
          .from('favorite_locations')
          .insert({
            user_id: user.id,
            name: loc.name,
            latitude: loc.lat,
            longitude: loc.lng,
            description: loc.desc
          })
        if (insertError) console.error('Location insert error:', insertError)
      }

      // Skapa sample catches
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

        const { error: insertError } = await supabase
          .from('catches')
          .insert({
            user_id: user.id,
            species_id: matchingSpecies.id,
            weight: catchData.weight,
            length: catchData.length,
            latitude: 58.5923 + (Math.random() - 0.5) * 0.1, // Lägg till lite variation
            longitude: 13.0813 + (Math.random() - 0.5) * 0.1,
            location_name: catchData.location,
            caught_at: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(), // Vecka mellan varje
            notes: catchData.notes
          })
        if (insertError) {
          console.error('Catch insert error:', insertError)
        } else {
          console.log('Inserted catch:', catchData.species)
        }
      }

      console.log('Refreshing catches list...')
      await fetchCatches() // Uppdatera listan

      alert('Provdata laddad! 🎣')
    } catch (error) {
      console.error('Error loading sample data:', error)
      alert('Ett fel uppstod: ' + error.message)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📋 Dina fångster ({catches.length})
            </h2>

            {catches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Inga fångster registrerade än</p>
                <p className="text-gray-400 mb-4">Börja logga dina fångster!</p>
                <button
                  onClick={loadSampleData}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  📊 Ladda provdata (6 fångster)
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {catches.map((catch_item) => (
                  <div key={catch_item.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {catch_item.species.name_swedish}
                      </h3>
                      <span className="text-sm text-gray-500 capitalize">
                        {catch_item.species.category}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 italic mb-3">
                      {catch_item.species.name_latin}
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Vikt:</span>
                        <span className="text-gray-900 font-semibold">{catch_item.weight} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Längd:</span>
                        <span className="text-gray-900 font-semibold">{catch_item.length} cm</span>
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
            )}
          </div>
        </div>
      </main>
    </div>
  )
}