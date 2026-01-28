# Deployment Checklist - 401 Fix

## Pre-Deployment Verification

- [x] Frontend changes in `GlowUpPlanSection.tsx` (lines 73-97)
- [x] Edge Function changes in `generate-glowup-plan/index.ts` (lines 20-65)
- [x] No other files modified
- [x] CORS handling preserved
- [x] JWT verification still enabled

## Deployment Steps

### 1. Deploy Edge Function
```powershell
cd c:\Users\wail\Desktop\mypepshi
supabase functions deploy generate-glowup-plan
```

**Expected output:**
```
Deploying function generate-glowup-plan...
Function deployed successfully
```

### 2. Test Frontend (no deployment needed for React)
- The frontend changes are already in place
- Just refresh your browser (Ctrl+F5 for hard refresh)

## Testing Procedure

### Test 1: Successful Plan Generation
1. **Open browser:** Navigate to your app
2. **Log in:** Ensure you're authenticated
3. **Go to Glow-Up Plan:** Navigate to the section
4. **Check console:** Look for these logs in order:
   ```
   🎯 [GLOWUP] Fetching AI-generated plan for user: <user-id>
   🎯 [GLOWUP] Generating new plan from onboarding data
   🎯 [GLOWUP] Calling Edge Function with JWT
   ✅ [GLOWUP] Plan generated successfully: {...}
   ```
5. **Verify:** NO 401 errors
6. **Verify:** Plan displays correctly

### Test 2: Missing Session (Edge Case)
1. **Clear cookies/storage:** Clear browser data
2. **Go to Glow-Up Plan:** Without logging in
3. **Verify:** Error message shows: "Please log in to see your personalized plan"
4. **Verify:** Edge Function is NOT called (no network request)

### Test 3: Edge Function Logs
```powershell
# View real-time logs
supabase functions log generate-glowup-plan --tail

# Or view recent logs
supabase functions log generate-glowup-plan --limit 50
```

**Expected logs:**
```
[generate-glowup-plan] auth header present: true
✅ [generate-glowup-plan] User authenticated: <user-id>
📦 [generate-glowup-plan] Request body: {"scanId":"..."}
🤖 [generate-glowup-plan] Calling OpenAI...
✅ [generate-glowup-plan] Plan validated
📤 [generate-glowup-plan] Returning plan
```

## Success Criteria

✅ **Browser console:** No 401 errors
✅ **Browser console:** Shows "Calling Edge Function with JWT"
✅ **Edge Function logs:** Shows "auth header present: true"
✅ **Edge Function logs:** Shows "User authenticated"
✅ **UI:** Plan generates and displays correctly
✅ **Caching:** Reload shows cached plan (no regeneration)

## Rollback Plan (if needed)

If something goes wrong:

```powershell
# 1. View previous deployment
supabase functions list

# 2. Check function status
supabase functions inspect generate-glowup-plan

# 3. If needed, redeploy from git history
git checkout HEAD~1 supabase/functions/generate-glowup-plan/index.ts
supabase functions deploy generate-glowup-plan
git checkout HEAD supabase/functions/generate-glowup-plan/index.ts
```

## Common Issues & Solutions

### Issue: Still getting 401
**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Check if user is logged in: `supabase.auth.getSession()` in console
- Verify Edge Function deployed: `supabase functions list`
- Check Edge Function logs for auth errors

### Issue: "Please log in to generate your plan" even when logged in
**Solution:**
- Check if session exists: Open console, run `await supabase.auth.getSession()`
- If no session, re-login
- Clear browser cache/cookies and login again

### Issue: Edge Function logs show "auth header present: false"
**Solution:**
- Verify frontend code has the Authorization header
- Check network tab in browser DevTools
- Look for "Authorization: Bearer ..." in request headers

## Post-Deployment Verification

After deployment, verify these in production:

- [ ] 401 errors resolved
- [ ] JWT token sent in Authorization header
- [ ] Edge Function validates Bearer token format
- [ ] Plans generate successfully
- [ ] Error messages are user-friendly
- [ ] No regressions in other features
- [ ] Console logs visible for debugging

## Documentation Updated

- [x] GLOWUP_401_FIX.md (detailed explanation)
- [x] GLOWUP_401_QUICK_FIX.md (quick reference)
- [x] GLOWUP_VISUAL_DIFF.md (visual diffs)
- [x] This deployment checklist

## Support Info

If issues persist after deployment:

1. **Check browser console** for [GLOWUP] logs
2. **Check Edge Function logs** via `supabase functions log`
3. **Verify session exists** via DevTools console
4. **Check network tab** for Authorization header
5. **Review error messages** for specific issues

---

**Deployed by:** _____________
**Date:** _____________
**Status:** [ ] Success [ ] Issues (describe below)

**Notes:**
