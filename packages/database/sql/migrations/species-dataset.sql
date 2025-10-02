-- Species Expansion Migration
-- Adds 100+ fish species with continent classification and English names

-- Step 1: Add continent column (if not exists)
ALTER TABLE species ADD COLUMN IF NOT EXISTS continent VARCHAR(50);
ALTER TABLE species ADD COLUMN IF NOT EXISTS name_english TEXT;

-- Step 2: Update existing 10 species with continent and English names
UPDATE species SET continent = 'Europe', name_english = 'Pike' WHERE name_swedish = 'Gädda';
UPDATE species SET continent = 'Europe', name_english = 'Perch' WHERE name_swedish = 'Abborre';
UPDATE species SET continent = 'Europe', name_english = 'Brown Trout' WHERE name_swedish = 'Öring';
UPDATE species SET continent = 'Europe', name_english = 'Zander' WHERE name_swedish = 'Gös';
UPDATE species SET continent = 'Europe', name_english = 'Atlantic Salmon' WHERE name_swedish = 'Lax';
UPDATE species SET continent = 'Europe', name_english = 'Atlantic Cod' WHERE name_swedish = 'Torsk';
UPDATE species SET continent = 'Europe', name_english = 'Mackerel' WHERE name_swedish = 'Makrill';
UPDATE species SET continent = 'Global', name_english = 'Rainbow Trout' WHERE name_swedish = 'Regnbågslax';
UPDATE species SET continent = 'Europe', name_english = 'Herring' WHERE name_swedish = 'Sill';
UPDATE species SET continent = 'Global', name_english = 'Common Carp' WHERE name_swedish = 'Karp';

-- Step 3: Add new European species
INSERT INTO species (name_swedish, name_english, name_latin, category, continent) VALUES
-- European Freshwater
('Braxen', 'Common Bream', 'Abramis brama', 'Fredsfisk', 'Europe'),
('Mört', 'Roach', 'Rutilus rutilus', 'Fredsfisk', 'Europe'),
('Sutare', 'Tench', 'Tinca tinca', 'Fredsfisk', 'Europe'),
('Ål', 'European Eel', 'Anguilla anguilla', 'Rovfisk', 'Europe'),
('Lake', 'Burbot', 'Lota lota', 'Rovfisk', 'Europe'),
('Asp', 'Asp', 'Leuciscus aspius', 'Rovfisk', 'Europe'),
('Id', 'Ide', 'Leuciscus idus', 'Fredsfisk', 'Europe'),
('Sarv', 'Common Ruffe', 'Gymnocephalus cernuus', 'Fredsfisk', 'Europe'),
('Löja', 'Vendace', 'Coregonus albula', 'Fredsfisk', 'Europe'),
('Sik', 'European Whitefish', 'Coregonus lavaretus', 'Fredsfisk', 'Europe'),
('Ruda', 'Crucian Carp', 'Carassius carassius', 'Fredsfisk', 'Europe'),
('Stäm', 'Wels Catfish', 'Silurus glanis', 'Rovfisk', 'Europe'),
('Björkna', 'White Bream', 'Blicca bjoerkna', 'Fredsfisk', 'Europe'),
('Vimma', 'Vimba Bream', 'Vimba vimba', 'Fredsfisk', 'Europe'),
('Gärs', 'Common Nase', 'Chondrostoma nasus', 'Fredsfisk', 'Europe'),
('Flodkräfta', 'European Crayfish', 'Astacus astacus', 'Skaldjur', 'Europe'),

-- European Saltwater
('Havsöring', 'Sea Trout', 'Salmo trutta', 'Rovfisk', 'Europe'),
('Flundra', 'European Flounder', 'Platichthys flesus', 'Rovfisk', 'Europe'),
('Hornfisk', 'Garfish', 'Belone belone', 'Rovfisk', 'Europe'),
('Piggvar', 'Turbot', 'Scophthalmus maximus', 'Rovfisk', 'Europe'),
('Rödspätta', 'European Plaice', 'Pleuronectes platessa', 'Rovfisk', 'Europe'),
('Skarpsill', 'European Sprat', 'Sprattus sprattus', 'Fredsfisk', 'Europe'),
('Tobis', 'Lesser Sand Eel', 'Ammodytes tobianus', 'Fredsfisk', 'Europe'),
('Kolja', 'Haddock', 'Melanogrammus aeglefinus', 'Rovfisk', 'Europe'),
('Vitling', 'Whiting', 'Merlangius merlangus', 'Rovfisk', 'Europe'),
('Sej', 'Saithe', 'Pollachius virens', 'Rovfisk', 'Europe'),

