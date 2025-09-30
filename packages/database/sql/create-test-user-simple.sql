-- Enklare metod: Skapa testanvändare via Supabase Auth funktioner
-- Kör denna SQL i Supabase SQL Editor

-- Först, kontrollera om testanvändaren redan finns
SELECT id, email FROM auth.users WHERE email = 'test@fishlog.se';

-- Om användaren inte finns, skapa den manuellt
-- OBSERVERA: Detta är en förenklad metod
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  instance_id
)
SELECT
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'authenticated',
  'authenticated',
  'test@fishlog.se',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000'::uuid
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'test@fishlog.se'
);

-- Skapa identitet
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  jsonb_build_object(
    'sub', '550e8400-e29b-41d4-a716-446655440001',
    'email', 'test@fishlog.se'
  ),
  'email',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.identities
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'::uuid
);

-- Uppdatera public.users tabellen
UPDATE users
SET id = '550e8400-e29b-41d4-a716-446655440001'::uuid
WHERE email = 'test@fishlog.se'
AND id != '550e8400-e29b-41d4-a716-446655440001'::uuid;

-- Verifiera resultatet
SELECT
  'Auth Users' as table_name,
  count(*) as count,
  email
FROM auth.users
WHERE email = 'test@fishlog.se'
GROUP BY email
UNION ALL
SELECT
  'Public Users',
  count(*),
  email
FROM users
WHERE email = 'test@fishlog.se'
GROUP BY email;