-- Lägg till testfångster till Google-användaren
-- Kör detta EFTER att du loggat in med Google första gången

-- Först, hitta din Google user ID
SELECT id, email, profile_name FROM users ORDER BY created_at DESC LIMIT 5;

-- Uppdatera catches för att använda din Google user ID
-- Ersätt 'YOUR_GOOGLE_USER_ID' med ditt faktiska ID från ovanstående query
UPDATE catches
SET user_id = 'YOUR_GOOGLE_USER_ID'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';

UPDATE favorite_locations
SET user_id = 'YOUR_GOOGLE_USER_ID'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';

-- Verifiera att det fungerade
SELECT
  c.location_name,
  s.name_swedish,
  c.weight,
  u.email
FROM catches c
JOIN species s ON c.species_id = s.id
JOIN users u ON c.user_id = u.id
WHERE u.email = 'DIN_GOOGLE_EMAIL'
ORDER BY c.caught_at DESC;