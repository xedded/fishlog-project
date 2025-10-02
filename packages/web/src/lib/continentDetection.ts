/**
 * Detect continent from latitude/longitude coordinates
 * Used for smart species list sorting
 */
export function detectContinent(latitude: number, longitude: number): string {
  // Europe: 35-70°N, -10-40°E
  if (latitude >= 35 && latitude <= 70 && longitude >= -10 && longitude <= 40) {
    return 'Europe'
  }

  // North America: 25-70°N, -170 to -50°W
  if (latitude >= 25 && latitude <= 70 && longitude >= -170 && longitude <= -50) {
    return 'North America'
  }

  // Asia: 10-70°N, 40-180°E
  if (latitude >= 10 && latitude <= 70 && longitude >= 40 && longitude <= 180) {
    return 'Asia'
  }

  // Oceania: -50 to 0°S, 110-180°E
  if (latitude >= -50 && latitude <= 0 && longitude >= 110 && longitude <= 180) {
    return 'Oceania'
  }

  // South America: -60 to 15°N, -85 to -30°W
  if (latitude >= -60 && latitude <= 15 && longitude >= -85 && longitude <= -30) {
    return 'South America'
  }

  // Africa: -35 to 40°N, -20 to 55°E
  if (latitude >= -35 && latitude <= 40 && longitude >= -20 && longitude <= 55) {
    return 'Africa'
  }

  // Default to Global if no match
  return 'Global'
}

/**
 * Get user's region from their most recent catch location
 */
export async function getUserRegion(
  userId: string,
  supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>
): Promise<string> {
  const { data, error } = await supabase
    .from('catches')
    .select('latitude, longitude')
    .eq('user_id', userId)
    .order('caught_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return 'Europe' // Default to Europe if no catches
  }

  const catchData = data as { latitude: number; longitude: number }
  return detectContinent(catchData.latitude, catchData.longitude)
}
