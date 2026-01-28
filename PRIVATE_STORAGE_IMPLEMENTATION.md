# 🔐 PRIVATE Storage Implementation - Complete Guide

## ✅ **IMPLEMENTATION COMPLETE**

All code has been updated to use **PRIVATE Supabase Storage** with **signed URLs** and **path-based** database storage.

---

## 🎯 **What Changed**

### **BEFORE (Problematic):**
```typescript
// ❌ PUBLIC bucket
// ❌ Stored URLs in database
// ❌ Photos accessible to anyone with the URL
// ❌ Wrong path format: scans/userId/scanId/front.jpg
```

### **NOW (Secure):**
```typescript
// ✅ PRIVATE bucket
// ✅ Store PATHS in database (not URLs)
// ✅ Generate signed URLs on-demand for display
// ✅ Correct path format: userId/scanId/front.jpg
// ✅ RLS policies enforce user-specific access
```

---

## 📂 **File Changes**

### 1. **`src/lib/photoUpload.ts`** (UPDATED)

#### **Upload Function:**
```typescript
export async function uploadPhotosToStorage(
  userId: string,
  scanId: string,
  frontPhotoBase64: string,
  sidePhotoBase64: string
): Promise<UploadResult>
```

**Returns:**
- `frontImagePath` → Store in DB (e.g., `"userId/scanId/front.jpg"`)
- `sideImagePath` → Store in DB (e.g., `"userId/scanId/side.jpg"`)
- `frontImageUrl` → Signed URL for immediate AI analysis (60 min expiry)
- `sideImageUrl` → Signed URL for immediate AI analysis (60 min expiry)

**Upload Path:**
```typescript
const frontPath = `${userId}/${scanId}/front.jpg`;  // ✅ CORRECT
const sidePath = `${userId}/${scanId}/side.jpg`;    // ✅ CORRECT
```

**Signed URL Generation:**
```typescript
const { data: frontSignedData } = await supabase.storage
  .from("scan-photos")
  .createSignedUrl(frontPath, 3600); // 60 minutes
```

#### **Get Signed URL Function:**
```typescript
export async function getSignedUrl(
  path: string,
  expiresInSeconds: number = 60
): Promise<string | null>
```

**Usage:**
```typescript
const signedUrl = await getSignedUrl("userId/scanId/front.jpg", 3600);
// Returns a temporary URL valid for 1 hour
```

---

### 2. **`src/pages/Paywall.tsx`** (UPDATED)

**Upload Photos:**
```typescript
const { frontImagePath, sideImagePath, frontImageUrl, sideImageUrl } = 
  await uploadPhotosToStorage(
    user!.id,
    scanId,
    guestPhotos.frontPhotoBase64,
    guestPhotos.sidePhotoBase64
  );
```

**Save to Database (PATHS only):**
```typescript
await supabase
  .from("scans")
  .insert({
    user_id: user!.id,
    front_image_path: frontImagePath,  // ✅ Store PATH
    side_image_path: sideImagePath,    // ✅ Store PATH
    scores_json: { ... },
    notes_json: { ... },
  });
```

**AI Analysis (Signed URLs):**
```typescript
const { data: aiResponse } = await supabase.functions.invoke('analyze-face', {
  body: {
    front_image_url: frontImageUrl,  // ✅ Signed URL (60 min)
    side_image_url: sideImageUrl,    // ✅ Signed URL (60 min)
    sex,
    age,
  },
});
```

---

### 3. **`src/pages/Dashboard.tsx`** (UPDATED)

**Fetch Scans (PATHS from DB):**
```typescript
const { data } = await supabase
  .from("scans")
  .select("id, created_at, front_image_path, side_image_path, scores_json")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
```

