# Glow-Up Plan - Persistent with Auto-Reset

## Overview

The Glow-Up Plan is now a **persistent 4-week (28-day) routine** that:
- Stays the same for each user across sessions
- Automatically resets after 28 days and starts again from Day 1
- Tracks completion progress in the database
- Highlights the current day based on elapsed time

## Database Schema

### New Columns Added to `scans` table:

```sql
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS glow_up_plan jsonb;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS glow_up_start_date timestamptz;
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS glow_up_progress jsonb;
```

**Run this SQL:** See `ADD_GLOWUP_PERSISTENT_COLUMNS.sql`

### Column Descriptions:

- **`glow_up_plan`** (jsonb): The fixed 4-week routine content (28 days of tasks)
- **`glow_up_start_date`** (timestamptz): When the current 4-week cycle started
- **`glow_up_progress`** (jsonb): Completion state `{ "completedDays": [0,1,5], "updatedAt": "..." }`

## How It Works

### 1. Plan Initialization
- When a user first accesses the Glow-Up Plan, the system:
  - Creates the standard 4-week routine (28 days)
  - Sets `glow_up_start_date` to current timestamp
  - Initializes `glow_up_progress` with empty `completedDays` array

### 2. Day Index Calculation
```javascript
dayIndex = floor((now - glow_up_start_date) / 86400000)
currentWeek = floor(dayIndex / 7) + 1
currentDay = (dayIndex % 7) + 1
```

### 3. Auto-Reset (After 28 Days)
- When `dayIndex >= 28`:
  - Resets `glow_up_start_date` to current timestamp
  - Clears `glow_up_progress.completedDays` to `[]`
  - **Keeps the same `glow_up_plan`** (routine stays identical)
  - Shows toast: "🎉 Cycle Complete! Starting fresh!"

### 4. Progress Tracking
- User marks days complete → updates `glow_up_progress.completedDays`
- Progress persists across sessions (page refresh, logout/login)
- Completed days show green checkmark

## Edge Functions

### 1. `generate-glowup-plan`

**Deploy:**
```bash
supabase functions deploy generate-glowup-plan --no-verify-jwt
```

**Input:**
```json
{ "userId": "uuid" }
```

**Output:**
```json
{
  "ok": true,
  "scanId": "uuid",
  "startDate": "2026-01-26T12:00:00Z",
  "dayIndex": 5,
  "currentWeek": 1,
  "currentDay": 6,
  "plan": { "weeks": [...] },
  "progress": { "completedDays": [0,1,2], "updatedAt": "..." },
  "resetPerformed": false
}
```

**Logic:**
1. Loads latest scan for user
2. Initializes plan/start/progress if null
3. Calculates current day based on elapsed time
4. Auto-resets if 28 days passed
5. Returns computed state

### 2. `update-glowup-progress`

**Deploy:**
```bash
supabase functions deploy update-glowup-progress --no-verify-jwt
```

**Input:**
```json
{
  "scanId": "uuid",
  "dayIndex": 5,
  "completed": true
}
```

**Output:**
```json
{
  "ok": true,
  "progress": {
    "completedDays": [0, 1, 2, 5],
    "updatedAt": "2026-01-27T10:30:00Z"
  }
}
```

**Logic:**
1. Loads current progress from scan
2. Adds/removes dayIndex from completedDays array
3. Updates timestamp
4. Saves to database

## Frontend Component

### `GlowUpPlanSection.tsx`

**Key Features:**
- On mount: Calls `generate-glowup-plan` with userId
- Shows current week/day highlighted
- Days unlock progressively (current day + past days)
- Click day → modal with description + mark complete button
- Mark complete → calls `update-glowup-progress`
- Optimistic updates for instant feedback
- Shows progress counter: "Day 6 of 28 • 3 tasks completed"

**No Auth Required (Dev Mode):**
- Functions use `--no-verify-jwt` flag
- For production, add JWT verification later

