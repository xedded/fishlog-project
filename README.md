# 🎣 FishLog

Personlig fiskfångst-app för att registrera, visualisera och analysera dina fångster.

## ✨ Features

- 📝 **Registrera fångster** - Art, vikt, längd, plats, datum med kartväljare
- 🗺️ **Kartvisualisering** - Se alla dina fångster på en interaktiv karta
- 🌤️ **Väderdata** - Automatisk hämtning av historisk väderdata
- 📊 **Statistik** - Analysera dina fångster med grafer och statistik
- 🌍 **Internationellt** - Svenska/Engelska, Metric/Imperial enheter
- 🐟 **100+ Fiskarter** - Regionalt filtrerade arter från hela världen
- 📱 **Responsiv** - Fungerar på desktop, tablet och mobil
- 🔐 **Säker inloggning** - Google OAuth eller email/lösenord

## 🚀 Snabbstart

### Förutsättningar
- Node.js 18+
- Supabase-konto
- Google Maps API-nyckel
- Google Cloud projekt (för OAuth)

### Installation

```bash
# Klona projektet
git clone https://github.com/xedded/fishlog-project.git
cd fishlog-project

# Installera dependencies
npm install

# Konfigurera environment variables
# Kopiera .env.example till .env.local och fyll i:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# - GOOGLE_GEOCODING_API_KEY

# Starta utvecklingsserver
npm run dev:web
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

### Databas Setup

1. Gå till Supabase Dashboard → SQL Editor
2. Kör följande SQL-filer i ordning:
   ```
   packages/database/sql/create-tables.sql
   packages/database/sql/seed-data.sql
   packages/database/sql/migrations/migration-add-quantity.sql
   packages/database/sql/migrations/species-dataset.sql
   ```

## 📁 Projektstruktur

```
fishlog-project/
├── packages/
│   ├── web/              # Next.js webb-app (huvudprojekt)
│   │   ├── src/
│   │   │   ├── app/           # Next.js 15 App Router
│   │   │   ├── components/    # React-komponenter
│   │   │   ├── contexts/      # React Context (Language, Auth)
│   │   │   ├── lib/           # Utilities (supabase, helpers)
│   │   │   ├── types/         # TypeScript-definitioner
│   │   │   └── locales/       # i18n-översättningar
│   │   └── public/            # Statiska filer
│   ├── mobile/           # Expo React Native (ej kopplad)
│   ├── database/
│   │   └── sql/
│   │       ├── migrations/    # Aktiva databas-migrationer
│   │       ├── legacy/        # Gamla test-scripts
│   │       ├── create-tables.sql
│   │       └── seed-data.sql
│   └── shared/           # Delade TypeScript-typer (framtida)
├── docs/                 # Dokumentation
│   ├── setup/            # Setup-guider
│   ├── migrations/       # Migration-dokumentation
│   └── *.md             # Arkitektur, databas, deployment
└── CLAUDE.md            # Context för AI-assistent
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Databas:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Maps:** Google Maps API (@vis.gl/react-google-maps)
- **Väder:** Open-Meteo API
- **Deployment:** Vercel
- **Ikoner:** Lucide React

## 📖 Dokumentation

- [CLAUDE.md](CLAUDE.md) - Komplett kontext för utveckling
- [docs/architecture.md](docs/architecture.md) - Systemarkitektur
- [docs/database-schema.md](docs/database-schema.md) - Databasschema
- [docs/deployment.md](docs/deployment.md) - Deployment-guide
- [docs/supabase-setup.md](docs/supabase-setup.md) - Supabase-konfiguration
- [docs/LESSONS_LEARNED.md](docs/LESSONS_LEARNED.md) - Best practices

## 🚢 Deployment

Projektet deployas automatiskt till Vercel vid push till `master`.

**Viktigt:**
- Root Directory måste sättas till `packages/web` i Vercel-inställningar
- Environment variables måste konfigureras i Vercel Dashboard

Se [docs/deployment.md](docs/deployment.md) för fullständig guide.

## 🐛 Felsökning

### Vanliga problem

**"No species in dropdown"**
- Kör `packages/database/sql/migrations/species-dataset.sql` i Supabase

**"Build fails with TypeScript errors"**
- Kör `npm run build` lokalt först
- Kontrollera att alla types är korrekt definierade

**"Google Maps not loading"**
- Verifiera att API-nyckeln är korrekt i `.env.local`
- Kontrollera att Maps JavaScript API är aktiverat i Google Cloud Console

**"Geocoding fails"**
- Använd separat server-side nyckel för Geocoding API
- Ingen referer-restriktion på server-side nyckeln

Se [docs/LESSONS_LEARNED.md](docs/LESSONS_LEARNED.md) för fler lösningar.

## 🤝 Contributing

Detta är ett personligt projekt, men feedback och förslag är välkomna!

1. Fork projektet
2. Skapa en feature branch (`git checkout -b feature/amazing-feature`)
3. Commit dina ändringar (`git commit -m 'Add amazing feature'`)
4. Push till branchen (`git push origin feature/amazing-feature`)
5. Öppna en Pull Request

## 📝 License

Privat projekt - Ingen licens.

## 👨‍💻 Utvecklad av

xedded - [GitHub](https://github.com/xedded)

Med hjälp av Claude Code AI-assistent.