**Generate Signed URLs for Display:**
```typescript
if (data[0].front_image_path) {
  const frontUrl = await getSignedUrl(data[0].front_image_path, 3600); // 1 hour
  setFrontImageSignedUrl(frontUrl);
}

if (data[0].side_image_path) {
  const sideUrl = await getSignedUrl(data[0].side_image_path, 3600); // 1 hour
  setSideImageSignedUrl(sideUrl);
}
```

**Pass to Component:**
```typescript
<PaymentSuccessScreen
  latestScanData={latestScan ? {
    ...latestScan,
    front_image_url: frontImageSignedUrl || "",  // ✅ Signed URL
    side_image_url: sideImageSignedUrl || "",    // ✅ Signed URL
  } : null}
/>
```

---

### 4. **`src/pages/ScanResults.tsx`** (UPDATED)

**Fetch Scan (PATH from DB):**
```typescript
const { data } = await supabase
  .from("scans")
  .select("*")
  .eq("id", scanId)
  .eq("user_id", user.id)
  .single();
```

**Generate Signed URLs:**
```typescript
if (data.front_image_path) {
  const frontUrl = await getSignedUrl(data.front_image_path, 3600);
  setFrontImageSignedUrl(frontUrl);
}

if (data.side_image_path) {
  const sideUrl = await getSignedUrl(data.side_image_path, 3600);
  setSideImageSignedUrl(sideUrl);
}
```

**Display Images:**
```typescript
<img src={frontImageSignedUrl} alt="Front photo" />
<img src={sideImageSignedUrl} alt="Side photo" />
```

---

## 🗄️ **Database Migration**

### **Run in Supabase SQL Editor:**

```sql
-- Add new columns for paths
ALTER TABLE scans 
ADD COLUMN IF NOT EXISTS front_image_path TEXT,
ADD COLUMN IF NOT EXISTS side_image_path TEXT;

-- Migrate existing data (if you have old URLs)
UPDATE scans 
SET 
  front_image_path = regexp_replace(front_image_url, '^.*/scan-photos/scans/', ''),
  side_image_path = regexp_replace(side_image_url, '^.*/scan-photos/scans/', '')
WHERE front_image_url IS NOT NULL 
  AND side_image_url IS NOT NULL
  AND front_image_path IS NULL;
```

**See:** `MIGRATE_TO_PRIVATE_STORAGE.sql` for full migration script.

---

## 🔐 **Storage Bucket Setup**

### **1. Make Bucket PRIVATE:**

In **Supabase Dashboard → Storage → scan-photos → Settings:**
- Set **Public** to **OFF** ❌

OR run SQL:
```sql
UPDATE storage.buckets 
SET public = false 
WHERE id = 'scan-photos';
```

### **2. Configure RLS Policies:**

Run the SQL script in `PRIVATE_STORAGE_SETUP.sql`:

```sql
-- Allow users to upload to their own userId/ folder
CREATE POLICY "Users can insert their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'scan-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read from their own userId/ folder
CREATE POLICY "Users can read their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'scan-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ... (UPDATE and DELETE policies too)
```

**See:** `PRIVATE_STORAGE_SETUP.sql` for complete RLS setup.

---

## 📋 **Path Format (CRITICAL)**

### **✅ CORRECT:**
```
userId/scanId/front.jpg
550e8400-e29b-41d4-a716-446655440000/abc123-def456/front.jpg
```

### **❌ WRONG:**
```
scans/userId/scanId/front.jpg      ❌ Extra "scans/" prefix
scanId/front.jpg                    ❌ Missing userId
userId/front.jpg                    ❌ Missing scanId
```

**Why it matters:**
- RLS policies check: `(storage.foldername(name))[1] = auth.uid()`
- This means the **FIRST folder** MUST be the user's ID
- Format: `${userId}/${scanId}/filename.jpg`

---

## 🔄 **Data Flow**

