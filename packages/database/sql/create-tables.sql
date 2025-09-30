-- FishLog Database Schema
-- Run this in Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  profile_name VARCHAR,
  avatar_url VARCHAR
);

-- Species table
CREATE TABLE IF NOT EXISTS species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_swedish VARCHAR NOT NULL,
  name_latin VARCHAR,
  name_english VARCHAR,
  category VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Weather data table
CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temperature DECIMAL(4,1),
  pressure DECIMAL(6,2),
  wind_speed DECIMAL(4,1),
  wind_direction INTEGER,
  humidity INTEGER,
  weather_desc VARCHAR,
  recorded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Catches table
CREATE TABLE IF NOT EXISTS catches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  species_id UUID REFERENCES species(id),
  weight DECIMAL(5,2),
  length DECIMAL(4,1),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  location_name VARCHAR,
  caught_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  weather_id UUID REFERENCES weather_data(id)
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catch_id UUID REFERENCES catches(id) ON DELETE CASCADE,
  file_path VARCHAR NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorite locations table
CREATE TABLE IF NOT EXISTS favorite_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_catches_user_id ON catches(user_id);
CREATE INDEX IF NOT EXISTS idx_catches_species_id ON catches(species_id);
CREATE INDEX IF NOT EXISTS idx_catches_caught_at ON catches(caught_at);
CREATE INDEX IF NOT EXISTS idx_photos_catch_id ON photos(catch_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own catches" ON catches
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own photos" ON photos
  FOR ALL USING (auth.uid() = (
    SELECT user_id FROM catches WHERE id = catch_id
  ));

CREATE POLICY "Users can manage own locations" ON favorite_locations
  FOR ALL USING (auth.uid() = user_id);