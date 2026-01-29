# Peptides Knowledge Base - Testing Guide

## 🧪 Step-by-Step Testing Instructions

### Prerequisites
Before testing, ensure:
- ✅ `OPENAI_API_KEY` is set in Supabase Edge Function secrets
- ✅ `peptides_knowledge` table has at least 5-10 rows
- ✅ Edge Function is deployed to Supabase

---

## Step 1: Verify Table Population

### Check Table Contents
```sql
-- In Supabase SQL Editor
SELECT 
  name, 
  aliases, 
  goal_tags, 
  evidence_level,
  CASE 
    WHEN LENGTH(benefits) > 50 THEN LEFT(benefits, 50) || '...'
    ELSE benefits
  END as benefits_preview
FROM peptides_knowledge
ORDER BY name;
```

**Expected:** At least 5-10 rows with populated fields.

**If empty:** Run the sample INSERT from `PEPTIDES_KNOWLEDGE_BASE_SETUP.md`

---

## Step 2: Test Edge Function Directly

### Option A: Using curl

```bash
# Replace with your project details
PROJECT_URL="https://YOUR_PROJECT.supabase.co"
ANON_KEY="your_anon_key"
SCAN_ID="your_scan_id"

curl -X POST "$PROJECT_URL/functions/v1/recommend-peptides" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"scan_id\": \"$SCAN_ID\"}"
```

### Option B: Using Postman/Insomnia

**Method:** POST  
**URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/recommend-peptides`  
**Headers:**
- `Authorization: Bearer YOUR_ANON_KEY`
- `Content-Type: application/json`

**Body (JSON):**
```json
{
  "scan_id": "your-scan-uuid"
}
```

### Option C: Using Supabase Dashboard

1. Go to: **Supabase Dashboard → Edge Functions → recommend-peptides**
2. Click **"Invoke"** button
3. Enter test payload:
```json
{
  "scan_id": "your-scan-uuid"
}
```
4. Click **"Run"**

---

## Step 3: Verify Response Format

### Expected Success Response

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
        "Addresses low skin quality score (65/100)",
        "Matches user goal: anti-aging",
        "Well-researched peptide with strong clinical evidence"
      ]
    },
    {
      "name": "Matrixyl 3000",
      "fit_score": 88,
      "tags": ["Anti-aging", "Wrinkle reduction"],
      "summary": "Stimulates collagen synthesis and reduces the appearance of wrinkles. Moderate evidence base.",
      "reasons": [
        "Addresses aging concerns",
        "Complements collagen production pathway",
        "Safe for most users"
      ]
    }
  ],
  "cached": false
}
```

### Validation Checklist
- ✅ `ok: true`
- ✅ `recommended_peptides` is an array
- ✅ Each peptide has: `name`, `fit_score`, `tags`, `summary`, `reasons`
- ✅ All peptide `name` values exist in your `peptides_knowledge` table
- ✅ `fit_score` is between 85-95
- ✅ `tags` array has 2-5 items
- ✅ `summary` is 1-2 sentences
- ✅ `reasons` array has 3-5 items

---

## Step 4: Check Edge Function Logs

### Navigate to Logs
**Supabase Dashboard → Edge Functions → recommend-peptides → Logs**

### Look for Success Indicators

