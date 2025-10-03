-- Migration: Add wind_gusts column to weather_data table
-- Date: 2025-01-10
-- Description: Store wind gust data alongside wind speed for better weather accuracy

ALTER TABLE weather_data
ADD COLUMN wind_gusts DECIMAL(5,1);

COMMENT ON COLUMN weather_data.wind_gusts IS 'Wind gusts in m/s from Open-Meteo API';
