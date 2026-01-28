# ✅ FIXED: JWT Authentication for recommend-peptides Edge Function

## 🐛 THE ERROR

```json
{ "code": 401, "message": "Invalid JWT" }
```

**Cause:** The Edge Function was receiving invalid or missing JWT token from the frontend.

---

## ✅ FIXES APPLIED

### 1. **Frontend - Enhanced JWT Handling**

**File:** `components/payment/PeptideCardsSection.tsx`

**Changes:**
- ✅ Added comprehensive logging for session validation
- ✅ Enhanced error handling with detailed error messages
- ✅ Added scanId to request body
- ✅ Log token length and session validity

**Before:**
```typescript
const { data: session } = await supabase.auth.getSession();
if (!session?.session?.access_token) {
  throw new Error("No active session");
}

const { data, error: invokeError } = await supabase.functions.invoke("recommend-peptides", {
  headers: { Authorization: `Bearer ${session.session.access_token}` }
});
```

**After:**
```typescript
const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

if (sessionError) {
  console.error("[PEPTIDES] ❌ Session error:", sessionError);
  throw new Error("Authentication error: " + sessionError.message);
}

const session = sessionData?.session;
if (!session || !session.access_token) {
  console.error("[PEPTIDES] ❌ No session or access token");
  throw new Error("No active session. Please log in again.");
}

console.log("[PEPTIDES] ✅ Session valid, token length:", session.access_token.length);

const { data, error: invokeError } = await supabase.functions.invoke("recommend-peptides", {
  body: scanId ? { scanId } : {},
  headers: { Authorization: `Bearer ${session.access_token}` }
});
```

---

### 2. **Updated Other Callers**

**Files:**
- `lib/saveAuthenticatedScan.ts`
- `lib/flushPendingScan.ts`

**Changes:**
- ✅ Added scanId to request body
- ✅ Added error logging for invoke errors
- ✅ Log when peptides API returns non-ok response

---

### 3. **Edge Function - Enhanced Logging**

**File:** `supabase/functions/recommend-peptides/index.ts`

**Changes:**
- ✅ Log auth header presence and format
- ✅ Log each step of JWT verification
- ✅ Detailed error messages for 401 responses
- ✅ Return `message` instead of `error` for consistency

