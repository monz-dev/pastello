-- Migration 00011: add is_guest flag to profiles.
--
-- Explicit boolean column (per design decision A) so guest accounts are
-- queryable and indexable without coupling logic to email format.
-- Safe on existing data: all current profiles default to is_guest = false.
--
-- Rollback: ALTER TABLE profiles DROP COLUMN is_guest;

ALTER TABLE profiles ADD COLUMN is_guest BOOLEAN DEFAULT false;

CREATE INDEX idx_profiles_is_guest ON profiles (is_guest);