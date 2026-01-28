# 🧪 AI RESPONSE VALIDATION GUIDE

## 🎯 PURPOSE

This guide helps you verify that the AI is returning personalized results and that they're being displayed correctly in the UI.

## ✅ VALIDATION CHECKLIST

### 1. AI Response Structure Validation

Open browser console and look for these logs after a scan:

#### ✅ analyze-face Response Should Have:
```javascript
[AI] Raw response from analyze-face: {
  "ok": true,
  "data": {
    "scores": {
      "overall": <number>,           // ✅ Required
      "skin_quality": <number>,      // ✅ Required
      "jawline_definition": <number>, // ✅ Required
      "cheekbones": <number>,        // ✅ Required
      "facial_symmetry": <number>,   // ✅ Required
      "eye_area": <number>,          // ✅ Required
      "potential": <number>          // ✅ Required
    },
    "gender": "male" | "female"      // ✅ Required
  }
}
```

**❌ FAIL IF:**
- `ok` is false
- Any score field is missing
- Any score is null/undefined (should be a number)
- `gender` is missing

#### ✅ recommend-peptides Response Should Have:
```javascript
[AI] Raw response from recommend-peptides: {
  "ok": true,
  "recommended_peptides": [
    {
      "name": <string>,           // ✅ Required
      "fit_score": <number>,      // ✅ Required (0-100)
      "tags": [<string>],         // ✅ Required (array)
      "summary": <string>         // ✅ Required
    }
  ]
}
```

**❌ FAIL IF:**
- `ok` is false
- `recommended_peptides` is empty array
- Any peptide missing name/fit_score/tags/summary
- fit_score is not between 0-100

### 2. Personalization Validation

#### Test A: Different Photos = Different Scores

**Steps:**
1. Do scan with Photo Set A (e.g., clear lighting, frontal view)
2. Note the scores (console → `[AI] Scores being saved`)
3. Do new scan with Photo Set B (different person or angle)
4. Note the new scores

**✅ PASS IF:**
- Overall score is different (variance > 5 points)
- At least 4 of 6 aspect scores are different
- Peptide recommendations are different

**❌ FAIL IF:**
- All scores identical
- Peptides identical
- Console shows same AI response JSON

#### Test B: Different Users = Different Results

**Steps:**
1. User A: Complete scan, note scores
2. User B: Complete scan with different photo
3. Compare console logs: `[AI] Raw response from analyze-face`

**✅ PASS IF:**
- Different user_id in logs
- Different scan_id in logs
- Different scores in AI response

**❌ FAIL IF:**
- Same scores for both users
- Console shows cached/duplicate response

### 3. Score Mapping Validation

Check the normalization is working:

```javascript
// Look for this in console:
[AI] Raw scores_json from DB: {
  "skin_quality": 72,        // ← snake_case
  "jawline_definition": 68
}

[AI] Normalized scores for display:
  skinQuality: 72            // ← camelCase
  jawline: 68

[AI] UI will display:
  Skin Quality: 72           // ← Final display value
  Jawline: 68
```

**✅ PASS IF:**
- All 7 scores are mapped correctly
- No "—" displayed (means null/missing)
- Numbers match between DB and UI

**❌ FAIL IF:**
- Any score shows "—" when DB has number
- Any score shows 0 when DB has non-zero
- Score in UI doesn't match DB value

### 4. Peptide Display Validation

```javascript
// Look for this in console:
[AI] Parsed peptides: [
  {
    "name": "GHK-Cu",
    "fit_score": 92,
    "tags": ["anti-aging", "collagen"],
    "summary": "..."
  }
]

[AI] Rendering peptide card 1: {
  name: "GHK-Cu",
  fit_score: 92,
  tags: ["anti-aging", "collagen"],
  summary_length: 150
}
```

**✅ PASS IF:**
- All peptides from AI are rendered
- fit_score displayed matches AI response
- tags displayed match AI response
- summary text is displayed

**❌ FAIL IF:**
- Peptide name in UI doesn't match AI response
- fit_score in UI doesn't match AI response
- Missing tags or summary

### 5. No Fallback Data Validation

**Check these console logs DO NOT appear:**
```javascript
❌ "Using fallback scores"
❌ "No scan data, using defaults"
❌ "FALLBACK_ASPECTS"
❌ "Default peptides"
```

**✅ PASS IF:**
- All logs show "AI" prefix
- No mentions of fallback/default/mock data
- Dashboard shows "Has real data: true"

