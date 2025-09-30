-- Skapa testanvändare i Supabase Auth
-- Kör denna SQL i Supabase SQL Editor

-- Skapa testanvändare i auth.users (Supabase Auth)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440001',
  'authenticated',
  'authenticated',
  'test@fishlog.se',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Skapa identitet för testanvändaren
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  format('{"sub":"%s","email":"%s"}', '550e8400-e29b-41d4-a716-446655440001', 'test@fishlog.se')::jsonb,
  'email',
  NOW(),
  NOW()
) ON CONFLICT (provider, id) DO NOTHING;

-- Uppdatera vår users tabell för att matcha auth.users ID
UPDATE users
SET id = '550e8400-e29b-41d4-a716-446655440001'
WHERE email = 'test@fishlog.se';

-- Verifiera att testanvändaren skapades
SELECT 'auth.users' as table_name, count(*) as count FROM auth.users WHERE email = 'test@fishlog.se'
UNION ALL
SELECT 'public.users', count(*) FROM users WHERE email = 'test@fishlog.se';