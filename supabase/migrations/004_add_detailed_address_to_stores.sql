-- ============================================================
-- PreLove - Migration 004
-- Add detailed address fields to stores
-- ============================================================

ALTER TABLE stores
ADD COLUMN kecamatan TEXT,
ADD COLUMN kelurahan TEXT,
ADD COLUMN rt_rw TEXT;