## The 4-Week Routine

### Week 1: Foundation
- Hydration, Sleep, Skincare, Posture, Massage, Eye Rest, Review

### Week 2: Building Habits
- SPF, Mewing, Eye Care, Walking, Face Yoga, Skin Hydration, Progress Check

### Week 3: Consistency Focus
- Exfoliation, Chewing, Eye Exercises, Healthy Snack, Face Symmetry, Advanced Mewing, Mid-Review

### Week 4: Advanced Routine
- Full Skincare, Jaw Resistance, Dark Circles, Meal Prep, Full Face Routine, Final Push, Complete Review

**Total:** 28 days, each with title, description, duration, and category

## Deployment Steps

### 1. Run SQL Migration
```sql
-- In Supabase Dashboard → SQL Editor
-- Run: ADD_GLOWUP_PERSISTENT_COLUMNS.sql
```

### 2. Deploy Edge Functions
```bash
cd c:\Users\wail\Desktop\mypepshi
supabase functions deploy generate-glowup-plan --no-verify-jwt
supabase functions deploy update-glowup-progress --no-verify-jwt
```

### 3. Refresh Frontend
```
Ctrl + Shift + R (hard refresh)
```

## Testing Checklist

### Initialization Test:
1. [ ] Log in as user with existing scan
2. [ ] Navigate to Glow-Up Plan
3. [ ] Verify plan displays with Week 1 Day 1 highlighted
4. [ ] Check console: `[GLOWUP] Response: { ok: true, ... }`

### Progress Test:
1. [ ] Click current day
2. [ ] Click "Mark as completed"
3. [ ] Verify green checkmark appears
4. [ ] Refresh page
5. [ ] Verify completion persists

### Day Progression Test:
1. [ ] Check current day is highlighted
2. [ ] Verify future days are locked (padlock icon)
3. [ ] Verify past days are unlocked

### Reset Test (Simulate 28 days):
1. [ ] Manually update `glow_up_start_date` in DB to 29 days ago
2. [ ] Refresh Glow-Up Plan
3. [ ] Verify toast shows "Cycle Complete!"
4. [ ] Verify starts at Day 1 again
5. [ ] Verify progress is cleared

## Files Changed (ONLY 3)

1. ✅ `supabase/functions/generate-glowup-plan/index.ts` (NEW - complete rewrite)
2. ✅ `supabase/functions/update-glowup-progress/index.ts` (NEW)
3. ✅ `src/components/payment/GlowUpPlanSection.tsx` (complete rewrite)

## Files NOT Changed

- ❌ Routes
- ❌ Paywall
- ❌ Coach features
- ❌ Scan upload/flow
- ❌ Auth guards
- ❌ Any other components

## Key Differences from Previous Version

**BEFORE:**
- Generated new plan each time
- No persistence
- Used onboarding data
- Called OpenAI
- Required full auth

**AFTER:**
- Fixed routine, same for everyone
- Fully persistent in DB
- No onboarding dependency
- No AI calls (hardcoded plan)
- Auto-resets after 28 days
- Current day auto-advances based on time
- No auth required (dev mode)

## Success Indicators

✅ Plan loads instantly (no AI delay)
✅ Current day is highlighted
✅ Completion persists across refresh
✅ Progress counter shows correct numbers
✅ After 28 days, plan auto-resets
✅ Same plan shown for same user every time
✅ No 401 errors
✅ Console shows `[GLOWUP]` logs

## Future Enhancements

Once this works:
1. Add personalized tips based on scan scores
2. Add JWT verification for production
3. Add email reminders for current day
4. Add streak tracking (consecutive days)
5. Add achievements/badges
6. Add custom plan variations per user profile

---

**Status:** Ready to deploy
**Deploy Commands:**
```bash
supabase functions deploy generate-glowup-plan --no-verify-jwt
supabase functions deploy update-glowup-progress --no-verify-jwt
```
