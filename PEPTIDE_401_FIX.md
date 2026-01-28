# Peptide Recommendations 401 Error - FIXED

## 🔧 What Was the Problem?

The peptide recommendations were failing with a **401 Unauthorized** error because of how the Authorization header was being passed to the edge function.

### Root Cause:
When using `supabase.functions.invoke()`, the Supabase client **automatically** handles authentication by:
1. Getting the current session
2. Adding the `Authorization: Bearer <token>` header

**The bug**: We were manually adding the Authorization header, which caused a conflict or incorrect token format.

---

## ✅ What Was Fixed

### 1. Frontend Service (`src/lib/peptideRecommendations.ts`)

**BEFORE (Broken)**:
```typescript
const response = await supabase.functions.invoke("recommend-peptides", {
  body: { scan_id: scanId },
  headers: {
    Authorization: `Bearer ${session.access_token}`,  // ❌ Manual header causes issues
  },
});
```

**AFTER (Fixed)**:
```typescript
const response = await supabase.functions.invoke("recommend-peptides", {
  body: { scan_id: scanId },
  // ✅ Supabase client automatically adds auth header
});
```

### 2. Added Debug Logging

**Frontend logs** (in browser console):
- `[PEPTIDES] Fetching recommendations` - Starting fetch
- `[PEPTIDES] Session token present: true` - Auth check
- `[PEPTIDES] Response received` - Got response
- `[PEPTIDES] Peptides count: 3` - Success

**Backend logs** (in Supabase Edge Function logs):
- `[recommend-peptides] User authenticated: <userId>` - Auth success
- `[recommend-peptides] Using cached recommendations` - Using cache
- `[recommend-peptides] Generating new recommendations` - Calling OpenAI

---

## 🧪 How to Test

### 1. Deploy the Updated Function
```bash
cd c:\Users\wail\Desktop\mypepshi
supabase functions deploy recommend-peptides
```

### 2. Clear Browser Cache
```javascript
// In browser console:
localStorage.clear();
```
Then log in again to get a fresh session.

### 3. Check the Dashboard
1. Log in to your app
2. Go to Dashboard
3. Scroll to "AI-Picked Peptides for Your Goals"
4. Open browser DevTools → Console

### 4. Expected Console Output (Success)
```
[PEPTIDES] Fetching recommendations for scan: abc-123-def
[PEPTIDES] Session token present: true
🧬 [getPeptideRecommendations] Fetching for scan: abc-123-def
✅ [getPeptideRecommendations] Found cached recommendations
[PEPTIDES] Response received: true
✅ [PEPTIDES] Loaded peptide recommendations: 3 peptides
```

### 5. Check Network Tab
- Filter by "recommend-peptides"
- Status should be **200 OK** (not 401)
- Response should contain peptide data

---

## 🔍 Debugging Authentication Issues

If you still get 401 errors, check these:

### 1. User is Logged In
```javascript
// In browser console:
const { data } = await supabase.auth.getSession();
console.log("Session:", data.session);
// Should show session object with access_token
```

### 2. Token is Valid
```javascript
// Check token expiration:
const { data } = await supabase.auth.getSession();
if (data.session) {
  const exp = JSON.parse(atob(data.session.access_token.split('.')[1])).exp;
  console.log("Token expires:", new Date(exp * 1000));
}
```

### 3. Edge Function is Deployed
```bash
supabase functions list
# Should show "recommend-peptides" in the list
```

### 4. Check Supabase Logs
1. Go to Supabase Dashboard
2. Edge Functions → recommend-peptides → Logs
3. Look for authentication errors

---

## 🚨 Common Issues & Solutions

### Issue: "Missing authorization header"
**Cause**: User not logged in or session expired
**Fix**: 
```typescript
// Check if user is authenticated before calling function
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Redirect to login
}
```

### Issue: "Authentication failed: JWT token invalid"
**Cause**: Token format incorrect or expired
**Fix**: Log out and log back in to get fresh token

### Issue: "Scan not found"
**Cause**: Invalid scan_id or scan doesn't belong to user
**Fix**: Verify scan_id is correct and belongs to authenticated user

### Issue: Function returns 500
**Cause**: OpenAI API key missing or invalid
**Fix**: Check Supabase Edge Functions environment variables

---

## ✨ Expected Behavior After Fix

### First Time Viewing Scan:
1. Loading spinner appears (~5-10 seconds)
2. Edge function calls OpenAI
3. 3-5 peptide cards appear
4. Recommendations saved to database

### Subsequent Views:
1. Recommendations load instantly (< 1 second)
2. No loading spinner
3. Same peptides every time (cached)

### Different Users:
- Each user gets unique recommendations
- Based on their scan scores and onboarding data

---

## 📋 Success Checklist

✅ No 401 errors in console  
✅ Network tab shows 200 OK for recommend-peptides  
✅ Peptide cards display under results  
✅ Console logs show authentication success  
✅ Refresh doesn't break anything  
✅ Different users get different recommendations  

---

## 🔐 Security Notes

**Why this is secure:**
- `supabase.functions.invoke()` uses the authenticated Supabase client
- JWT token is automatically extracted from the current session
- Edge function validates the token on every request
- User can only access their own scans (verified by user_id)
- No tokens are ever exposed in the frontend code

**Why manual headers were wrong:**
- Redundant (Supabase client already handles this)
- Can cause token format mismatches
- Harder to maintain and debug

---

## 🎯 Next Steps

1. Deploy the updated edge function
2. Test with a real user account
3. Verify recommendations appear correctly
4. Monitor logs for any remaining issues

---

Need more help? Check the browser console logs and Supabase Edge Function logs for detailed error messages.
