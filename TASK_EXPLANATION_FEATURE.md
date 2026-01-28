# Glow-Up Plan Task Explanation Feature

## Overview
This feature adds AI-powered personalized explanations for each task in the Glow-Up Plan. Users can click an info button on any task to learn why it's beneficial for them and how to do it properly.

## Key Features
- **Info button** on each task row (right side)
- **AI-generated explanations** personalized based on:
  - Face scan scores (skin quality, jawline, eye area, symmetry, etc.)
  - Onboarding answers (if available)
  - Task context (week, day, category)
- **Caching**: Explanations are generated once and cached in the database
- **Loading states**: Spinner shown while generating
- **Mobile-optimized**: Bottom sheet on mobile, popover on desktop

## Implementation Details

### Frontend Changes

#### 1. `GlowUpDayTasksModal.tsx`
- Added info button (ⓘ) to each task row
- Created `handleInfoClick` function to fetch/display explanations
- Added Sheet component for displaying explanations
- Loading state while generating
- Automatic caching detection

#### 2. `GlowUpPlanSection.tsx`
- Updated Task interface to include `ai_explain` property
- Passed `scanId` prop to modal

### Backend Changes

#### 1. Edge Function: `supabase/functions/explain-glowup-task/index.ts`
**Purpose**: Generate personalized AI explanations for tasks

**Input**:
```json
{
  "scanId": "uuid",
  "weekIndex": 0,
  "dayIndex": 0,
  "taskId": "w1d1-1"
}
```

**Output**:
```json
{
  "ok": true,
  "explanation": {
    "summary": "Brief 1-sentence summary",
    "why": [
      "Personalized reason 1",
      "Personalized reason 2"
    ],
    "how": [
      "Step 1",
      "Step 2",
      "Step 3"
    ],
    "tip": "Optional practical tip",
    "caution": "Optional safety note"
  },
  "cached": false
}
```

**Behavior**:
1. Verifies user authentication
2. Loads scan and verifies ownership
3. Checks if explanation already exists (cached)
4. If not cached:
   - Calls OpenAI GPT-4o-mini
   - Generates personalized explanation
   - Saves to `scans.glow_up_plan` JSON
   - Returns explanation
5. If cached, returns immediately

**Caching**:
- Explanations are stored directly on the task object in the database
- Path: `scans.glow_up_plan.weeks[weekIndex].days[dayIndex].tasks[taskIndex].ai_explain`
- Once generated, never regenerated (unless manually cleared)

## AI Explanation Format

### Tone & Style
- Coach/mentor voice
- Practical and actionable
- Motivating but realistic
- Simple language
- No medical claims
- No blackpill language

### JSON Structure
```json
{
  "summary": "Quick overview of what this task does",
  "why": [
    "Reason 1 (personalized based on user's scores)",
    "Reason 2 (personalized based on user's scores)"
  ],
  "how": [
    "Specific step 1",
    "Specific step 2", 
    "Specific step 3"
  ],
  "tip": "Pro tip for better results (optional)",
  "caution": "Safety or important note (optional)"
}
```

## UI Components

### Info Button
- Location: Right side of each task row
- Icon: `Info` from lucide-react
- Style: Subtle, ghost button
- Hover effect: Primary color highlight

### Explanation Sheet (Mobile)
- Type: Bottom sheet
- Max height: 85vh
- Sections:
  1. **Summary** - Highlighted box with key insight
  2. **Why This Matters** - Bullet points with personalized reasons
  3. **How To Do It** - Numbered steps
  4. **Tip** - Optional blue callout
  5. **Caution** - Optional orange callout

### Loading State
- Spinner animation
- Text: "Generating personalized explanation..."

## Console Logs (for debugging)

```
[TASK_EXPLAIN] open task
[TASK_EXPLAIN] using cached explanation
[TASK_EXPLAIN] generating with AI
[TASK_EXPLAIN] saved to scan
```

## Deployment

### 1. Deploy Edge Function
```powershell
# Using PowerShell script
.\deploy-explain-task.ps1

# Or manually
supabase functions deploy explain-glowup-task
```

### 2. Set OpenAI API Key (if not already set)
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key
```

### 3. Verify Deployment
- Open the Glow-Up Plan
- Click on any day
- Click the info button on a task
- Should see loading spinner, then explanation

## Testing Checklist

- [ ] Info button appears on each task
- [ ] Clicking info button shows loading state
- [ ] AI generates explanation (first time)
- [ ] Explanation is personalized based on scores
- [ ] Explanation is cached (instant on second click)
- [ ] Sheet displays properly on mobile
- [ ] All sections render correctly (summary, why, how, tip, caution)
- [ ] Close button works
- [ ] Click outside sheet closes it
- [ ] No console errors
- [ ] No layout shifts

## Database Schema

**No changes required!** 

The feature uses existing columns:
- `scans.glow_up_plan` (JSONB) - stores task explanations
- `scans.scores_json` (JSONB) - used for personalization
- `scans.onboarding_answers` (JSONB) - used for personalization (if available)

## Future Enhancements

Potential improvements:
- [ ] Add "regenerate" button to refresh cached explanations
- [ ] Track which tasks users view explanations for (analytics)
- [ ] A/B test different explanation styles
- [ ] Add video/image recommendations for certain tasks
- [ ] Multilingual support

## Troubleshooting

### Explanation not generating
1. Check console logs for `[TASK_EXPLAIN]` messages
2. Verify OPENAI_API_KEY is set in Supabase secrets
3. Check edge function logs: `supabase functions logs explain-glowup-task`

### Info button not appearing
1. Check that `scanId` is being passed to modal
2. Verify task data structure includes `id` field

### Cached explanation not showing
1. Check database: `glow_up_plan.weeks[x].days[y].tasks[z].ai_explain`
2. Clear cache by removing `ai_explain` field and regenerating

## Files Modified

### Frontend
- `src/components/payment/GlowUpDayTasksModal.tsx` - Main implementation
- `src/components/payment/GlowUpPlanSection.tsx` - Interface updates

### Backend
- `supabase/functions/explain-glowup-task/index.ts` - New edge function

### Documentation
- `TASK_EXPLANATION_FEATURE.md` - This file
- `deploy-explain-task.ps1` - Deployment script