```
✅ SUCCESS FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧬 [recommend-peptides] Function invoked
✅ [recommend-peptides] scan_id extracted: abc-123
🔗 [recommend-peptides] Creating Supabase client (service role)
✅ [recommend-peptides] Scan loaded: abc-123
📊 [recommend-peptides] Scan user_id: user-xyz
🔄 [recommend-peptides] No cached recommendations, generating new ones...
📋 [recommend-peptides] Using scanId=abc-123 userId=user-xyz
📚 [recommend-peptides] Fetching peptides_knowledge...
✅ [recommend-peptides] Loaded peptides_knowledge count=15
✅ [recommend-peptides] Onboarding data loaded
🤖 [recommend-peptides] Calling OpenAI...
✅ [recommend-peptides] AI returned 4 recommendations
✅ [recommend-peptides] Final recommended peptides=4: GHK-Cu, Matrixyl 3000, Argireline, Eyeseryl
✅ [recommend-peptides] Recommendations saved to scan: abc-123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Key Log Lines to Verify

| Log Line | What It Means | Status |
|----------|---------------|--------|
| `✅ Loaded peptides_knowledge count=X` | Knowledge base loaded successfully | Must see X > 0 |
| `🤖 Calling OpenAI...` | AI call initiated | Should appear |
| `✅ AI returned X recommendations` | AI responded | Should be 3-5 |
| `✅ Final recommended peptides=X: ...` | Validation passed | Should match AI count or be lower |
| `✅ Recommendations saved to scan` | Cache updated | Should appear |

### Warning Indicators (OK if occasional)

```
⚠️ [recommend-peptides] Peptide not found in knowledge base: "XYZ" - dropping
🔄 [recommend-peptides] Matched "Copper Peptide" → "GHK-Cu"
```

These mean the AI suggested a peptide not in your knowledge base, but it was handled gracefully.

### Error Indicators (NOT OK)

```
❌ [recommend-peptides] peptides_knowledge table is empty!
❌ [recommend-peptides] Error fetching peptides_knowledge: ...
❌ [recommend-peptides] No valid peptides matched from AI response
❌ [recommend-peptides] OpenAI API error: 401
```

If you see these, check the troubleshooting section below.

---

## Step 5: Verify Database Cache

### Check Cached Recommendations

```sql
-- In Supabase SQL Editor
SELECT 
  id,
  user_id,
  created_at,
  peptide_recommendations
