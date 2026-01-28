# JWT Fix - Quick Test Guide

## 🚀 Quick Test (2 Minutes)

### Test the Fix:

1. **Login to your app**
   ```
   Open browser → Navigate to your app → Login
   ```

2. **Open Browser DevTools**
   ```
   Press F12 → Go to "Network" tab → Filter: "generate-glowup"
   ```

3. **Trigger Glow-Up Plan**
   ```
   Upload a scan OR view existing scan with glow-up plan
   ```

4. **Check Network Request**
   ```
   Click on "generate-glowup-plan" request in Network tab
   → Go to "Headers" section
   → Scroll to "Request Headers"
   → Look for: Authorization: Bearer eyJ...
   ```

   **✅ SUCCESS:** Authorization header is present → Returns 200 OK  
   **❌ FAILURE:** No Authorization header → Returns 401 Unauthorized

5. **Test Peptide Recommendations**
   ```
   Repeat steps 2-4, but filter for "recommend-peptides"
   ```

---

## 🎯 Expected Results

### BEFORE Fix:
```
Request Headers:
  Content-Type: application/json
  ❌ Missing Authorization header

Response Status: 401 Unauthorized
Response Body: { "error": "Invalid JWT" }
```

### AFTER Fix:
```
Request Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ✅ Authorization header present

Response Status: 200 OK
Response Body: { "ok": true, "plan": {...} }
```

---

## 🐛 If Still Failing (401 Error)

### Quick Diagnostics:

1. **Check Browser Console**
   ```
   F12 → Console tab → Look for:
   
   ✅ "[generate-glowup-plan] Calling for user abc123"
   ❌ "[generate-glowup-plan] No session: ..."
   ```

   If "No session" appears → **User needs to logout and login again**

2. **Verify Session**
   ```javascript
   // Paste in Console:
   const { data } = await supabase.auth.getSession()
   console.log("Session:", data.session)
   console.log("Token:", data.session?.access_token?.substring(0, 20))
   ```

   Expected output:
   ```
   Session: { user: {...}, access_token: "eyJ..." }
   Token: "eyJhbGciOiJIUzI1NiI..."
   ```

   If `null` → **Session expired, user must re-login**

3. **Check Edge Function Config (Supabase Dashboard)**
   ```
   Supabase Dashboard → Edge Functions → generate-glowup-plan
   → Verify "JWT Verification" is enabled (if it requires auth)
   ```

---

## 📋 Files Changed (Reference)

| File | What Changed |
|------|--------------|
| `lib/supabaseEdgeFunctions.ts` | NEW: Utility function for authenticated Edge Function calls |
| `components/payment/GlowUpPlanSection.tsx` | UPDATED: Uses `invokeAuthenticatedFunction()` |
| `lib/peptideRecommendations.ts` | UPDATED: Uses `invokeAuthenticatedFunction()` |
| `lib/flushPendingScan.ts` | UPDATED: Uses `invokeAuthenticatedFunction()` |
| `lib/saveAuthenticatedScan.ts` | UPDATED: Uses `invokeAuthenticatedFunction()` |

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Browser Network tab shows `200 OK` for `generate-glowup-plan`
2. ✅ Browser Network tab shows `200 OK` for `recommend-peptides`
3. ✅ Glow-up plan loads without errors
4. ✅ Peptide recommendations display correctly
5. ✅ Authorization header appears in all Edge Function requests
6. ✅ No "Invalid JWT" errors in console

---

## 🔄 If You Need to Rollback

The changes are isolated to 5 files. Use git to revert:

```bash
git checkout HEAD -- src/lib/supabaseEdgeFunctions.ts
git checkout HEAD -- src/components/payment/GlowUpPlanSection.tsx
git checkout HEAD -- src/lib/peptideRecommendations.ts
git checkout HEAD -- src/lib/flushPendingScan.ts
git checkout HEAD -- src/lib/saveAuthenticatedScan.ts
```

---

## 💡 Pro Tips

1. **Clear Browser Cache**
   ```
   Ctrl+Shift+Delete → Clear cached files → Reload page
   ```

2. **Hard Refresh**
   ```
   Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   ```

3. **Test in Incognito**
   ```
   Fresh session, no cached data → Better for testing
   ```

4. **Monitor Edge Function Logs**
   ```
   Supabase Dashboard → Edge Functions → Logs (real-time)
   ```

---

## 📞 Still Having Issues?

If the fix doesn't work, it's likely NOT a code issue. Check:

1. **Supabase Project Settings**
   - JWT secret configured correctly?
   - Edge Functions deployed?
   - RLS policies not blocking requests?

2. **Token Expiration**
   - Tokens expire after 1 hour by default
   - User may need to re-login
   - Consider implementing auto-refresh

3. **Network Issues**
   - CORS errors?
   - Firewall blocking requests?
   - VPN interfering with Supabase?

---

**Created:** 2026-01-27  
**Status:** ✅ Ready to Test
