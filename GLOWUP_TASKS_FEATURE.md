# Glow-Up Plan - Day Tasks & Checklist Feature

## New Feature: Per-Day Task Checklists

Each day in the Glow-Up Plan now has a **detailed task checklist** that opens when you click a day card.

## What Changed

### 1. Edge Function Updates

**File:** `supabase/functions/generate-glowup-plan/index.ts`

Each day now includes a `tasks` array with actionable items:

```javascript
{
  day: 1,
  title: "Hydration Start",
  description: "Drink 8 glasses of water throughout the day...",
  tasks: [
    { id: "w1d1-1", label: "Drink 2 glasses upon waking", est_minutes: 2, category: "lifestyle" },
    { id: "w1d1-2", label: "Set hourly reminders", est_minutes: 2, category: "lifestyle" },
    // ... more tasks
  ]
}
```

**Deploy:** `supabase functions deploy generate-glowup-plan --no-verify-jwt`

### 2. Progress Tracking Enhanced

**File:** `supabase/functions/update-glowup-progress/index.ts`

Progress now tracks:
- **Day-level completion** (existing): `completedDays: [0, 1, 5]`
- **Task-level completion** (NEW): `completedTasksByDay: { "0": ["w1d1-1", "w1d1-2"], "5": ["w1d6-1"] }`

**New API:**
```javascript
// Mark task complete/incomplete
{ scanId, dayIndex: 0, taskId: "w1d1-1", completed: true }

// Mark entire day complete (still works)
{ scanId, dayIndex: 0, completed: true }
```

**Deploy:** `supabase functions deploy update-glowup-progress --no-verify-jwt`

### 3. New Component: Day Tasks Modal

**File:** `src/components/payment/GlowUpDayTasksModal.tsx` (NEW)

Features:
- ✅ Shows all tasks for the clicked day
- ✅ Interactive checkboxes for each task
- ✅ Displays estimated time per task
- ✅ Shows total time for the day
- ✅ "Mark Day Complete" button (enabled when all tasks checked)
- ✅ Blur backdrop matching existing UI style
- ✅ Smooth animations

### 4. Frontend Integration

**File:** `src/components/payment/GlowUpPlanSection.tsx` (UPDATED)

- Clicking a day card → opens GlowUpDayTasksModal
- Checking tasks → updates DB via `update-glowup-progress`
- Progress persists across refresh
- Optimistic updates for instant feedback
- Fallback for days without tasks: "No tasks available for this day yet."

## User Flow

1. **Click Day Card** → Modal opens with task checklist
2. **Check Tasks** → Each checkbox updates DB instantly
3. **All Tasks Done** → "Mark Day Complete" button activates
4. **Click Button** → Day marked complete with green checkmark
5. **Refresh Page** → Progress persists, checkmarks remain

## Task Data Structure

```typescript
interface Task {
  id: string;              // Unique: "w1d1-1", "w2d3-2", etc.
  label: string;           // "Drink 2 glasses of water"
  details?: string;        // Optional longer description
  est_minutes?: number;    // Time estimate: 2, 5, 10, etc.
  category?: string;       // "lifestyle", "skin", "jawline", etc.
}
```

## Progress Data Structure

```typescript
interface GlowUpProgress {
  completedDays: number[];                    // [0, 1, 5, 7] - day indices
  completedTasksByDay: Record<string, string[]>; // { "0": ["w1d1-1", "w1d1-2"], "5": ["w1d6-1"] }
  updatedAt: string;                          // ISO timestamp
}
```

## Example: Week 1 Day 1 Tasks

**Day:** Hydration Start
**Total Time:** ~10 minutes

Tasks:
1. ☐ Drink 2 glasses of water upon waking (2 min)
2. ☐ Set hourly water reminders on phone (2 min)
3. ☐ Drink water before each meal (2 min)
4. ☐ Track total glasses consumed today (2 min)
5. ☐ Drink final glass 1 hour before bed (2 min)

## Deployment Steps

```bash
# 1. Deploy both Edge Functions
cd c:\Users\wail\Desktop\mypepshi
supabase functions deploy generate-glowup-plan --no-verify-jwt
supabase functions deploy update-glowup-progress --no-verify-jwt

# 2. Hard refresh browser
Ctrl + Shift + R
```

## Testing

1. **Open Day 1**
   - Click "Hydration Start" day card
   - Modal opens with 5 tasks
   - Shows "Estimated time: 10 minutes"

2. **Check Tasks**
   - Click checkbox on first task
   - Checkbox fills with green checkmark
   - Refresh page → checkbox still checked ✅

3. **Complete All Tasks**
   - Check all 5 tasks
   - "Mark Day Complete" button turns green
   - Click button → modal closes
   - Day 1 shows green checkmark on card

4. **Fallback Test**
   - If older plan has no tasks
   - Shows: "No tasks available for this day yet."
   - No crash, UI remains stable

## Console Logs

```
[GLOWUP] Open day: 1 0
[GLOWUP] Tasks count: 5
[GLOWUP] Toggle task: w1d1-1 completed: true dayIndex: 0
[GLOWUP] Task updated: { completedDays: [], completedTasksByDay: { "0": ["w1d1-1"] }, ... }
```

## Visual Features

- ✅ Blur/backdrop style matches existing modals
- ✅ Smooth slide-up animation
- ✅ Task cards highlight on hover
- ✅ Completed tasks show line-through
- ✅ Progress bar shows X/Y completed
- ✅ Category badges color-coded
- ✅ Time estimates with clock icon

## Backward Compatibility

- ✅ Old scans without `tasks` → shows fallback message
- ✅ Old `completedTasksByDay` undefined → defaults to `{}`
- ✅ Day-level completion still works
- ✅ No breaking changes to existing data

## Files Changed

1. ✅ `supabase/functions/generate-glowup-plan/index.ts` (added tasks to all 28 days)
2. ✅ `supabase/functions/update-glowup-progress/index.ts` (task-level tracking)
3. ✅ `src/components/payment/GlowUpDayTasksModal.tsx` (NEW component)
4. ✅ `src/components/payment/GlowUpPlanSection.tsx` (integrated modal)

## Files NOT Changed

- ❌ Routes
- ❌ Paywall
- ❌ Coach
- ❌ Scan flow
- ❌ Auth guards
- ❌ Any other components

Only the Glow-Up Plan feature was enhanced.

---

**Status:** Ready to deploy
**Deploy Commands:**
```bash
supabase functions deploy generate-glowup-plan --no-verify-jwt
supabase functions deploy update-glowup-progress --no-verify-jwt
```
