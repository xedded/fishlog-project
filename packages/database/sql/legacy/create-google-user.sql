-- Skapa Google-användaren i public.users tabellen först
-- Hämta info från auth.users och skapa motsvarande post i public.users

-- Första, kolla vilken Google-användare som finns
SELECT id, email, raw_user_meta_data FROM auth.users
WHERE id = '21f24f43-d2a1-466c-bc27-6213200fa298';

-- Skapa användaren i public.users
INSERT INTO users (id, email, profile_name, avatar_url)
SELECT
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    email
  ) as profile_name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users
WHERE id = '21f24f43-d2a1-466c-bc27-6213200fa298'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  profile_name = EXCLUDED.profile_name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

-- Verifiera att användaren skapades
SELECT id, email, profile_name FROM users
WHERE id = '21f24f43-d2a1-466c-bc27-6213200fa298';