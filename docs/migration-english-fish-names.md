# Migration: Add English Fish Names

## Step 1: Run in Supabase SQL Editor

Go to Supabase Dashboard → SQL Editor and run this SQL:

```sql
-- Add name_english column to species table
ALTER TABLE species ADD COLUMN IF NOT EXISTS name_english TEXT;

-- Update existing species with English names
UPDATE species SET name_english = 'Pike' WHERE name_swedish = 'Gädda';
UPDATE species SET name_english = 'Perch' WHERE name_swedish = 'Abborre';
UPDATE species SET name_english = 'Brown Trout' WHERE name_swedish = 'Öring';
UPDATE species SET name_english = 'Zander' WHERE name_swedish = 'Gös';
UPDATE species SET name_english = 'Atlantic Salmon' WHERE name_swedish = 'Lax';
UPDATE species SET name_english = 'Atlantic Cod' WHERE name_swedish = 'Torsk';
UPDATE species SET name_english = 'Mackerel' WHERE name_swedish = 'Makrill';
UPDATE species SET name_english = 'Rainbow Trout' WHERE name_swedish = 'Regnbågslax';
UPDATE species SET name_english = 'Herring' WHERE name_swedish = 'Sill';
UPDATE species SET name_english = 'Common Carp' WHERE name_swedish = 'Karp';
```

## Step 2: Verify

Check that all species have English names:

```sql
SELECT name_swedish, name_english, name_latin FROM species ORDER BY name_swedish;
```

Expected result:
- Abborre → Perch
- Gädda → Pike
- Gös → Zander
- Karp → Common Carp
- Lax → Atlantic Salmon
- Makrill → Mackerel
- Regnbågslax → Rainbow Trout
- Sill → Herring
- Torsk → Atlantic Cod
- Öring → Brown Trout

## Context

This migration adds English translations for all fish species names to support the new i18n (internationalization) feature. The app now displays species names in the user's selected language (Swedish or English).

**Date:** 2025-10-02
**Related:** i18n implementation (Fas 4)
