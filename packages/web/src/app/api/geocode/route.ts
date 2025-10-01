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
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=sv`
    )

    const data = await response.json()

    if (data.status === 'REQUEST_DENIED') {
      console.error('Geocoding API error:', data.error_message)
      return NextResponse.json({
        status: 'FALLBACK',
        location_name: `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lon).toFixed(4)}°E`
      })
    }

    if (data.status !== 'OK') {
      console.error('Geocoding error:', data.status)
      return NextResponse.json({
        status: 'FALLBACK',
        location_name: `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lon).toFixed(4)}°E`
      })
    }

    if (data.results && data.results.length > 0) {
      const result = data.results[0]
      const components = result.address_components

      // Kolla efter sjö/naturlig feature
      const naturalFeature = components.find((c: { types: string[] }) =>
        c.types.includes('natural_feature') || c.types.includes('establishment') || c.types.includes('park')
      )

      // Kolla efter ort
      const locality = components.find((c: { types: string[] }) => c.types.includes('locality'))

      // Kolla efter kommun
      const adminArea = components.find((c: { types: string[] }) => c.types.includes('administrative_area_level_2'))

      const locationName = naturalFeature?.long_name || locality?.long_name || adminArea?.long_name || result.formatted_address

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
