# FishLog - Personal Fishing Tracker

En personlig app för att registrera fiskfångster med offline-stöd och datavisualisering.

## Funktioner
- 📱 Webb och mobilapp med delad inloggning
- 🗺️ Kartor med fångstpunkter och heatmaps
- 📊 Statistik, trendgrafer och personliga topplistor
- 📷 Foto-upload av fångster
- 🌤️ Automatisk väderdata-registrering
- 📡 Offline-funktionalitet med automatisk sync

## Snabbstart

### Förutsättningar
- Node.js 18+
- npm eller yarn
- Expo CLI (för mobilapp)

### Installation
```bash
# Installera alla dependencies
npm run install:all

# Starta utvecklingsservrar
npm run dev:web      # Webb-app på http://localhost:3000
npm run dev:mobile   # Expo development server
```

### Databas
```bash
npm run db:migrate   # Kör migrations
npm run db:studio    # Öppna Prisma Studio
```

## Projektstruktur
- `packages/web/` - Next.js webb-app
- `packages/mobile/` - Expo React Native app
- `packages/shared/` - Delad TypeScript kod
- `packages/database/` - Prisma schema och migrations
- `docs/` - Projektdokumentation

## Utvecklingsfaser
Se [CLAUDE.md](./CLAUDE.md) för detaljerad utvecklingsplan och teknikval.