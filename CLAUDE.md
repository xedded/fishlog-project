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
  - [x] Custom Fish-ikoner som markers (färgkodade efter kategori)
  - [x] InfoWindow med fångstdetaljer och väderdata
  - [x] Darkmode-stöd för karta och InfoWindow
  - [x] Kartbaserad filtrering (zoom/pan uppdaterar listan)
  - [x] Kartväljare i fångstformuläret
  - [x] Klicka utanför för att stänga InfoWindow
- [x] **Reverse Geocoding**
  - [x] Automatisk platsnamn från koordinater (Google Geocoding API)
  - [x] Prioritering: sjö/naturlig feature → ort → kommun
  - [x] Fallback till koordinater om API ej aktiverat
  - [x] Koordinatfält dolda från användare
- [x] **UX-förbättringar**
  - [x] Darkmode sparas i localStorage
  - [x] Darkmode default för hela appen
  - [x] Expanderbar listvy (dölj på mobil)
  - [x] Förbättrad felhantering med detaljerade meddelanden
  - [x] Inloggningssida omdesignad med darkmode
  - [x] Google-inloggning prioriterad

### Fas 3 - Demodata & Testing ← 100% KLAR ✅
- [x] **Demodata-generering**
  - [x] API-route för att generera 10 slumpmässiga fångster
  - [x] 15 svenska vatten med realistiska koordinater
  - [x] 8 fiskarter med realistiska viktintervall
  - [x] Slumpmässiga datum senaste 3 månaderna
  - [x] Automatisk väderdata-hämtning för varje fångst
  - [x] Grön "Generera demodata"-knapp i UI
  - [x] Kan köras flera gånger för mer testdata

### Fas 4 - Statistik & Foto ← EJ PÅBÖRJAD
- [ ] Foto-upload funktionalitet
- [ ] Basic statistik och listor
- [ ] Filtrering på art/datum
- [ ] Trendgrafer (vikt över tid, fångster per månad)

### Fas 5 - Advanced Features
- [ ] Heatmaps och avancerade kartor
- [ ] Trendgrafer och toplistor
- [ ] Förbättrad offline-sync
- [ ] Performance optimering
- [ ] Månfas-data (bra för fiske!)
- [ ] Soluppgång/nedgång
- [ ] Exportera data till CSV/JSON

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

### ✅ Fas 1, 2 & 3 - KLART (Foundation + Väder + Karta + Demodata)

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
- Custom Fish-ikoner som markers (färgkodade efter kategori)
- InfoWindow popup med full info (kompakt design)
- Darkmode-stöd för kartan och InfoWindow
- Kartbaserad filtrering (synliga fångster baserat på zoom/pan)
- Kartväljare i fångstformuläret
- Klicka utanför för att stänga InfoWindow
- Reverse geocoding (automatiska platsnamn från koordinater)

**Väderintegration:**
- Open-Meteo API (gratis, ingen API-nyckel)
- Automatisk hämtning vid fångstregistrering
- Historisk data upp till 2 år bakåt
- Data: Temperatur, lufttryck, luftfuktighet, vindhastighet, vindriktning
- Svensk väderbeskrivning
- Vindriktning konverterad till väderstreck (N, NNÖ, NÖ, ÖNÖ, etc.)

**Testdata & Demodata:**
- 10 svenska fiskarter (Gädda, Abborre, Öring, Lax, Gös, Torsk, Makrill, etc.)
- 5 favoritplatser (Vänern, Vättern, Mörrum, etc.)
- Demodata-generator för 10 slumpmässiga fångster
- 15 svenska vatten med realistiska koordinater
- Automatisk väderdata för genererade fångster
- Kan köras flera gånger för mer testdata

**Google Cloud Setup:**
- Maps JavaScript API (för kartor och markers)
- Geocoding API (för reverse geocoding - måste aktiveras manuellt)
- OAuth 2.0 konfigurerad för Supabase

### 🚀 Nästa steg - Fas 4 (Statistik & Foto)

**Högsta prioritet:**
1. **Foto-upload:** Supabase Storage integration för fångstbilder
2. **Filtrering:** Filtrera fångster på art och datumintervall
3. **Basic statistik:**
   - Total antal fångster
   - Största fångst (vikt/längd)
   - Fångster per art (diagram)
   - Favorit fiskeplats

**Medium prioritet:**
4. **Trendgrafer:**
   - Vikt över tid (line chart)
   - Fångster per månad (bar chart)
   - Väderkorrelation (scatter plot)
5. **Export-funktion:** Exportera fångster till CSV/JSON
6. **Dela fångst:** Generera delbar länk med bild
7. **Månfas-data:** Visa månfas för varje fångst (bra för fiskeprognos)

**Lägre prioritet:**
8. **Mobile app:** Koppla Expo-app till Supabase
9. **Offline-funktionalitet:** SQLite + sync för mobil
10. **Heatmaps:** Värmekartor för fångstplatser
11. **Push-notiser:** Påminnelser om fiske

## Kända problem och lösningar

### Google Geocoding API "REQUEST_DENIED"
**Problem:** Geocoding API returnerar REQUEST_DENIED när man försöker hämta platsnamn.
**Lösning:**
1. Gå till Google Cloud Console
2. Aktivera "Geocoding API" i APIs & Services → Library
3. Appen har fallback till koordinater om API:et inte är aktiverat

### Demodata genererar 0 fångster
**Problem:** Artnamn i FISH_SPECIES matchar inte exakt med databas-arter.
**Lösning:** Kontrollera att fiskarter i databasen matchar namnen i generate-demo/route.ts

### Användare får "okänt fel" vid registrering
**Problem:** Otillräcklig felhantering gjorde det svårt att felsöka.
**Lösning:** Lagt till omfattande console.error() logging och detaljerade felmeddelanden

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