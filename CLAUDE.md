# FishLog Project - Context för Claude

## Projektöversikt
Personlig fiskfångst-app med webb och mobilgränssnitt för att registrera fångster, visualisera data och hantera offline-sync.

## Projektets krav
- Personliga fiskfångster (ej delning mellan användare)
- Offline-funktionalitet med automatisk sync
- Kartor med punkter och heatmaps (filtrerbart på art/tid)
- Trendgrafer, artstatistik och personliga topplistor
- Foto-upload av fångster
- Väderdata-integration (tryck, temperatur, vind)

## Teknikstack
- **Backend:** Next.js API routes + Prisma + PostgreSQL
- **Webb:** Next.js med TypeScript
- **Mobil:** Expo (React Native) med TypeScript
- **Databas:** PostgreSQL (Supabase hosting)
- **Auth:** Supabase Auth
- **Maps:** Mapbox
- **Väder:** OpenWeatherMap API
- **File storage:** Supabase Storage
- **Offline:** SQLite (Expo) + sync-mekanism

## Utvecklingsfaser

### Fas 1 - Foundation (vecka 1-2) ← 100% KLAR ✅
- [x] Projektsetup + monorepo
- [x] Databas-schema + Prisma setup
- [x] Next.js webb-app initialiserad
- [x] Expo mobil-app initialiserad
- [x] Delat TypeScript paket skapat
- [x] GitHub repository setup
- [x] Vercel deployment konfiguration
- [x] Testdata och seeding scripts
- [x] Supabase setup dokumentation
- [x] Supabase projekt deployment + databas setup
- [x] Testdata i produktionsdatabas
- [x] **Auth implementation (Supabase Auth + Google OAuth)**
  - [x] AuthForm med email/lösenord + Google sign-in
  - [x] useAuth hook för state management
  - [x] OAuth callback route
  - [x] Auto-create user profile vid inloggning
- [x] **Fångstvisning i Dashboard**
  - [x] Lista fångster med detaljer (art, vikt, längd, plats, väder)
  - [x] Ladda provdata-funktion
- [ ] **Fångstregistrering** (pågående)
  - [ ] Formulär för ny fångst
  - [ ] Radera fångster
  - [ ] List/Grid toggle-vy

### Fas 2 - Core Features (vecka 3-4)
- [ ] Foto-upload funktionalitet
- [ ] Väder-API integration (auto-fetch vid registrering)
- [ ] Offline storage (mobil)
- [ ] Basic sync-mekanism

### Fas 3 - Visualization (vecka 5-6) ← Delvis klar
- [x] **Kartvy med fångstpunkter** (Google Maps)
  - [x] Markers för varje fångst
  - [x] InfoWindow med fångstdetaljer
- [ ] Basic statistik och listor
- [ ] Filtrering på art/datum

### Fas 4 - Advanced Features (vecka 7-8)
- [ ] Heatmaps och avancerade kartor
- [ ] Trendgrafer och toplistor
- [ ] Förbättrad offline-sync
- [ ] Performance optimering

## Projektstruktur
```
fishlog-project/
├── packages/
│   ├── shared/           # Delad TypeScript kod (types, utils)
│   ├── web/             # Next.js webb-app
│   ├── mobile/          # Expo mobil-app
│   └── database/        # Prisma schema + migrations
├── docs/                # Projektdokumentation
├── CLAUDE.md            # Context för Claude (denna fil)
└── package.json         # Monorepo setup
```

## Status och nästa steg
✅ **Klart:**
- Monorepo struktur med workspaces
- Next.js webb-app med TypeScript + Tailwind
- Expo React Native app med TypeScript
- Prisma databas-schema designat
- Delat TypeScript paket med types och utils
- GitHub repository: https://github.com/xedded/fishlog-project
- Vercel deployment konfiguration
- Komplett testdata med svenska fiskar och platser
- Database seeding scripts
- Supabase setup dokumentation
- **Supabase databas deployment med fullständig testdata**
- **Environment variables konfigurerade**
- **Auth implementation komplett:**
  - Supabase client konfigurerad
  - AuthForm med email/password + Google OAuth
  - useAuth hook
  - OAuth callback route
  - User profile auto-creation
- **Dashboard komplett:**
  - Fångstlista med detaljer
  - Google Maps integration med markers och InfoWindow
  - Ladda provdata-funktion

🎯 **Testdata i databas:**
- 1 testanvändare: test@fishlog.se (lösenord: testpassword123)
- 10 svenska fiskarter (Gädda, Abborre, Öring, Lax, etc.)
- 5 favoritplatser (Vänern, Vättern, Mörrum, etc.)
- 6 realistiska fångster med väderdata

🚧 **Pågående (idag):**
1. Fångstregistrerings-formulär
2. Radera fångster-funktion
3. List/Grid toggle-vy
4. Deploy till Vercel

🚀 **Nästa steg (efter idag):**
1. Foto-upload funktionalitet
2. Väder-API integration (auto-fetch)
3. Statistik och trendgrafer
4. Filtrering på art/datum
5. Koppla mobile app till Supabase

## Deployment Configuration (VIKTIGT!)

### Vercel Setup - Monorepo Configuration
**Vercel Project Name:** `fishlog-web`
**GitHub Repo:** `xedded/fishlog-project`

⚠️ **KRITISK INFORMATION - FÖLJ DESSA STEG:**

1. **Root Directory Configuration:**
   - Gå till Vercel Dashboard → fishlog-web → Settings → General
   - Under "Root Directory", sätt till: `packages/web`
   - Detta är NÖDVÄNDIGT eftersom Next.js-appen ligger i packages/web, inte i root

2. **ANVÄND INTE root vercel.json:**
   - Ska INTE finnas någon vercel.json i projektets root
   - Endast packages/web/vercel.json ska finnas (med `{"framework": "nextjs"}`)
   - Om du lägger till custom buildCommand/outputDirectory i root vercel.json får du 404-fel

3. **Environment Variables i Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

4. **Vid deployment-problem:**
   - Kontrollera att Root Directory är satt till `packages/web`
   - Ta bort eventuell root vercel.json
   - Trigga en Redeploy från Vercel dashboard

### Vanliga deployment-fel och lösningar:
- ❌ "No Output Directory named 'public' found" → Root Directory ej konfigurerad
- ❌ "Function Runtimes must have a valid version" → Ta bort custom runtime config
- ❌ 404 på deployed site → Root Directory ej satt ELLER custom vercel.json i root

## Kommandoöversikt
```bash
# Starta utveckling
npm run dev:web      # Next.js på :3000
npm run dev:mobile   # Expo development server

# Databas
npm run db:migrate   # Kör Prisma migrations
npm run db:studio    # Öppna Prisma Studio
```