# Species Expansion Specification

## Overview
Expand the species list from 10 to 100+ fish species with smart regional sorting and user favorites.

## Database Schema Changes

### Add continent/region column to species table
```sql
ALTER TABLE species ADD COLUMN continent VARCHAR(50);
-- Values: 'Europe', 'North America', 'Asia', 'Oceania', 'South America', 'Africa', 'Global'
```

### Species Data Structure
```typescript
interface Species {
  id: string
  name_swedish: string
  name_english: string
  name_latin: string
  category: string
  continent: string // New field
}
```

## Regional Fish Species

### Europe (40+ species)
**Freshwater:**
- Pike (Gädda) - Esox lucius
- Perch (Abborre) - Perca fluviatilis
- Zander/Pike-perch (Gös) - Sander lucioperca
- Brown Trout (Öring) - Salmo trutta
- Rainbow Trout (Regnbågslax) - Oncorhynchus mykiss
- Atlantic Salmon (Lax) - Salmo salar
- European Carp (Karp) - Cyprinus carpio
- Common Bream (Braxen) - Abramis brama
- Roach (Mört) - Rutilus rutilus
- Tench (Sutare) - Tinca tinca
- Eel (Ål) - Anguilla anguilla
- Burbot (Lake) - Lota lota
- Asp - Leuciscus aspius
- Ide (Id) - Leuciscus idus

**Saltwater:**
- Atlantic Cod (Torsk) - Gadus morhua
- Mackerel (Makrill) - Scomber scombrus
- Herring (Sill) - Clupea harengus
- Sea Trout (Havsöring) - Salmo trutta
- Flounder (Flundra) - Platichthys flesus
- Garfish (Hornfisk) - Belone belone

### North America (40+ species)
**Freshwater:**
- Largemouth Bass - Micropterus salmoides
- Smallmouth Bass - Micropterus dolomieu
- Northern Pike - Esox lucius
- Walleye - Sander vitreus
- Muskellunge - Esox masquinongy
- Crappie (Black/White) - Pomoxis species
- Bluegill - Lepomis macrochirus
- Channel Catfish - Ictalurus punctatus
- Blue Catfish - Ictalurus furcatus
- Flathead Catfish - Pylodictis olivaris
- Yellow Perch - Perca flavescens
- Brook Trout - Salvelinus fontinalis
- Rainbow Trout - Oncorhynchus mykiss
- Lake Trout - Salvelinus namaycush
- Chinook Salmon - Oncorhynchus tshawytscha
- Coho Salmon - Oncorhynchus kisutch

**Saltwater:**
- Striped Bass - Morone saxatilis
- Red Drum (Redfish) - Sciaenops ocellatus
- Snook - Centropomus undecimalis
- Tarpon - Megalops atlanticus
- Bonefish - Albula vulpes
- Mahi-mahi - Coryphaena hippurus

### Asia (20+ species)
- Snakehead - Channa species
- Tilapia - Oreochromis species
- Asian Carp (various)
- Grass Carp - Ctenopharyngodon idella
- Catla - Catla catla
- Rohu - Labeo rohita
- Giant Snakehead - Channa micropeltes

### Oceania (10+ species)
- Barramundi - Lates calcarifer
- Murray Cod - Maccullochella peelii
- Golden Perch - Macquaria ambigua
- Australian Bass - Macquaria novemaculeata

### Global (Widespread species)
- Common Carp - Cyprinus carpio
- Rainbow Trout - Oncorhynchus mykiss
- Brown Trout - Salmo trutta

## Smart Sorting Logic

### 1. Detect User's Region
```typescript
// On first catch or from user profile
const detectContinent = (latitude: number, longitude: number): string => {
  // Europe: lat 35-70, lon -10-40
  // North America: lat 25-70, lon -170 to -50
  // etc.
  return continent
}
```

### 2. Species Dropdown Structure
```
┌─────────────────────────────────┐
│ [Your 5 Most Used Species]      │
│  • Pike                          │
│  • Perch                         │
│  • Zander                        │
│  • Brown Trout                   │
│  • Carp                          │
├─────────────────────────────────┤ ← disabled separator
│  ──────────────                  │
├─────────────────────────────────┤
│ [Regional Species - Europe]      │
│  • Pike (Gädda)                  │
│  • Perch (Abborre)               │
│  • ... (sorted alphabetically)   │
├─────────────────────────────────┤
│ [Other Species]                  │
│  • Largemouth Bass               │
│  • Walleye                       │
│  • ... (sorted alphabetically)   │
└─────────────────────────────────┘
```

### 3. Implementation

**Query user's favorite species:**
```sql
SELECT
  species_id,
  COUNT(*) as catch_count
FROM catches
WHERE user_id = $1
GROUP BY species_id
ORDER BY catch_count DESC
LIMIT 5
```

**Sorting in frontend:**
```typescript
const sortedSpecies = [
  ...userFavorites,
  { id: 'separator', name_english: '──────────────', disabled: true },
  ...regionalSpecies.sort((a, b) => a.name_english.localeCompare(b.name_english)),
  ...otherSpecies.sort((a, b) => a.name_english.localeCompare(b.name_english))
]
```

## UI Components to Update

1. **AddCatchForm.tsx** - Species dropdown
2. **EditCatchForm.tsx** - Species dropdown
3. **Dashboard.tsx** - Display species names (already uses species.name_swedish)

## Migration Plan

### Step 1: Database
1. Add `continent` column to species table
2. Add `name_english` column to species table
3. Update existing 10 species with continent + english names
4. Add 90+ new species with all data

### Step 2: Backend
1. Update fetchSpecies queries to include continent
2. Create utility function to detect continent from coordinates
3. Create API endpoint to fetch user's favorite species

### Step 3: Frontend
1. Add species sorting logic in components
2. Implement separator in dropdown
3. Update species display to show english/swedish based on language setting

### Step 4: Testing
1. Test with different user locations (Europe, USA, etc.)
2. Test with users who have many catches (favorites shown)
3. Test with new users (no favorites)

## Example SQL for species data
```sql
INSERT INTO species (name_swedish, name_english, name_latin, category, continent) VALUES
-- Europe
('Gädda', 'Pike', 'Esox lucius', 'Rovfisk', 'Europe'),
('Abborre', 'Perch', 'Perca fluviatilis', 'Rovfisk', 'Europe'),
-- North America
('Gös (Walleye)', 'Walleye', 'Sander vitreus', 'Rovfisk', 'North America'),
('Largemouth Bass', 'Largemouth Bass', 'Micropterus salmoides', 'Rovfisk', 'North America'),
-- etc.
```

## Notes
- Keep latin names for all species (scientifically correct)
- Swedish names can be translations or just use English name
- Category remains the same (Rovfisk, Fredsfisk, etc.) for color coding
- Continent should allow 'Global' for widespread species
