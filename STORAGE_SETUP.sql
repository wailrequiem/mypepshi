# Supabase Storage Setup for Scan Photos

## Create Storage Bucket

Run this SQL in Supabase SQL Editor:

```sql
-- Create storage bucket for scan photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('scan-photos', 'scan-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own scan photos
CREATE POLICY "Users can upload own scan photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'scan-photos' AND
  (storage.foldername(name))[1] = 'scans' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can view their own scan photos
CREATE POLICY "Users can view own scan photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'scan-photos' AND
  (storage.foldername(name))[1] = 'scans' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Public can view scan photos (for public URLs)
CREATE POLICY "Public can view scan photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'scan-photos');

-- Policy: Users can update their own scan photos
CREATE POLICY "Users can update own scan photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'scan-photos' AND
  (storage.foldername(name))[1] = 'scans' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can delete their own scan photos
CREATE POLICY "Users can delete own scan photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'scan-photos' AND
  (storage.foldername(name))[1] = 'scans' AND
  (storage.foldername(name))[2] = auth.uid()::text
);
```

## Verify Bucket Creation

1. Go to Supabase Dashboard → Storage
2. You should see "scan-photos" bucket
3. Bucket should be marked as "Public"

## Test Upload

Try uploading a test file to verify policies work:

```javascript
const { data, error } = await supabase.storage
  .from('scan-photos')
  .upload('scans/test-user-id/test-scan-id/front.jpg', fileBlob);
```

## Folder Structure

Photos will be stored as:
```
scan-photos/
  └── scans/
      └── {userId}/
          └── {scanId}/
              ├── front.jpg
              └── side.jpg
```

## Public URLs

After upload, get public URL:
```javascript
const { data } = supabase.storage
  .from('scan-photos')
  .getPublicUrl('scans/user-id/scan-id/front.jpg');

console.log(data.publicUrl); // https://...supabase.co/storage/v1/object/public/scan-photos/scans/...
```
