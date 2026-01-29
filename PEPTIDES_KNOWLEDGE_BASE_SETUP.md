# Peptides Knowledge Base Setup Guide

## 🎯 What Was Changed

The `recommend-peptides` Edge Function now **queries your `peptides_knowledge` table** instead of using hardcoded peptide lists. All AI recommendations are now grounded in your database.

### Key Changes:
- ✅ Fetches all peptides from `peptides_knowledge` table (limit: 200)
- ✅ Builds a compact "knowledge pack" for the AI prompt
- ✅ AI picks ONLY peptides that exist in the knowledge base
- ✅ Validates AI output against the knowledge base (drops invalid peptides)
- ✅ Returns structured JSON: `{ ok: true, recommended_peptides: [...] }`
- ✅ Caches results in `scans.peptide_recommendations`
- ✅ Educational recommendations only (no dosing/injection instructions)
- ✅ Considers `evidence_level` and `contraindications`

---

## 📋 Supabase Configuration Checklist

### 1. Environment Variables (Edge Function)

The Edge Function already uses these environment variables. Verify they are set in your Supabase project:

**Navigate to:** Supabase Dashboard → Edge Functions → `recommend-peptides` → Settings

Required environment variables:
- ✅ `SUPABASE_URL` - Your Supabase project URL (auto-set by Supabase)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key for bypassing RLS (auto-set by Supabase)
- ✅ `OPENAI_API_KEY` - Your OpenAI API key (you must set this if not already set)

**Action:** 
- If `OPENAI_API_KEY` is missing, add it:
  - Go to: Supabase Dashboard → Settings → Edge Functions → Secrets
  - Add secret: `OPENAI_API_KEY` = `sk-...`

---

### 2. Row-Level Security (RLS) Policies

**Good news:** Edge Functions use the **service role key**, which **bypasses RLS**. You don't need to add any RLS policies for the Edge Function to read `peptides_knowledge`.

However, if you want to expose `peptides_knowledge` to your frontend (e.g., for a peptide library page), you'll need to add a read policy:

```sql
-- Optional: Allow authenticated users to read peptides_knowledge
CREATE POLICY "Allow authenticated users to read peptides"
ON peptides_knowledge
FOR SELECT
TO authenticated
USING (true);
```

**Action:** 
- ✅ **No action required** for Edge Function to work
- ⚠️ If you want frontend access, run the SQL above in: Supabase Dashboard → SQL Editor

---

### 3. Populate `peptides_knowledge` Table

**CRITICAL:** The Edge Function will **fail** if `peptides_knowledge` is empty.

#### Minimum Required Fields:
The following fields MUST be populated for the AI to work properly:
- ✅ `name` (string) - **REQUIRED** - Canonical peptide name (e.g., "GHK-Cu")
- ✅ `aliases` (string[]) - **RECOMMENDED** - Alternative names (e.g., ["Copper Peptide", "GHK Copper"])
- ✅ `goal_tags` (string[]) - **REQUIRED** - Tags like ["Anti-aging", "Skin repair", "Collagen boost"]
- ✅ `benefits` (text) - **REQUIRED** - What does this peptide do?
- ✅ `evidence_level` (string) - **RECOMMENDED** - e.g., "High", "Moderate", "Limited", "Anecdotal"
- ✅ `contraindications` (text) - **RECOMMENDED** - When NOT to use this peptide

Optional but useful:
- `category` (string) - e.g., "Cosmetic", "Regenerative", "Cognitive"
- `mechanism` (text) - How does it work?
- `risks` (text) - Potential side effects
- `notes` (text) - Additional info

#### Example Row (SQL):

```sql
INSERT INTO peptides_knowledge (
  name, 
  aliases, 
  category, 
  goal_tags, 
  mechanism, 
  benefits, 
  risks, 
  contraindications, 
  evidence_level, 
  notes
) VALUES (
  'GHK-Cu',
  ARRAY['Copper Peptide', 'GHK Copper', 'Copper Tripeptide-1'],
  'Cosmetic',
  ARRAY['Anti-aging', 'Skin repair', 'Collagen boost', 'Wound healing'],
  'Stimulates collagen and glycosaminoglycan synthesis; activates tissue remodeling enzymes; improves skin elasticity',
  'Promotes skin regeneration, reduces fine lines and wrinkles, improves skin firmness and elasticity, supports wound healing, antioxidant properties',
  'Generally well-tolerated. Rare: skin irritation, redness at application site',
  'Avoid use with copper-sensitive conditions or Wilson''s disease',
  'High',
  'One of the most researched cosmetic peptides with decades of clinical data'
);
```

#### Quick Insert Template:

```sql
INSERT INTO peptides_knowledge (name, aliases, goal_tags, benefits, evidence_level, contraindications)
VALUES 
  ('GHK-Cu', ARRAY['Copper Peptide'], ARRAY['Anti-aging', 'Skin repair'], 'Promotes skin regeneration and collagen production', 'High', 'Avoid with copper sensitivity'),
  ('Matrixyl 3000', ARRAY['Palmitoyl Tripeptide-1'], ARRAY['Anti-aging', 'Wrinkle reduction'], 'Stimulates collagen synthesis and reduces wrinkles', 'Moderate', 'Generally safe for most users'),
  ('Argireline', ARRAY['Acetyl Hexapeptide-8'], ARRAY['Expression lines', 'Anti-aging'], 'Reduces muscle contraction to soften expression lines', 'Moderate', 'Avoid if pregnant or breastfeeding');
```

