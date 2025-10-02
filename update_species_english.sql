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
