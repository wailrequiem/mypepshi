# ✅ PRIVATE Storage - Setup Checklist

Use this checklist to verify your PRIVATE storage implementation.

---

## 📋 **Pre-Setup Checklist**

- [ ] I have access to Supabase Dashboard
- [ ] I have the `scan-photos` bucket created
- [ ] I have backed up my database (optional but recommended)
- [ ] I have read `QUICK_START_PRIVATE_STORAGE.md`

---

## 🔧 **Setup Steps**

### **Step 1: Update Bucket to PRIVATE** ⚙️

**Via Dashboard:**
- [ ] Go to Supabase Dashboard → Storage
- [ ] Click on `scan-photos` bucket
- [ ] Click Settings (gear icon)
- [ ] Turn OFF "Public bucket" toggle
- [ ] Click Save

**Verification:**
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'scan-photos';
-- Expected result: public = false
```
- [ ] Verified: `public = false` ✅

---

### **Step 2: Run RLS Policies SQL** 🔐

- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Click "+ New query"
- [ ] Open `PRIVATE_STORAGE_SETUP.sql`
- [ ] Copy ALL contents
- [ ] Paste in SQL Editor
- [ ] Click "Run"
- [ ] Wait for success message

**Expected Output:**
```
Success. 4 rows affected.
```

**Verification:**
```sql
SELECT policyname
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%photos%';
-- Expected: 4 policies listed
```
- [ ] Verified: 4 policies created ✅

---

### **Step 3: Run Database Migration SQL** 🗄️

- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Click "+ New query"
- [ ] Open `MIGRATE_TO_PRIVATE_STORAGE.sql`
- [ ] Copy ALL contents
- [ ] Paste in SQL Editor
- [ ] Click "Run"
- [ ] Wait for success message

**Expected Output:**
```
Success. Columns added/updated.
```

**Verification:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'scans' 
  AND column_name IN ('front_image_path', 'side_image_path');
-- Expected: 2 rows
```
- [ ] Verified: 2 new columns exist ✅

---

## 🧪 **Testing Checklist**

### **Test 1: Upload Flow** 📤

- [ ] Clear browser data: `localStorage.clear()` in console
- [ ] Open browser DevTools → Console tab
- [ ] Do a face scan (without being logged in)
- [ ] Take front photo
- [ ] Take side photo
- [ ] Photos saved to localStorage

**Expected Console Log:**
```
✅ [ScanFlow] Front photo saved to localStorage
✅ [ScanFlow] Side photo saved to localStorage
```

- [ ] Click "Create Account to Continue"
- [ ] Create new account (or log in)
- [ ] Watch Console for upload logs

**Expected Console Logs:**
```
📤 [PhotoUpload] Starting upload to PRIVATE Supabase Storage
📤 [PhotoUpload] Uploading front photo to: userId/scanId/front.jpg
✅ [PhotoUpload] Front photo uploaded successfully
📤 [PhotoUpload] Uploading side photo to: userId/scanId/side.jpg
✅ [PhotoUpload] Side photo uploaded successfully
🔐 [PhotoUpload] Generating signed URLs for AI analysis
✅ [PhotoUpload] Upload complete
💾 [Paywall] Saving scan to database...
✅ [Paywall] Scan saved successfully
```

- [ ] All upload logs appeared correctly ✅
- [ ] No errors in console ✅
- [ ] Redirected to Dashboard ✅

---

### **Test 2: Verify Storage** 📁

**In Supabase Dashboard:**
- [ ] Go to Storage → scan-photos
- [ ] You should see a folder with your user ID
- [ ] Click into `userId/` folder
- [ ] You should see a folder with scan ID
- [ ] Click into `scanId/` folder
- [ ] You should see `front.jpg` and `side.jpg`

**Path Structure:**
```
scan-photos/
  └── userId/              ← Your user ID (UUID)
      └── scanId/          ← Scan ID (UUID)
          ├── front.jpg    ← Front photo
          └── side.jpg     ← Side photo
```

- [ ] Files exist in correct path format ✅
- [ ] Path is `userId/scanId/front.jpg` (NOT `scans/userId/...`) ✅

---

### **Test 3: Verify Database** 💾

**Run this SQL:**
```sql
SELECT 
  id,
  user_id,
  front_image_path,
  side_image_path,
  scores_json->>'overall' as overall_score,
  created_at
FROM scans
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- [ ] `front_image_path` = `"userId/scanId/front.jpg"` (PATH, not URL) ✅
- [ ] `side_image_path` = `"userId/scanId/side.jpg"` (PATH, not URL) ✅
- [ ] `overall_score` has a value (AI analysis worked) ✅
- [ ] NO `http://` or `https://` in paths ✅

