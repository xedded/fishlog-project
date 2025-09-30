-- Debug testdata i databasen
-- Kör denna SQL i Supabase SQL Editor

-- Kolla alla users
SELECT 'All users:' as info;
SELECT id, email, profile_name, created_at FROM users ORDER BY created_at DESC;

-- Kolla alla catches
SELECT 'All catches:' as info;
SELECT id, user_id, location_name, caught_at FROM catches ORDER BY caught_at DESC;

-- Kolla alla species
SELECT 'All species:' as info;
SELECT id, name_swedish, name_latin FROM species LIMIT 10;

-- Kolla favorite_locations
SELECT 'All locations:' as info;
SELECT id, user_id, name FROM favorite_locations;

-- Kolla efter den specifika test-användaren
SELECT 'Looking for test user:' as info;
SELECT * FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- Kolla catches för test-användaren
SELECT 'Catches for test user:' as info;
SELECT * FROM catches WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';