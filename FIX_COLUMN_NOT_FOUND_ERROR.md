# 🚨 FIX: "Could not find the 'front_image_path' column" Error

## ❌ **PROBLEM**

Database error when saving scans:
```
Could not find the 'front_image_path' column of 'scans' in the schema cache
```

## 🔍 **ROOT CAUSE**

The `scans` table is missing the `front_image_path` and `side_image_path` columns.

---

## ✅ **SOLUTION**

### **Step 1: Add Columns to Database**

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Click "+ New query"**
3. **Copy and paste this SQL:**

```sql
-- Add image path columns
ALTER TABLE scans 
ADD COLUMN IF NOT EXISTS front_image_path TEXT,
ADD COLUMN IF NOT EXISTS side_image_path TEXT;

-- Add comments
COMMENT ON COLUMN scans.front_image_path IS 'Storage path for front photo (e.g., userId/scanId/front.jpg)';
COMMENT ON COLUMN scans.side_image_path IS 'Storage path for side photo (e.g., userId/scanId/side.jpg)';

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'scans' 
  AND column_name IN ('front_image_path', 'side_image_path');
```

4. **Click "Run"**
5. **Expected output:** 2 rows showing both columns

---

### **Step 2: Restart Supabase (Clear Cache)**

**Option A: Via Supabase Dashboard**
1. Go to **Settings** → **General**
2. Scroll to **Project Settings**
3. Click **"Restart project"** (if available)
4. Wait 30-60 seconds

**Option B: Wait for automatic cache refresh**
- Supabase caches schema for ~5 minutes
- Wait 5 minutes and try again

**Option C: Force refresh**
```javascript
// In your browser console, clear localStorage:
localStorage.clear();

// Refresh the page
location.reload();
```

---

### **Step 3: Verify Setup**

**Run this SQL to check:**
```sql
-- View all columns in scans table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'scans'
ORDER BY ordinal_position;
```

**Expected columns:**
- ✅ `id` (uuid)
- ✅ `user_id` (uuid)
- ✅ `front_image_path` (text) **← NEW**
- ✅ `side_image_path` (text) **← NEW**
- ✅ `scores_json` (jsonb)
- ✅ `notes_json` (jsonb)
- ✅ `created_at` (timestamp)

---

### **Step 4: Test Upload Again**

1. **Clear browser data:**
   ```javascript
   localStorage.clear();
   ```

2. **Do a new scan**
3. **Create account / login**
4. **Watch console logs**

**Expected console output:**
```
✅ [Paywall] Photos uploaded successfully
✅ [Paywall] AI analysis completed
💾 [Paywall] Saving scan to database...
✅ [Paywall] Scan saved successfully: <scan-id>
```

---

## 🔍 **Verification Checklist**

- [ ] SQL script executed successfully
- [ ] 2 columns shown in verification query
- [ ] Waited 5 minutes or restarted Supabase
- [ ] Cleared browser localStorage
- [ ] Test upload succeeded
- [ ] No more "column not found" errors

---

## 📊 **Database Schema (After Fix)**

```sql
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  front_image_path TEXT,           -- ← NEW: Storage path
  side_image_path TEXT,             -- ← NEW: Storage path
  scores_json JSONB,
  notes_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🆘 **Troubleshooting**

### **Error persists after adding columns:**

1. **Check if columns exist:**
   ```sql
   SELECT * FROM scans LIMIT 1;
   ```
   Look for `front_image_path` and `side_image_path` in results.

2. **Check Supabase connection:**
   ```javascript
   // In browser console:
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   ```
   Make sure it matches your project URL.

3. **Force schema refresh:**
   - Restart your dev server: `Ctrl+C` then `npm run dev`
   - Clear all browser data (not just localStorage)
   - Try in incognito/private window

4. **Check table permissions:**
   ```sql
   -- View RLS policies for scans table
   SELECT * FROM pg_policies WHERE tablename = 'scans';
   ```

---

## 📝 **After Fix: Code Flow**

### **Upload (Paywall.tsx):**
```typescript
// 1. Upload photos → get paths
const { frontImagePath, sideImagePath } = await uploadPhotosToStorage(...);

// 2. Save to DB with PATHS
await supabase.from("scans").insert({
  user_id: user.id,
  front_image_path: frontImagePath,  // ✅ "userId/scanId/front.jpg"
  side_image_path: sideImagePath,    // ✅ "userId/scanId/side.jpg"
  scores_json: { ... },
  notes_json: { ... },
});
```

### **Display (Dashboard.tsx):**
```typescript
// 1. Fetch PATHS from DB
const { data } = await supabase
  .from("scans")
  .select("front_image_path, side_image_path, ...")
  
// 2. Generate signed URLs
const frontUrl = await getSignedUrl(data.front_image_path, 3600);

// 3. Pass to UI
<PaymentSuccessScreen
  latestScanData={{
    ...scan,
    front_image_url: frontUrl,  // ✅ Signed URL (temporary)
    side_image_url: sideUrl,    // ✅ Signed URL (temporary)
  }}
/>
```

---

## ✅ **Success Criteria**

After completing these steps:
- ✅ Upload succeeds without errors
- ✅ Scan appears in `scans` table with paths
- ✅ Dashboard displays images correctly
- ✅ Console shows "Scan saved successfully"
- ✅ No 400 or "column not found" errors

---

## 📚 **Related Files**

- `ADD_IMAGE_PATH_COLUMNS.sql` - SQL script to add columns
- `src/pages/Paywall.tsx` - Upload and save logic
- `src/pages/Dashboard.tsx` - Fetch and display logic
- `src/lib/photoUpload.ts` - Upload utilities

---

**Run the SQL script now to fix this error! 🚀**
