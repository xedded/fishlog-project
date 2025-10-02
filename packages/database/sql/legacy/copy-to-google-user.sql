-- Kopiera testdata till Google-användaren
-- Ersätt 'YOUR_GOOGLE_USER_ID' med: 21f24f43-d2a1-466c-bc27-6213200fa298

-- Kopiera favorite_locations
INSERT INTO favorite_locations (user_id, name, latitude, longitude, description)
SELECT
  '21f24f43-d2a1-466c-bc27-6213200fa298'::uuid,
  name,
  latitude,
  longitude,
  description
FROM favorite_locations
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid;

-- Kopiera catches (med nya UUID:er)
INSERT INTO catches (
  user_id, species_id, weight, length, latitude, longitude,
  location_name, caught_at, notes, weather_id
)
SELECT
  '21f24f43-d2a1-466c-bc27-6213200fa298'::uuid,
  species_id,
  weight,
  length,
  latitude,
  longitude,
  location_name,
  caught_at,
  notes,
  weather_id
FROM catches
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid;

-- Verifiera att det fungerade
SELECT
  'Catches for Google user:' as info,
  count(*) as count
FROM catches
WHERE user_id = '21f24f43-d2a1-466c-bc27-6213200fa298'::uuid;

SELECT
  'Locations for Google user:' as info,
  count(*) as count
FROM favorite_locations
WHERE user_id = '21f24f43-d2a1-466c-bc27-6213200fa298'::uuid;