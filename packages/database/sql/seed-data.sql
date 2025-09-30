-- FishLog Test Data
-- Run this in Supabase SQL Editor AFTER creating tables

-- Insert test user
INSERT INTO users (id, email, profile_name) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'test@fishlog.se', 'Test Fiskare')
ON CONFLICT (email) DO NOTHING;

-- Insert Swedish fish species
INSERT INTO species (id, name_swedish, name_latin, name_english, category) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Gädda', 'Esox lucius', 'Northern Pike', 'freshwater'),
('550e8400-e29b-41d4-a716-446655440011', 'Abborre', 'Perca fluviatilis', 'European Perch', 'freshwater'),
('550e8400-e29b-41d4-a716-446655440012', 'Gös', 'Sander lucioperca', 'Zander', 'freshwater'),
('550e8400-e29b-41d4-a716-446655440013', 'Öring', 'Salmo trutta', 'Brown Trout', 'freshwater'),
('550e8400-e29b-41d4-a716-446655440014', 'Lax', 'Salmo salar', 'Atlantic Salmon', 'freshwater'),
('550e8400-e29b-41d4-a716-446655440015', 'Torsk', 'Gadus morhua', 'Atlantic Cod', 'saltwater'),
('550e8400-e29b-41d4-a716-446655440016', 'Makrill', 'Scomber scombrus', 'Atlantic Mackerel', 'saltwater'),
('550e8400-e29b-41d4-a716-446655440017', 'Sill', 'Clupea harengus', 'Atlantic Herring', 'saltwater'),
('550e8400-e29b-41d4-a716-446655440018', 'Regnbågslax', 'Oncorhynchus mykiss', 'Rainbow Trout', 'freshwater'),
('550e8400-e29b-41d4-a716-446655440019', 'Karp', 'Cyprinus carpio', 'Common Carp', 'freshwater')
ON CONFLICT (id) DO NOTHING;

-- Insert favorite locations
INSERT INTO favorite_locations (id, user_id, name, latitude, longitude, description) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', 'Vänern - Kållandsö', 58.5923, 13.0813, 'Bra gös- och gäddvatten vid Kållandsö'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', 'Vättern - Visingsö', 57.9833, 14.3833, 'Öringfiske runt Visingsö'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440001', 'Stockholms skärgård - Sandhamn', 59.2917, 18.9167, 'Havsfiske efter torsk och abborre'),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440001', 'Mörrum - Laxfiske', 56.1667, 14.75, 'Världsberömt laxfiske i Mörrumsån'),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440001', 'Siljan - Rättvik', 60.8833, 15.1167, 'Öring och gös i Siljan')
ON CONFLICT (id) DO NOTHING;

-- Insert weather data
INSERT INTO weather_data (id, temperature, pressure, wind_speed, wind_direction, humidity, weather_desc, recorded_at) VALUES
('550e8400-e29b-41d4-a716-446655440030', 15.5, 1013.2, 3.2, 180, 65, 'Partly cloudy', '2024-03-15 08:30:00'),
('550e8400-e29b-41d4-a716-446655440031', 12.1, 1018.7, 5.1, 225, 72, 'Overcast', '2024-03-20 14:15:00'),
('550e8400-e29b-41d4-a716-446655440032', 18.3, 1005.9, 2.8, 90, 58, 'Clear sky', '2024-04-02 06:45:00'),
('550e8400-e29b-41d4-a716-446655440033', 8.7, 1021.4, 4.3, 315, 78, 'Light rain', '2024-04-10 16:20:00')
ON CONFLICT (id) DO NOTHING;

-- Insert catches
INSERT INTO catches (id, user_id, species_id, weight, length, latitude, longitude, location_name, caught_at, notes, weather_id) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 4.2, 68.5, 58.5923, 13.0813, 'Vänern - Kållandsö', '2024-03-15 08:30:00', 'Fantastisk gädda på wobbler vid gräsbänk. Starka ryck!', '550e8400-e29b-41d4-a716-446655440030'),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 0.8, 25.3, 59.2917, 18.9167, 'Stockholms skärgård - Sandhamn', '2024-03-20 14:15:00', 'Fin abborre på jig vid stengrund', '550e8400-e29b-41d4-a716-446655440031'),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440013', 1.6, 42.1, 57.9833, 14.3833, 'Vättern - Visingsö', '2024-04-02 06:45:00', 'Vacker öring på spinnare i gryningen', '550e8400-e29b-41d4-a716-446655440032'),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', 2.8, 55.7, 58.5923, 13.0813, 'Vänern - Kållandsö', '2024-04-10 16:20:00', 'Gös på jigg vid 8 meters djup', '550e8400-e29b-41d4-a716-446655440033'),
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440014', 6.5, 78.2, 56.1667, 14.75, 'Mörrum - Laxfiske', '2024-04-15 05:20:00', 'Stor lax på flugfiske! Kamp på 15 minuter.', NULL),
('550e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 2.1, 52.3, 60.8833, 15.1167, 'Siljan - Rättvik', '2024-05-01 11:30:00', 'Mindre gädda men fin fisk på spoon', NULL)
ON CONFLICT (id) DO NOTHING;

-- Verify data
SELECT 'Users' as table_name, count(*) as rows FROM users
UNION ALL
SELECT 'Species', count(*) FROM species
UNION ALL
SELECT 'Favorite Locations', count(*) FROM favorite_locations
UNION ALL
SELECT 'Weather Data', count(*) FROM weather_data
UNION ALL
SELECT 'Catches', count(*) FROM catches;