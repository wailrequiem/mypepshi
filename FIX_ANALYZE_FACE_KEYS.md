# ✅ FIX: analyze-face Payload Keys - COMPLETE

## 🐛 **Bug Found**

**Problem:** `flushPendingScan` uploaded images successfully but `analyze-face` failed with:
```
"Either (front_image_url + side_image_url) or (front_image_base64 + side_image_base64) required"
```

**Root Cause:** Frontend sent `frontImageUrl` and `sideImageUrl`, but Edge Function expected `front_image_url` and `side_image_url`.

---

## ✅ **Fixes Applied**

### **1. Frontend: `flushPendingScan.ts`** ✅

**BEFORE (Wrong keys):**
```typescript
const { data: aiData, error: aiError } = await supabase.functions.invoke("analyze-face", {
  body: {
    frontImageUrl: frontSignedData.signedUrl,  // ❌ Wrong key
    sideImageUrl: sideSignedData.signedUrl,    // ❌ Wrong key
    age: pendingScan.onboarding.age || 25,
    sex: pendingScan.onboarding.gender || "male",
  },
  ...
});
```

**AFTER (Correct keys):**
```typescript
// IMPORTANT: Use exact keys expected by analyze-face Edge Function
const analyzePayload = {
  front_image_url: frontSignedData.signedUrl,  // ✅ Correct key
  side_image_url: sideSignedData.signedUrl,    // ✅ Correct key
  age: pendingScan.onboarding.age || 25,
  sex: pendingScan.onboarding.gender || "male",
};

console.log("📤 [PENDING] analyze-face payload keys:", Object.keys(analyzePayload));

const { data: aiData, error: aiError } = await supabase.functions.invoke("analyze-face", {
  body: analyzePayload,
  ...
});
```

**Changes:**
- ✅ Changed `frontImageUrl` → `front_image_url`
- ✅ Changed `sideImageUrl` → `side_image_url`
- ✅ Added log to show payload keys

---

### **2. Backend: `analyze-face/index.ts`** ✅

**Added Key Normalization:**

```typescript
console.log("Body keys:", Object.keys(body));
console.log("[analyze-face] received keys:", Object.keys(body));

// STEP 3: Normalize and validate images (accept URLs or base64)
currentStep = "validate_images";
console.log("STEP 3: Normalizing and validating images");

// Normalize key aliases to standard names
// Accept: front_image_url, frontImageUrl, front_url, frontUrl, frontSignedUrl
const frontImageUrl = body.front_image_url 
  || body.frontImageUrl 
  || body.front_url 
  || body.frontUrl 
  || body.frontSignedUrl;

// Accept: side_image_url, sideImageUrl, side_url, sideUrl, sideSignedUrl
const sideImageUrl = body.side_image_url 
  || body.sideImageUrl 
  || body.side_url 
  || body.sideUrl 
  || body.sideSignedUrl;

// Base64 keys (already standard)
const frontImageBase64 = body.front_image_base64;
const sideImageBase64 = body.side_image_base64;

// Log what we detected
console.log("[analyze-face] normalized:", {
  hasFrontUrl: !!frontImageUrl,
  hasSideUrl: !!sideImageUrl,
  hasFrontB64: !!frontImageBase64,
  hasSideB64: !!sideImageBase64
});
```

**Benefits:**
- ✅ Accepts multiple key name variations
- ✅ Backward compatible with old code
- ✅ Detailed logging for debugging
- ✅ No breaking changes

**Accepted Key Variations:**

| Standard Key | Accepted Aliases |
|--------------|------------------|
| `front_image_url` | `frontImageUrl`, `front_url`, `frontUrl`, `frontSignedUrl` |
| `side_image_url` | `sideImageUrl`, `side_url`, `sideUrl`, `sideSignedUrl` |
| `front_image_base64` | (no aliases, already standard) |
| `side_image_base64` | (no aliases, already standard) |

---

## 📊 **Expected Flow After Fix**

### **Guest → Signup → Auto-flush:**

```
1. Guest completes onboarding + takes photos
   ↓
2. pending_scan saved to localStorage
   ↓
3. Guest creates account
   ↓
4. Paywall detects pending_scan + user
   ↓
5. Auto-flush triggered:
   
   a) Upload photos → Storage
      ✅ scan-photos/userId/scanId/front.jpg
      ✅ scan-photos/userId/scanId/side.jpg
   
   b) Generate signed URLs (60 min expiry)
      ✅ https://...storage.supabase.co/.../front.jpg?token=...
   
   c) Call analyze-face with CORRECT keys:
      ✅ front_image_url: <signed URL>
      ✅ side_image_url: <signed URL>
      ✅ age: 25
      ✅ sex: "male"
   
   d) analyze-face normalizes keys:
      ✅ Detects front_image_url ✓
      ✅ Detects side_image_url ✓
      ✅ Logs: hasFrontUrl: true, hasSideUrl: true
   
   e) Call OpenAI GPT-4o with signed URLs
      ✅ AI analyzes images
      ✅ Returns { gender, scores, notes }
   
   f) Save to database:
      ✅ profiles.onboarding_json
      ✅ scans table with:
         - front_image_path (storage path, not signed URL)
         - side_image_path (storage path, not signed URL)
         - scores_json
         - notes_json
   
   g) Clear localStorage
   
   h) Redirect to dashboard
   
   i) Dashboard loads real data from DB
```

