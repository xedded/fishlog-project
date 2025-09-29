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

### Fas 1 - Foundation (vecka 1-2) ← VI ÄR HÄR
- [x] Projektsetup + monorepo
- [x] Databas-schema + Prisma setup
- [x] Next.js webb-app initialiserad
- [x] Expo mobil-app initialiserad
- [x] Delat TypeScript paket skapat
- [ ] Supabase projekt setup
- [ ] Basic auth (webb + mobil)
- [ ] Enkel fångstregistrering

### Fas 2 - Core Features (vecka 3-4)
- [ ] Foto-upload funktionalitet
- [ ] Väder-API integration
- [ ] Offline storage (mobil)
- [ ] Basic sync-mekanism

### Fas 3 - Visualization (vecka 5-6)
- [ ] Kartvy med fångstpunkter
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

🚀 **Nästa steg:**
1. Skapa Supabase projekt och koppla databas
2. Implementera basic auth med Supabase
3. Skapa första fångstregistrerings-formulär
4. Setup utvecklingsmiljö scripts

## Kommandoöversikt
```bash
# Starta utveckling
npm run dev:web      # Next.js på :3000
npm run dev:mobile   # Expo development server

# Databas
npm run db:migrate   # Kör Prisma migrations
npm run db:studio    # Öppna Prisma Studio
```