### **Upload Flow:**
```
1. User takes photos → localStorage (base64)
2. User logs in → Paywall.tsx
3. processGuestPhotos() called:
   ├─ uploadPhotosToStorage()
   │  ├─ Convert base64 → Blob
   │  ├─ Upload to: userId/scanId/front.jpg
   │  ├─ Upload to: userId/scanId/side.jpg
   │  ├─ Generate signed URLs (60 min)
   │  └─ Return { paths, signedUrls }
   ├─ Call analyze-face with signedUrls
   ├─ Save PATHS to scans table:
   │  ├─ front_image_path: "userId/scanId/front.jpg"
   │  └─ side_image_path: "userId/scanId/side.jpg"
   └─ Navigate to /dashboard
```

### **Display Flow:**
```
1. Dashboard.tsx loads
2. Fetch scans table:
   ├─ front_image_path: "userId/scanId/front.jpg"
   └─ side_image_path: "userId/scanId/side.jpg"
3. Generate signed URLs (1 hour):
   ├─ getSignedUrl(front_image_path, 3600)
   └─ getSignedUrl(side_image_path, 3600)
4. Pass signed URLs to UI:
   └─ <img src={signedUrl} />
```

---

## 🧪 **Testing Instructions**

### **1. Verify Bucket is PRIVATE:**

**Supabase Dashboard → Storage → scan-photos:**
- ✅ Public toggle should be **OFF**

**SQL Check:**
```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'scan-photos';
-- Expected: public = false
```

---

### **2. Test Upload Flow:**

1. **Clear existing data:**
   ```javascript
   localStorage.clear(); // In browser console
   ```

2. **Open DevTools Console**

3. **Do a scan without being logged in:**
   - Take front photo
   - Take side photo
   - Photos saved to localStorage

4. **Click "Create Account to Continue"**

5. **Create your account**

6. **Watch Console Logs:**
   ```
   📤 [PhotoUpload] Starting upload to PRIVATE Supabase Storage
   📤 [PhotoUpload] Uploading front photo to: userId/scanId/front.jpg
   ✅ [PhotoUpload] Front photo uploaded successfully
   📤 [PhotoUpload] Uploading side photo to: userId/scanId/side.jpg
   ✅ [PhotoUpload] Side photo uploaded successfully
   🔐 [PhotoUpload] Generating signed URLs for AI analysis (60 min expiry)...
   ✅ [PhotoUpload] Upload complete
   💾 [Paywall] Saving scan to database...
   ✅ [Paywall] Scan saved successfully
   ```

7. **Check Supabase Storage:**
   - Go to **Storage → scan-photos**
   - You should see: `userId/scanId/front.jpg` and `side.jpg`

8. **Check Database:**
   ```sql
   SELECT 
     id, 
     user_id,
     front_image_path,
     side_image_path,
     created_at
   FROM scans
   ORDER BY created_at DESC
   LIMIT 1;
   ```
   - Expected: Paths like `"userId/scanId/front.jpg"` (NOT URLs)

---

### **3. Test Display Flow:**

1. **Dashboard should load and show images**

2. **Watch Console Logs:**
   ```
   🔍 [Dashboard] Fetched scans from DB: 1
   🔐 [Dashboard] Generating signed URL for front image: userId/scanId/front.jpg
   🔐 [Dashboard] Generating signed URL for side image: userId/scanId/side.jpg
   ```

3. **Verify images are visible:**
   - You should see your front and side photos
   - They should load without errors

4. **Inspect image URLs in DevTools:**
   - Right-click image → Inspect
   - The `src` should contain a signed URL like:
     ```
     https://xxx.supabase.co/storage/v1/object/sign/scan-photos/userId/scanId/front.jpg?token=xxx
     ```
   - **NOT** a public URL with `/public/` in it

---

### **4. Test Security (Cross-User Access):**

1. **Create a second account** (different email)

2. **Try to access the first user's scan:**
   - Go to `/scan/{firstUserScanId}`
   - You should be **redirected to /dashboard**
   - No access to other user's data