**❌ FAIL IF:**
- Console mentions fallback
- Dashboard shows "Has real data: false"
- Same scores appear for all users

## 🐛 COMMON ISSUES

### Issue 1: Scores Show "—" or 0

**Diagnosis:**
```javascript
// Check this sequence:
[AI] Raw response from analyze-face: { ... }
→ Are all score fields present?

[AI] Scores being saved to database: { ... }
→ Are they being saved correctly?

[AI] Raw scores_json from DB: { ... }
→ Are they in the database?

[AI] Normalized scores for display: { ... }
→ Are they being mapped?
```

**Fix:**
- If missing in AI response → Edge Function issue
- If saved but not retrieved → Database query issue
- If retrieved but not mapped → normalizeScores issue

### Issue 2: Same Scores for Everyone

**Diagnosis:**
```javascript
// Check:
[DASHBOARD] Fetching scans for user: <user_id>
→ Is user_id changing between users?

[AI] Raw response from analyze-face: { ... }
→ Is the response different for different photos?
```

**Fix:**
- If same user_id → Auth issue
- If same response → Edge Function not using photo URLs
- If same scores → Edge Function returning hardcoded data

### Issue 3: Peptides Not Personalized

**Diagnosis:**
```javascript
// Check:
[AI] Raw peptides response: { ... }
→ Are different peptides returned for different users?

[AI] Peptides to save: [ ... ]
→ Are they being saved?

[AI] Cached peptides: [ ... ]
→ Are cached ones being loaded?
```

**Fix:**
- If same peptides in AI response → Edge Function issue
- If not saved → Database update issue
- If wrong cached data → Cache invalidation issue

## 📊 EXPECTED VARIANCE

For proper personalization, you should see:

**Score Variance Between Users:**
- Overall: ±10-20 points typical
- Individual aspects: ±5-15 points typical
- At least 3 scores should differ significantly

**Peptide Variance Between Users:**
- Different top 3 peptides (order matters)
- Different fit_scores (±10-30 points)
- Different tags based on user needs

## 🎯 SUCCESS CRITERIA

✅ **Pass All Tests:**
1. AI returns complete response structure
2. Different photos → different scores
3. Different users → different results
4. All scores mapped correctly (no 0 or "—")
5. All peptides displayed correctly
6. No fallback/default data

✅ **Console Logs Show:**
```
[AI] Raw response from analyze-face: ✓
[AI] Scores being saved to database: ✓
[AI] Raw scores_json from DB: ✓
[AI] Normalized scores for display: ✓
[AI] UI will display: ✓
[AI] Raw peptides response: ✓
[AI] Rendering peptides in UI: ✓
```

✅ **UI Displays:**
- Overall score (number, not "—")
- 6 aspect scores (all numbers, not "—" or 0)
- 5 peptide cards with personalized recommendations
- Peptide fit percentages (not all 100% or 0%)
- Unique tags per peptide

## 🔍 HOW TO DEBUG

### Step 1: Open Console
F12 → Console tab

### Step 2: Clear Console
Click "Clear" to remove old logs

### Step 3: Perform Action
- Do a new scan, OR
- Refresh dashboard

### Step 4: Copy Full Log Sequence
Copy everything from:
```
[NEW_SCAN] Starting authenticated scan save...
```
to:
```
[AI] Rendering peptides in UI: ...
```

### Step 5: Analyze Logs
Look for these patterns:

**✅ Good:**
```
[AI] Raw response from analyze-face: { ok: true, ... }
[AI] Scores being saved: { overall: 81, ... }
[AI] Normalized scores: { overall: 81, ... }
[AI] UI will display: Overall: 81
```

**❌ Bad:**
```
[AI] Raw response: { ok: false, error: ... }
❌ [NEW_SCAN] AI analysis failed
```

**❌ Bad:**
```
[AI] Normalized scores: { overall: null, ... }
[AI] UI will display: Overall: —
```

**❌ Bad:**
```
[AI] Raw peptides response: { ok: true, recommended_peptides: [] }
⚠️ [PEPTIDES] No peptides returned from AI
```

## 📝 REPORTING ISSUES

If you find an issue, provide:

1. **Full console log sequence** (copy/paste)
2. **Which test failed** (Test A, B, etc.)
3. **Expected vs Actual**:
   - Expected: Overall score should be 75
   - Actual: Shows "—" in UI
4. **Steps to reproduce**:
   - User ID
   - Scan ID
   - Which page (Dashboard/ScanResults)

This allows pinpointing the exact stage where the issue occurs!
