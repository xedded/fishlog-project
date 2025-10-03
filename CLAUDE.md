# FishLog - Claude Context

## Projektöversikt
Personlig fiskfångst-app med webb och mobilgränssnitt. Registrera fångster, visualisera data, offline-sync.

## Teknikstack
- **Backend:** Next.js 15 API routes + Supabase PostgreSQL
- **Webb:** Next.js 15 + TypeScript + Tailwind CSS
- **Databas:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (Email + Google OAuth)
- **Maps:** Google Maps API (@vis.gl/react-google-maps)
- **Väder:** Open-Meteo API (gratis, historisk data)
- **Ikoner:** Lucide React

## Projektstruktur
```
fishlog-project/
├── packages/
│   ├── web/              # Next.js webb-app (HUVUDPROJEKT)
│   ├── mobile/           # Expo React Native (ej kopplad)
│   ├── database/
│   │   └── sql/
│   │       ├── migrations/       # Aktiva migrationer
│   │       ├── legacy/           # Gamla test-scripts
│   │       ├── create-tables.sql
│   │       └── seed-data.sql
│   └── shared/           # Delade TypeScript typer
├── docs/
│   ├── setup/            # Setup-guider (Vercel, OAuth, etc)
│   ├── migrations/       # Migration-dokumentation
│   ├── architecture.md
│   ├── database-schema.md
│   ├── deployment.md
│   └── supabase-setup.md
└── CLAUDE.md            # Denna fil
```

## Nuvarande Status

### ✅ KLART
- **Fas 1-3:** Foundation, Auth, CRUD, Väder, Karta, Demodata
- **Fas 4:**
  - ✅ Redigera fångster
  - ✅ Språkstöd (Svenska/Engelska med flaggor 🇸🇪/🇬🇧)
  - ✅ Metric/Imperial enhetssystem
  - ✅ 100+ fiskarter med regionfiltrering
  - ✅ Quantity-fält (antal fångster)
  - ✅ "Registrera fler här"-funktion
  - ✅ Settings-dropdown med kugghjulsikon
  - ✅ Foto-upload med Supabase Storage

### 🚧 Nästa Steg (Fas 5)
1. **Filtrering** - Filtrera på art och datum
2. **Statistik** - Totala fångster, största fångst, per art
3. **Trendgrafer** - Vikt över tid, fångster per månad

## Viktiga Tekniska Detaljer

### Database Schema
- `users` - Användarprofiler (email, profile_name, avatar_url)
- `species` - 100+ fiskarter (continent, name_english, name_swedish)
- `catches` - Fångster (weight, length, quantity, latitude, longitude)
- `weather_data` - Väderdata från Open-Meteo
- `photos` - Foton kopplade till fångster (file_path, file_size, mime_type)

### Supabase Storage
- **Bucket:** `catch-photos` (public)
- **Struktur:** `{user_id}/{catch_id}_{index}.jpg`
- **Max storlek:** 5 MB per fil
- **RLS:** Användare kan bara ladda upp/läsa egna foton

### API Routes
- `/api/weather` - Hämtar historisk väderdata
- `/api/geocode` - Reverse geocoding (platsnamn från koordinater)
- `/api/generate-demo` - Genererar 10 slumpmässiga fångster
- `/api/upload-photo` - POST: Ladda upp foto, DELETE: Ta bort foto

### Environment Variables
**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side)

**Google Maps:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (frontend)
- `GOOGLE_GEOCODING_API_KEY` (server-side)

### Deployment (Vercel)
⚠️ **KRITISKT:** Root Directory = `packages/web`
- Sätt detta i Vercel Project Settings → General
- Endast `packages/web/vercel.json` ska finnas (ej i root)

## Kodkonventioner

### Database Types (VIKTIGT!)
**Använd ALLTID types från `src/types/database.ts` när du interagerar med Supabase!**
```typescript
// packages/web/src/types/database.ts
import type { DatabaseUserInsert, DatabaseCatchInsert, DatabaseWeatherDataInsert } from '@/types/database'

// Exempel: Skapa user
const userInsert: DatabaseUserInsert = {
  id: userId,
  email: 'user@example.com',
  profile_name: 'Test User'  // OBS: profile_name, INTE name!
}

// Exempel: Skapa catch
const catchInsert: DatabaseCatchInsert = {
  user_id: userId,
  species_id: speciesId,
  weight: 2.5,
  length: 45.5,
  quantity: 1,  // OBS: quantity är required (default 1)
  latitude: 59.32,
  longitude: 18.06,
  location_name: 'Mälaren',
  caught_at: new Date().toISOString(),
  weather_id: null,
  notes: null
}
```

### Presentation Types (frontend)
```typescript
// packages/web/src/types/catch.ts
export interface Catch {
  id: string
  user_id: string
  species_id: string
  weight: number | null
  length: number | null
  quantity: number
  latitude: number
  longitude: number
  location_name: string
  caught_at: string
  notes: string | null
  species: { name_swedish, name_english, name_latin, category }
  weather_data?: { temperature, weather_desc, wind_speed, ... }
}
```

### i18n Pattern
```typescript
// Använd LanguageContext
const { language, t } = useLanguage()
const displayName = language === 'en' ? species.name_english : species.name_swedish
```

### Smart Species Sorting
1. **Regionala arter** (Europa/Global) - alfabetisk ordning
2. **Separator** (`──────────────`)
3. **Övriga arter** - alfabetisk ordning

Detektera region från koordinater med `detectContinent()` i `lib/continentDetection.ts`

## Vanliga Problem & Lösningar

### TypeScript Errors
- **Strict mode:** Använd explicit types, inga `any`
- **Supabase data:** Type assertion: `data as { latitude: number; longitude: number }`
- **Union types:** Type guards med `'disabled' in s` eller `as Species`

### Google Maps API
- **Frontend:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Maps JavaScript API)
- **Backend:** `GOOGLE_GEOCODING_API_KEY` (Geocoding API, separat nyckel)
- Referer-restriktioner endast på frontend-nyckel

### Vercel Build Errors
- Kontrollera Root Directory = `packages/web`
- Ta bort custom build commands i root `vercel.json`
- Kör `npm run build` lokalt först för att fånga TypeScript-fel

## Snabbkommandon
```bash
# Utveckling
npm run dev:web      # Next.js på :3000

# Databas
# Kör SQL i Supabase SQL Editor:
# - packages/database/sql/create-tables.sql
# - packages/database/sql/migrations/*.sql

# Build & Deploy
npm run build        # Testa build lokalt
git push            # Auto-deploy till Vercel
```

## Dokumentation
Se `/docs` för detaljerad dokumentation:
- `setup/` - Vercel, OAuth, Environment setup
- `migrations/` - Databas-migrationer och specs
- `architecture.md` - Systemarkitektur
- `database-schema.md` - Databasschema
- `LESSONS_LEARNED.md` - Best practices och lärdomar