-- North American Freshwater
('Largemouth Bass', 'Largemouth Bass', 'Micropterus salmoides', 'Rovfisk', 'North America'),
('Smallmouth Bass', 'Smallmouth Bass', 'Micropterus dolomieu', 'Rovfisk', 'North America'),
('Walleye', 'Walleye', 'Sander vitreus', 'Rovfisk', 'North America'),
('Muskellunge', 'Muskellunge', 'Esox masquinongy', 'Rovfisk', 'North America'),
('Northern Pike', 'Northern Pike', 'Esox lucius', 'Rovfisk', 'North America'),
('Black Crappie', 'Black Crappie', 'Pomoxis nigromaculatus', 'Fredsfisk', 'North America'),
('White Crappie', 'White Crappie', 'Pomoxis annularis', 'Fredsfisk', 'North America'),
('Bluegill', 'Bluegill', 'Lepomis macrochirus', 'Fredsfisk', 'North America'),
('Pumpkinseed', 'Pumpkinseed', 'Lepomis gibbosus', 'Fredsfisk', 'North America'),
('Channel Catfish', 'Channel Catfish', 'Ictalurus punctatus', 'Rovfisk', 'North America'),
('Blue Catfish', 'Blue Catfish', 'Ictalurus furcatus', 'Rovfisk', 'North America'),
('Flathead Catfish', 'Flathead Catfish', 'Pylodictis olivaris', 'Rovfisk', 'North America'),
('Yellow Perch', 'Yellow Perch', 'Perca flavescens', 'Rovfisk', 'North America'),
('Brook Trout', 'Brook Trout', 'Salvelinus fontinalis', 'Rovfisk', 'North America'),
('Lake Trout', 'Lake Trout', 'Salvelinus namaycush', 'Rovfisk', 'North America'),
('Chinook Salmon', 'Chinook Salmon', 'Oncorhynchus tshawytscha', 'Rovfisk', 'North America'),
('Coho Salmon', 'Coho Salmon', 'Oncorhynchus kisutch', 'Rovfisk', 'North America'),
('Sockeye Salmon', 'Sockeye Salmon', 'Oncorhynchus nerka', 'Rovfisk', 'North America'),
('White Bass', 'White Bass', 'Morone chrysops', 'Rovfisk', 'North America'),
('Rock Bass', 'Rock Bass', 'Ambloplites rupestris', 'Rovfisk', 'North America'),

-- North American Saltwater
('Striped Bass', 'Striped Bass', 'Morone saxatilis', 'Rovfisk', 'North America'),
('Red Drum', 'Red Drum', 'Sciaenops ocellatus', 'Rovfisk', 'North America'),
('Snook', 'Common Snook', 'Centropomus undecimalis', 'Rovfisk', 'North America'),
('Tarpon', 'Atlantic Tarpon', 'Megalops atlanticus', 'Rovfisk', 'North America'),
('Bonefish', 'Bonefish', 'Albula vulpes', 'Rovfisk', 'North America'),
('Mahi-Mahi', 'Mahi-Mahi', 'Coryphaena hippurus', 'Rovfisk', 'Global'),
('Yellowfin Tuna', 'Yellowfin Tuna', 'Thunnus albacares', 'Rovfisk', 'Global'),
('Bluefish', 'Bluefish', 'Pomatomus saltatrix', 'Rovfisk', 'Global'),

-- Asian Species
('Snakehead', 'Giant Snakehead', 'Channa micropeltes', 'Rovfisk', 'Asia'),
('Tilapia', 'Nile Tilapia', 'Oreochromis niloticus', 'Fredsfisk', 'Global'),
('Grass Carp', 'Grass Carp', 'Ctenopharyngodon idella', 'Fredsfisk', 'Asia'),
('Silver Carp', 'Silver Carp', 'Hypophthalmichthys molitrix', 'Fredsfisk', 'Asia'),
('Bighead Carp', 'Bighead Carp', 'Hypophthalmichthys nobilis', 'Fredsfisk', 'Asia'),
('Catla', 'Catla', 'Catla catla', 'Fredsfisk', 'Asia'),
('Rohu', 'Rohu', 'Labeo rohita', 'Fredsfisk', 'Asia'),
('Mrigal', 'Mrigal Carp', 'Cirrhinus cirrhosus', 'Fredsfisk', 'Asia'),

-- Oceania Species
('Barramundi', 'Barramundi', 'Lates calcarifer', 'Rovfisk', 'Oceania'),
('Murray Cod', 'Murray Cod', 'Maccullochella peelii', 'Rovfisk', 'Oceania'),
('Golden Perch', 'Golden Perch', 'Macquaria ambigua', 'Rovfisk', 'Oceania'),
('Australian Bass', 'Australian Bass', 'Macquaria novemaculeata', 'Rovfisk', 'Oceania'),
('Silver Perch', 'Silver Perch', 'Bidyanus bidyanus', 'Fredsfisk', 'Oceania'),
('Yellowbelly', 'Yellowbelly', 'Macquaria ambigua', 'Rovfisk', 'Oceania'),

-- South American Species
('Peacock Bass', 'Peacock Bass', 'Cichla ocellaris', 'Rovfisk', 'South America'),
('Piranha', 'Red-Bellied Piranha', 'Pygocentrus nattereri', 'Rovfisk', 'South America'),
('Pacu', 'Red-Bellied Pacu', 'Piaractus brachypomus', 'Fredsfisk', 'South America'),
('Arapaima', 'Arapaima', 'Arapaima gigas', 'Rovfisk', 'South America'),
('Dorado', 'Golden Dorado', 'Salminus brasiliensis', 'Rovfisk', 'South America'),

-- African Species
('Nile Perch', 'Nile Perch', 'Lates niloticus', 'Rovfisk', 'Africa'),
('African Sharptooth Catfish', 'African Sharptooth Catfish', 'Clarias gariepinus', 'Rovfisk', 'Africa'),
('Tiger Fish', 'African Tiger Fish', 'Hydrocynus vittatus', 'Rovfisk', 'Africa');

-- Verify the migration
SELECT
  continent,
  COUNT(*) as species_count
FROM species
GROUP BY continent
ORDER BY species_count DESC;
