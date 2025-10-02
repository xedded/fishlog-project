-- Create test user directly in Supabase Auth
-- This bypasses email confirmation
-- Password: testpassword123

-- 1. Insert into auth.users (Supabase's auth table)
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
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440001',
  'authenticated',
  'authenticated',
  'test@fishlog.se',
  -- Password: testpassword123 (bcrypt hash)
  '$2a$10$XQmnz.oPYpPJQEYqZ.PZ2eKYGYJKYXXVKGJKKYXXVKGJKKYXXVKGJ',
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert into auth.identities
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  jsonb_build_object(
    'sub', '550e8400-e29b-41d4-a716-446655440001',
    'email', 'test@fishlog.se'
  ),
  'email',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert into public.users (our app table)
INSERT INTO public.users (id, email, name, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'test@fishlog.se',
  'Test Fiskare',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the user was created
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'test@fishlog.se';
