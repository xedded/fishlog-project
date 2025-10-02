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

      // Funktion för att rensa bort onödiga delar från formatted_address
      const cleanFormattedAddress = (address: string): string => {
        // Ta bort postnummer (internationellt: 5-6 siffror, kan ha bokstäver)
        let cleaned = address.replace(/\b\d{3,6}\s?\d{0,3}[A-Z]{0,2}\b/gi, '')
        // Ta bort gatuadresser (text följt av nummer, kan ha suffix som A, 1A, etc)
        cleaned = cleaned.replace(/^[^,]+\s+\d+[A-Za-z0-9]?\s*,?\s*/i, '')
        // Ta bort vanliga generiska vägnamnord (internationellt)
        cleaned = cleaned.replace(/^(Road|Street|Avenue|Väg|Gata|Unnamed\s+\w+),?\s*/i, '')
        // Rensa dubbla komman, extra mellanslag och trailing komma
        cleaned = cleaned.replace(/,\s*,/g, ',').replace(/\s+,/g, ',').replace(/,\s*$/, '').trim()
        return cleaned
      }

      // Kontrollera om det är en gatuadress (innehåller husnummer eller route)
      const isStreetAddress = (addressComponents: typeof components): boolean => {
        return addressComponents.some(c =>
          c.types.includes('street_number') ||
          c.types.includes('route')
        )
      }

      // Hitta land-komponenten (för att ta bort det från slutresultatet)
      const country = components.find((c: { types: string[] }) => c.types.includes('country'))

      // Kolla efter sjö/naturlig feature eller interessant plats
      const naturalFeature = components.find((c: { types: string[] }) =>
        c.types.includes('natural_feature') ||
        c.types.includes('establishment') ||
        c.types.includes('park') ||
        c.types.includes('point_of_interest')
      )

      // Kolla efter ort
      const locality = components.find((c: { types: string[] }) => c.types.includes('locality'))

      // Kolla efter kommun
      const adminArea = components.find((c: { types: string[] }) => c.types.includes('administrative_area_level_2'))

      // Kolla efter sublocality eller neighborhood för mer specifik plats
      const sublocality = components.find((c: { types: string[] }) =>
        c.types.includes('sublocality') || c.types.includes('neighborhood')
      )

      // Bygg ett smart platsnamn
      let locationName = ''

      // Om det är en gatuadress (med husnummer), prioritera ort/område istället
      const hasStreetAddress = isStreetAddress(components)

      if (naturalFeature && !hasStreetAddress) {
        // Om det finns en naturlig feature och inte en gatuadress, använd den + eventuell ort
        locationName = naturalFeature.long_name
        if (locality && locality.long_name !== naturalFeature.long_name) {
          locationName += `, ${locality.long_name}`
        }
      } else if (hasStreetAddress && locality) {
        // Om det är en gatuadress, använd bara orten (skippa adressen)
        locationName = locality.long_name
      } else if (sublocality && locality) {
        // Om det finns både sublocality och locality, kombinera dem
        locationName = `${sublocality.long_name}, ${locality.long_name}`
      } else if (locality) {
        // Annars bara orten
        locationName = locality.long_name
      } else if (adminArea) {
        // Eller kommunen
        locationName = adminArea.long_name
      } else {
        // Sista utväg: rensa formatted_address
        locationName = cleanFormattedAddress(bestResult.formatted_address)
      }

      // Ta bort landnamnet från slutresultatet om det finns
      if (country && locationName.includes(country.long_name)) {
        locationName = locationName
          .replace(new RegExp(`,?\\s*${country.long_name}\\s*$`, 'i'), '')
          .trim()
      }

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
