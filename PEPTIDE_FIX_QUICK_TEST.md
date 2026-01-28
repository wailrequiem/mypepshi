# 🚀 Quick Test Guide - Peptide 400 Fix

## What Was Fixed
✅ Removed JWT authentication from Edge Function  
✅ Backend now accepts both `scanId` and `scan_id`  
✅ Added detailed error logging  
✅ Edge Function deployed successfully  

---

## Test NOW (3 Steps)

### 1. Hard Refresh Browser
```
Press: Ctrl + Shift + R
```

### 2. Trigger Peptide Recommendations
- Complete a face scan
- Go to Dashboard
- Scroll to peptide section

### 3. Check Console Logs
Look for these logs:

#### ✅ SUCCESS Looks Like:
```
🔴 [CLIENT] Starting peptide recommendations
🔴 [CLIENT] scanId: abc-123-def-456
🔴 [CLIENT] Payload being sent: { scanId: "abc-123-def-456" }
🔴 [CLIENT] Response status: 200
🔴 [CLIENT] ✅ SUCCESS - Returning data
```

#### ❌ ERROR Looks Like:
```
🔴 [CLIENT] Edge Function returned error:
🔴 [CLIENT] Full error: { ... }
```

---

## Network Tab Check

Open DevTools → Network tab:

**Expected:**
```
POST /functions/v1/recommend-peptides
Status: 200 OK
Response:
{
  "ok": true,
  "data": {
    "peptides": [...]
  }
}
```

**Old Error (should NOT see this anymore):**
```
Status: 400 Bad Request
```

---

## If It Still Fails

### Check These Logs:

1. **Browser Console** - Copy ALL 🔴 logs
2. **Network Tab** - Copy response body
3. **Edge Function Logs** - Check Supabase Dashboard → Functions → recommend-peptides → Logs

### Send Me:
- Screenshot of console logs
- Screenshot of Network response
- Copy of error message

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still getting 401 | Clear browser cache, sign out/in |
| Still getting 400 | Check if scanId is defined in logs |
| 404 Scan not found | Verify scan exists in database |
| 500 Internal error | Check Edge Function logs in Dashboard |

---

## Edge Function Logs Location

1. Go to: https://supabase.com/dashboard/project/yufapyazxhjmjhonmfhd/functions
2. Click **recommend-peptides**
3. Click **Logs** tab
4. Look for:
   - `📦 RAW_BODY`
   - `📋 BODY_KEYS`
   - `✅ SUCCESS` or `❌ ERROR`

---

## Expected Result

✅ Network: **200 OK**  
✅ Console: `🔴 [CLIENT] ✅ SUCCESS`  
✅ UI: Peptides display correctly  
✅ No "Unable to load" error  

---

**The fix is deployed and ready to test!** 🎉