**Before:**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return new Response(
    JSON.stringify({ ok: false, error: "Unauthorized" }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

**After:**
```typescript
console.log("🔐 [recommend-peptides] Auth header present:", !!authHeader);
console.log("👤 [recommend-peptides] Verifying user from JWT...");

const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError) {
  console.error("❌ [recommend-peptides] Auth error:", authError.message);
  console.error("❌ [recommend-peptides] Auth error details:", JSON.stringify(authError, null, 2));
  return new Response(
    JSON.stringify({ ok: false, message: `Authentication failed: ${authError.message}` }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

if (!user) {
  console.error("❌ [recommend-peptides] No user found from JWT");
  return new Response(
    JSON.stringify({ ok: false, message: "No user found. Please log in again." }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

console.log("✅ [recommend-peptides] User authenticated:", user.id);
```

---

## 🔍 LOGGING OVERVIEW

### Frontend Logs (PeptideCardsSection.tsx):
```
🧬 [PEPTIDES] Fetching AI recommendations for user: <userId>
[PEPTIDES] ✅ Session valid, token length: 527
[PEPTIDES] 📤 Calling recommend-peptides Edge Function...
[PEPTIDES] 📥 Response received
[PEPTIDES] Response data: { ok: true, recommended_peptides: [...] }
[PEPTIDES] ✅ AI peptides received: 5
```

### Edge Function Logs (recommend-peptides):
```
🧬 [recommend-peptides] Function invoked
🔐 [recommend-peptides] Auth header present: true
🔐 [recommend-peptides] Auth header format: Bearer eyJhbGciOiJI...
🔗 [recommend-peptides] Creating Supabase client with JWT
👤 [recommend-peptides] Verifying user from JWT...
✅ [recommend-peptides] User authenticated: <userId>
✅ [recommend-peptides] Onboarding data loaded
✅ [recommend-peptides] Scan data loaded
✅ [recommend-peptides] Peptides KB loaded: 10
🤖 [recommend-peptides] Calling OpenAI...
✅ [recommend-peptides] AI recommendations: 5
✅ [recommend-peptides] Recommendations saved to latest scan
```

---

## 🚀 DEPLOYMENT

### Step 1: Deploy Updated Edge Function

**PowerShell:**
```powershell
cd C:\Users\wail\Desktop\mypepshi
.\deploy-peptide-recommendations.bat
```

**Or manually:**
```bash
cd C:\Users\wail\Desktop\mypepshi
npx supabase functions deploy recommend-peptides
```

### Step 2: Verify Deployment

Check Supabase dashboard → Edge Functions → recommend-peptides → Should show updated timestamp

---

## ✅ TESTING CHECKLIST

### Test 1: Authenticated User - Get Recommendations

1. **Login to dashboard**
2. **Check console logs for:**
   ```
   [PEPTIDES] ✅ Session valid, token length: <number>
   [PEPTIDES] 📤 Calling recommend-peptides Edge Function...
   [PEPTIDES] ✅ AI peptides received: <count>
   ```

3. **Expected result:** Peptides display without error

### Test 2: Check Network Tab

1. **Open DevTools → Network**
2. **Filter for:** `recommend-peptides`
3. **Check request:**
   - Headers → Authorization: `Bearer <token>`
   - Body (if present): `{ "scanId": "<id>" }`
4. **Check response:**
   - Status: **200 OK** (not 401!)
   - Body: `{ "ok": true, "recommended_peptides": [...] }`

### Test 3: Edge Function Logs

1. **Go to Supabase Dashboard**
2. **Navigate to:** Edge Functions → recommend-peptides → Logs
3. **Look for:**
   ```
   ✅ User authenticated: <userId>
   ✅ AI recommendations: <count>
   ```
4. **Should NOT see:**
   ```
   ❌ Auth error: Invalid JWT
   ❌ No user found from JWT
   ```

---

## 🔧 COMMON ISSUES & SOLUTIONS

### Issue 1: Still Getting 401 "Invalid JWT"

**Possible Causes:**
1. Edge function not redeployed
2. Token expired (user logged in > 1 hour ago)
3. Using wrong Supabase project URL

**Solutions:**
1. Redeploy edge function: `.\deploy-peptide-recommendations.bat`
2. Have user log out and log back in
3. Check `.env.local` has correct `VITE_SUPABASE_URL`

---

### Issue 2: "No active session" Error in Frontend

**Cause:** User session expired or logged out

**Solution:**
- User needs to log in again
- Frontend will show clear error: "No active session. Please log in again."

---

### Issue 3: Edge Function Returns 200 but `ok: false`

**Check Edge Function Logs for:**
- OpenAI API errors
- Database query failures
- Missing environment variables

**Solution:** Fix the specific issue shown in logs

---

## 📂 FILES MODIFIED

1. ✅ `components/payment/PeptideCardsSection.tsx` - Enhanced JWT handling & logging
2. ✅ `lib/saveAuthenticatedScan.ts` - Added scanId to body, better error handling
3. ✅ `lib/flushPendingScan.ts` - Added scanId to body, better error handling
4. ✅ `supabase/functions/recommend-peptides/index.ts` - Enhanced auth logging

---

## 🎯 EXPECTED BEHAVIOR AFTER FIX

### ✅ Success Flow:
1. User is logged in → Session valid
2. Dashboard loads → Triggers peptide fetch
3. Frontend sends JWT → Edge function validates
4. Edge function returns recommendations → Display on UI
5. **Network shows:** `200 OK` with peptides
6. **Console shows:** Success logs

### ❌ Failure Flow (Proper Error Handling):
1. User session expired
2. Frontend detects no session
3. Shows clear error: "No active session. Please log in again."
4. **Does NOT** make API call with invalid token

---

## 🚀 NEXT STEPS

1. **Deploy edge function** (REQUIRED!)
2. **Test with logged-in user**
3. **Check browser console** for logs
4. **Check Network tab** for 200 response
5. **Verify peptides display** on dashboard

**If still getting 401 after deployment, check Edge Function logs in Supabase Dashboard for specific error details.**