FROM scans
WHERE id = 'YOUR_SCAN_ID';
```

### Expected `peptide_recommendations` Structure

```json
{
  "generated_at": "2026-01-29T12:34:56.789Z",
  "peptides": [
    {
      "name": "GHK-Cu",
      "fit_score": 92,
      "tags": ["Anti-aging", "Skin repair"],
      "summary": "A copper peptide...",
      "reasons": ["Addresses low skin quality", "..."]
    }
  ]
}
```

### Cache Validation
- ✅ `peptide_recommendations` is NOT null
- ✅ `peptide_recommendations.generated_at` is a valid ISO timestamp
- ✅ `peptide_recommendations.peptides` is an array with 3-5 items
- ✅ Each peptide has all required fields

---

## Step 6: Test Caching Behavior

### First Call (No Cache)
```bash
curl -X POST "$PROJECT_URL/functions/v1/recommend-peptides" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"scan_id\": \"$SCAN_ID\"}"
```

**Expected:** `"cached": false` + AI generation logs

### Second Call (With Cache)
```bash
# Same request again
curl -X POST "$PROJECT_URL/functions/v1/recommend-peptides" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"scan_id\": \"$SCAN_ID\"}"
```

**Expected:** `"cached": true` + "Returning cached recommendations" log (no AI call)

### Clear Cache (Optional)
```sql
-- To force regeneration
UPDATE scans 
SET peptide_recommendations = NULL 
WHERE id = 'YOUR_SCAN_ID';
```

---

## Step 7: Test Frontend Integration

### Check Browser Console

When viewing a scan with peptide recommendations:

```
🔴 [CLIENT] Starting peptide recommendations
🔴 [CLIENT] scanId: abc-123
🔴 [CLIENT] Using NEW response format (recommended_peptides)
🔴 [CLIENT] ✅ SUCCESS - Normalized data: {...}
🔴 [CLIENT] Peptides count: 4
🔴 [CLIENT] Cached: false
```

### Expected UI Display
- ✅ Peptide cards rendered
- ✅ Each card shows: name, tags, summary
- ✅ Fit score displayed (if UI supports it)
- ✅ No errors in console
- ✅ Loading state → Success state transition

---

## 🚨 Troubleshooting

### Issue: "peptides_knowledge table is empty"

**Symptoms:**
- Error in logs: `⚠️ peptides_knowledge table is empty!`
- Response: `{ ok: false, message: "peptides_knowledge table is empty..." }`

**Fix:**
1. Run sample INSERT SQL from `PEPTIDES_KNOWLEDGE_BASE_SETUP.md`
2. Verify: `SELECT COUNT(*) FROM peptides_knowledge;` returns > 0

---

### Issue: "AI did not recommend any peptides from the knowledge base"

**Symptoms:**
- Logs show: `⚠️ Peptide not found in knowledge base: "XYZ" - dropping`
- Logs show: `❌ No valid peptides matched from AI response`

**Possible Causes:**
1. AI suggested peptides not in your knowledge base
2. Peptide names don't match (e.g., AI said "Copper Peptide" but DB has "GHK-Cu")

**Fix:**
1. Check logs to see which peptides were dropped
2. Add those peptides to `peptides_knowledge`, OR
3. Add aliases to existing peptides:
```sql
UPDATE peptides_knowledge 
SET aliases = ARRAY['Copper Peptide', 'GHK Copper', 'Copper Tripeptide-1']
WHERE name = 'GHK-Cu';
```

---

### Issue: "OpenAI API error: 401"

**Symptoms:**
- Logs: `❌ OpenAI API error: 401`
- Response: `{ ok: false, message: "OpenAI API error: 401" }`

**Fix:**
1. Verify `OPENAI_API_KEY` is set: Supabase Dashboard → Settings → Edge Functions → Secrets
2. Verify key is valid: Test at https://platform.openai.com/api-keys
3. Redeploy Edge Function after adding key

---

### Issue: Same peptides recommended every time (no variety)

**Symptoms:**
- AI always recommends "GHK-Cu, Matrixyl 3000, Argireline" regardless of scan scores

**Cause:**
- Not enough peptides in knowledge base
- Peptides all have similar `goal_tags`

**Fix:**
1. Add more peptides (aim for 15-20)
2. Diversify `goal_tags`:
   - Anti-aging: GHK-Cu, Matrixyl, Argireline
   - Eye area: Eyeseryl, Haloxyl, Eyeliss
   - Volume: Matrixyl Synthe'6, Collagen peptides
   - Hydration: Hyaluronic acid peptides
   - Skin repair: Copper peptides, GHK-Cu

---

### Issue: Frontend shows "No peptides found"

**Symptoms:**
- UI shows empty state or "No recommendations available"
- Console logs show empty `peptides` array

**Cause:**
- Edge Function returned error
- Frontend parsing issue

**Fix:**
1. Check browser console for errors
2. Check Edge Function logs for errors
3. Verify response format matches expected structure
4. Clear cache and retry

---

## ✅ Final Verification Checklist

Before marking as complete:

- [ ] `peptides_knowledge` has at least 10 rows
- [ ] Each row has: `name`, `aliases`, `goal_tags`, `benefits`, `evidence_level`
- [ ] Edge Function returns `{ ok: true, recommended_peptides: [...] }`
- [ ] All peptide names in response exist in `peptides_knowledge`
- [ ] Logs show: `✅ Loaded peptides_knowledge count=X`
- [ ] Logs show: `✅ Final recommended peptides=Y: ...`
- [ ] `scans.peptide_recommendations` is populated after call
- [ ] Second call returns cached results (`cached: true`)
- [ ] Frontend displays peptide cards correctly
- [ ] No errors in browser console
- [ ] No errors in Edge Function logs

---

## 🎯 Success Metrics

**You know it's working when:**
1. ✅ Edge Function logs show knowledge base loaded (count > 0)
2. ✅ AI returns 3-5 recommendations
3. ✅ All recommendations match your knowledge base
4. ✅ Recommendations vary based on scan scores
5. ✅ Cache works (second call is instant)
6. ✅ Frontend displays recommendations correctly

**You're all set!** 🚀
