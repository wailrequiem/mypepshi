# Guest Photos Flow - Implementation Documentation

## 🎯 Overview

Photos are now stored **locally BEFORE authentication** and uploaded to Supabase Storage **ONLY AFTER login**.

---

## 📋 Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER CAPTURES PHOTOS (No Auth Required)                     │
│    ├─ Front photo confirmed                                     │
│    ├─ Side photo confirmed                                      │
│    └─ ScanFlow.tsx                                             │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SAVE PHOTOS LOCALLY                                          │
│    ├─ saveGuestPhotos({ frontPhotoBase64, sidePhotoBase64 })  │
│    ├─ Stored in localStorage (key: "guest_photos")            │
│    ├─ NO upload to Supabase                                    │
│    ├─ NO call to analyze-face                                  │
│    └─ Log: "💾 [GuestPhotos] Saved guest photos"              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. REDIRECT TO PAYWALL                                          │
│    ├─ navigate("/paywall")                                     │
│    └─ User must login/signup                                    │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. USER LOGS IN                                                 │
│    ├─ Authentication successful                                 │
│    ├─ user state updated                                        │
│    └─ Paywall.tsx useEffect triggers                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. LOAD GUEST PHOTOS                                            │
│    ├─ loadGuestPhotos()                                        │
│    ├─ Returns: { frontPhotoBase64, sidePhotoBase64, timestamp }│
│    └─ Log: "✅ [GuestPhotos] Loaded guest photos"              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. UPLOAD TO SUPABASE STORAGE                                   │
│    ├─ uploadPhotosToStorage(userId, scanId, front, side)      │
│    ├─ Path: scans/{userId}/{scanId}/front.jpg                 │
│    ├─ Path: scans/{userId}/{scanId}/side.jpg                  │
│    ├─ Get public URLs                                           │
│    └─ Log: "✅ [PhotoUpload] Photos uploaded"                  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. CALL AI ANALYSIS                                             │
│    ├─ supabase.functions.invoke('analyze-face')               │
│    ├─ Payload: { front_image_url, side_image_url, sex, age }  │
│    ├─ Edge Function downloads from URLs                        │
│    ├─ OpenAI analyzes images                                    │
│    └─ Log: "✅ [Paywall] AI analysis completed"                │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. SAVE SCAN TO DATABASE                                        │
│    ├─ supabase.from("scans").insert({...})                    │
│    ├─ Fields: user_id, front_image_url, side_image_url        │
│    ├─          scores_json, notes_json, created_at            │
│    └─ Log: "✅ [Paywall] Scan saved"                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. CLEANUP                                                      │
│    ├─ clearGuestPhotos()                                       │
│    ├─ localStorage cleared                                      │
│    └─ Log: "🧹 [GuestPhotos] Cleared guest photos"            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. USER SEES RESULTS ON DASHBOARD                             │
│     ├─ navigate("/dashboard")                                  │
│     └─ Displays real AI scores from database                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Rules

### ❌ BEFORE Authentication:
- Photos NEVER uploaded to Supabase Storage
- Photos NEVER sent to any Edge Function
- Photos stored ONLY in localStorage
- NO API calls with photos

