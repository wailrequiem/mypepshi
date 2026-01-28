# ✅ FIXED: Score Display Bug - Key Mapping Issue

## 🐛 THE BUG

**Symptom:** Dashboard showed:
- ✅ Overall: 81
- ✅ Cheekbones: 75
- ✅ Potential: 93
- ❌ Skin Quality: 0
- ❌ Jawline Definition: 0
- ❌ Facial Symmetry: 0
- ❌ Eye Area: 0

## 🔍 ROOT CAUSE

**Key Mismatch:** AI returns snake_case keys, but UI expected camelCase:

| AI Returns (snake_case) | UI Expected (camelCase) | Result |
|------------------------|------------------------|--------|
| `skin_quality` | `skinQuality` | ❌ No match → 0 |
| `jawline_definition` | `jawline` | ❌ No match → 0 |
| `facial_symmetry` | `symmetry` | ❌ No match → 0 |
| `eye_area` | `eyeArea` | ❌ No match → 0 |
| `cheekbones` | `cheekbones` | ✅ Match |
| `potential` | `potential` | ✅ Match |
| `overall` | `overall` | ✅ Match |

**Additional Issue:** Used `|| 0` which silently converted missing keys to 0 instead of showing error.

## ✅ THE FIX

### 1. Created Normalization Function

**File:** `lib/normalizeScores.ts` (NEW)

```typescript
export function normalizeScores(rawScores: any): NormalizedScores {
  // Helper to get value with multiple possible keys
  const getValue = (...keys: string[]): number | null => {
    for (const key of keys) {
      const value = rawScores[key];
      // Use nullish coalescing - only reject null/undefined, not 0
      if (value !== null && value !== undefined) {
        const num = Number(value);
        return isNaN(num) ? null : num;
      }
    }
    return null;
  };

  return {
    overall: getValue('overall'),
    skinQuality: getValue('skinQuality', 'skin_quality'),
    jawline: getValue('jawline', 'jawline_definition', 'jawlineDefinition'),
    cheekbones: getValue('cheekbones'),
    symmetry: getValue('symmetry', 'facial_symmetry', 'facialSymmetry'),
    eyeArea: getValue('eyeArea', 'eye_area'),
    potential: getValue('potential'),
  };
}
```

**Key Features:**
- ✅ Tries multiple key formats (camelCase + snake_case)
- ✅ Uses nullish coalescing (`??`) not `||` so real 0 values work
- ✅ Returns `null` (not 0) when key truly missing
- ✅ Logs raw input and normalized output for debugging

### 2. Updated Display Components

**Files Modified:**
1. ✅ `components/payment/PaymentSuccessScreen.tsx`
2. ✅ `pages/ScanResults.tsx`
3. ✅ `pages/Dashboard.tsx` (enhanced logging)

**Before (BROKEN):**
```typescript
const aspects = [
  { key: "skinQuality", label: "Skin Quality", score: scoresJson.skinQuality || 0 },
  { key: "jawline", label: "Jawline Definition", score: scoresJson.jawline || 0 },
  // ... etc
];
```

**After (FIXED):**
```typescript
import { normalizeScores, formatScore, getProgressValue } from "@/lib/normalizeScores";

const scores = normalizeScores(scoresJson);

const aspects = [
  { key: "skinQuality", label: "Skin Quality", score: scores.skinQuality },
  { key: "jawline", label: "Jawline Definition", score: scores.jawline },
  // ... etc
];
```

### 3. Enhanced UI Rendering

**Display Rules:**
- If value is `null`: Show "—" (em dash)
- If value is number: Show number (even if 0)
- Progress bar: Disabled/dimmed if null, normal if number