---

### **Test 4: Display Flow** 🖼️

- [ ] Dashboard should load automatically (after upload)
- [ ] Images should be visible
- [ ] No broken image icons
- [ ] No 404 errors in Console

**Expected Console Logs:**
```
🔍 [Dashboard] Fetched scans from DB: 1
🔐 [Dashboard] Generating signed URL for front image: userId/scanId/front.jpg
🔐 [Dashboard] Generating signed URL for side image: userId/scanId/side.jpg
```

- [ ] Console logs appeared correctly ✅
- [ ] Images loaded successfully ✅

**Inspect Image URLs:**
- [ ] Right-click on front image → Inspect
- [ ] Check `src` attribute
- [ ] Should contain: `.../sign/scan-photos/userId/scanId/front.jpg?token=...`
- [ ] Should NOT contain: `/public/scan-photos/...`

- [ ] Image src contains `?token=` (signed URL) ✅
- [ ] Image src does NOT contain `/public/` ✅

---

### **Test 5: Security Test** 🔒

**Create a second account:**
- [ ] Log out
- [ ] Create new account with different email
- [ ] Try to navigate to first user's scan: `/scan/{firstUserScanId}`

**Expected Behavior:**
- [ ] Redirected to `/dashboard` (can't access other user's scan) ✅
- [ ] No photos from first user visible ✅

**Try direct Storage access:**
- [ ] In Supabase Dashboard → Storage → scan-photos
- [ ] Try to access first user's folder

**Expected Behavior:**
- [ ] Can only see own user ID folder ✅
- [ ] Cannot see other users' folders ✅

---

## 🎯 **Final Verification**

### **Console Checks**
- [ ] No "Bucket not found" errors
- [ ] No "RLS policy violation" errors
- [ ] No "Failed to create signed URL" errors
- [ ] All images load without 404 errors

### **Database Checks**
```sql
-- All scans have paths (not URLs):
SELECT COUNT(*) as scans_with_paths
FROM scans
WHERE front_image_path IS NOT NULL 
  AND side_image_path IS NOT NULL;
```
- [ ] All scans have paths ✅

### **Storage Checks**
- [ ] Bucket is PRIVATE (not public)
- [ ] Files follow `userId/scanId/filename.jpg` format
- [ ] RLS policies are active

### **Code Checks**
- [ ] No TypeScript errors
- [ ] No linter errors
- [ ] All imports resolved

---

## 📊 **Performance Check**

**Signed URL Generation:**
- [ ] Console shows signed URL generation time
- [ ] Should be < 100ms per URL
- [ ] No timeout errors

**Image Loading:**
- [ ] Images load within 2 seconds
- [ ] No broken images
- [ ] No loading spinners stuck

---

## 🚀 **Production Ready Checklist**

- [ ] All tests passed
- [ ] No console errors
- [ ] Images display correctly
- [ ] Security verified (no cross-user access)
- [ ] Database migration complete
- [ ] RLS policies active
- [ ] Bucket is PRIVATE
- [ ] Code deployed to production
- [ ] Tested on production environment
- [ ] Documentation reviewed

---

## 📈 **Success Metrics**

After completing this checklist, you should have:

- ✅ **0** public photo URLs in database
- ✅ **100%** of photos stored in PRIVATE bucket
- ✅ **4** RLS policies protecting Storage
- ✅ **0** cross-user access violations
- ✅ **100%** of images loading via signed URLs

---

## 🆘 **Troubleshooting**

If any test fails:

1. **Check** `QUICK_START_PRIVATE_STORAGE.md` → Troubleshooting section
2. **Verify** SQL scripts ran without errors
3. **Review** Console logs for specific error messages
4. **Confirm** bucket is PRIVATE (not public)
5. **Re-run** failed test after fixing issue

---

## ✅ **Completion**

Once all checkboxes are checked:

**Your PRIVATE storage implementation is COMPLETE and PRODUCTION-READY! 🎉**

Date completed: _______________
Tested by: _______________
Production deployed: _______________

---

## 📚 **Reference**

- Full guide: `PRIVATE_STORAGE_IMPLEMENTATION.md`
- Quick start: `QUICK_START_PRIVATE_STORAGE.md`
- Changes summary: `CHANGES_SUMMARY.md`
- SQL scripts: `PRIVATE_STORAGE_SETUP.sql`, `MIGRATE_TO_PRIVATE_STORAGE.sql`