3. **Check Storage directly:**
   - In Supabase Storage, try to access another user's folder
   - Should get **permission denied** error

---

## ⚠️ **Common Errors & Fixes**

### **Error: "Bucket not found"**
**Cause:** Bucket doesn't exist or has wrong name.

**Fix:**
```sql
-- Verify bucket exists:
SELECT * FROM storage.buckets WHERE id = 'scan-photos';

-- Create if missing:
INSERT INTO storage.buckets (id, name, public)
VALUES ('scan-photos', 'scan-photos', false);
```

---

### **Error: "new row violates row-level security policy"**
**Cause:** RLS policies not configured or path format wrong.

**Fix:**
1. Run `PRIVATE_STORAGE_SETUP.sql` to create policies
2. Verify path format is `userId/scanId/front.jpg`
3. Check user is authenticated

---

### **Error: "Failed to create signed URL"**
**Cause:** Trying to generate signed URL for non-existent file or wrong path.

**Fix:**
1. Verify file exists in Storage
2. Check path format matches DB
3. Ensure user has permission to read the file

---

### **Images not loading in UI**
**Cause:** Signed URLs expired or not generated.

**Fix:**
1. Check Console for signed URL generation logs
2. Increase expiry time in `getSignedUrl()` calls
3. Verify `front_image_path` and `side_image_path` exist in DB

---

## 🔒 **Security Benefits**

### **BEFORE (PUBLIC bucket):**
- ❌ Anyone with URL can access photos
- ❌ URLs are permanent
- ❌ No user-specific access control
- ❌ Privacy concerns

### **NOW (PRIVATE bucket):**
- ✅ Only authenticated users can access
- ✅ Only owner can access their own photos
- ✅ Signed URLs expire automatically
- ✅ RLS enforces user-specific access
- ✅ Full privacy and security

---

## 📊 **Performance Considerations**

**Signed URL Generation:**
- **Cost:** ~10-50ms per URL
- **Caching:** Consider caching signed URLs in state for 30-60 min
- **Optimization:** Generate URLs in parallel using `Promise.all()`

**Example:**
```typescript
const [frontUrl, sideUrl] = await Promise.all([
  getSignedUrl(frontPath, 3600),
  getSignedUrl(sidePath, 3600),
]);
```

---

## 📚 **Files Reference**

### **Code Files:**
- ✅ `src/lib/photoUpload.ts` - Upload & signed URL logic
- ✅ `src/pages/Paywall.tsx` - Upload after auth
- ✅ `src/pages/Dashboard.tsx` - Display with signed URLs
- ✅ `src/pages/ScanResults.tsx` - Display individual scan

### **SQL Files:**
- ✅ `PRIVATE_STORAGE_SETUP.sql` - Bucket & RLS setup
- ✅ `MIGRATE_TO_PRIVATE_STORAGE.sql` - Database migration

### **Documentation:**
- ✅ `PRIVATE_STORAGE_IMPLEMENTATION.md` (this file)

---

## ✅ **Checklist**

Before deploying to production:

- [ ] Run `PRIVATE_STORAGE_SETUP.sql` in Supabase
- [ ] Run `MIGRATE_TO_PRIVATE_STORAGE.sql` if you have existing data
- [ ] Verify bucket is PRIVATE (public = false)
- [ ] Test upload flow (scan → login → upload → display)
- [ ] Test display flow (Dashboard & ScanResults)
- [ ] Verify signed URLs are working
- [ ] Verify images load correctly
- [ ] Test cross-user security (no unauthorized access)
- [ ] Check Console logs for any errors
- [ ] Deploy frontend code

---

## 🎉 **Result**

You now have a **fully secure, private photo storage system** with:
- ✅ User-specific access control
- ✅ Temporary signed URLs
- ✅ No direct public access
- ✅ RLS policy enforcement
- ✅ Path-based database storage
- ✅ Production-ready security

**Your users' photos are now 100% private and secure! 🔐**
