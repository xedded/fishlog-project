-- Skapa RPC-funktion för att kopiera provdata till ny användare
-- Kör denna SQL i Supabase SQL Editor

CREATE OR REPLACE FUNCTION copy_sample_data(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sample_user_id uuid := '550e8400-e29b-41d4-a716-446655440001';
BEGIN
    -- Kopiera favorite_locations
    INSERT INTO favorite_locations (id, user_id, name, latitude, longitude, description, created_at)
    SELECT
        gen_random_uuid(),
        target_user_id,
        name,
        latitude,
        longitude,
        description,
        NOW()
    FROM favorite_locations
    WHERE user_id = sample_user_id
    ON CONFLICT DO NOTHING;

    -- Kopiera catches (med nya UUID:er)
    INSERT INTO catches (
        id, user_id, species_id, weight, length, latitude, longitude,
        location_name, caught_at, created_at, updated_at, notes, weather_id
    )
    SELECT
        gen_random_uuid(),
        target_user_id,
        species_id,
        weight,
        length,
        latitude,
        longitude,
        location_name,
        caught_at,
        NOW(),
        NOW(),
        notes,
        weather_id
    FROM catches
    WHERE user_id = sample_user_id
    ON CONFLICT DO NOTHING;

    -- Uppdatera user profile
    UPDATE users
    SET updated_at = NOW()
    WHERE id = target_user_id;

END;
$$;

-- Ge rättigheter till authenticated users
GRANT EXECUTE ON FUNCTION copy_sample_data(uuid) TO authenticated;