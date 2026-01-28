# 💾 Guest Stash → Flush on Auth - Summary

## ✅ Done

Fixed: Guest users complete onboarding + photos → create account → Dashboard is empty

Solution: Auto-save system that flushes guest scans to Supabase after authentication.

---

## 📦 Files

### **1. NEW: `src/lib/pendingScan.ts`**
Manages pending scan storage in localStorage:
- `savePendingScan({ onboarding, frontImage, sideImage })`
- `loadPendingScan()`
- `hasPendingScan()`
- `clearPendingScan()`

### **2. NEW: `src/lib/flushPendingScan.ts`**
Flushes pending scan to Supabase (10 steps):
1. Load pending scan
2. Upload photos to Storage
3. Generate signed URLs
4. Call analyze-face
5. Save onboarding to profiles
6. Insert scan to database
7. Call recommend-peptides
8. Clear localStorage

### **3. MODIFIED: `OnboardingFlow.tsx`**
`handleComplete` now:
- Loads guest photos
- Combines onboarding + photos
- Saves as "pending_scan" in localStorage

### **4. MODIFIED: `Paywall.tsx`**
Auto-detects pending scan after auth:
- Shows "Saving your scan..." loading screen
- Calls `flushPendingScanToSupabase()`
- Auto-redirects to dashboard

---

## 🧪 How It Works

**Guest Flow:**
```
Onboarding → Photos → Save locally → Redirect to paywall
```

**localStorage:**
```json
{
  "pending_scan": {
    "onboarding": { /* all 22 answers */ },
    "frontImage": "data:image/jpeg;base64,...",
    "sideImage": "data:image/jpeg;base64,...",
    "timestamp": 1706194736000
  }
}
```

**Auth Flow:**
```
Click "Glow Up Now" → Create account → Auto-flush → Dashboard
```

**Auto-flush:**
1. Detect user + pending_scan
2. Show loading screen
3. Upload + analyze + save
4. Clear localStorage
5. Redirect to dashboard

---

## 🎯 Test

```
1. Incognito mode (not logged in)
2. Complete onboarding + take 2 photos
3. Click "Glow Up Now" → create account
4. See "Saving your scan..." screen
5. Auto-redirect to dashboard
6. Dashboard shows real AI scores
7. Supabase has:
   - profiles.onboarding_json ✅
   - scans table row ✅
   - scan-photos bucket images ✅
```

**Expected logs:**
```
💾 [PENDING] Saving pending_scan (2456 KB)
✅ [PENDING] Saved successfully
🔄 [Paywall] Auto-flushing...
📤 [PENDING] Uploading photos...
🤖 [PENDING] Calling analyze-face...
💾 [PENDING] Inserting scan...
✅ [PENDING] Scan inserted (scanId: xyz)
🗑️ [PENDING] Cleared localStorage
🎉 [PENDING] Flush complete!
```

---

## ✅ Success Criteria

- ✅ Guest scan saved after signup
- ✅ Dashboard shows real data
- ✅ No empty dashboard for new accounts
- ✅ localStorage cleared after flush
- ✅ "Saving..." screen shown
- ✅ No 404/400 errors

---

**Full docs:** `GUEST_STASH_FLUSH.md`

**Guest scans now automatically saved! 💾✨**
