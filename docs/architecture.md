# Arkitektur - FishLog

## Systemöversikt

```
┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   Mobile App    │
│   (Next.js)     │    │   (Expo RN)     │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌─────────────────┐
          │   Supabase      │
          │   - Auth        │
          │   - PostgreSQL  │
          │   - Storage     │
          │   - Real-time   │
          └─────────┬───────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼────┐  ┌──────▼──────┐  ┌────▼─────┐
│Mapbox  │  │OpenWeather  │  │  Prisma  │
│ Maps   │  │     API     │  │   ORM    │
└────────┘  └─────────────┘  └──────────┘
```

## Dataflöde

### Fångstregistrering
1. Användare registrerar fångst (webb/mobil)
2. Hämta aktuell position (GPS)
3. Hämta väderdata (OpenWeatherMap)
4. Spara till lokal databas (offline-stöd)
5. Sync till Supabase när online

### Offline-hantering (Mobil)
1. SQLite som lokal cache
2. Queue för pending syncs
3. Conflict resolution vid sync
4. Background sync när täckning återkommer

## Säkerhet

### Autentisering
- Supabase Auth med JWT tokens
- Row Level Security (RLS) i PostgreSQL
- Användare ser endast egna fångster

### Data
- Krypterade API-nycklar
- HTTPS överallt
- Bilder lagras i Supabase Storage med auth

## Skalbarhet

### Performance
- Next.js SSG för statiska sidor
- React Query för API caching
- Prisma connection pooling
- CDN för bilder

### Monitoring
- Supabase Analytics
- Error tracking (Sentry)
- Performance monitoring