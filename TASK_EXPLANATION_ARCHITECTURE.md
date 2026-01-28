# Task Explanation Feature - Architecture & Data Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  GlowUpPlanSection.tsx                                       │
│  ├─ Manages Glow-Up Plan state                              │
│  └─ Passes scanId to modal                                  │
│                                                              │
│  GlowUpDayTasksModal.tsx                                     │
│  ├─ Displays tasks for selected day                         │
│  ├─ Info button (ⓘ) on each task                           │
│  ├─ handleInfoClick() - fetch explanation                   │
│  └─ Sheet component - display explanation                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ supabase.functions.invoke()
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      EDGE FUNCTION                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  explain-glowup-task/index.ts                                │
│  ├─ 1. Authenticate user (JWT)                              │
│  ├─ 2. Load scan from database                              │
│  ├─ 3. Verify user owns scan                                │
│  ├─ 4. Find task in glow_up_plan                            │
│  ├─ 5. Check if ai_explain exists (cache)                   │
│  ├─ 6. If cached → return immediately                       │
│  └─ 7. If not cached:                                       │
│      ├─ Build context (scores, onboarding)                  │
│      ├─ Call OpenAI GPT-4o-mini                             │
│      ├─ Parse & validate response                           │
│      ├─ Save to database (cache)                            │
│      └─ Return explanation                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
           │                                  │
           │                                  │
           ▼                                  ▼
┌──────────────────────┐         ┌──────────────────────┐
│   SUPABASE DB        │         │   OPENAI API         │
├──────────────────────┤         ├──────────────────────┤
│                      │         │                      │
│ scans table:         │         │ gpt-4o-mini          │
│ ├─ scores_json       │         │ ├─ System prompt    │
│ ├─ glow_up_plan      │         │ ├─ User context     │
│ │  └─ ai_explain ✨  │         │ └─ JSON response    │
│ └─ onboarding_answers│         │                      │
│                      │         │ Returns structured   │
│ Cache location:      │         │ explanation          │
│ glow_up_plan.weeks   │         │                      │
│  [i].days[j].tasks   │         │                      │
│  [k].ai_explain      │         │                      │
│                      │         │                      │
└──────────────────────┘         └──────────────────────┘
```

---

## 🔄 Data Flow Diagram

### First Time (No Cache)

```
User clicks ⓘ
    │
    ├─ Frontend: handleInfoClick()
    │   ├─ Show loading state
    │   └─ Call edge function
    │
    ▼
Edge Function
    │
    ├─ Authenticate user
    ├─ Load scan from DB
    ├─ Verify ownership
    ├─ Find task
    ├─ Check cache: ai_explain = null ❌
    │
    ├─ Build AI context:
    │   ├─ Task info
    │   ├─ User scores (skin, jawline, etc.)
    │   └─ Onboarding answers
    │
    ├─ Call OpenAI API
    │   └─ GPT-4o-mini generates:
    │       ├─ summary
    │       ├─ why (personalized)
    │       ├─ how (steps)
    │       ├─ tip (optional)
    │       └─ caution (optional)
    │
    ├─ Save to database:
    │   └─ UPDATE scans
    │       SET glow_up_plan.weeks[i].days[j].tasks[k].ai_explain = {...}
    │
    └─ Return explanation
    │
    ▼
Frontend receives response
    │
    ├─ Hide loading state
    ├─ Update task object
    └─ Display Sheet with explanation
```

### Second Time (Cached)

```
User clicks ⓘ again
    │
    ├─ Frontend: handleInfoClick()
    │   └─ Check task.ai_explain exists ✅
    │
    └─ Display Sheet immediately
        (no API call needed)
