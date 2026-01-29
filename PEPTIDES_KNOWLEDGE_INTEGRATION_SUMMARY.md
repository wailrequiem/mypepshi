# Peptides Knowledge Base Integration - Summary

## ✅ What Was Implemented

Your `recommend-peptides` Edge Function now **pulls from `peptides_knowledge` table** instead of using hardcoded peptide lists.

### Code Changes:
**File:** `supabase/functions/recommend-peptides/index.ts`

**Added:**
1. ✅ `getPeptidesKnowledge()` - Queries `peptides_knowledge` table (limit 200 rows)
2. ✅ `buildKnowledgePack()` - Transforms DB rows into compact AI prompt (max ~500 chars per peptide)
3. ✅ `findPeptideMatch()` - Matches AI output to knowledge base (exact name, alias, or partial match)
4. ✅ `validateRecommendations()` - Validates AI picks against knowledge base, drops invalid peptides
5. ✅ Enhanced AI prompt with full knowledge base injection
6. ✅ Safety requirements: no dosing, educational only, considers evidence_level & contraindications
7. ✅ Updated response format: `{ ok: true, recommended_peptides: [...] }`
8. ✅ Comprehensive logging at every step

---

## 🎯 How It Works

```
User Request → Edge Function
  ↓
1. Fetch scan data from `scans` table
  ↓
2. Fetch ALL peptides from `peptides_knowledge` table
  ↓
3. Build compact "knowledge pack" for AI prompt
  ↓
4. Call OpenAI with:
   - User's scan scores
   - Onboarding data
   - Full peptides knowledge base
   - Instruction: "Pick ONLY from this list"
  ↓
5. AI returns 3-5 peptide recommendations
  ↓
6. VALIDATE: Match each AI pick to knowledge base
   - Found → Keep (use canonical name)
   - Not found → Drop + log warning
  ↓
7. Cache validated results in `scans.peptide_recommendations`
  ↓
8. Return: { ok: true, recommended_peptides: [...] }
```

---

## 📋 What YOU Need to Do

### 1. Set OpenAI API Key (if not already set)
**Where:** Supabase Dashboard → Settings → Edge Functions → Secrets

Add:
- **Key:** `OPENAI_API_KEY`
- **Value:** `sk-...` (your OpenAI API key)

### 2. Populate `peptides_knowledge` Table
**CRITICAL:** Edge Function will fail if table is empty.

**Minimum fields required:**
- `name` (string) - e.g., "GHK-Cu"
- `aliases` (string[]) - e.g., ["Copper Peptide", "GHK Copper"]
- `goal_tags` (string[]) - e.g., ["Anti-aging", "Skin repair"]
- `benefits` (text) - What does it do?
- `evidence_level` (string) - e.g., "High", "Moderate", "Limited"
- `contraindications` (text) - When NOT to use it

**Quick start SQL:**
```sql
INSERT INTO peptides_knowledge (name, aliases, goal_tags, benefits, evidence_level, contraindications)
VALUES 
  ('GHK-Cu', ARRAY['Copper Peptide'], ARRAY['Anti-aging', 'Skin repair'], 'Promotes skin regeneration and collagen production', 'High', 'Avoid with copper sensitivity'),
  ('Matrixyl 3000', ARRAY['Palmitoyl Tripeptide-1'], ARRAY['Anti-aging', 'Wrinkle reduction'], 'Stimulates collagen synthesis and reduces wrinkles', 'Moderate', 'Generally safe'),
  ('Argireline', ARRAY['Acetyl Hexapeptide-8'], ARRAY['Expression lines'], 'Reduces muscle contraction to soften expression lines', 'Moderate', 'Avoid if pregnant');
```

**Recommended:** Add 10-15 peptides minimum for good variety.

### 3. RLS Policies
**Good news:** Edge Functions use service role → **bypass RLS** → no policy needed! ✅

(Only needed if you want frontend to read `peptides_knowledge` directly)

---

## 🧪 Quick Test

### Test 1: Check Logs
**Where:** Supabase Dashboard → Edge Functions → `recommend-peptides` → Logs

**Look for:**
```
✅ [recommend-peptides] Loaded peptides_knowledge count=15
📋 [recommend-peptides] Using scanId=... userId=...
✅ [recommend-peptides] Final recommended peptides=4: GHK-Cu, Matrixyl 3000, ...
```

### Test 2: Call API
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/recommend-peptides \
  -H "Content-Type: application/json" \
  -d '{"scan_id": "YOUR_SCAN_ID"}'
```

**Expected Response:**
```json
{
  "ok": true,
  "recommended_peptides": [
    {
      "name": "GHK-Cu",
      "fit_score": 92,
      "tags": ["Anti-aging", "Skin repair"],
      "summary": "A copper peptide that supports skin regeneration...",
      "reasons": ["Addresses low skin quality score", "..."]
    }
  ],
  "cached": false
}
```

### Test 3: Verify Cache
```sql
SELECT peptide_recommendations FROM scans WHERE id = 'YOUR_SCAN_ID';
```

Should contain the `peptides` array with recommendations.

---

## 🚨 Common Issues

### "peptides_knowledge table is empty"
**Fix:** Run the INSERT SQL above to add peptides.

### "AI did not recommend any peptides from the knowledge base"
**Cause:** AI suggested peptides not in your DB.
**Fix:** Add more peptides or check logs to see what was dropped.

### AI recommends same peptides every time
**Cause:** Not enough variety in knowledge base.
**Fix:** Add 10-15+ peptides across different categories (anti-aging, eye area, volume, etc.)

---

## 📊 Response Format Changes

### OLD (before):
```json
{
  "ok": true,
  "data": {
    "generated_at": "...",
    "peptides": [...]
  }
}
```

### NEW (now):
```json
{
  "ok": true,
  "recommended_peptides": [
    {
      "name": "GHK-Cu",
      "fit_score": 92,
      "tags": ["Anti-aging", "Skin repair"],
      "summary": "A copper peptide...",
      "reasons": ["Addresses low skin quality", "..."]
    }
  ],
  "cached": false
}
```

**Note:** Frontend code may need updates to use `recommended_peptides` instead of `data.peptides`.

---

## ✅ Final Checklist

Before deploying:

- [ ] `OPENAI_API_KEY` is set in Edge Function secrets
- [ ] `peptides_knowledge` has at least 10 rows with all required fields
- [ ] Tested Edge Function via curl/app → no errors
- [ ] Logs show: "Loaded peptides_knowledge count=X"
- [ ] Response contains `recommended_peptides` array
- [ ] Peptide names match your knowledge base exactly
- [ ] `scans.peptide_recommendations` is populated after call

---

## 📚 Full Documentation

See `PEPTIDES_KNOWLEDGE_BASE_SETUP.md` for:
- Detailed setup instructions
- Complete SQL examples
- Troubleshooting guide
- Recommended peptide dataset

---

## 🎉 Summary

✅ **Knowledge base connected** - AI picks from your database  
✅ **Validation added** - Invalid peptides are dropped  
✅ **Educational only** - No dosing instructions  
✅ **Evidence-aware** - Considers evidence levels & contraindications  
✅ **Comprehensive logging** - Easy to debug  
✅ **Cached results** - Fast subsequent requests  

**You're all set!** Just populate `peptides_knowledge` and test. 🚀
