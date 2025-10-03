'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Cloud, Wind, Droplets, Eye, Sunrise, Sunset, ThermometerSun, Fish } from 'lucide-react'

interface WeatherForecastViewProps {
  darkMode?: boolean
  latitude?: number
  longitude?: number
}

interface ForecastDay {
  date: string
  maxTemp: number
  minTemp: number
  precipitation: number
  windSpeed: number
  windDirection: number
  weatherCode: number
  sunrise: string
  sunset: string
}

export default function WeatherForecastView({ darkMode = false, latitude = 59.329, longitude = 18.068 }: WeatherForecastViewProps) {
  const { language } = useLanguage()
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationName, setLocationName] = useState<string>('')

  useEffect(() => {
    fetchForecast()
    fetchLocationName()
  }, [latitude, longitude])

  const fetchLocationName = async () => {
    try {
      const response = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`)
      const data = await response.json()
      if (data.name) {
        setLocationName(data.name)
      }
    } catch (err) {
      console.error('Failed to fetch location name:', err)
    }
  }

  const fetchForecast = async () => {
    setLoading(true)
    setError(null)

    try {
      // Use Open-Meteo API for 7-day forecast
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant,weathercode,sunrise,sunset&timezone=auto&forecast_days=7`

      const response = await fetch(url)
      const data = await response.json()

      if (data.daily) {
        const forecastData: ForecastDay[] = data.daily.time.map((date: string, index: number) => ({
          date,
          maxTemp: data.daily.temperature_2m_max[index],
          minTemp: data.daily.temperature_2m_min[index],
          precipitation: data.daily.precipitation_sum[index],
          windSpeed: data.daily.windspeed_10m_max[index],
          windDirection: data.daily.winddirection_10m_dominant[index],
          weatherCode: data.daily.weathercode[index],
          sunrise: data.daily.sunrise[index],
          sunset: data.daily.sunset[index]
        }))

        setForecast(forecastData)
      }
    } catch (err) {
      setError('Failed to load weather forecast')
      console.error('Forecast error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherDescription = (code: number): string => {
    const codes: Record<number, { sv: string; en: string }> = {
      0: { sv: 'Klart', en: 'Clear sky' },
      1: { sv: 'Mestadels klart', en: 'Mainly clear' },
      2: { sv: 'Delvis molnigt', en: 'Partly cloudy' },
      3: { sv: 'Mulet', en: 'Overcast' },
      45: { sv: 'Dimma', en: 'Foggy' },
      48: { sv: 'Dimma', en: 'Foggy' },
      51: { sv: 'Lätt duggregn', en: 'Light drizzle' },
      53: { sv: 'Duggregn', en: 'Drizzle' },
      55: { sv: 'Kraftigt duggregn', en: 'Heavy drizzle' },
      61: { sv: 'Lätt regn', en: 'Light rain' },
      63: { sv: 'Regn', en: 'Rain' },
      65: { sv: 'Kraftigt regn', en: 'Heavy rain' },
      71: { sv: 'Lätt snöfall', en: 'Light snow' },
      73: { sv: 'Snöfall', en: 'Snow' },
      75: { sv: 'Kraftigt snöfall', en: 'Heavy snow' },
      80: { sv: 'Lätta regnskurar', en: 'Light showers' },
      81: { sv: 'Regnskurar', en: 'Showers' },
      82: { sv: 'Kraftiga regnskurar', en: 'Heavy showers' },
      95: { sv: 'Åska', en: 'Thunderstorm' },
      96: { sv: 'Åska med hagel', en: 'Thunderstorm with hail' },
      99: { sv: 'Kraftig åska med hagel', en: 'Heavy thunderstorm with hail' }
    }

    return (codes[code]?.[language] || codes[0][language])
  }

  const getFishingCondition = (day: ForecastDay): { score: number; text: string; color: string } => {
    let score = 50 // Base score

    // Temperature (10-20°C is ideal)
    const avgTemp = (day.maxTemp + day.minTemp) / 2
    if (avgTemp >= 10 && avgTemp <= 20) score += 20
    else if (avgTemp < 5 || avgTemp > 25) score -= 10

    // Precipitation (light rain is okay, heavy is bad)
    if (day.precipitation > 10) score -= 20
    else if (day.precipitation > 0 && day.precipitation < 5) score += 10

    // Wind (light to moderate is good)
    if (day.windSpeed > 15) score -= 15
    else if (day.windSpeed >= 5 && day.windSpeed <= 10) score += 15

    // Weather code (clear/partly cloudy is best)
    if (day.weatherCode <= 2) score += 15
    else if (day.weatherCode >= 61) score -= 10

    // Determine rating
    let text = language === 'en' ? 'Poor' : 'Dåligt'
    let color = 'text-red-500'

    if (score >= 70) {
      text = language === 'en' ? 'Excellent' : 'Utmärkt'
      color = 'text-green-500'
    } else if (score >= 55) {
      text = language === 'en' ? 'Good' : 'Bra'
      color = 'text-blue-500'
    } else if (score >= 40) {
      text = language === 'en' ? 'Fair' : 'Okej'
      color = 'text-yellow-500'
    }

    return { score, text, color }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'sv-SE', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    const time = new Date(timeStr)
    return time.toLocaleTimeString(language === 'en' ? 'en-US' : 'sv-SE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 text-center`}>
        <Cloud className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'} animate-pulse`} />
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {language === 'en' ? 'Loading forecast...' : 'Laddar prognos...'}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 text-center`}>
        <Cloud className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-red-600' : 'text-red-500'}`} />
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {language === 'en' ? '7-Day Fishing Forecast' : '7-dagars fiskeprognos'}
            </h2>
            {locationName && (
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {locationName}
              </p>
            )}
          </div>
          <Cloud className={`w-12 h-12 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
      </div>

      {/* Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {forecast.map((day, index) => {
          const fishingCondition = getFishingCondition(day)
          const isToday = index === 0

          return (
            <div
              key={day.date}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-5 ${
                isToday ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Date */}
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(day.date)}
                </h3>
                {isToday && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    {language === 'en' ? 'Today' : 'Idag'}
                  </span>
                )}
              </div>

              {/* Weather */}
              <div className="mb-4">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {getWeatherDescription(day.weatherCode)}
                </p>
                <div className="flex items-center gap-2">
                  <ThermometerSun className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(day.maxTemp)}°
                  </span>
                  <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    / {Math.round(day.minTemp)}°
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Wind className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {Math.round(day.windSpeed)} m/s
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {Math.round(day.precipitation)} mm
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sunrise className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatTime(day.sunrise)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sunset className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatTime(day.sunset)}
                  </span>
                </div>
              </div>

              {/* Fishing Condition */}
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <Fish className={`w-4 h-4 ${fishingCondition.color}`} />
                  <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {language === 'en' ? 'Fishing Conditions' : 'Fiskeförhållanden'}
                  </span>
                </div>
                <p className={`text-lg font-bold ${fishingCondition.color}`}>
                  {fishingCondition.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Eye className="w-4 h-4 inline mr-2" />
          {language === 'en'
            ? 'Fishing conditions are calculated based on temperature, precipitation, wind speed, and general weather conditions. Best fishing typically occurs with mild temperatures (10-20°C), light winds (5-10 m/s), and stable weather.'
            : 'Fiskeförhållanden beräknas baserat på temperatur, nederbörd, vindhastighet och allmänna väderförhållanden. Bäst fiske sker vanligtvis vid milda temperaturer (10-20°C), lätt vind (5-10 m/s) och stabilt väder.'}
        </p>
      </div>
    </div>
  )
}
