// Database types matching actual Supabase schema
// Source: packages/database/sql/create-tables.sql

export interface DatabaseUser {
  id: string
  email: string
  created_at: string
  updated_at: string
  profile_name: string | null
  avatar_url: string | null
}

export interface DatabaseSpecies {
  id: string
  name_swedish: string
  name_latin: string | null
  name_english: string | null
  category: string | null
  continent: string | null  // Added by migration
  created_at: string
}

export interface DatabaseWeatherData {
  id: string
  temperature: number | null
  pressure: number | null
  wind_speed: number | null
  wind_direction: number | null
  humidity: number | null
  weather_desc: string | null
  recorded_at: string | null
  created_at: string
}

export interface DatabaseCatch {
  id: string
  user_id: string
  species_id: string
  weight: number | null
  length: number | null
  quantity: number  // Added by migration, default 1
  latitude: number
  longitude: number
  location_name: string
  caught_at: string
  created_at: string
  updated_at: string
  notes: string | null
  weather_id: string | null
}

export interface DatabasePhoto {
  id: string
  catch_id: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

export interface DatabaseFavoriteLocation {
  id: string
  user_id: string
  name: string
  latitude: number | null
  longitude: number | null
  description: string | null
  created_at: string
}

// Insert types (for creating new records - omit auto-generated fields)
export type DatabaseUserInsert = {
  id: string
  email: string
  profile_name?: string | null
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
}

export type DatabaseCatchInsert = Omit<DatabaseCatch, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type DatabaseWeatherDataInsert = Omit<DatabaseWeatherData, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}
