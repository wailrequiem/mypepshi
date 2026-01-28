# Quick Deploy Guide - Glow-Up Plan Persistent

## 1. Run SQL Migration

In **Supabase Dashboard → SQL Editor**, run:

```sql
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS glow_up_plan jsonb;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS glow_up_start_date timestamptz;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS glow_up_progress jsonb;
```

Or run the file: `ADD_GLOWUP_PERSISTENT_COLUMNS.sql`

## 2. Deploy Edge Functions

```bash
cd c:\Users\wail\Desktop\mypepshi

# Deploy generate-glowup-plan
supabase functions deploy generate-glowup-plan --no-verify-jwt

# Deploy update-glowup-progress
supabase functions deploy update-glowup-progress --no-verify-jwt
```

**IMPORTANT:** The `--no-verify-jwt` flag is required for both functions.

## 3. Verify Deployment

```bash
supabase functions list
```

Should show:
- `generate-glowup-plan`
- `update-glowup-progress`

## 4. Test Frontend

1. Hard refresh browser: `Ctrl + Shift + R`
2. Log in as a user with an existing scan
3. Navigate to Glow-Up Plan section
4. Verify plan displays with current day highlighted

## Expected Console Logs

```
[GLOWUP] Fetching plan for user: <uuid>
[generate-glowup-plan] Function invoked
[generate-glowup-plan] userId: <uuid>
[generate-glowup-plan] Found scan: <uuid>
[generate-glowup-plan] dayIndex: 0
[generate-glowup-plan] Returning plan, week: 1 day: 1
[GLOWUP] Response: { ok: true, scanId: "...", dayIndex: 0, ... }
```

## Expected UI

- **Header:** "Your Glow-Up Plan" with "Week 1 • Day 1"
- **Week 1 Card:** Shows "Foundation Week" with 7 day buttons
- **Current Day:** Day 1 highlighted with thicker border
- **Future Days:** Locked with padlock icon
- **Footer:** "Day 1 of 28 • 0 tasks completed"

## Test Completion

1. Click current day (Day 1)
2. Modal opens with "Hydration Start" task
3. Click "Mark as completed"
4. Green checkmark appears on Day 1
5. Footer updates: "Day 1 of 28 • 1 tasks completed"
6. Refresh page → completion persists ✅

## Test Auto-Advance (Next Day)

To simulate next day:
1. In Supabase Dashboard → SQL Editor:
   ```sql
   UPDATE scans 
   SET glow_up_start_date = NOW() - INTERVAL '1 day'
   WHERE user_id = '<your-user-id>';
   ```
2. Refresh Glow-Up Plan
3. Should now show "Week 1 • Day 2" highlighted
4. Day 1 and Day 2 unlocked, rest locked

## Test Auto-Reset (28 Days Complete)

To simulate completion:
1. In Supabase Dashboard → SQL Editor:
   ```sql
   UPDATE scans 
   SET glow_up_start_date = NOW() - INTERVAL '29 days'
   WHERE user_id = '<your-user-id>';
   ```
2. Refresh Glow-Up Plan
3. Should show toast: "🎉 Cycle Complete! Starting fresh!"
4. Back to "Week 1 • Day 1"
5. Progress cleared (all checkmarks gone)

## Troubleshooting

**Error: "no_scan_for_user"**
- User needs to complete a face scan first
- Or: Check user_id in request matches scan owner

**Progress not persisting:**
- Check `glow_up_progress` column exists in DB
- Check browser console for errors
- Verify `update-glowup-progress` function deployed

**Current day not advancing:**
- Check `glow_up_start_date` is set correctly
- Verify server time is correct
- Check dayIndex calculation in console logs

**Functions returning 404:**
- Verify functions deployed: `supabase functions list`
- Check project ref in .env matches deployment

## Files Changed

✅ `supabase/functions/generate-glowup-plan/index.ts`
✅ `supabase/functions/update-glowup-progress/index.ts`
✅ `src/components/payment/GlowUpPlanSection.tsx`
✅ `ADD_GLOWUP_PERSISTENT_COLUMNS.sql` (new)

## Files NOT Changed

❌ All other files remain unchanged
❌ No route changes
❌ No paywall changes
❌ No coach changes
❌ No scan flow changes

---

**Ready to deploy!** Follow the 4 steps above.
