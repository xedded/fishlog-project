import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Missing lat or lon parameter' },
      { status: 400 }
    )
  }

  try {
    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY
    console.log('Geocoding API key exists:', !!apiKey, 'Length:', apiKey?.length)

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}&language=sv`
    console.log('Fetching geocoding for:', lat, lon)

    const response = await fetch(url)
    const data = await response.json()

    console.log('Geocoding response status:', data.status)
    if (data.error_message) {
      console.error('Geocoding error message:', data.error_message)
    }

    if (data.status === 'REQUEST_DENIED') {
      console.error('Geocoding API error:', data.error_message)
      return NextResponse.json({
        status: 'FALLBACK',
        location_name: `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lon).toFixed(4)}°E`,
        debug: { error: data.error_message, status: data.status }
      })
    }

    if (data.status !== 'OK') {
      console.error('Geocoding error:', data.status, data)
      return NextResponse.json({
        status: 'FALLBACK',
        location_name: `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lon).toFixed(4)}°E`,
        debug: { status: data.status, resultsCount: data.results?.length || 0 }
      })
    }

    if (data.results && data.results.length > 0) {
      // Försök hitta ett bra resultat (undvik Plus Codes)
      let bestResult = data.results[0]

      // Om första resultatet är en Plus Code, leta efter ett bättre
      if (bestResult.formatted_address.match(/^[A-Z0-9]{4,}\+[A-Z0-9]{2,}/)) {
        const betterResult = data.results.find((r: { formatted_address: string }) =>
          !r.formatted_address.match(/^[A-Z0-9]{4,}\+[A-Z0-9]{2,}/)
        )
        if (betterResult) bestResult = betterResult
      }

      const components = bestResult.address_components as Array<{
        long_name: string
        types: string[]
      }>

      // Kolla efter sjö/naturlig feature
      const naturalFeature = components.find((c: { types: string[] }) =>
        c.types.includes('natural_feature') || c.types.includes('establishment') || c.types.includes('park')
      )

      // Kolla efter ort
      const locality = components.find((c: { types: string[] }) => c.types.includes('locality'))

      // Kolla efter kommun
      const adminArea = components.find((c: { types: string[] }) => c.types.includes('administrative_area_level_2'))

      const locationName = naturalFeature?.long_name || locality?.long_name || adminArea?.long_name || bestResult.formatted_address

      return NextResponse.json({
        status: 'OK',
        location_name: locationName
      })
    }

    return NextResponse.json({
      status: 'FALLBACK',
      location_name: `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lon).toFixed(4)}°E`
    })

  } catch (error) {
    console.error('Geocoding request failed:', error)
    return NextResponse.json({
      status: 'ERROR',
      location_name: `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lon).toFixed(4)}°E`
    })
  }
}