---

## 🧪 **Testing**

### **Expected Logs:**

**Frontend (flushPendingScan):**
```
🚀 [PENDING] Starting flush to Supabase...
✅ [PENDING] User authenticated: abc123
📝 [PENDING] Generated scanId: xyz789
📤 [PENDING] Uploading photos to Storage...
✅ [PENDING] Photos uploaded successfully
🔗 [PENDING] Generating signed URLs for AI...
✅ [PENDING] Signed URLs generated
🤖 [PENDING] Calling analyze-face...
📤 [PENDING] analyze-face payload keys: ["front_image_url", "side_image_url", "age", "sex"]
```

**Backend (analyze-face):**
```
🚀 === ANALYZE-FACE EDGE FUNCTION STARTED ===
Body keys: ["front_image_url", "side_image_url", "age", "sex"]
[analyze-face] received keys: ["front_image_url", "side_image_url", "age", "sex"]
STEP 3: Normalizing and validating images
[analyze-face] normalized: {
  hasFrontUrl: true,
  hasSideUrl: true,
  hasFrontB64: false,
  hasSideB64: false
}
✅ Using image URLs (new format)
✅ analyze-face input { sex: "male", age: 25, usingUrls: true, imageFormat: "URLs" }
STEP 5: Building OpenAI request
STEP 6: Calling OpenAI
✅ openai output { gender: "male", scores: {...}, notes: {...} }
```

**Frontend (after success):**
```
✅ [PENDING] AI analysis completed
💾 [PENDING] Saving onboarding data...
✅ [PENDING] Onboarding data saved
💾 [PENDING] Inserting scan into database...
✅ [PENDING] Scan inserted successfully (scanId: xyz789)
🧬 [PENDING] Calling recommend-peptides...
✅ [PENDING] Peptides recommendations received: 3
🗑️ [PENDING] Clearing pending_scan from localStorage...
🎉 [PENDING] Flush completed successfully!
```

---

## ✅ **Success Criteria**

**PASS if:**
- ✅ `front_image_url` and `side_image_url` sent from frontend
- ✅ analyze-face accepts and normalizes keys
- ✅ Logs show: `hasFrontUrl: true, hasSideUrl: true`
- ✅ OpenAI call succeeds with signed URLs
- ✅ AI returns `{ ok: true, data: { gender, scores, notes } }`
- ✅ Scan saved to database with storage paths
- ✅ Dashboard shows real AI data
- ✅ No "required" error

**FAIL if:**
- ❌ Error: "Either (front_image_url + side_image_url) ... required"
- ❌ analyze-face returns 400/500
- ❌ Frontend sends wrong keys
- ❌ Database insert fails

---

## 🔧 **Commands Used**

### **Deploy Edge Function:**
```bash
supabase functions deploy analyze-face --no-verify-jwt
```

**Output:**
```
✅ Uploaded asset (analyze-face): supabase/functions/analyze-face/index.ts
✅ Deployed Functions on project yufapyazxhjmjhonmfhd: analyze-face
```

### **Build Frontend:**
```bash
npm run build
```

**Output:**
```
✅ ✓ 2147 modules transformed.
✅ ✓ built in 9.53s
```

---

## 📝 **Summary**

| Component | Fix | Status |
|-----------|-----|--------|
| Frontend payload | Changed to `front_image_url`, `side_image_url` | ✅ |
| Backend normalization | Accept multiple key aliases | ✅ |
| Logging | Added detailed logs for debugging | ✅ |
| Edge Function deployed | analyze-face v2 | ✅ |
| Build successful | No errors | ✅ |
| Backward compatible | Old keys still work | ✅ |

---

## 🎯 **What Changed**

**Frontend (`flushPendingScan.ts`):**
- Line 123: `frontImageUrl` → `front_image_url` ✅
- Line 124: `sideImageUrl` → `side_image_url` ✅
- Added: Payload keys logging ✅

**Backend (`analyze-face/index.ts`):**
- Added: Key normalization (accepts 5+ aliases per key) ✅
- Added: Detailed logging `[analyze-face] normalized:` ✅
- Added: Received keys logging ✅

---

**The payload keys are now aligned! Guest scans should flush successfully! 🎉**

**Next step:** Test the full guest → signup → auto-flush flow!
