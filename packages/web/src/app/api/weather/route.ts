import { NextRequest, NextResponse } from 'next/server'

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

  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: 'OpenWeatherMap API key not configured' },
      { status: 500 }
    )
  }

  try {
    const catchDate = new Date(timestamp)
    const now = new Date()
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)

    // If catch is within last 5 days, use current weather endpoint
    // Otherwise, use historical data (requires paid plan) or return null
    if (catchDate >= fiveDaysAgo) {
      // Use current weather API
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=sv`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.statusText}`)
      }

      const data = await response.json()

      return NextResponse.json({
        temperature: Math.round(data.main.temp),
        weather_desc: data.weather[0].description,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        wind_direction: data.wind.deg
      })
    } else {
      // For historical data (older than 5 days), we need the "History" API which requires a paid plan
      // As a workaround, we'll use the Time Machine API endpoint
      const unixTime = Math.floor(catchDate.getTime() / 1000)
      const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${unixTime}&appid=${apiKey}&units=metric&lang=sv`

      const response = await fetch(url)

      if (!response.ok) {
        // If historical API fails (likely due to not having paid plan), return null data
        console.warn('Historical weather data not available')
        return NextResponse.json({
          temperature: null,
          weather_desc: 'Väderdata ej tillgänglig för historiska datum',
          pressure: null,
          humidity: null,
          wind_speed: null,
          wind_direction: null
        })
      }

      const data = await response.json()
      const weatherData = data.data[0]

      return NextResponse.json({
        temperature: Math.round(weatherData.temp),
        weather_desc: weatherData.weather[0].description,
        pressure: weatherData.pressure,
        humidity: weatherData.humidity,
        wind_speed: weatherData.wind_speed,
        wind_direction: weatherData.wind_deg
      })
    }
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
