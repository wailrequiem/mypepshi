-- ============================================================================
-- MIGRATION: Switch from public URLs to private paths
-- ============================================================================
-- This migration updates the scans table to use PATHS instead of URLs
-- for better security with PRIVATE Supabase Storage buckets.
-- ============================================================================

-- 1️⃣ Add new columns for paths (if they don't exist)
ALTER TABLE scans 
ADD COLUMN IF NOT EXISTS front_image_path TEXT,
ADD COLUMN IF NOT EXISTS side_image_path TEXT;

-- 2️⃣ Migrate existing data from URLs to paths (if you have existing data)
-- This extracts the path from the public URL
-- Example: https://xxx.supabase.co/storage/v1/object/public/scan-photos/scans/userId/scanId/front.jpg
-- Becomes: userId/scanId/front.jpg

-- OPTION A: If your old URLs contained "scans/" prefix:
UPDATE scans 
SET 
  front_image_path = regexp_replace(front_image_url, '^.*/scan-photos/scans/', ''),
  side_image_path = regexp_replace(side_image_url, '^.*/scan-photos/scans/', '')
WHERE front_image_url IS NOT NULL 
  AND side_image_url IS NOT NULL
  AND front_image_path IS NULL;

-- OPTION B: If your old URLs used userId/scanId directly (no "scans/" prefix):
-- UPDATE scans 
-- SET 
--   front_image_path = regexp_replace(front_image_url, '^.*/scan-photos/', ''),
--   side_image_path = regexp_replace(side_image_url, '^.*/scan-photos/', '')
-- WHERE front_image_url IS NOT NULL 
--   AND side_image_url IS NOT NULL
--   AND front_image_path IS NULL;

-- 3️⃣ Optional: Drop old URL columns after verifying paths work
-- ⚠️ ONLY RUN THIS AFTER CONFIRMING YOUR APP WORKS WITH PATHS!
-- ALTER TABLE scans DROP COLUMN IF EXISTS front_image_url;
-- ALTER TABLE scans DROP COLUMN IF EXISTS side_image_url;

-- 4️⃣ Add comments for documentation
COMMENT ON COLUMN scans.front_image_path IS 'Storage path for front photo (e.g., userId/scanId/front.jpg)';
COMMENT ON COLUMN scans.side_image_path IS 'Storage path for side photo (e.g., userId/scanId/side.jpg)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if paths were migrated correctly:
SELECT 
  id, 
  user_id,
  front_image_path,
  side_image_path,
  created_at
FROM scans
ORDER BY created_at DESC
LIMIT 5;

-- Check for any records missing paths:
SELECT COUNT(*) as records_missing_paths
FROM scans
WHERE front_image_path IS NULL OR side_image_path IS NULL;
