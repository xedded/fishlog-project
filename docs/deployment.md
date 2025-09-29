# Deployment Guide - FishLog

## Vercel Setup (Webb-app)

### 1. Länka GitHub Repository
```bash
# I fishlog-project/packages/web/
vercel --prod
```

### 2. Environment Variables
Lägg till dessa i Vercel Dashboard:

```
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
```

### 3. Automatisk Deploy
- Push till `main` branch deployas automatiskt
- Pull requests får preview deployments

## Expo Setup (Mobil-app)

### 1. EAS Build
```bash
# I fishlog-project/packages/mobile/
npx expo install expo-dev-client
eas build:configure
eas build --platform all
```

### 2. Environment Variables
Skapa `.env` i mobile-mappen:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. App Store Distribution
```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

## Database Deployment

### 1. Supabase Production
- Skapa nytt projekt på supabase.com
- Kopiera connection string till `DATABASE_URL`
- Aktivera Row Level Security
- Kör migrations: `npm run db:migrate`

### 2. Produktionsdata
```bash
# Seed med testdata (utveckling)
npm run db:seed

# Reset och seed
npm run db:reset
```

## CI/CD Pipeline

GitHub Actions kommer att:
1. Köra linting och tests
2. Bygga alla packages
3. Deploya webb-app till Vercel
4. Bygga mobil-app med EAS

## Monitoring

### Vercel Analytics
- Automatiskt aktiverat för Next.js
- Performance och användningsstatistik

### Supabase Dashboard
- Database metrics
- API calls
- Error tracking

### Sentry (Optional)
```bash
npm install @sentry/nextjs @sentry/react-native
```

## Secrets Management

**NEVER** commit:
- `.env` files
- API keys
- Database passwords
- JWT secrets

Använd:
- Vercel environment variables
- Expo secrets
- GitHub secrets för CI/CD