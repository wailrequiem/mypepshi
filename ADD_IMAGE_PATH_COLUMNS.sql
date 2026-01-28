-- ============================================================================
-- ADD IMAGE PATH COLUMNS TO SCANS TABLE
-- ============================================================================
-- This script adds front_image_path and side_image_path columns to the scans table.
-- Run this in Supabase SQL Editor.
-- ============================================================================

-- 1️⃣ Add new columns for paths
ALTER TABLE scans 
ADD COLUMN IF NOT EXISTS front_image_path TEXT,
ADD COLUMN IF NOT EXISTS side_image_path TEXT;

-- 2️⃣ Add comments for documentation
COMMENT ON COLUMN scans.front_image_path IS 'Storage path for front photo in scan-photos bucket (e.g., userId/scanId/front.jpg). DO NOT store URLs, only paths.';
COMMENT ON COLUMN scans.side_image_path IS 'Storage path for side photo in scan-photos bucket (e.g., userId/scanId/side.jpg). DO NOT store URLs, only paths.';

-- 3️⃣ Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_scans_user_id_created_at ON scans(user_id, created_at DESC);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if columns were added:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'scans' 
  AND column_name IN ('front_image_path', 'side_image_path')
ORDER BY column_name;

-- Expected result: 2 rows showing both columns as TEXT, nullable

-- View table structure:
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'scans'
ORDER BY ordinal_position;

-- Check recent scans:
SELECT 
  id,
  user_id,
  front_image_path,
  side_image_path,
  created_at
FROM scans
ORDER BY created_at DESC
LIMIT 5;
