-- Check wind speed data in existing catches
SELECT 
  c.id,
  c.location_name,
  c.caught_at,
  w.wind_speed,
  w.wind_gusts,
  w.temperature,
  w.weather_desc
FROM catches c
LEFT JOIN weather_data w ON c.weather_id = w.id
WHERE w.wind_speed IS NOT NULL
ORDER BY c.caught_at DESC
LIMIT 10;
