-- ============================================================================
-- PRIVATE STORAGE BUCKET SETUP
-- ============================================================================
-- This script sets up a PRIVATE Supabase Storage bucket with proper RLS policies
-- for secure photo storage per user.
-- ============================================================================

-- 1️⃣ Create the PRIVATE bucket (if not exists)
-- ⚠️ Run this in Supabase Dashboard → Storage → "Create a new bucket"
-- OR use the SQL below:

INSERT INTO storage.buckets (id, name, public)
VALUES ('scan-photos', 'scan-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2️⃣ IMPORTANT: Make sure bucket is PRIVATE
UPDATE storage.buckets 
SET public = false 
WHERE id = 'scan-photos';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- 3️⃣ Drop existing policies (if any) to start fresh
DROP POLICY IF EXISTS "Users can insert their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

-- 4️⃣ Policy: Allow authenticated users to UPLOAD their own photos
-- Path format: ${userId}/${scanId}/front.jpg
CREATE POLICY "Users can insert their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'scan-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5️⃣ Policy: Allow authenticated users to READ their own photos
CREATE POLICY "Users can read their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'scan-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6️⃣ Policy: Allow authenticated users to UPDATE their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'scan-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 7️⃣ Policy: Allow authenticated users to DELETE their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'scan-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify bucket is PRIVATE:
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'scan-photos';
-- Expected: public = false

-- List all policies for scan-photos bucket:
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%photos%'
ORDER BY policyname;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- Path Format:
-- ✅ CORRECT:  userId/scanId/front.jpg
-- ❌ WRONG:    scans/userId/scanId/front.jpg
-- ❌ WRONG:    scanId/front.jpg
-- 
-- The RLS policies check that (storage.foldername(name))[1] = auth.uid()
-- This means the FIRST folder in the path MUST be the user's ID.
-- 
-- Example upload path:
-- "550e8400-e29b-41d4-a716-446655440000/abc123-def456/front.jpg"
--  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  = user ID (matches auth.uid())
--                                            ^^^^^^^^^^^ = scan ID
--                                                        ^^^^^^^^^ = filename
-- 
-- Security:
-- - Users can ONLY upload to their own userId/ folder
-- - Users can ONLY read/update/delete from their own userId/ folder
-- - No cross-user access possible
-- - All access requires authentication (authenticated role)
-- 
-- Signed URLs:
-- - Frontend generates signed URLs on-demand via createSignedUrl()
-- - Signed URLs expire after specified time (e.g., 60 seconds)
-- - Never store signed URLs in the database
-- - Only store paths: "userId/scanId/front.jpg"
-- 
-- ============================================================================
