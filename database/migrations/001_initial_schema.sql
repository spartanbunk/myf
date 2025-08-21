-- Migration 001: Initial Schema (for tracking purposes)
-- This represents the current state before role/subscription changes

BEGIN;

-- This migration file is created for tracking purposes
-- The initial schema was already applied via init.sql
-- We're just marking it as migration 001 so future migrations can build on it

-- Record that the initial schema is in place
SELECT 'Initial schema already exists' as status;

COMMIT;