# Fix Google Console OAuth Configuration

## Problem
Error 400: redirect_uri_mismatch från Google OAuth

## Lösning: Uppdatera Google Cloud Console

### 1. Gå till Google Cloud Console
https://console.cloud.google.com/apis/credentials

### 2. Hitta ditt OAuth 2.0 Client ID
- Leta efter det OAuth client som används för Fishlog
- Eller skapa nytt om det inte finns

### 3. Lägg till Authorized redirect URIs
Klicka på OAuth client och lägg till dessa URIs:

```
https://upufuptjzprlysvkecpt.supabase.co/auth/v1/callback
https://fishlog-web.vercel.app/auth/callback
https://fishlog-vx83ypipo-xeddeds-projects.vercel.app/auth/callback
http://localhost:3000/auth/callback
http://localhost:3006/auth/callback
```

### 4. Spara ändringarna

## Viktigt!
Det primära som Google OAuth behöver är Supabase callback URL:
```
https://upufuptjzprlysvkecpt.supabase.co/auth/v1/callback
```

Detta är den URL som Supabase använder för att hantera Google OAuth callbacks.

## Kontrollera Supabase Settings också
Gå till: https://supabase.com/dashboard/project/upufuptjzprlysvkecpt/auth/providers

Kontrollera att Google OAuth är aktiverat och att:
- Client ID är korrekt
- Client Secret är korrekt
- Redirect URL är: `https://upufuptjzprlysvkecpt.supabase.co/auth/v1/callback`

## Efter fix:
Google OAuth kommer att fungera korrekt utan redirect_uri_mismatch fel.