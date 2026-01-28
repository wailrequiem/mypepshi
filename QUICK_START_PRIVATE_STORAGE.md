# 🚀 Quick Start: PRIVATE Storage Setup

Follow these steps IN ORDER to set up private photo storage.

---

## ⚡ **Step 1: Update Storage Bucket (Supabase Dashboard)**

### **Option A: Via Dashboard (Recommended)**
1. Go to **Supabase Dashboard** → **Storage**
2. Click on **scan-photos** bucket
3. Click **Settings** (gear icon)
4. **Turn OFF** the "Public bucket" toggle
5. Click **Save**

### **Option B: Via SQL Editor**
```sql
UPDATE storage.buckets 
SET public = false 
WHERE id = 'scan-photos';
```

---

## ⚡ **Step 2: Set Up RLS Policies**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **+ New query**
3. Copy and paste the entire contents of `PRIVATE_STORAGE_SETUP.sql`
4. Click **Run**

**Expected output:** 4 policies created successfully

---

## ⚡ **Step 3: Update Database Schema**

1. In **SQL Editor**, click **+ New query**
2. Copy and paste the contents of `MIGRATE_TO_PRIVATE_STORAGE.sql`
3. Click **Run**

**Expected output:** 
- 2 columns added (`front_image_path`, `side_image_path`)
- Existing data migrated (if any)

---

## ⚡ **Step 4: Verify Setup**

### **Check Bucket:**
```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'scan-photos';
```
**Expected:** `public = false` ✅

### **Check Policies:**
```sql
SELECT policyname
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%photos%';
```
**Expected:** 4 policies listed ✅

### **Check Database:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'scans' 
  AND column_name IN ('front_image_path', 'side_image_path');
```
**Expected:** 2 rows with type `text` ✅

---

## ⚡ **Step 5: Test the Implementation**

### **1. Clear Browser Data:**
```javascript
// In browser console:
localStorage.clear();
```

### **2. Test Upload:**
1. Do a face scan without being logged in
2. Create an account when prompted
3. Watch the console for upload logs
4. Check **Supabase Storage** → **scan-photos**
5. You should see: `userId/scanId/front.jpg` and `side.jpg`

### **3. Test Display:**
1. Go to Dashboard
2. You should see your photos
3. Check console for signed URL generation logs
4. Inspect image `src` - should contain `?token=` (signed URL)

---

## ⚡ **Step 6: Deploy Frontend**

All code changes are already in place. Just:

```bash
# If using Vite:
npm run build

# If using local dev:
npm run dev
```

---

## ✅ **Success Checklist**

- [ ] Bucket is PRIVATE (public = false)
- [ ] 4 RLS policies created
- [ ] Database has `front_image_path` and `side_image_path` columns
- [ ] Upload works (check Storage for files)
- [ ] Photos display correctly on Dashboard
- [ ] Console shows signed URL generation logs
- [ ] No "Bucket not found" errors
- [ ] No RLS policy violations

---

## 🆘 **Troubleshooting**

### **"Bucket not found" error**
```sql
-- Create bucket if missing:
INSERT INTO storage.buckets (id, name, public)
VALUES ('scan-photos', 'scan-photos', false);
```

### **"RLS policy violation" error**
- Re-run `PRIVATE_STORAGE_SETUP.sql`
- Make sure you're authenticated
- Check path format is `userId/scanId/front.jpg`

### **Images not loading**
- Check Console for signed URL generation logs
- Verify `front_image_path` exists in scans table
- Try increasing signed URL expiry time

---

## 📚 **Full Documentation**

See `PRIVATE_STORAGE_IMPLEMENTATION.md` for complete details.

---

## 🎉 **You're Done!**

Your photo storage is now:
- ✅ Private (not public)
- ✅ Secure (RLS enforced)
- ✅ User-specific (no cross-user access)
- ✅ Production-ready

**Total setup time:** ~10 minutes
