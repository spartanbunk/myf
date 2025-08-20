-- Migration: Create all tables for Markyourfish application
-- Date: 2025-01-20

-- Create species table
CREATE TABLE IF NOT EXISTS species (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  scientific_name VARCHAR(150),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lures table  
CREATE TABLE IF NOT EXISTS lures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50),
  brand VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create catches table (already exists, but let's ensure all columns)
CREATE TABLE IF NOT EXISTS catches (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  species VARCHAR(100) NOT NULL,
  weight DECIMAL(10,2),
  length DECIMAL(10,2),
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,6),
  longitude DECIMAL(11,6),
  date TIMESTAMP NOT NULL,
  notes TEXT,
  photo_urls TEXT,
  lure_type VARCHAR(100),
  depth DECIMAL(10,2),
  water_temperature DECIMAL(5,2),
  weather_conditions VARCHAR(100),
  air_temperature DECIMAL(5,2),
  wind_speed DECIMAL(5,2),
  wind_direction VARCHAR(10),
  barometric_pressure DECIMAL(6,2),
  pressure_trend VARCHAR(20),
  lunar_phase VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create weather_data table
CREATE TABLE IF NOT EXISTS weather_data (
  id SERIAL PRIMARY KEY,
  catch_id INTEGER REFERENCES catches(id) ON DELETE CASCADE,
  temperature DECIMAL(5,2),
  feels_like DECIMAL(5,2),
  humidity INTEGER,
  pressure DECIMAL(6,2),
  visibility DECIMAL(10,2),
  wind_speed DECIMAL(5,2),
  wind_direction INTEGER,
  clouds INTEGER,
  conditions VARCHAR(100),
  icon VARCHAR(10),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  catch_id INTEGER REFERENCES catches(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_catches_user_id ON catches(user_id);
CREATE INDEX IF NOT EXISTS idx_catches_species ON catches(species);
CREATE INDEX IF NOT EXISTS idx_catches_date ON catches(date);
CREATE INDEX IF NOT EXISTS idx_catches_location ON catches(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_weather_catch_id ON weather_data(catch_id);
CREATE INDEX IF NOT EXISTS idx_photos_catch_id ON photos(catch_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for catches table
DROP TRIGGER IF EXISTS update_catches_updated_at ON catches;
CREATE TRIGGER update_catches_updated_at 
  BEFORE UPDATE ON catches 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();