### ✅ AFTER Authentication:
- Photos uploaded to Supabase Storage (user's folder)
- Public URLs generated
- Edge Function called with URLs (not base64)
- AI analysis performed
- Results saved to database

---

## 📁 Files Created/Modified

### New Files:
1. **`src/lib/guestPhotos.ts`**
   - `saveGuestPhotos()` - Save to localStorage
   - `loadGuestPhotos()` - Load from localStorage
   - `clearGuestPhotos()` - Clear from localStorage
   - `hasGuestPhotos()` - Check existence
   - `getGuestPhotosAge()` - Get age in seconds

2. **`src/lib/photoUpload.ts`**
   - `uploadPhotosToStorage()` - Upload to Supabase Storage
   - `base64ToBlob()` - Convert base64 to Blob
   - Returns public URLs

3. **`STORAGE_SETUP.sql`**
   - Storage bucket creation
   - RLS policies for security

### Modified Files:
4. **`src/components/scan/ScanFlow.tsx`**
   - REMOVED: analyzePhotos() function
   - REMOVED: AI analysis logic
   - CHANGED: step "analyzing" → "saving"
   - ADDED: Save photos locally
   - ADDED: Redirect to /paywall after save

5. **`src/pages/Paywall.tsx`**
   - ADDED: processGuestPhotos() function
   - ADDED: Load photos after login
   - ADDED: Upload to Storage
   - ADDED: Call AI with URLs
   - ADDED: Save scan to DB
   - ADDED: Clear guest photos

6. **`src/pages/NewScan.tsx`**
   - REMOVED: handleScanComplete logic
   - ScanFlow now handles redirect

7. **`src/components/onboarding/screens/FaceScanScreen.tsx`**
   - REMOVED: scan saving logic
   - ScanFlow now handles redirect

8. **`supabase/functions/analyze-face/index.ts`**
   - ADDED: Support for image URLs
   - ADDED: Support for base64 (legacy)
   - Edge Function accepts both formats

---

## 🧪 Testing Steps

### A. Capture Photos (Guest Mode)
1. Open app (not logged in)
2. Start onboarding or "New Scan"
3. Take front photo → confirm
4. Take side photo → confirm
5. **Expected:**
   - Console: `💾 [GuestPhotos] Saved guest photos`
   - Redirect to `/paywall`
   - NO upload to Supabase
   - NO AI analysis yet

### B. Check LocalStorage
1. F12 → Application → Local Storage
2. Look for key: `guest_photos`
3. **Expected:**
   ```json
   {
     "frontPhotoBase64": "data:image/jpeg;base64,...",
     "sidePhotoBase64": "data:image/jpeg;base64,...",
     "timestamp": "2026-01-24T..."
   }
   ```

### C. Login on Paywall
1. Enter email/password
2. Click "Login" or "Sign up"
3. **Expected console logs (in order):**
   ```
   🔍 [Paywall] Checking for guest photos after login...
   ✅ [GuestPhotos] Loaded guest photos from localStorage
   📤 [Paywall] Starting photo upload and AI analysis...
   📤 [Paywall] Uploading photos to Supabase Storage...
   📤 [PhotoUpload] Starting upload to Supabase Storage
   ✅ [PhotoUpload] Front photo uploaded
   ✅ [PhotoUpload] Side photo uploaded
   ✅ [PhotoUpload] Got public URLs
   ✅ [Paywall] Photos uploaded successfully
   🤖 [Paywall] Starting AI analysis...
   ✅ [Paywall] AI analysis completed
   📊 [Paywall] AI response: {...}
   💾 [Paywall] Saving scan to database...
   ✅ [Paywall] Scan saved successfully
   🧹 [GuestPhotos] Cleared guest photos
   ```

### D. Verify Storage
1. Supabase Dashboard → Storage → scan-photos
2. Navigate to: `scans/{your-user-id}/{scan-id}/`
3. **Expected:**
   - `front.jpg` ✅
   - `side.jpg` ✅

### E. Verify Database
1. Supabase Dashboard → Table Editor → scans
2. Find your latest scan
3. **Expected fields:**
   - `front_image_url`: https://...supabase.co/storage/.../front.jpg
   - `side_image_url`: https://...supabase.co/storage/.../side.jpg
   - `scores_json`: { overall: X, skinQuality: Y, ... }
   - `notes_json`: { skin_quality: "...", ... }

### F. Verify Dashboard
1. Navigate to `/dashboard`
2. **Expected:**
   - Latest scan displayed
   - Real scores from AI
   - Photos visible
   - NO fallback scores

---

## 🚨 Important Behaviors

### 1. Photos Never Sent Before Auth
```javascript
// ❌ NEVER happens before login:
await supabase.storage.from('scan-photos').upload(...)
await supabase.functions.invoke('analyze-face', ...)
```

### 2. LocalStorage Used as Temporary Storage
```javascript
// ✅ Photos stored here until login:
localStorage.setItem('guest_photos', JSON.stringify({
  frontPhotoBase64: "...",
  sidePhotoBase64: "...",
  timestamp: "..."
}))
```

### 3. Upload Happens ONLY After Login
```javascript
// ✅ Only after user is authenticated:
if (user) {
  uploadPhotosToStorage(user.id, scanId, front, side)
}
```

### 4. Edge Function Supports Both Formats
```javascript
// New format (preferred):
{
  front_image_url: "https://...supabase.co/.../front.jpg",
  side_image_url: "https://...supabase.co/.../side.jpg"
}

// Legacy format (still supported):
{
  front_image_base64: "data:image/jpeg;base64,...",
  side_image_base64: "data:image/jpeg;base64,..."
}
```

---

## 🔍 Debug Checklist

### If photos not saved locally:
- [ ] Check console for `💾 [GuestPhotos] Saved guest photos`
- [ ] Check localStorage has `guest_photos` key
- [ ] Verify photos are base64 strings

### If photos not uploaded after login:
- [ ] Check user is authenticated (user !== null)
- [ ] Check console for `📤 [PhotoUpload] Starting upload`
- [ ] Verify Supabase Storage bucket exists: `scan-photos`
- [ ] Check RLS policies allow authenticated uploads

### If AI analysis fails:
- [ ] Check Edge Function logs: `supabase functions logs analyze-face`
- [ ] Verify URLs are accessible (public bucket)
- [ ] Check OPENAI_API_KEY is set
- [ ] Look for 400/401/500 errors

### If scan not in database:
- [ ] Check console for `✅ [Paywall] Scan saved successfully`
- [ ] Verify `scans` table exists
- [ ] Check RLS policies allow inserts
- [ ] Look for database errors in console

---

## ✨ Success Indicators

### Console Logs Sequence:
1. ✅ `💾 [GuestPhotos] Saved guest photos`
2. ✅ `✅ [GuestPhotos] Loaded guest photos`
3. ✅ `✅ [PhotoUpload] Photos uploaded`
4. ✅ `✅ [Paywall] AI analysis completed`
5. ✅ `✅ [Paywall] Scan saved successfully`
6. ✅ `🧹 [GuestPhotos] Cleared guest photos`

### Visual Confirmation:
- Photos visible in Supabase Storage
- Scan record in database with URLs (not base64)
- Dashboard shows real scores
- Photos displayed on Dashboard

---

## 🎯 Result

**All requirements met:**
- [x] Photos stored locally BEFORE auth ✅
- [x] Photos NEVER uploaded before auth ✅
- [x] Photos NEVER sent to Edge Function before auth ✅
- [x] Photos uploaded to Storage AFTER login ✅
- [x] AI called with URLs (not base64) ✅
- [x] Scan saved with URLs ✅
- [x] Guest photos cleared after success ✅
- [x] Dashboard reads from database ONLY ✅
- [x] No fallback/mock scores ✅

**Photos are now properly managed with authentication! 🎉**
