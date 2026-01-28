# 🎯 AI FIX QUICK REFERENCE

## ✅ WHAT WAS DONE

Added comprehensive logging to trace AI responses from Edge Function → Database → UI.

## 📋 FILES CHANGED

| File | What Changed |
|------|-------------|
| `lib/saveAuthenticatedScan.ts` | Added AI response logging (lines 151-170) |
| `lib/flushPendingScan.ts` | Added AI response logging (lines 144-163) |
| `components/payment/PeptideCardsSection.tsx` | Added peptide logging (lines 80-118) |
| `pages/Dashboard.tsx` | Enhanced DB retrieval logs (lines 57-61) |
| `components/payment/PaymentSuccessScreen.tsx` | Added display mapping logs (lines 118-132) |

## 🔍 KEY CONSOLE LOGS

### 1. AI Face Analysis
```
[AI] Raw response from analyze-face: { ... }
[AI] Parsed response structure: { ... }
[AI] Scores being saved to database: { ... }
```

### 2. Score Normalization
```
[SCORES_RAW] Input: { skin_quality: 72, ... }
[SCORES_NORM] Output: { skinQuality: 72, ... }
```

### 3. Display Mapping
```
[AI] Normalized scores for display: { ... }
[AI] UI will display: Overall: 81, Skin Quality: 72, ...
```

### 4. Peptide Recommendations
```
[AI] Raw response from recommend-peptides: { ... }
[AI] Peptide 1: { name: "...", fit_score: 92 }
[AI] Rendering peptide card 1: { ... }
```

## 🎯 HOW TO DEBUG

### If Scores Show 0 or "—"

**Check This Sequence:**
1. `[AI] Raw response from analyze-face` → Are all fields present?
2. `[AI] Scores being saved` → Being saved correctly?
3. `[AI] Raw scores_json from DB` → In database?
4. `[SCORES_NORM] Output` → Mapped correctly?
5. `[AI] UI will display` → Displayed correctly?

### If Same Results for Everyone

**Check:**
1. `[DASHBOARD] Fetching scans for user:` → Different user_id?
2. `[AI] Raw response` → Different for different photos?
3. `[NEW_SCAN] Generated scanId:` → Different scan_id?

### If Peptides Not Personalized

**Check:**
1. `[AI] Raw peptides response` → Personalized recommendations?
2. `[AI] Peptides to save` → Being saved?
3. `[AI] Cached peptides` → Loading correctly?

## ✅ SUCCESS CRITERIA

- ✅ All [AI] logs present in console
- ✅ Different photos → different scores (variance > 5)
- ✅ Different users → different peptides
- ✅ No "—" displayed (no missing data)
- ✅ No mentions of "fallback" or "default"

## 📚 DOCUMENTATION

| File | Purpose |
|------|---------|
| `AI_FIX_COMPLETE_SUMMARY.md` | Complete technical overview |
| `AI_RESPONSE_LOGGING_FIX.md` | Detailed logging implementation |
| `AI_VALIDATION_GUIDE.md` | Testing procedures |
| `AI_FIX_QUICK_REFERENCE.md` | This file (quick lookup) |

## 🚀 TESTING

1. **Do a scan** → Open console
2. **Look for** `[AI]` logs
3. **Verify** all values are numbers (not "—" or 0)
4. **Compare** two different scans → different results
5. **If issues** → Check console logs, refer to AI_VALIDATION_GUIDE.md

All AI data is now fully traced and visible in browser console!