```

---

## 📦 Data Structures

### Task Interface (Frontend)
```typescript
interface Task {
  id: string;                    // e.g., "w1d1-1"
  label: string;                 // e.g., "Drink 2 glasses of water"
  details?: string;              // Optional description
  est_minutes?: number;          // e.g., 2
  category?: string;             // e.g., "lifestyle"
  ai_explain?: TaskExplanation;  // ✨ NEW: Cached explanation
}
```

### TaskExplanation Interface
```typescript
interface TaskExplanation {
  summary: string;               // 1 sentence overview
  why: string[];                 // Personalized reasons (2-3)
  how: string[];                 // Step-by-step instructions (3-5)
  tip?: string;                  // Optional practical tip
  caution?: string;              // Optional safety note
}
```

### Edge Function Request
```typescript
{
  scanId: string;        // UUID of user's scan
  weekIndex: number;     // 0-3 (4 weeks)
  dayIndex: number;      // 0-6 (7 days per week)
  taskId: string;        // e.g., "w1d1-1"
}
```

### Edge Function Response
```typescript
{
  ok: boolean;
  explanation: TaskExplanation;
  cached: boolean;       // true if from cache
  error?: string;        // if ok = false
}
```

### Database Storage (JSONB)
```json
{
  "weeks": [
    {
      "week": 1,
      "title": "Foundation Week",
      "days": [
        {
          "day": 1,
          "title": "Hydration Start",
          "description": "...",
          "tasks": [
            {
              "id": "w1d1-1",
              "label": "Drink 2 glasses of water",
              "est_minutes": 2,
              "category": "lifestyle",
              "ai_explain": {
                "summary": "Hydration jumpstarts your body's natural repair processes",
                "why": [
                  "Your skin quality score is 6.5/10 - proper hydration helps improve elasticity and glow",
                  "Morning hydration flushes toxins and preps your body for better nutrient absorption"
                ],
                "how": [
                  "Place two glasses of water by your bedside tonight",
                  "Drink them within 5 minutes of waking up, before eating",
                  "Sip slowly rather than chugging - aids absorption"
                ],
                "tip": "Room temperature water is easier on your system than cold",
                "caution": "If you have kidney issues, consult your doctor about fluid intake"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🔐 Security Flow

```
1. User Action
   └─ Click info button
      ├─ Must be logged in (AuthContext)
      └─ Must have completed scan

2. Edge Function Call
   └─ Includes JWT in Authorization header
      ├─ supabase.auth.getUser() validates
      └─ Returns user ID

3. Database Query
   └─ Load scan by ID
      ├─ Verify user_id matches JWT user
      └─ If mismatch → 403 Forbidden

4. OpenAI Call
   └─ Uses server-side OPENAI_API_KEY
      ├─ Never exposed to client
      └─ Stored in Supabase secrets

5. Response
   └─ Only returns data user owns
```

---

## 📊 Caching Strategy

### Why Cache?
- OpenAI API costs money (~ $0.001 per generation)
- User expects instant results after first load
- Explanations don't change (based on static scores)

### How Cache Works
1. **Write**: After generating, save to `ai_explain` field
2. **Read**: Check `ai_explain !== null` before calling API
3. **Hit**: Return cached data immediately
4. **Miss**: Generate and cache

### Cache Location
```
Database: scans table
Column: glow_up_plan (JSONB)
Path: weeks[weekIndex].days[dayIndex].tasks[taskIndex].ai_explain
```

### Cache Duration
**Permanent** (until manually cleared)

### Cache Invalidation
Currently: Manual only
Future: Add "regenerate" button

---

## 🎨 UI Component Hierarchy

```
GlowUpPlanSection
  └─ GlowUpDayTasksModal (when day clicked)
      ├─ Task List
      │   └─ Task Row (for each task)
      │       ├─ Checkbox
      │       ├─ Task Label
      │       ├─ Task Details
      │       ├─ Category Badge
      │       └─ Info Button ⓘ ← NEW
      │
      └─ Sheet (when info clicked)
          ├─ SheetHeader
          │   ├─ Task Title
          │   └─ Category Badge
          │
          └─ SheetContent
              ├─ Loading State (if generating)
              │   └─ Spinner + "Generating..."
              │
              └─ Explanation (if loaded)
                  ├─ Summary Box (highlighted)
                  ├─ Why Section (bullets)
                  ├─ How Section (numbered steps)
                  ├─ Tip Box (blue, optional)
                  └─ Caution Box (orange, optional)
```

---

## 🔄 State Management

### Frontend State
```typescript
// In GlowUpDayTasksModal.tsx
const [selectedTaskExplanation, setSelectedTaskExplanation] = useState<{
  task: Task;
  explanation: TaskExplanation | null;
  loading: boolean;
} | null>(null);
```

### State Transitions
```
null → loading → loaded → null
  │       │         │       │
  │       │         │       └─ User closes sheet
  │       │         └─ Explanation received
  │       └─ API call in progress
  └─ Initial state
```

---

## 📈 Performance Considerations

### First Load
- Time: 2-3 seconds
- Cost: ~$0.001 (OpenAI)
- Network: 1 edge function call + 1 OpenAI API call

### Subsequent Loads
- Time: Instant (<100ms)
- Cost: $0 (from cache)
- Network: 0 API calls (read from memory)

### Optimization
- ✅ Caching prevents repeated API calls
- ✅ Loading state keeps UI responsive
- ✅ Edge function runs close to user (Cloudflare)
- ✅ JSON response format is compact

---

## 🧪 Testing Strategy

### Unit Tests (Future)
- [ ] `handleInfoClick()` with cached data
- [ ] `handleInfoClick()` with API call
- [ ] Error handling on API failure
- [ ] Sheet open/close state

### Integration Tests (Future)
- [ ] Full flow: click → generate → display
- [ ] Second click uses cache
- [ ] Ownership verification
- [ ] Invalid scan ID handling

### Manual Testing (Current)
- ✅ Click info button → loading → explanation
- ✅ Second click → instant display
- ✅ All sections render correctly
- ✅ Close button works
- ✅ Mobile responsive

---

## 🎯 Success Metrics

### User Experience
- Load time < 3 seconds (first time)
- Load time < 100ms (cached)
- 0 console errors
- Works on mobile & desktop

### Technical
- Cache hit rate > 95%
- API success rate > 99%
- Error rate < 1%
- No impact on other features

### Business
- Increased task completion rate
- Reduced support questions
- Improved user satisfaction

---

## 🔮 Future Enhancements

### Planned
- [ ] Regenerate button
- [ ] Share explanation feature
- [ ] Analytics tracking (which tasks viewed most)
- [ ] A/B test different AI tones

### Ideas
- [ ] Video demonstrations
- [ ] Progress tracking per task
- [ ] Gamification (badges for learning)
- [ ] Multi-language support

---

**Architecture Status**: ✅ Production Ready
