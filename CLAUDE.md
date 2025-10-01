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
- **Backend:** Next.js API routes + Supabase PostgreSQL
- **Webb:** Next.js 15 med TypeScript + Tailwind CSS
- **Mobil:** Expo (React Native) med TypeScript
- **Databas:** PostgreSQL (Supabase hosting)
- **Auth:** Supabase Auth (Email + Google OAuth)
- **Maps:** Google Maps API (@vis.gl/react-google-maps)
- **Väder:** Open-Meteo API (gratis, ingen API-nyckel)
- **Ikoner:** Lucide React
- **File storage:** Supabase Storage (ej implementerat än)
- **Offline:** SQLite (Expo) + sync-mekanism (ej implementerat än)

## Utvecklingsfaser

### Fas 1 - Foundation & Core UI ← 100% KLAR ✅
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
- [x] **Fångstregistrering & Hantering**
  - [x] Formulär för ny fångst med kartväljare
  - [x] Radera fångster
  - [x] Vikt och längd är valfria fält
  - [x] Darkmode-stöd för formulär
- [x] **Fångstvisning i Dashboard**
  - [x] Grid-vy med kort
  - [x] Listvy med expanderbara rader
  - [x] Mobilanpassad listvy (4 kolumner på mobil)
  - [x] Klickbar kolumnsortering med visuella indikatorer
  - [x] Ladda provdata-funktion
  - [x] Darkmode toggle med fullständigt stöd
  - [x] Moderna Lucide-ikoner genomgående

### Fas 2 - Väder & Kartvisualisering ← 100% KLAR ✅
- [x] **Väder-API integration**
  - [x] Open-Meteo API (gratis, historisk data upp till 2 år)
  - [x] Automatisk hämtning vid fångstregistrering
  - [x] Temperatur, lufttryck, luftfuktighet, vindhastighet, vindriktning
  - [x] Svensk väderbeskrivning
  - [x] Vindriktning i väderstreck (N, NNÖ, SÖ, etc.)
- [x] **Kartvisualisering (Google Maps)**
  - [x] Markers för varje fångst
  - [x] InfoWindow med fångstdetaljer och väderdata
  - [x] Darkmode-stöd för karta
  - [x] Kartbaserad filtrering (zoom/pan uppdaterar listan)
  - [x] Kartväljare i fångstformuläret

### Fas 3 - Statistik & Foto ← EJ PÅBÖRJAD
- [ ] Foto-upload funktionalitet
- [ ] Basic statistik och listor
- [ ] Filtrering på art/datum
- [ ] Trendgrafer (vikt över tid, fångster per månad)

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

### ✅ Fas 1 & 2 - KLART (Foundation + Väder + Karta)

**Infrastruktur:**
- Monorepo struktur med workspaces
- Next.js 15 webb-app med TypeScript + Tailwind CSS
- Expo React Native app med TypeScript (ej kopplad än)
- Supabase PostgreSQL databas
- GitHub repository: https://github.com/xedded/fishlog-project
- Vercel deployment (packages/web som root directory)
- Environment variables konfigurerade

**Auth & Användare:**
- Supabase Auth med email/lösenord
- Google OAuth integration
- useAuth hook för state management
- Automatisk user profile-skapande
- Testanvändare: test@fishlog.se (lösenord: testpassword123)

**Fångsthantering:**
- AddCatchForm med kartväljare (Google Maps)
- Automatisk geolocation
- Valfri vikt/längd
- Radera fångster
- Ladda provdata-funktion
- Fullständigt darkmode-stöd

**Dashboard & UI:**
- **Grid-vy:** Kort med alla detaljer, ikoner, väderdata
- **Listvy:**
  - Expanderbara rader (klicka för att visa väder/anteckningar)
  - Klickbar kolumnsortering med pilikoner
  - Mobilanpassad (4 kolumner på mobil: Art, Vikt, Längd, Datum)
  - Plats och Radera visas i expanderad vy på mobil
- **Darkmode:** Komplett stöd för alla komponenter
- **Ikoner:** Moderna Lucide React-ikoner genomgående
- **Responsiv design:** Optimerad för mobil, tablet, desktop

**Kartfunktioner:**
- Google Maps (@vis.gl/react-google-maps)
- Markers för varje fångst
- InfoWindow popup med full info
- Darkmode-stöd för kartan
- Kartbaserad filtrering (synliga fångster baserat på zoom/pan)
- Kartväljare i fångstformuläret

**Väderintegration:**
- Open-Meteo API (gratis, ingen API-nyckel)
- Automatisk hämtning vid fångstregistrering
- Historisk data upp till 2 år bakåt
- Data: Temperatur, lufttryck, luftfuktighet, vindhastighet, vindriktning
- Svensk väderbeskrivning
- Vindriktning konverterad till väderstreck (N, NNÖ, NÖ, ÖNÖ, etc.)

**Testdata i databas:**
- 10 svenska fiskarter (Gädda, Abborre, Öring, Lax, Gös, Torsk, Makrill, etc.)
- 5 favoritplatser (Vänern, Vättern, Mörrum, etc.)
- 6 realistiska fångster med väderdata

### 🚀 Nästa steg - Fas 3 (Statistik & Foto)

**Högsta prioritet:**
1. **Foto-upload:** Supabase Storage integration för fångstbilder
2. **Custom map markers:** Stilrena markers som matchar appens design
3. **Filtrering:** Filtrera fångster på art och datumintervall
4. **Basic statistik:**
   - Total antal fångster
   - Största fångst (vikt/längd)
   - Fångster per art (diagram)
   - Favorit fiskeplats

**Medium prioritet:**
5. **Trendgrafer:**
   - Vikt över tid (line chart)
   - Fångster per månad (bar chart)
   - Väderkorrelation (scatter plot)
6. **Export-funktion:** Exportera fångster till CSV/JSON
7. **Dela fångst:** Generera delbar länk med bild

**Lägre prioritet:**
8. **Mobile app:** Koppla Expo-app till Supabase
9. **Offline-funktionalitet:** SQLite + sync för mobil
10. **Heatmaps:** Värmekartor för fångstplatser
11. **Push-notiser:** Påminnelser om fiske

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