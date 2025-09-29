# Supabase Setup - FishLog

## 1. Skapa Supabase Projekt

1. Gå till [supabase.com](https://supabase.com)
2. Klicka "New Project"
3. Välj organisation eller skapa ny
4. Projekt-namn: `fishlog-project`
5. Database Password: Generera stark lösenord
6. Region: Europe (Stockholm om tillgängligt)

## 2. Databas Setup

### Kopiera Connection String
```sql
-- Hämta från Settings > Database
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### Kör Prisma Migrations
```bash
cd packages/database
DATABASE_URL="postgresql://..." npm run migrate
```

### Aktivera Row Level Security
```sql
-- I Supabase SQL Editor
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_locations ENABLE ROW LEVEL SECURITY;

-- Policies för users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id::uuid);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id::uuid);

-- Policies för catches
CREATE POLICY "Users can view own catches" ON catches
  FOR ALL USING (auth.uid() = user_id::uuid);

-- Policies för photos
CREATE POLICY "Users can view own photos" ON photos
  FOR ALL USING (auth.uid() = (
    SELECT user_id FROM catches WHERE id = catch_id
  )::uuid);

-- Policies för favorite_locations
CREATE POLICY "Users can manage own locations" ON favorite_locations
  FOR ALL USING (auth.uid() = user_id::uuid);
```

## 3. Authentication Setup

### Email Auth (Standard)
```json
{
  "site_url": "http://localhost:3000",
  "additional_redirect_urls": [
    "https://your-app.vercel.app",
    "fishlog://auth"
  ]
}
```

### OAuth Providers (Optional)
- Google OAuth
- GitHub OAuth
- Apple Sign In (för iOS)

## 4. Storage Setup

### Skapa Bucket för Bilder
```sql
-- I Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('catch-photos', 'catch-photos', true);
```

### Storage Policies
```sql
-- Användare kan ladda upp egna bilder
CREATE POLICY "Users can upload catch photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'catch-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Alla kan se publika bilder
CREATE POLICY "Public can view catch photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'catch-photos');
```

## 5. Environment Variables

### Development (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Expo (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 6. Seed Test Data

```bash
cd packages/database
npm run seed
```

Detta skapar:
- 1 testanvändare: `test@fishlog.se`
- 10 fiskarter (svenska arter)
- 5 favoritplatser (svenska sjöar/skärgård)
- 6 fångster med väderdata
- 4 väderloggar

## 7. Test API Access

### Testa Connection
```bash
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://your-project.supabase.co/rest/v1/species
```

## 8. Nästa Steg

1. Implementera Supabase client i Next.js
2. Lägg till auth komponenter
3. Koppla mobile app till Supabase
4. Deploy till Vercel med environment variables