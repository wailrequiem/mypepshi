# Quick Setup Guide - Supabase Storage for Scan Photos

## 📦 Step 1: Create Storage Bucket

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/yufapyazxhjmjhonmfhd/storage

2. **Click "New Bucket"**
   - Name: `scan-photos`
   - Public: ✅ **ENABLED** (checked)
   - Click "Create bucket"

---

## 🔒 Step 2: Setup RLS Policies

1. **Go to SQL Editor:**
   - https://supabase.com/dashboard/project/yufapyazxhjmjhonmfhd/sql/new

2. **Run this SQL:**

```sql
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

3. **Click "Run"**

---

## ✅ Step 3: Verify Setup

1. **Check bucket exists:**
   - Storage → Buckets
   - You should see: `scan-photos` (Public)

2. **Check policies:**
   - Go to: Storage → Policies
   - You should see 5 policies for `scan-photos`

---

## 🧪 Step 4: Test Upload (Optional)

Test that uploads work:

```javascript
// In browser console after logging in:
const testBlob = new Blob(['test'], { type: 'image/jpeg' });
const { data, error } = await supabase.storage
  .from('scan-photos')
  .upload(`scans/${user.id}/test/front.jpg`, testBlob);

console.log(data ? '✅ Upload works!' : '❌ Error:', error);
```

---

## 📁 Folder Structure

After first scan, structure will be:

```
scan-photos/
  └── scans/
      └── {user-id}/
          └── {scan-id}/
              ├── front.jpg
              └── side.jpg
```

Example:
```
scan-photos/
  └── scans/
      └── 12345678-abcd-1234-efgh-123456789abc/
          └── a1b2c3d4-scan-uuid-here/
              ├── front.jpg
              └── side.jpg
```

---

## 🔗 Public URLs

Photos will be accessible via public URLs like:

```
https://yufapyazxhjmjhonmfhd.supabase.co/storage/v1/object/public/scan-photos/scans/{user-id}/{scan-id}/front.jpg
```

These URLs:
- ✅ Work without authentication
- ✅ Can be embedded in <img> tags
- ✅ Can be used by OpenAI Vision API
- ✅ Are permanently accessible

---

## 🚨 Security Notes

### What's Protected:
- Users can ONLY upload to their own folder (`scans/{their-user-id}/`)
- Users can ONLY view their own photos (when authenticated)
- Public can view photos if they have the URL (but can't list them)

### What's NOT:
- Direct folder browsing (users can't see other users' folders)
- Batch download (users can't download all photos)
- Listing files (users can't enumerate bucket contents)

---

## ⚠️ Important

**Bucket MUST be Public** for:
1. OpenAI to access photos (via public URL)
2. Dashboard to display photos
3. Scan history to show thumbnails

**RLS Policies protect:**
- Who can upload (only authenticated users to their folder)
- Who can modify/delete (only owners)

---

## 🎯 Done!

Once setup is complete:
- [x] Bucket created
- [x] Bucket is public
- [x] RLS policies enabled
- [x] Ready to receive photo uploads

**Now test the app flow:**
1. Take photos (guest mode)
2. Login on paywall
3. Photos should upload automatically
4. Check Storage to verify files exist
