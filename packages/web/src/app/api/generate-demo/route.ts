import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Svenska vatten med koordinater
const SWEDISH_WATERS = [
  { name: 'Vänern - Kållandsö', lat: 58.8, lon: 13.4 },
  { name: 'Vättern - Visingsö', lat: 58.0, lon: 14.4 },
  { name: 'Mälaren - Drottningholm', lat: 59.32, lon: 17.87 },
  { name: 'Hjälmaren - Örebro', lat: 59.27, lon: 15.21 },
  { name: 'Storsjön - Östersund', lat: 63.18, lon: 14.63 },
  { name: 'Siljan - Mora', lat: 61.01, lon: 14.55 },
  { name: 'Mörrum - Karlshamn', lat: 56.17, lon: 14.86 },
  { name: 'Bolmen - Ljungby', lat: 56.92, lon: 13.65 },
  { name: 'Skärgården - Stockholm', lat: 59.35, lon: 18.65 },
  { name: 'Göta kanal - Berg', lat: 58.60, lon: 15.58 },
  { name: 'Klarälven - Karlstad', lat: 59.37, lon: 13.50 },
  { name: 'Dalälven - Avesta', lat: 60.15, lon: 16.16 },
  { name: 'Öresund - Helsingborg', lat: 56.04, lon: 12.70 },
  { name: 'Kattegatt - Göteborg', lat: 57.70, lon: 11.97 },
  { name: 'Bottenviken - Luleå', lat: 65.58, lon: 22.15 },
]

// Fiskarter med realistiska vikter och längder
const FISH_SPECIES = [
  { name: 'Gädda', minWeight: 0.5, maxWeight: 8.0, minLength: 30, maxLength: 110 },
  { name: 'Abborre', minWeight: 0.1, maxWeight: 2.0, minLength: 15, maxLength: 45 },
  { name: 'Öring', minWeight: 0.3, maxWeight: 5.0, minLength: 25, maxLength: 70 },
  { name: 'Gös', minWeight: 0.5, maxWeight: 6.0, minLength: 35, maxLength: 80 },
  { name: 'Lax', minWeight: 1.0, maxWeight: 12.0, minLength: 50, maxLength: 120 },
  { name: 'Torsk', minWeight: 0.8, maxWeight: 10.0, minLength: 40, maxLength: 100 },
  { name: 'Makrill', minWeight: 0.2, maxWeight: 1.5, minLength: 25, maxLength: 50 },
  { name: 'Braxen', minWeight: 0.3, maxWeight: 4.0, minLength: 20, maxLength: 60 },
]

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomDate(): Date {
  // Senaste 3 månaderna
  const now = new Date()
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const randomTime = threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime())
  return new Date(randomTime)
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Hämta alla arter från databasen
    const { data: species, error: speciesError } = await supabase
      .from('species')
      .select('id, name_swedish')

    if (speciesError || !species) {
      console.error('Species fetch error:', speciesError)
      return NextResponse.json({ error: 'Failed to fetch species' }, { status: 500 })
    }

    console.log('Available species:', species.map(s => s.name_swedish))

    const generatedCatches = []

    // Generera 10 fångster
    for (let i = 0; i < 10; i++) {
      // Välj slumpmässig plats
      const location = SWEDISH_WATERS[randomInt(0, SWEDISH_WATERS.length - 1)]

      // Välj slumpmässig art
      const fishType = FISH_SPECIES[randomInt(0, FISH_SPECIES.length - 1)]

      // Hitta motsvarande art i databasen
      const dbSpecies = species.find(s => s.name_swedish === fishType.name)
      if (!dbSpecies) {
        console.warn(`Species not found in DB: ${fishType.name}`)
        continue
      }

      // Generera realistiska mått
      const weight = Math.round(randomInRange(fishType.minWeight, fishType.maxWeight) * 100) / 100
      const length = Math.round(randomInRange(fishType.minLength, fishType.maxLength) * 10) / 10

      // Slumpmässigt datum senaste 3 månaderna
      const caughtAt = getRandomDate()

      // Lägg till lite variation på koordinaterna (±0.1 grader)
      const latitude = location.lat + randomInRange(-0.1, 0.1)
      const longitude = location.lon + randomInRange(-0.1, 0.1)

      // Hämta väderdata
      const weatherUrl = `${request.nextUrl.origin}/api/weather?lat=${latitude}&lon=${longitude}&timestamp=${caughtAt.toISOString()}`
      let weatherId = null

      try {
        const weatherResponse = await fetch(weatherUrl)
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json()

          if (weatherData.temperature !== null) {
            const { data: insertedWeather } = await supabase
              .from('weather_data')
              .insert({
                temperature: weatherData.temperature,
                weather_desc: weatherData.weather_desc,
                pressure: weatherData.pressure,
                humidity: weatherData.humidity,
                wind_speed: weatherData.wind_speed,
                wind_direction: weatherData.wind_direction,
                recorded_at: caughtAt.toISOString()
              })
              .select()
              .single()

            if (insertedWeather) {
              weatherId = insertedWeather.id
            }
          }
        }
      } catch (error) {
        console.warn('Could not fetch weather for demo catch:', error)
      }

      // Skapa fångsten
      const { data: catchData, error: catchError } = await supabase
        .from('catches')
        .insert({
          user_id: userId,
          species_id: dbSpecies.id,
          weight,
          length,
          latitude,
          longitude,
          location_name: location.name,
          caught_at: caughtAt.toISOString(),
          weather_id: weatherId,
          notes: Math.random() > 0.7 ? 'Genererad demodata' : null
        })
        .select()
        .single()

      if (catchError) {
        console.error('Catch insert error:', catchError)
      } else if (catchData) {
        generatedCatches.push(catchData)
      }
    }

    console.log(`Generated ${generatedCatches.length} catches`)

    return NextResponse.json({
      success: true,
      count: generatedCatches.length,
      catches: generatedCatches
    })

  } catch (error) {
    console.error('Generate demo error:', error)
    return NextResponse.json(
      { error: 'Failed to generate demo data' },
      { status: 500 }
    )
  }
}
