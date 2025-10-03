# Databas Schema - FishLog

## Huvudtabeller

### users
```sql
id              UUID PRIMARY KEY
email           VARCHAR UNIQUE NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
profile_name    VARCHAR
avatar_url      VARCHAR
```

### catches
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
species_id      UUID REFERENCES species(id)
weight          DECIMAL(5,2)  -- kg
length          DECIMAL(4,1)  -- cm
latitude        DECIMAL(10,8)
longitude       DECIMAL(11,8)
location_name   VARCHAR
caught_at       TIMESTAMP
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
notes           TEXT
weather_id      UUID REFERENCES weather_data(id)
```

### species
```sql
id              UUID PRIMARY KEY
name_swedish    VARCHAR NOT NULL
name_latin      VARCHAR
name_english    VARCHAR
category        VARCHAR  -- freshwater/saltwater
created_at      TIMESTAMP DEFAULT NOW()
```

### weather_data
```sql
id              UUID PRIMARY KEY
temperature     DECIMAL(4,1)  -- Celsius
pressure        DECIMAL(6,2)  -- hPa
wind_speed      DECIMAL(4,1)  -- m/s
wind_direction  INTEGER       -- degrees
humidity        INTEGER       -- percent
weather_desc    VARCHAR       -- clear, cloudy, rain etc
recorded_at     TIMESTAMP
created_at      TIMESTAMP DEFAULT NOW()
```

### photos
```sql
id              UUID PRIMARY KEY
catch_id        UUID REFERENCES catches(id)
file_path       VARCHAR NOT NULL
file_size       INTEGER
mime_type       VARCHAR
created_at      TIMESTAMP DEFAULT NOW()
```

### locations (för favoriter)
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
name            VARCHAR NOT NULL
latitude        DECIMAL(10,8)
longitude       DECIMAL(11,8)
description     TEXT
created_at      TIMESTAMP DEFAULT NOW()
```

## Indexer för Performance

```sql
-- Ofta använda queries
CREATE INDEX idx_catches_user_id ON catches(user_id);
CREATE INDEX idx_catches_species_id ON catches(species_id);
CREATE INDEX idx_catches_caught_at ON catches(caught_at);
CREATE INDEX idx_catches_location ON catches(latitude, longitude);

-- Geo-spatial queries för kartor
CREATE INDEX idx_catches_geo ON catches USING GIST(point(longitude, latitude));

-- Foto-kopplingar
CREATE INDEX idx_photos_catch_id ON photos(catch_id);
```

## Row Level Security (RLS)

```sql
-- Användare ser endast egna fångster
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see own catches" ON catches
  FOR ALL USING (auth.uid() = user_id);

-- Samma för foton
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see own photos" ON photos
  FOR ALL USING (auth.uid() = (
    SELECT user_id FROM catches WHERE id = catch_id
  ));
```

## Supabase Storage

### Bucket: catch-photos

**Konfiguration:**
- **Public:** ✅ Ja (för att kunna visa bilderna)
- **Max file size:** 5 MB
- **Allowed MIME types:** `image/*`

**Filstruktur:**
```
catch-photos/
├── {user_id_1}/
│   ├── {catch_id_1}_1.jpg
│   ├── {catch_id_1}_2.jpg
│   ├── {catch_id_2}_1.png
│   └── {catch_id_3}_1.jpg
├── {user_id_2}/
│   └── {catch_id_4}_1.jpg
```

**Storage Policies (RLS):**
```sql
-- Användare kan ladda upp egna foton
CREATE POLICY "Users can upload own photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'catch-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Användare kan läsa egna foton
CREATE POLICY "Users can view own photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'catch-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Användare kan radera egna foton
CREATE POLICY "Users can delete own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'catch-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Alla kan läsa publika foton (för delning)
CREATE POLICY "Anyone can view public photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'catch-photos');
```

**Public URL Format:**
```
https://{project}.supabase.co/storage/v1/object/public/catch-photos/{user_id}/{catch_id}_{index}.jpg
```

Se [docs/setup/supabase-storage-setup.md](setup/supabase-storage-setup.md) för fullständig setup-guide.