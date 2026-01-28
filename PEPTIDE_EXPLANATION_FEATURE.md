# AI Peptide Explanation Feature

## Overview
When users click on a peptide card, a modal opens with a personalized AI-generated explanation. The explanation is structured, context-aware, and provides educational guidance about the peptide.

## Implementation Summary

### 1. Edge Function: `explain-peptide`
**Location:** `supabase/functions/explain-peptide/index.ts`

**Features:**
- ✅ NO JWT required (`--no-verify-jwt`)
- ✅ Accepts peptide data + optional user context
- ✅ Returns structured explanation (why_this, how_to_use_safely, what_to_expect, warnings)
- ✅ Uses OpenAI GPT-4o-mini for generation
- ✅ Validates response structure with safe defaults
- ✅ Debug logging (disabled by default with DEBUG flag)

**Request Format:**
```json
{
  "peptide": {
    "name": "GHK-Cu",
    "fit_score": 92,
    "tags": ["Skin", "Anti-aging", "Collagen"],
    "summary": "Promotes collagen production..."
  },
  "userContext": {
    "scanScores": {
      "skinQuality": 65,
      "jawline": 78,
      "overall": 72
    },
    "goals": ["Better skin", "Anti-aging"],
    "notes": {}
  }
}
```

**Response Format:**
```json
{
  "ok": true,
  "explanation": {
    "why_this": [
      "Your fit score of 92% indicates this peptide strongly aligns with your skin improvement goals",
      "GHK-Cu specifically addresses collagen synthesis which supports your anti-aging objectives",
      "It targets skin quality areas where your scan shows room for improvement"
    ],
    "how_to_use_safely": [
      "This is for educational purposes only - always consult a healthcare professional",
      "Typically administered topically or subcutaneously; professional guidance required",
      "Store in refrigerated conditions to maintain stability"
    ],
    "what_to_expect": "Most users report visible improvements in skin texture and firmness within 4-8 weeks of consistent use. Results are gradual and cumulative. Professional monitoring is recommended throughout treatment.",
    "warnings": [
      "Not recommended for individuals under 18 years old",
      "Consult your healthcare provider if pregnant, nursing, or have existing medical conditions",
      "This information is educational only and not a substitute for professional medical advice"
    ]
  }
}
```

**Deploy:**
```bash
supabase functions deploy explain-peptide --no-verify-jwt
```
or use: `deploy-explain-peptide.bat`

---

### 2. Frontend Helper: `explainPeptide.ts`
**Location:** `src/lib/peptides/explainPeptide.ts`

**Features:**
- ✅ In-memory cache by peptide name (instant on re-open)
- ✅ Type-safe interfaces
- ✅ Soft error handling (returns sensible fallbacks, never crashes UI)
- ✅ Validates response fields and provides defaults

**Usage:**
```typescript
import { explainPeptide } from "@/lib/peptides/explainPeptide";

const explanation = await explainPeptide({
  peptide: {
    name: "GHK-Cu",
    fit_score: 92,
    tags: ["Skin", "Anti-aging"],
    summary: "..."
  },
  userContext: {
    scanScores: { skinQuality: 65, overall: 72 },
    goals: ["Better skin"]
  }
});
```

---

### 3. UI Integration: `PeptideRecommendationsRow.tsx`
**Location:** `src/components/payment/PeptideRecommendationsRow.tsx`

**Changes:**
- ✅ Added AI explanation section to modal
- ✅ Fetches explanation when modal opens via `useEffect`
- ✅ Displays loading skeleton with "Generating explanation..." message
- ✅ Structured display with icons:
  - 💡 **Why This Peptide** - Personalized relevance
  - 🛡️ **Safe Usage Guidance** - Educational safety tips
  - ⏰ **What to Expect** - Realistic timeline and outcomes
  - ⚠️ **Important Warnings** - Critical safety info
- ✅ Graceful error handling (no scary red error boxes)
- ✅ Caching ensures instant display on re-open

**UI Flow:**
1. User clicks peptide card
2. Modal opens showing basic peptide info (name, fit_score, tags, summary, benefits)
3. AI Explanation section shows skeleton + "Generating explanation..."
4. After ~2-3 seconds, explanation appears with structured content
5. If reopened, explanation is instant (cached)

