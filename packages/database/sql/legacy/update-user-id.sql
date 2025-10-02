-- Efter registrering, uppdatera user ID i fångster
-- Först, hitta det riktiga user ID från auth
SELECT id, email FROM auth.users WHERE email = 'test@fishlog.se';

-- Sedan uppdatera catches tabellen med rätt user_id
-- Ersätt 'REAL_USER_ID_FROM_ABOVE' med det faktiska ID:t
UPDATE catches
SET user_id = (SELECT id FROM auth.users WHERE email = 'test@fishlog.se' LIMIT 1)
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';

UPDATE favorite_locations
SET user_id = (SELECT id FROM auth.users WHERE email = 'test@fishlog.se' LIMIT 1)
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';

-- Ta bort gamla user från public.users
DELETE FROM users WHERE email = 'test@fishlog.se';

-- Lägg till ny user med rätt ID
INSERT INTO users (id, email, profile_name)
SELECT id, email, 'Test Fiskare'
FROM auth.users
WHERE email = 'test@fishlog.se';