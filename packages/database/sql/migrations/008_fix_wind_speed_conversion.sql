-- Fix wind speed conversion from km/h to m/s
-- Open-Meteo API returns wind speeds in km/h, but we store them as m/s
-- Previous data was stored incorrectly (km/h values were saved as m/s)
-- This migration converts all existing wind speed data from km/h to m/s

UPDATE weather_data
SET
  wind_speed = wind_speed / 3.6,
  wind_gusts = CASE
    WHEN wind_gusts IS NOT NULL THEN wind_gusts / 3.6
    ELSE NULL
  END
WHERE wind_speed IS NOT NULL;

COMMENT ON COLUMN weather_data.wind_speed IS 'Wind speed in m/s (converted from Open-Meteo km/h)';
COMMENT ON COLUMN weather_data.wind_gusts IS 'Wind gusts in m/s (converted from Open-Meteo km/h)';
