# 🔧 Fix: analyze-face Payload Keys

## ✅ Bug Fixed

**Problem:** Frontend sent `frontImageUrl`/`sideImageUrl`, Edge Function expected `front_image_url`/`side_image_url`.

**Error:** "Either (front_image_url + side_image_url) ... required"

---

## 📦 Changes

### **1. Frontend: `flushPendingScan.ts`**

**BEFORE:**
```typescript
body: {
  frontImageUrl: signedUrl,  // ❌ Wrong
  sideImageUrl: signedUrl    // ❌ Wrong
}
```

**AFTER:**
```typescript
body: {
  front_image_url: signedUrl,  // ✅ Correct
  side_image_url: signedUrl    // ✅ Correct
}
```

### **2. Backend: `analyze-face/index.ts`**

**Added key normalization:**
```typescript
// Accept multiple aliases:
const frontImageUrl = body.front_image_url 
  || body.frontImageUrl 
  || body.front_url 
  || body.frontUrl 
  || body.frontSignedUrl;

const sideImageUrl = body.side_image_url 
  || body.sideImageUrl 
  || body.side_url 
  || body.sideUrl 
  || body.sideSignedUrl;

console.log("[analyze-face] normalized:", {
  hasFrontUrl: !!frontImageUrl,
  hasSideUrl: !!sideImageUrl
});
```

**Benefits:**
- ✅ Accepts 5+ key name variations
- ✅ Backward compatible
- ✅ Detailed logging

---

## 🧪 Expected Logs

**Frontend:**
```
📤 [PENDING] analyze-face payload keys: ["front_image_url", "side_image_url", "age", "sex"]
🤖 [PENDING] Calling analyze-face...
✅ [PENDING] AI analysis completed
```

**Backend:**
```
[analyze-face] received keys: ["front_image_url", "side_image_url", "age", "sex"]
[analyze-face] normalized: { hasFrontUrl: true, hasSideUrl: true }
✅ Using image URLs (new format)
✅ analyze-face input { sex: "male", age: 25, usingUrls: true }
```

---

## 🚀 Deploy

```bash
# Deploy Edge Function
supabase functions deploy analyze-face --no-verify-jwt

# Build frontend
npm run build
```

**Status:**
- ✅ Edge Function deployed
- ✅ Build successful
- ✅ No errors

---

## ✅ Test

```
1. Guest: Complete onboarding + photos
2. Create account
3. See "Saving your scan..."
4. Check console:
   - "analyze-face payload keys: [...]" ✅
   - "AI analysis completed" ✅
5. Dashboard shows real data ✅
```

---

**Full docs:** `FIX_ANALYZE_FACE_KEYS.md`

**Keys aligned! 🎉**
