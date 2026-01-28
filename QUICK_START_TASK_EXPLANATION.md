# ⚡ Quick Start: Task Explanation Feature

## What This Does
Adds an info button (ⓘ) to each Glow-Up Plan task. Click it to get personalized AI explanations showing WHY the task matters and HOW to do it.

---

## 🚀 Deploy in 3 Steps

### 1. Deploy Edge Function
```powershell
cd c:\Users\wail\Desktop\mypepshi
.\deploy-explain-task.ps1
```

### 2. Verify OpenAI Key
```bash
supabase secrets list | grep OPENAI_API_KEY
```
If missing:
```bash
supabase secrets set OPENAI_API_KEY=sk-your-actual-key
```

### 3. Test in Browser
1. Open your app → Glow-Up Plan
2. Click any day (e.g., "Day 1")
3. Click the ⓘ button on any task
4. Should see loading → explanation appears

---

## ✅ Quick Test

### First Click (Generating)
```
Click ⓘ button
  ↓
Loading spinner (2-3 sec)
  ↓
Explanation sheet opens with:
  • Summary
  • Why this matters (personalized)
  • How to do it (steps)
  • Optional tip & caution
```

### Second Click (Cached)
```
Click ⓘ button again
  ↓
Explanation appears INSTANTLY
  ↓
Console: "[TASK_EXPLAIN] using cached explanation"
```

---

## 📱 What You'll See

### Before (Task Row)
```
[✓] Drink 2 glasses of water
    💧 lifestyle • 2m
```

### After (Task Row)
```
[✓] Drink 2 glasses of water        [ⓘ]
    💧 lifestyle • 2m
```

### Explanation Panel
- **Summary**: Quick 1-sentence overview
- **Why**: 2 personalized bullet points based on user's face scores
- **How**: 3 step-by-step instructions
- **Tip**: Optional practical advice (blue box)
- **Caution**: Optional safety note (orange box)

---

## 🔍 Console Logs to Expect

```
[TASK_EXPLAIN] open task: w1d1-1
[TASK_EXPLAIN] generating with AI
[TASK_EXPLAIN] saved to scan
```

Second click:
```
[TASK_EXPLAIN] open task: w1d1-1
[TASK_EXPLAIN] using cached explanation
```

---

## ⚠️ If Something Goes Wrong

### Error: "Failed to generate explanation"
**Fix**: Check OpenAI key
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key
```

### Error: "Scan not found"
**Fix**: Make sure you've completed a face scan first

### Info button doesn't appear
**Fix**: Clear browser cache and refresh

### Explanation not personalized
**Fix**: Check that face scan has `scores_json` data

---

## 📊 Files Changed

| File | What Changed |
|------|--------------|
| `GlowUpDayTasksModal.tsx` | Added info button & explanation UI |
| `GlowUpPlanSection.tsx` | Pass scanId to modal |
| `supabase/functions/explain-glowup-task/` | NEW edge function |

---

## 🎯 Success = All Green

- ✅ Info button visible on every task
- ✅ Clicking shows loading state
- ✅ Explanation appears with all sections
- ✅ Explanation mentions user's specific scores
- ✅ Second click is instant (cached)
- ✅ No console errors
- ✅ Mobile UI looks good

---

## 🔧 Advanced: Clear Cache

To regenerate an explanation:

### Option 1: Database Query
```sql
UPDATE scans 
SET glow_up_plan = jsonb_set(
  glow_up_plan,
  '{weeks,0,days,0,tasks,0,ai_explain}',
  'null'::jsonb
)
WHERE id = 'your-scan-id';
```

### Option 2: Future Enhancement
Add a "regenerate" button in the UI (not implemented yet)

---

## 📞 Need Help?

1. Check console: `[TASK_EXPLAIN]` logs
2. Check edge function logs:
   ```bash
   supabase functions logs explain-glowup-task --tail
   ```
3. Verify deployment:
   ```bash
   supabase functions list
   ```

---

## 🎉 That's It!

The feature is self-contained and doesn't affect any other parts of the app.

**Deploy time**: ~2 minutes  
**Test time**: ~30 seconds

---

**Status**: ✅ Ready to use
