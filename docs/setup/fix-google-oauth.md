# Fix Google OAuth Callback Problem

## Problem
Google OAuth fungerar lokalt men "tänker" efter att ha valt konto i production.

## Lösning: Uppdatera Supabase OAuth Settings

### 1. Gå till Supabase Dashboard
https://supabase.com/dashboard/project/upufuptjzprlysvkecpt/auth/url-configuration

### 2. Lägg till nya Site URLs
I "Site URL" fältet, lägg till:
```
https://fishlog-web.vercel.app
```

### 3. Lägg till Redirect URLs
I "Redirect URLs" fältet, lägg till:
```
https://fishlog-web.vercel.app/auth/callback
https://fishlog-vx83ypipo-xeddeds-projects.vercel.app/auth/callback
```

### 4. Nuvarande konfiguration (behåll dessa också):
```
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:3006
http://localhost:3006/auth/callback
```

### 5. Klicka "Save"

## Varför detta behövs:
- Supabase OAuth måste veta vilka domäner som är tillåtna för callbacks
- Utan detta så "hänger sig" OAuth-flödet efter Google-inloggning
- Detta är en säkerhetsfunktion för att förhindra OAuth-attacker

## Efter fix:
Google OAuth kommer att fungera korrekt och redirecta tillbaka till appen efter inloggning.