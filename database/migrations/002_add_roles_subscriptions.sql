-- Migration: Add User Roles and Enhanced Subscription System
-- Removes firebase_uid field to eliminate confusion and adds role/subscription fields

BEGIN;

-- Remove the unused firebase_uid field to eliminate confusion
ALTER TABLE users DROP COLUMN IF EXISTS firebase_uid;

-- Add user role system
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'angler' 
  CHECK (role IN ('angler', 'admin'));

ALTER TABLE users ADD COLUMN account_status VARCHAR(20) DEFAULT 'active' 
  CHECK (account_status IN ('active', 'suspended', 'deactivated'));

ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- Replace subscription_status with new subscription system
ALTER TABLE users DROP COLUMN IF EXISTS subscription_status;

ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(20) DEFAULT 'free' 
  CHECK (subscription_plan IN ('free', 'pro', 'master'));

ALTER TABLE users ADD COLUMN subscription_tier INTEGER DEFAULT 1;

-- Add subscription management fields
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(100);
ALTER TABLE users ADD COLUMN subscription_start_date TIMESTAMP;
ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP;

-- Set catch limits based on subscription plan
ALTER TABLE users ADD COLUMN catch_limit_monthly INTEGER DEFAULT 5;

-- Add essential profile fields
ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN display_name VARCHAR(100);
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR(500);

-- Add privacy settings
ALTER TABLE users ADD COLUMN is_profile_public BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN show_location_on_catches BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN show_catch_stats BOOLEAN DEFAULT true;

-- Add app preferences
ALTER TABLE users ADD COLUMN preferred_units VARCHAR(20) DEFAULT 'imperial' 
  CHECK (preferred_units IN ('metric', 'imperial'));
  
ALTER TABLE users ADD COLUMN theme_preference VARCHAR(20) DEFAULT 'auto' 
  CHECK (theme_preference IN ('light', 'dark', 'auto'));

-- Add analytics fields
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN total_fishing_days INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN biggest_catch_weight DECIMAL(6,2);
ALTER TABLE users ADD COLUMN biggest_catch_species VARCHAR(100);

-- Update catch limits for existing users based on their needs
-- All existing users start with free plan (5 catches)
UPDATE users SET 
  subscription_plan = 'free',
  subscription_tier = 1,
  catch_limit_monthly = 5,
  role = 'angler',
  account_status = 'active',
  is_verified = true  -- Assume existing users are verified
WHERE subscription_plan IS NULL;

-- Create function to enforce catch limits
CREATE OR REPLACE FUNCTION enforce_catch_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Get user's current catch count and limit
    DECLARE
        current_count INTEGER;
        monthly_limit INTEGER;
        user_plan VARCHAR(20);
    BEGIN
        SELECT catches_count, catch_limit_monthly, subscription_plan 
        INTO current_count, monthly_limit, user_plan
        FROM users 
        WHERE id = NEW.user_id;
        
        -- Pro and Master tiers have unlimited catches
        IF user_plan IN ('pro', 'master') THEN
            RETURN NEW;
        END IF;
        
        -- Check if free tier user exceeds limit
        IF current_count >= monthly_limit THEN
            RAISE EXCEPTION 'Monthly catch limit of % exceeded. Please upgrade your subscription to continue logging catches.', monthly_limit;
        END IF;
        
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce catch limits
DROP TRIGGER IF EXISTS catch_limit_trigger ON catches;
CREATE TRIGGER catch_limit_trigger
    BEFORE INSERT ON catches
    FOR EACH ROW
    EXECUTE FUNCTION enforce_catch_limit();

-- Create function to reset monthly catch counts (for free tier users)
CREATE OR REPLACE FUNCTION reset_monthly_catch_counts()
RETURNS void AS $$
BEGIN
    -- Reset catch count for free tier users only
    UPDATE users SET catches_count = 0 
    WHERE subscription_plan = 'free';
    
    -- Log the reset
    RAISE NOTICE 'Monthly catch counts reset for free tier users at %', CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Update the user timestamp trigger to include new fields
CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user updates if it doesn't exist
DROP TRIGGER IF EXISTS update_user_timestamp_trigger ON users;
CREATE TRIGGER update_user_timestamp_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_timestamp();

COMMIT;