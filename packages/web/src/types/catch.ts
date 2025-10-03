/**
 * Shared Catch interface used across components
 * Keep this in sync with database schema
 */
export interface Catch {
  id: string
  user_id: string
  species_id: string
  weight: number | null
  length: number | null
  latitude: number
  longitude: number
  location_name: string
  caught_at: string
  notes: string | null
  quantity: number
  species: {
    name_swedish: string
    name_english: string
    name_latin: string
    category: string
  }
  weather_data?: {
    temperature: number
    weather_desc: string
    wind_speed: number
    wind_direction: number
    pressure: number
    humidity: number
  }
  photos?: {
    id: string
    file_path: string
    file_size: number | null
    mime_type: string | null
  }[]
}
