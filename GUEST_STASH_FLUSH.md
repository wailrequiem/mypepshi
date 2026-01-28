# ✅ Guest Stash → Flush on Auth - COMPLETE

## 🎯 **What Was Implemented**

**Problem:** Guest users complete onboarding + take photos → create account → Dashboard is empty (no scan saved)

**Solution:** "Guest Stash → Flush on Auth" system that automatically saves guest scans after authentication.

---

## 📦 **Files Created/Modified**

### **1. NEW: `src/lib/pendingScan.ts`** ✅

**Purpose:** Manage pending scan storage in localStorage

**Functions:**
```typescript
// Save guest onboarding + photos
savePendingScan({
  onboarding: Record<string, any>,
  frontImage: string, // base64 dataURL
  sideImage: string   // base64 dataURL
}): boolean

// Load pending scan
loadPendingScan(): PendingScan | null

// Check if pending scan exists
hasPendingScan(): boolean

// Clear pending scan
clearPendingScan(): void

// Get pending scan size in KB
getPendingScanSize(): number | null
```

**Storage format:**
```json
{
  "onboarding": { /* all 22 onboarding answers */ },
  "frontImage": "data:image/jpeg;base64,...",
  "sideImage": "data:image/jpeg;base64,...",
  "timestamp": 1706194736000
}
```

**Safety features:**
- Validates structure before loading
- Auto-clears corrupted data
- Handles quota exceeded errors
- Logs all operations

---

### **2. NEW: `src/lib/flushPendingScan.ts`** ✅

**Purpose:** Flush pending scan to Supabase after authentication

**Main function:**
```typescript
flushPendingScanToSupabase(): Promise<FlushResult>
```

**Process (10 steps):**
1. Load pending scan from localStorage
2. Check authentication
3. Generate scanId
4. Convert base64 images to Blobs
5. Upload photos to Supabase Storage (`scan-photos` bucket)
   - Path: `${userId}/${scanId}/front.jpg`
   - Path: `${userId}/${scanId}/side.jpg`
6. Generate signed URLs (60 min expiry)
7. Call `analyze-face` Edge Function with signed URLs
8. Save onboarding data to `profiles.onboarding_json`
9. Insert scan into `scans` table with:
   - `front_image_path`
   - `side_image_path`
   - `scores_json`
   - `notes_json`
10. Optional: Call `recommend-peptides` (non-blocking)
11. Clear pending scan from localStorage

**Return format:**
```typescript
{
  success: boolean,
  scanId?: string,
  error?: string,
  step?: string // which step failed
}
```

**Error handling:**
- Returns success/failure for each step
- Non-blocking peptides recommendation
- Comprehensive logging

---

### **3. MODIFIED: `OnboardingFlow.tsx`** ✅

**Changes in `handleComplete`:**

**BEFORE:**
```typescript
const handleComplete = async () => {
  await syncToSupabase();
  onComplete(onboardingData);
};
```

**AFTER:**
```typescript
const handleComplete = async () => {
  console.log("🎯 [Onboarding] Flow completed, preparing to save pending scan...");
  
  // Load guest photos
  const guestPhotos = loadGuestPhotos();
  
  if (guestPhotos && guestPhotos.frontPhotoBase64 && guestPhotos.sidePhotoBase64) {
    // Save as pending scan (onboarding + photos)
    const saved = savePendingScan({
      onboarding: onboardingData,
      frontImage: guestPhotos.frontPhotoBase64,
      sideImage: guestPhotos.sidePhotoBase64,
    });
    
    if (saved) {
      console.log("✅ [Onboarding] Pending scan saved successfully");
    }
  } else {
    console.warn("⚠️ [Onboarding] No guest photos found, syncing onboarding data only");
    await syncToSupabase();
  }
  
  onComplete(onboardingData);
};
```

**Why:** Saves onboarding + photos together for flush after auth.

---

### **4. MODIFIED: `Paywall.tsx`** ✅

**Changes:**

**BEFORE:**
```typescript
export default function Paywall() {
  const navigate = useNavigate();
  const handleUnlock = () => { navigate("/dashboard"); };
  return <PostOnboardingPaywall onUnlock={handleUnlock} />;
}
```