---

## AI Prompting Rules

The AI generates explanations following strict guidelines:

### 1. **why_this** (3 bullets max)
- WHY this peptide is relevant for THIS USER
- Ties to fit_score, tags, scanScores, goals
- Benefits and impact, NOT instructions
- Example: "Your fit score of 92% indicates..." ✅
- Bad: "Set reminders to take this peptide" ❌

### 2. **how_to_use_safely** (3 bullets max)
- Practical safety guidance (NO dosing)
- Administration method, storage, timing
- Always frames as educational
- Example: "Typically administered topically; consult a professional" ✅
- Bad: "Take 250mcg daily before bed" ❌

### 3. **what_to_expect** (2-3 sentences)
- Realistic timeline (weeks/months)
- Common outcomes
- Sets realistic expectations
- Example: "Most users report improvements within 4-8 weeks..." ✅

### 4. **warnings** (3 bullets max)
- Age restrictions
- Contraindications (pregnancy, conditions)
- Legal/medical disclaimers
- Example: "Not recommended under 18" ✅

---

## File Structure

```
mypepshi/
├── supabase/functions/
│   └── explain-peptide/
│       └── index.ts           # Edge function (NO JWT)
│
├── src/
│   ├── lib/peptides/
│   │   └── explainPeptide.ts  # Frontend helper with caching
│   │
│   └── components/payment/
│       └── PeptideRecommendationsRow.tsx  # UI integration
│
└── deploy-explain-peptide.bat  # Deployment script
```

---

## Modified Files

1. **NEW:** `supabase/functions/explain-peptide/index.ts`
2. **NEW:** `src/lib/peptides/explainPeptide.ts`
3. **MODIFIED:** `src/components/payment/PeptideRecommendationsRow.tsx`
4. **NEW:** `deploy-explain-peptide.bat`

---

## Testing

### 1. Deploy the Edge Function
```bash
cd c:\Users\wail\Desktop\mypepshi
.\deploy-explain-peptide.bat
```

### 2. Test in UI
1. Complete onboarding → generate scan
2. View peptide recommendations (PaymentSuccessScreen or Paywall)
3. Click any peptide card
4. Modal opens → observe loading skeleton
5. After ~2-3 seconds, AI explanation appears
6. Close modal and reopen → explanation is instant (cached)

### 3. Test Error Handling
- Disconnect internet while fetching → soft fallback appears
- Invalid peptide data → defaults are used
- Missing fields → safe defaults prevent crashes

---

## Key Features

✅ **No Authentication Required** - Edge function uses `--no-verify-jwt`  
✅ **In-Memory Caching** - Instant on re-open, no redundant API calls  
✅ **Soft Error Handling** - Never crashes, always shows useful content  
✅ **Structured Output** - Clear sections with visual icons  
✅ **Personalized** - Uses fit_score, tags, scanScores, goals  
✅ **Educational Framing** - No medical claims, emphasizes professional consultation  
✅ **Debug Mode** - Console logs disabled by default (set DEBUG=true to enable)  

---

## Future Enhancements

- [ ] Pass actual user context (scanScores, goals) from parent component
- [ ] Add "Copy to Notes" button for saving explanations
- [ ] Multi-language support
- [ ] Analytics tracking for most-viewed peptides
- [ ] Compare multiple peptides side-by-side

---

## Notes

- **No dosing instructions:** AI is prompted to avoid specific dosages
- **Always disclaims:** Every explanation includes professional consultation reminder
- **Fallbacks everywhere:** If any field is missing, safe defaults are used
- **Cache invalidation:** Currently unlimited; consider adding TTL if memory becomes an issue
- **OpenAI model:** Uses `gpt-4o-mini` for cost efficiency (~$0.15 per 1M input tokens)

---

## Support

If explanations aren't loading:
1. Check edge function logs: `supabase functions logs explain-peptide`
2. Verify OpenAI API key is set in Supabase dashboard
3. Check browser console for client errors
4. Ensure edge function is deployed with `--no-verify-jwt`