**Action:**
1. Go to: Supabase Dashboard → SQL Editor
2. Paste your `INSERT` statements with real peptide data
3. Run the SQL
4. Verify: Run `SELECT COUNT(*) FROM peptides_knowledge;` (should return > 0)

---

## 🧪 Testing & Verification

### Step 1: Check Edge Function Logs

**Navigate to:** Supabase Dashboard → Edge Functions → `recommend-peptides` → Logs

Look for these log entries when the function runs:

```
✅ Success indicators:
📚 [recommend-peptides] Fetching peptides_knowledge...
✅ [recommend-peptides] Loaded peptides_knowledge count=15
📋 [recommend-peptides] Using scanId=abc-123 userId=xyz-789
🤖 [recommend-peptides] Calling OpenAI...
✅ [recommend-peptides] AI returned 4 recommendations
✅ [recommend-peptides] Final recommended peptides=4: GHK-Cu, Matrixyl 3000, Argireline, Eyeseryl
✅ [recommend-peptides] Recommendations saved to scan: abc-123

❌ Error indicators:
❌ [recommend-peptides] peptides_knowledge table is empty!
⚠️ [recommend-peptides] Peptide not found in knowledge base: "Fake Peptide" - dropping
❌ [recommend-peptides] No valid peptides matched from AI response
```

### Step 2: Test API Response

Call the Edge Function from your app or via curl:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/recommend-peptides \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
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
      "tags": ["Anti-aging", "Skin repair", "Collagen boost"],
      "summary": "A copper peptide that supports skin regeneration and improves overall skin quality. High evidence base.",
      "reasons": [
        "Addresses low skin quality score",
        "Supports collagen production",
        "Well-researched peptide"
      ]
    }
  ],
  "cached": false
}
```

### Step 3: Verify Database Cache

Check that recommendations are saved in `scans.peptide_recommendations`:

```sql
SELECT id, peptide_recommendations 
FROM scans 
WHERE id = 'YOUR_SCAN_ID';
```

Expected structure:
```json
{
  "generated_at": "2026-01-29T12:34:56.789Z",
  "peptides": [
    {
      "name": "GHK-Cu",
      "fit_score": 92,
      "tags": ["Anti-aging", "Skin repair"],
      "summary": "...",
      "reasons": ["..."]
    }
  ]
}
```

---

## 🚨 Troubleshooting

### Error: "peptides_knowledge table is empty"

**Solution:** Populate the table using the SQL examples above (Section 3).

### Error: "AI did not recommend any peptides from the knowledge base"

**Cause:** AI suggested peptides not in your knowledge base.

**Solution:**
1. Check Edge Function logs to see which peptides were dropped
2. Add those peptides to `peptides_knowledge`, OR
3. Ensure your knowledge base has common peptides the AI knows about

### Error: "No valid peptides matched from AI response"

**Cause:** AI output didn't match any names/aliases in your knowledge base.

**Solution:**
1. Add more `aliases` to your peptides (e.g., "Copper Peptide" for "GHK-Cu")
2. Check logs to see what the AI suggested
3. Add those peptide names to your knowledge base

### AI keeps suggesting the same peptides regardless of scan scores

**Cause:** Not enough variety in your knowledge base.

**Solution:**
1. Add more peptides (aim for 10-20 minimum)
2. Diversify `goal_tags` (anti-aging, volume, eye area, skin repair, etc.)
3. Add peptides across different categories

---

## 📊 Recommended Minimum Dataset

To get good variety in recommendations, populate at least **10-15 peptides** covering these categories:

**Anti-aging / Wrinkles:**
- GHK-Cu (Copper Peptide)
- Matrixyl 3000
- Argireline
- SYN-AKE

**Skin Quality / Repair:**
- GHK-Cu
- Palmitoyl Pentapeptide-4
- Copper Peptides

**Eye Area:**
- Eyeseryl
- Haloxyl
- Eyeliss

**Volume / Structure:**
- Collagen Peptides
- Matrixyl Synthe'6

**Hydration:**
- Hyaluronic Acid Peptides

---

## ✅ Quick Verification Checklist

Before going live, verify:

- [ ] `OPENAI_API_KEY` is set in Edge Function secrets
- [ ] `peptides_knowledge` has at least 10 rows
- [ ] Each row has `name`, `goal_tags`, `benefits`, `evidence_level`
- [ ] Test Edge Function via curl/Postman → see logs
- [ ] Verify `recommended_peptides` in response matches knowledge base
- [ ] Check `scans.peptide_recommendations` is populated after call
- [ ] Logs show: "Loaded peptides_knowledge count=X"
- [ ] No errors in Edge Function logs

---

## 🎉 You're Done!

Your peptide recommender now uses real knowledge base data instead of hardcoded lists. The AI will:
- ✅ Only recommend peptides from your `peptides_knowledge` table
- ✅ Consider evidence levels and contraindications
- ✅ Provide educational summaries (no dosing instructions)
- ✅ Cache results for faster subsequent requests

**Next Steps:**
1. Populate your `peptides_knowledge` table with comprehensive data
2. Test the Edge Function with a real scan
3. Review logs to ensure everything works
4. Iterate on your peptide data based on user needs