**AFTER:**
```typescript
export default function Paywall() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFlushing, setIsFlushing] = useState(false);

  // Auto-flush pending scan when user logs in/signs up
  useEffect(() => {
    const autoFlush = async () => {
      if (!user) return;
      if (!hasPendingScan()) return;
      
      setIsFlushing(true);
      const result = await flushPendingScanToSupabase();
      
      if (result.success) {
        setTimeout(() => navigate("/dashboard"), 1000);
      }
    };
    
    autoFlush();
  }, [user]);

  // Show loading screen while flushing
  if (isFlushing) {
    return <LoadingScreen />;
  }

  return <PostOnboardingPaywall onUnlock={handleUnlock} />;
}
```

**Why:** Automatically flushes pending scan after successful login/signup.

---

## 🧪 **How It Works**

### **Guest Flow (Before Auth):**

```
1. Guest completes onboarding questions
   ↓
2. Guest takes front + side photos
   ↓
3. ScanFlow saves photos to localStorage (existing)
   ↓
4. OnboardingFlow.handleComplete:
   - Loads guest photos
   - Combines onboarding + photos
   - Saves to localStorage as "pending_scan"
   ↓
5. Redirect to /paywall
```

**localStorage after onboarding:**
```
guest_photos: { frontPhotoBase64, sidePhotoBase64 }
onboarding_data: { gender, age, struggles, ... }
pending_scan: { onboarding, frontImage, sideImage, timestamp }
```

---

### **Auth Flow (After Login/Signup):**

```
1. User clicks "Glow Up Now" → Auth modal
   ↓
2. User signs up or logs in
   ↓
3. Paywall.useEffect detects:
   - user is authenticated
   - hasPendingScan() returns true
   ↓
4. Show loading screen: "Saving your scan..."
   ↓
5. flushPendingScanToSupabase():
   a. Upload photos to Storage
   b. Call analyze-face
   c. Save onboarding to profiles
   d. Insert scan to scans table
   e. Call recommend-peptides (optional)
   f. Clear localStorage
   ↓
6. Redirect to /dashboard
   ↓
7. Dashboard loads scan from database
```

---