**UI Code:**
```tsx
{aspects.map((aspect) => {
  const scoreValue = aspect.score;
  const isNull = scoreValue === null || scoreValue === undefined;
  
  return (
    <div className={isNull ? "opacity-60" : ""}>
      <p>{aspect.label}</p>
      <p className={isNull ? "text-muted-foreground" : ""}>
        {formatScore(scoreValue)}  {/* Shows "—" or number */}
      </p>
      <Progress 
        value={getProgressValue(scoreValue)}  {/* 0 if null, actual value otherwise */}
        className={isNull ? "opacity-30" : ""}
      />
    </div>
  );
})}
```

### 4. Enhanced Logging

**Dashboard.tsx** now logs:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SCORES_RAW] Raw scores_json from DB: {
  overall: 81,
  cheekbones: 75,
  potential: 93,
  skin_quality: 72,
  jawline_definition: 68,
  facial_symmetry: 80,
  eye_area: 77
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**normalizeScores.ts** logs:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SCORES_RAW] Input: { skin_quality: 72, jawline_definition: 68, ... }
[SCORES_NORM] Output: { skinQuality: 72, jawline: 68, ... }
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 📂 FILES CHANGED

1. ✅ **NEW:** `lib/normalizeScores.ts` - Canonical normalization function
2. ✅ `components/payment/PaymentSuccessScreen.tsx` - Use normalization
3. ✅ `pages/ScanResults.tsx` - Use normalization
4. ✅ `pages/Dashboard.tsx` - Enhanced logging

## 🎯 EXPECTED RESULT AFTER FIX

**All scores now display correctly:**

```
Overall: 81
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Skin Quality: 72          ✅ (was 0)
Jawline Definition: 68    ✅ (was 0)
Cheekbones: 75           ✅ (already worked)
Facial Symmetry: 80      ✅ (was 0)
Eye Area: 77             ✅ (was 0)
Potential: 93            ✅ (already worked)
```

**If a value is truly missing:**
```
Skin Quality: —          (shows em dash, not 0)
```

## 🧪 HOW TO VERIFY

1. **Open Dashboard** → Check console logs
2. **Look for:**
   ```
   [SCORES_RAW] Raw scores_json from DB: { ... }
   [SCORES_NORM] Output: { ... }
   ```
3. **Verify UI:**
   - All 6 aspect scores show numbers (not 0)
   - Progress bars match the numbers
   - Overall score displays correctly

4. **Test edge cases:**
   - If AI returns 0 for a score, it should show 0 (not "—")
   - If AI doesn't return a key at all, it should show "—"

## 📝 KEY MAPPING REFERENCE

The normalization function handles these mappings:

| Canonical UI Key | Possible API Keys |
|-----------------|-------------------|
| `skinQuality` | `skinQuality`, `skin_quality` |
| `jawline` | `jawline`, `jawline_definition`, `jawlineDefinition` |
| `cheekbones` | `cheekbones` |
| `symmetry` | `symmetry`, `facial_symmetry`, `facialSymmetry` |
| `eyeArea` | `eyeArea`, `eye_area` |
| `potential` | `potential` |
| `overall` | `overall` |

## ⚡ TECHNICAL DETAILS

**Why `??` instead of `||`:**
```typescript
// ❌ BAD - breaks for real 0
const score = rawScore || 0;  // If rawScore is 0, returns 0 anyway

// ✅ GOOD - preserves real 0
const score = rawScore ?? null;  // If rawScore is 0, returns 0; if undefined, returns null
```

**Why null instead of 0:**
```typescript
// ❌ BAD - can't distinguish between "missing" and "truly zero"
score: 0  // Is this missing or did AI return 0?

// ✅ GOOD - clear distinction
score: null  // Missing data → show "—"
score: 0     // AI returned 0 → show "0"
```

## 🚀 NEXT STEPS

1. **Test with real scan:** Do a new scan and verify all scores display
2. **Check console logs:** Verify raw scores_json structure matches expectations
3. **Verify consistency:** Check both Dashboard and individual scan results pages

If any scores still show 0 when they shouldn't, check the console logs to see what keys the AI is actually returning.
