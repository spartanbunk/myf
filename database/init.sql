-- Create database if not exists
SELECT 'CREATE DATABASE markyourfish'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'markyourfish')\gexec

-- Connect to the database
\c markyourfish;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    subscription_status VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    catches_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create species table
CREATE TABLE IF NOT EXISTS species (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color_code VARCHAR(7) NOT NULL,
    icon_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lures table
CREATE TABLE IF NOT EXISTS lures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create catches table
CREATE TABLE IF NOT EXISTS catches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    species_id INTEGER REFERENCES species(id),
    species_other VARCHAR(100),
    lure_id INTEGER REFERENCES lures(id),
    lure_other VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    depth DECIMAL(6, 2),
    water_temp DECIMAL(5, 2),
    length DECIMAL(6, 2),
    weight DECIMAL(6, 2),
    photo_url VARCHAR(500),
    notes TEXT,
    catch_date DATE NOT NULL,
    catch_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create weather_data table
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catch_id UUID NOT NULL REFERENCES catches(id) ON DELETE CASCADE,
    conditions VARCHAR(50),
    wind_speed DECIMAL(5, 2),
    wind_direction VARCHAR(10),
    air_temp DECIMAL(5, 2),
    lunar_phase VARCHAR(30),
    barometric_pressure DECIMAL(6, 2),
    pressure_trend VARCHAR(20),
    humidity DECIMAL(5, 2),
    visibility DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create photos table for multiple photos per catch
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catch_id UUID NOT NULL REFERENCES catches(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    caption VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_catches_user_id ON catches(user_id);
CREATE INDEX idx_catches_species_id ON catches(species_id);
CREATE INDEX idx_catches_catch_date ON catches(catch_date);
CREATE INDEX idx_catches_location ON catches(latitude, longitude);
CREATE INDEX idx_weather_catch_id ON weather_data(catch_id);
CREATE INDEX idx_photos_catch_id ON photos(catch_id);

-- Insert default species
INSERT INTO species (name, color_code) VALUES
    ('Musky', '#8B4513'),
    ('Pike', '#228B22'),
    ('Bass (Smallmouth)', '#4B0082'),
    ('Bass (Largemouth)', '#006400'),
    ('Walleye', '#FFD700'),
    ('Perch', '#FFA500'),
    ('Bluegill', '#4169E1'),
    ('Catfish', '#696969'),
    ('Trout', '#FF69B4'),
    ('Salmon', '#FA8072'),
    ('Other', '#800080')
ON CONFLICT (name) DO NOTHING;

-- Insert default lures
INSERT INTO lures (name, category) VALUES
    ('Bucktail', 'Spinner'),
    ('Spoon', 'Metal'),
    ('Topwater', 'Surface'),
    ('Crankbait', 'Diving'),
    ('Spinnerbait', 'Spinner'),
    ('Jig', 'Bottom'),
    ('Swimbait', 'Soft'),
    ('Soft Plastic', 'Soft'),
    ('Drop Shot', 'Finesse'),
    ('Rapala', 'Minnow'),
    ('Rattle Trap', 'Lipless'),
    ('Live Bait', 'Natural'),
    ('Other', 'Custom')
ON CONFLICT (name) DO NOTHING;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_catch_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_catch_timestamp_trigger
BEFORE UPDATE ON catches
FOR EACH ROW
EXECUTE FUNCTION update_catch_timestamp();

-- Create trigger to update user catches count
CREATE OR REPLACE FUNCTION update_user_catches_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET catches_count = catches_count + 1 WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET catches_count = catches_count - 1 WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_catches_count_trigger
AFTER INSERT OR DELETE ON catches
FOR EACH ROW
EXECUTE FUNCTION update_user_catches_count();