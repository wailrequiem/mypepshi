# Quick Reference - Glow-Up Plan Public Fix

## Deploy Command

```powershell
supabase functions deploy generate-glowup-plan --no-verify-jwt
```

## What Changed

### Edge Function: `supabase/functions/generate-glowup-plan/index.ts`

**BEFORE:** Required JWT auth, fetched onboarding, called OpenAI
**AFTER:** No auth, returns generic plan instantly

**Key changes:**
- ❌ Removed: All JWT/Authorization checks
- ❌ Removed: User authentication
- ❌ Removed: Onboarding data fetching
- ❌ Removed: OpenAI API calls
- ✅ Added: Generic 4-week hardcoded plan
- ✅ Added: Always returns `{ ok: true, plan: {...} }`
- ✅ Added: DEV NOTE comment at top with deploy command

### Frontend: `src/components/payment/GlowUpPlanSection.tsx`

**BEFORE:** Required user login, checked session, sent JWT token
**AFTER:** Works without auth, no session checks

**Key changes:**
- ❌ Removed: `if (!user)` check that blocked non-logged-in users
- ❌ Removed: `supabase.auth.getSession()` call
- ❌ Removed: `Authorization` header in function call
- ❌ Removed: Red error banner for failed requests
- ✅ Changed: Response field from `glow_up_plan` to `plan`
- ✅ Changed: Shows friendly message instead of error
- ✅ Changed: Graceful fallback (empty plan, no banner)

## Response Format Change

**OLD:**
```json
{ "ok": true, "glow_up_plan": { "weeks": [...] } }
```

**NEW:**
```json
{ "ok": true, "plan": { "weeks": [...] } }
```

## Testing Checklist

1. [ ] Deploy function with `--no-verify-jwt`
2. [ ] Hard refresh browser (`Ctrl+Shift+R`)
3. [ ] Open DevTools Console
4. [ ] Navigate to Glow-Up Plan
5. [ ] Verify logs: `[GLOWUP] Response: { ok: true, plan: {...} }`
6. [ ] Verify Network: `200 OK` (not 401)
7. [ ] Verify UI: Shows 4-week plan
8. [ ] Verify: No red error banners

## Generic Plan Structure

4 weeks × 5 days = 20 tasks total

- **Week 1:** Foundation (Hydration, Sleep, Skincare, Posture, Massage)
- **Week 2:** Building Habits (SPF, Mewing, Eye Care, Walking, Face Yoga)
- **Week 3:** Consistency (Exfoliation, Chewing, Eye Exercises, Snacks, Symmetry)
- **Week 4:** Advanced (Moisturize, Jaw Stretch, Dark Circles, Meal Prep, Full Routine)

Each day has:
- `day`: 1-5
- `title`: Short name
- `description`: One sentence instruction
- `minutes`: Time required
- `category`: skin | jawline | eye_area | symmetry | lifestyle

## Files Changed

1. ✅ `supabase/functions/generate-glowup-plan/index.ts` (complete rewrite)
2. ✅ `src/components/payment/GlowUpPlanSection.tsx` (minimal changes to fetch logic)

## Files NOT Changed

- ❌ Routes
- ❌ Paywall
- ❌ Coach
- ❌ Scan flow
- ❌ Auth logic
- ❌ Any other components

## Success Indicators

✅ Browser console: No 401 errors
✅ Browser console: `[GLOWUP] Response: { ok: true, plan: {...} }`
✅ Network tab: `POST .../generate-glowup-plan` returns `200 OK`
✅ UI: Displays 4-week plan with days
✅ UI: No red error banners
✅ Works: Even when not logged in

---

**Ready to deploy!** Just run the deploy command above.
