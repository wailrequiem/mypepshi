# Glow-Up Plan Fix - Public/No Auth Mode

## What Changed

Fixed Glow-Up Plan to work without authentication for dev mode. No more 401 errors!

## Files Modified (ONLY 2)

### 1. `supabase/functions/generate-glowup-plan/index.ts`
- ✅ Removed all JWT/auth requirements
- ✅ Added generic 4-week fallback plan (always works)
- ✅ Accepts optional `scanId` and `scores` in body
- ✅ Best-effort fetches scan data if available (doesn't fail if not)
- ✅ Best-effort caches to `scans.glow_up_plan` if column exists
- ✅ Always returns `{ ok: true, plan: {...} }` (never throws)
- ✅ Added DEV NOTE comment with deploy command

### 2. `src/components/payment/GlowUpPlanSection.tsx`
- ✅ Removed auth checks (no session token required)
- ✅ Calls `supabase.functions.invoke()` without Authorization header
- ✅ Changed response field from `glow_up_plan` to `plan`
- ✅ Removed red error banner (shows friendly message instead)
- ✅ Gracefully handles errors (shows empty state, not error)
- ✅ Removed dependency on `user` being logged in

## Deployment

### Step 1: Deploy Edge Function with --no-verify-jwt flag

```powershell
cd c:\Users\wail\Desktop\mypepshi
supabase functions deploy generate-glowup-plan --no-verify-jwt
```

**Important:** The `--no-verify-jwt` flag is REQUIRED. This makes the function public.

### Step 2: Refresh Frontend

No deployment needed for frontend - just hard refresh:
```
Ctrl + Shift + R
```

## Testing

### Expected Behavior:

1. **Open browser console**
2. **Navigate to Glow-Up Plan section**
3. **Check console logs:**
   ```
   [GLOWUP] Fetching plan, scanId: undefined
   [GLOWUP] Calling function to generate plan
   [GLOWUP] Response: { ok: true, plan: {...} }
   ```
4. **Check Network tab:**
   ```
   POST /functions/v1/generate-glowup-plan
   Status: 200 OK ✅ (not 401!)
   Response: { ok: true, plan: { weeks: [...] } }
   ```
5. **UI should show:**
   - 4-week plan with 5 days each
   - Foundation Week, Building Habits, Consistency Focus, Advanced Routine
   - No error banners

### Works Even When:
- ✅ Not logged in
- ✅ No onboarding data
- ✅ No scan data
- ✅ Invalid scanId
- ✅ Database errors

## Generic Plan Details

The function returns a hardcoded 4-week plan covering:

**Week 1 - Foundation:**
- Hydration, Sleep, Skincare, Posture, Facial Massage

**Week 2 - Building Habits:**
- SPF, Mewing, Eye Care, Walking, Face Yoga

**Week 3 - Consistency:**
- Exfoliation, Chewing, Eye Exercises, Healthy Snacks, Symmetry

**Week 4 - Advanced:**
- Moisturize, Jaw Stretch, Dark Circles, Meal Prep, Full Routine

## Response Schema

```typescript
{
  ok: true,
  plan: {
    weeks: [
      {
        week: 1,
        title: "Foundation Week",
        days: [
          {
            day: 1,
            title: "Hydration Start",
            description: "Drink 8 glasses of water throughout the day.",
            minutes: 2,
            category: "lifestyle"
          },
          // ... 4 more days
        ]
      },
      // ... 3 more weeks
    ]
  }
}
```

## What Was NOT Changed

- ❌ No route changes
- ❌ No paywall changes
- ❌ No coach changes
- ❌ No scan flow changes
- ❌ No auth guard changes
- ❌ No other features touched

## Future Personalization

Once this works, you can add:
1. AI generation using OpenAI (requires API key)
2. Personalization based on onboarding data
3. Customization based on scan scores
4. User-specific caching

For now, everyone gets the same generic plan, which is fine for dev/testing.

## Troubleshooting

**If still getting 401:**
- Verify function deployed with `--no-verify-jwt` flag
- Check function logs: `supabase functions log generate-glowup-plan`
- Redeploy if needed

**If plan doesn't show:**
- Check browser console for `[GLOWUP]` logs
- Verify response has `plan.weeks` array
- Check Network tab shows 200 status

**To verify deployment:**
```powershell
supabase functions list
```
Should show `generate-glowup-plan` in the list.

## Success Criteria

✅ No 401 errors in browser console
✅ No red error banners in UI
✅ Plan displays with 4 weeks, 5 days each
✅ Works without logging in
✅ Network tab shows 200 OK status
✅ Function logs show no auth errors

---

**Status:** Ready to deploy
**Deploy command:** `supabase functions deploy generate-glowup-plan --no-verify-jwt`
