# Supabase Storage Setup - Foto-upload

## 1. Skapa Storage Bucket

1. **Gå till Supabase Dashboard**
   - Öppna ditt projekt på [supabase.com](https://supabase.com)
   - Gå till **Storage** i vänstermenyn

2. **Skapa ny bucket**
   - Klicka **"New bucket"**
   - **Name:** `catch-photos`
   - **Public bucket:** ✅ **JA** (för att kunna visa bilderna)
   - **File size limit:** 5 MB (rekommenderat)
   - **Allowed MIME types:** `image/*` (alla bildformat)
   - Klicka **"Create bucket"**

3. **Verifiera bucket**
   - Du bör nu se `catch-photos` i listan över buckets
   - Klicka på bucketen för att se den är tom

## 2. Storage Policies (RLS)

Supabase Storage använder också Row Level Security. Kör dessa SQL-kommandon i **SQL Editor**:

```sql
-- Policy: Användare kan ladda upp egna foton
CREATE POLICY "Users can upload own photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'catch-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Användare kan läsa egna foton
CREATE POLICY "Users can view own photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'catch-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Användare kan radera egna foton
CREATE POLICY "Users can delete own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'catch-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Alla kan läsa publika foton (om du vill dela fångster)
CREATE POLICY "Anyone can view public photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'catch-photos');
```

## 3. Filstruktur i Storage

Foton kommer lagras enligt följande struktur:
```
catch-photos/
├── {user_id}/
│   ├── {catch_id}_1.jpg
│   ├── {catch_id}_2.jpg
│   └── {catch_id}_3.jpg
└── {another_user_id}/
    └── {catch_id}_1.jpg
```

Detta gör att varje användare har sin egen mapp, och RLS säkerställer att de bara kan komma åt sina egna foton.

## 4. Verifiera Setup

Efter att ha skapat bucket och policies, verifiera att allt fungerar:

1. **Testa upload via Dashboard**
   - Gå till Storage → catch-photos
   - Försök ladda upp en testbild manuellt
   - Kontrollera att den syns i bucketen

2. **Testa RLS-policies**
   - Kör i SQL Editor:
   ```sql
   SELECT * FROM storage.objects WHERE bucket_id = 'catch-photos';
   ```
   - Du bör se dina uppladdade filer

## 5. Environment Variables

Inga nya environment variables behövs! Supabase Storage använder samma credentials som databasen:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (för server-side radering)

## Nästa Steg

Efter att storage är konfigurerad:
1. Uppdatera `photos`-tabellen i databasen
2. Skapa API route för foto-upload (`/api/upload-photo`)
3. Lägg till foto-upload i CatchForm
4. Visa foton i Dashboard och CatchCard

## Felsökning

**"Upload failed: new row violates row-level security policy"**
- Kontrollera att RLS-policies är skapade korrekt
- Verifiera att bucketen är public
- Kolla att användaren är authenticated

**"File too large"**
- Öka file size limit i bucket settings
- Eller implementera client-side bildkomprimering

**"Invalid MIME type"**
- Kontrollera allowed MIME types i bucket settings
- Säkerställ att filen verkligen är en bild