## 📊 **Data Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                      GUEST FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Onboarding Questions  →  Take Photos  →  Save Locally      │
│                                                              │
│  localStorage:                                               │
│  {                                                           │
│    pending_scan: {                                           │
│      onboarding: { gender, age, ... },                       │
│      frontImage: "data:image/jpeg;base64,...",              │
│      sideImage: "data:image/jpeg;base64,...",               │
│      timestamp: 1706194736000                                │
│    }                                                         │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    User clicks "Glow Up Now"
                           ↓
                      Create Account
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      FLUSH FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Load pending_scan from localStorage                      │
│  2. Upload photos → Storage (scan-photos bucket)             │
│  3. Generate signed URLs                                     │
│  4. Call analyze-face Edge Function                          │
│  5. Save onboarding → profiles.onboarding_json               │
│  6. Insert scan → scans table                                │
│  7. Call recommend-peptides                                  │
│  8. Clear localStorage                                       │
│                                                              │
│  Result: Full scan saved in Supabase                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
                  Redirect to Dashboard
                           ↓
              Dashboard loads real data from DB
```

---

## 🛡️ **Safety Features**

### **localStorage Management:**
- Validates structure before loading
- Auto-clears corrupted data
- Handles quota exceeded errors
- Shows size in KB for debugging

### **Error Handling:**
- Each step can fail independently
- Returns specific error step (e.g., "upload_front", "analyze")
- Non-blocking peptides recommendation
- Comprehensive logging

### **Auto-cleanup:**
- Clears pending_scan after successful flush
- Clears guest_photos (legacy) if quota exceeded
- No orphaned data in localStorage

---

## 🧪 **Testing**

### **Test 1: Guest → Signup → Dashboard**
```
1. Open in incognito (not logged in)
2. Complete onboarding + take 2 photos
3. Click "Glow Up Now" → create account
4. Wait for "Saving your scan..." screen
5. Auto-redirect to dashboard
6. Dashboard shows real AI scores
7. Check Supabase:
   - profiles.onboarding_json has data
   - scans table has new row
   - scan-photos bucket has 2 images
```

**Expected console logs:**
```
🎯 [Onboarding] Flow completed, preparing to save pending scan...
📸 [Onboarding] Found guest photos, saving pending scan...
💾 [PENDING] Saving pending_scan (2456 KB)
✅ [PENDING] Saved pending_scan successfully
🔄 [Paywall] User authenticated with pending scan, auto-flushing...
🚀 [PENDING] Starting flush to Supabase...
✅ [PENDING] User authenticated: abc123...
📝 [PENDING] Generated scanId: xyz789...
📤 [PENDING] Uploading front photo to: abc123/xyz789/front.jpg
✅ [PENDING] Photos uploaded successfully
🤖 [PENDING] Calling analyze-face...
✅ [PENDING] AI analysis completed
💾 [PENDING] Saving onboarding data...
✅ [PENDING] Onboarding data saved
💾 [PENDING] Inserting scan into database...
✅ [PENDING] Scan inserted successfully (scanId: xyz789)
🧬 [PENDING] Calling recommend-peptides...
✅ [PENDING] Peptides recommendations received: 3
🗑️ [PENDING] Clearing pending_scan from localStorage...
🎉 [PENDING] Flush completed successfully!
✅ [Paywall] Flush successful, redirecting to dashboard...
```

---

### **Test 2: Already Logged In**
```
1. User is already logged in
2. Complete onboarding + take photos
3. Click final step
4. No pending_scan saved (direct sync)
5. Redirect to paywall
6. No flush happens (no pending scan)
7. Click "Glow Up Now" → Dashboard
```

---

### **Test 3: Partial Data**
```
1. Guest completes onboarding but NO photos
2. pending_scan not saved (missing photos)
3. Onboarding data synced directly if logged in
4. Or lost if not logged in (expected)
```

---

### **Test 4: Quota Exceeded**
```
1. Guest has full localStorage
2. Try to save pending_scan
3. Quota exceeded error
4. Auto-cleanup: removes guest_photos
5. Retry save
6. Success or fail gracefully
```

---

## 📝 **Logs Reference**

### **Save Logs:**
```
💾 [PENDING] Saving pending_scan (2456 KB)
✅ [PENDING] Saved pending_scan successfully
❌ [PENDING] Failed to save pending_scan: QuotaExceededError
⚠️ [PENDING] localStorage quota exceeded, attempting cleanup...
```

### **Load Logs:**
```
✅ [PENDING] Found pending_scan (5 minutes old)
ℹ️ [PENDING] No pending_scan found
⚠️ [PENDING] Invalid pending_scan structure, clearing...
```

### **Flush Logs:**
```
🚀 [PENDING] Starting flush to Supabase...
✅ [PENDING] User authenticated: abc123
📝 [PENDING] Generated scanId: xyz789
📤 [PENDING] Uploading front photo to: abc123/xyz789/front.jpg
✅ [PENDING] Photos uploaded successfully
🤖 [PENDING] Calling analyze-face...
✅ [PENDING] AI analysis completed
💾 [PENDING] Inserting scan into database...
✅ [PENDING] Scan inserted successfully (scanId: xyz789)
🎉 [PENDING] Flush completed successfully!
```

### **Error Logs:**
```
❌ [PENDING] User not authenticated
❌ [PENDING] Front photo upload failed: Bucket not found
❌ [PENDING] AI analysis failed: Invalid response
❌ [PENDING] Failed to insert scan: Column not found
```

---

## ✅ **Success Criteria**

**PASS if:**
- ✅ Guest completes onboarding + photos → pending_scan saved
- ✅ After signup → auto-flush triggered
- ✅ "Saving your scan..." screen shown
- ✅ Scan saved to Supabase (profiles + scans + storage)
- ✅ Dashboard shows real data
- ✅ localStorage cleared after flush
- ✅ No 404 errors, no empty dashboard

**FAIL if:**
- ❌ Guest scan lost after signup
- ❌ Dashboard empty for new accounts
- ❌ No auto-flush happens
- ❌ Errors in console
- ❌ localStorage not cleared

---

## 🎯 **Summary**

| Feature | Status |
|---------|--------|
| pendingScan.ts created | ✅ |
| flushPendingScan.ts created | ✅ |
| OnboardingFlow modified | ✅ |
| Paywall auto-flush | ✅ |
| Loading screen | ✅ |
| Error handling | ✅ |
| Comprehensive logs | ✅ |
| Build successful | ✅ |

---

**Guest scans are now automatically saved after authentication! 💾✨**

**Test it now:** Complete onboarding as guest → Create account → Watch auto-save magic!
