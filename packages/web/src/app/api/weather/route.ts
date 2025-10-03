import { NextRequest, NextResponse } from 'next/server'

// Using Open-Meteo - Free weather API with historical data support
// No API key required!
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const timestamp = searchParams.get('timestamp') // ISO string

  if (!lat || !lon || !timestamp) {
    return NextResponse.json(
      { error: 'Missing required parameters: lat, lon, timestamp' },
      { status: 400 }
    )
  }

  try {
    const catchDate = new Date(timestamp)
    const now = new Date()

    // Format date as YYYY-MM-DD for Open-Meteo API
    const dateStr = catchDate.toISOString().split('T')[0]

    // Check if date is in the future (use forecast) or past (use historical/archive)
    const isFuture = catchDate > now

    let url: string

    if (isFuture) {
      // Use forecast API (up to 16 days in future)
      url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode,pressure_msl,relativehumidity_2m,windspeed_10m,winddirection_10m,windgusts_10m&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`
    } else {
      // For past dates, try historical API first (last 2 years)
      const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000)

      if (catchDate >= twoYearsAgo) {
        // Use historical API (free, last 2 years)
        url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,weathercode,pressure_msl,relativehumidity_2m,windspeed_10m,winddirection_10m,windgusts_10m&timezone=auto`
      } else {
        // Too old for free historical data
        return NextResponse.json({
          temperature: null,
          weather_desc: 'Väderdata ej tillgänglig för datum äldre än 2 år',
          pressure: null,
          humidity: null,
          wind_speed: null,
          wind_direction: null,
          wind_gusts: null
        })
      }
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Find the closest hour to the catch time
    const hourly = data.hourly

    if (!hourly || !hourly.time || hourly.time.length === 0) {
      throw new Error('No weather data available for this date')
    }

    // Find index closest to catch time
    let closestIndex = 0
    if (hourly.time.length > 1) {
      const catchTime = catchDate.getTime()
      let minDiff = Infinity

      hourly.time.forEach((timeStr: string, index: number) => {
        const dataTime = new Date(timeStr).getTime()
        const diff = Math.abs(dataTime - catchTime)
        if (diff < minDiff) {
          minDiff = diff
          closestIndex = index
        }
      })
    }

    // WMO Weather codes to Swedish descriptions
    const weatherCodeToDesc = (code: number): string => {
      const codes: { [key: number]: string } = {
        0: 'Klar himmel',
        1: 'Mestadels klart',
        2: 'Delvis molnigt',
        3: 'Mulet',
        45: 'Dimma',
        48: 'Rimfrost dimma',
        51: 'Lätt duggregn',
        53: 'Måttligt duggregn',
        55: 'Tätt duggregn',
        61: 'Lätt regn',
        63: 'Måttligt regn',
        65: 'Kraftigt regn',
        71: 'Lätt snöfall',
        73: 'Måttligt snöfall',
        75: 'Kraftigt snöfall',
        77: 'Snökorn',
        80: 'Lätta regnskurar',
        81: 'Måttliga regnskurar',
        82: 'Kraftiga regnskurar',
        85: 'Lätta snöbyar',
        86: 'Kraftiga snöbyar',
        95: 'Åska',
        96: 'Åska med lätt hagel',
        99: 'Åska med kraftigt hagel'
      }
      return codes[code] || 'Okänt väder'
    }

    // Convert wind speed from km/h to m/s (Open-Meteo returns km/h by default)
    const windSpeedKmh = hourly.windspeed_10m[closestIndex]
    const windSpeedMs = windSpeedKmh / 3.6
    const windGustsKmh = hourly.windgusts_10m?.[closestIndex]
    const windGustsMs = windGustsKmh ? windGustsKmh / 3.6 : null

    return NextResponse.json({
      temperature: Math.round(hourly.temperature_2m[closestIndex]),
      weather_desc: weatherCodeToDesc(hourly.weathercode[closestIndex]),
      pressure: Math.round(hourly.pressure_msl[closestIndex]),
      humidity: Math.round(hourly.relativehumidity_2m[closestIndex]),
      wind_speed: Math.round(windSpeedMs * 10) / 10,
      wind_direction: Math.round(hourly.winddirection_10m[closestIndex]),
      wind_gusts: windGustsMs ? Math.round(windGustsMs * 10) / 10 : null
    })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
