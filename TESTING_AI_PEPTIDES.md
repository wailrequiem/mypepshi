# 🧪 Testing AI Peptide Recommendations

## Quick Test Checklist

### ✅ **Test 1: Basic Functionality**
```
1. npm run dev
2. Go to Dashboard
3. Scroll to "AI-Picked Peptides for Your Goals"
4. Check:
   ☐ Loading spinner appears
   ☐ Peptide cards load
   ☐ Console shows: [PEPTIDES] AI peptides used: [...]
   ☐ fit_score is NOT 95%, 88%, 76% (hardcoded values)
```

### ✅ **Test 2: Different Users → Different Peptides**

**User Profile A:**
```
- Age: 19
- Gender: Female
- Goal: Skin improvement, anti-aging
- Peptides openness: Yes
```

**Expected Peptides:**
- GHK-Cu (high fit score, 85-95%)
- Matrixyl (high fit score, 80-90%)
- NOT: Ipamorelin, CJC-1295 (performance peptides)

---

**User Profile B:**
```
- Age: 25
- Gender: Male
- Goal: Muscle gain, recovery
- Peptides openness: Yes
```

**Expected Peptides:**
- Ipamorelin (high fit score, 90-95%)
- CJC-1295 (high fit score, 85-92%)
- BPC-157 (moderate fit, 75-85%)

---

**User Profile C:**
```
- Age: 17 (MINOR)
- Gender: Male
- Goal: Muscle gain
- Peptides openness: Yes
```

**Expected Peptides:**
- ❌ NO Ipamorelin, CJC-1295 (age restriction)
- ✅ ONLY: Topical/skincare peptides (GHK-Cu with low fit score)
- ✅ Message about natural methods

---

**User Profile D:**
```
- Age: 30
- Peptides openness: NO
```

**Expected Result:**
- Empty array OR
- Message: "Focus on natural methods"

---

### ✅ **Test 3: Console Logs**

**Expected logs:**
```javascript
🧬 [PEPTIDES] Fetching AI recommendations...
✅ [PEPTIDES] AI peptides received: 3
[PEPTIDES] AI peptides used: [
  {
    name: "Ipamorelin",
    fit_score: 94,
    tags: ["Muscle growth", "Recovery", "Fat loss"],
    summary: "Perfect for your muscle-building goals..."
  },
  {
    name: "GHK-Cu",
    fit_score: 87,
    tags: ["Skin repair", "Collagen boost", "Jawline support"],
    summary: "Targets your jawline and skin concerns..."
  },
  {
    name: "BPC-157",
    fit_score: 79,
    tags: ["Recovery", "Tissue repair", "Overall wellness"],
    summary: "Supports recovery from your gym sessions..."
  }
]
```

---

### ✅ **Test 4: Changing Onboarding**

**Step-by-step:**
```
1. Complete onboarding with Goal = "Skin improvement"
2. Take face scan
3. Dashboard shows: GHK-Cu (95%), Matrixyl (89%)
4. Go back, change onboarding answers → Goal = "Muscle gain"
5. Retake face scan
6. Dashboard NOW shows: Ipamorelin (94%), CJC-1295 (89%), BPC-157 (82%)
```

**Expected:**
✅ Peptides change based on new answers
❌ NOT always the same peptides

---

### ✅ **Test 5: Low Scan Scores = Higher Priority**

**Scenario:**
```
User with low jawline score (60/100) + Goal = "Improve jawline"
```

**Expected:**
- GHK-Cu should have HIGH fit_score (90+)
- Summary should mention: "Addresses your low jawline score"
- AI prioritizes peptides that target weak areas

---

### ✅ **Test 6: Caching**

**Test caching logic:**
```
1. Complete scan → AI generates recommendations
2. Refresh page
3. Check console:
   ☐ Should see: "[PEPTIDES] ✅ Using cached recommendations"
   ☐ Should NOT call API again (faster load)
4. Take NEW scan
5. AI should generate NEW recommendations (not cached)
```

---

### ✅ **Test 7: Error Handling**

**Test error states:**

**Scenario A: Not logged in**
```
Expected: "Please log in to see personalized recommendations"
```

**Scenario B: No onboarding data**
```
Expected: "Complete your onboarding to get recommendations"
```

**Scenario C: API error**
```
Expected: Error message with AlertCircle icon
```

---

### ✅ **Test 8: Network Tab**

**Check network requests:**
```
1. Open DevTools → Network
2. Load Dashboard
3. Look for POST /functions/v1/recommend-peptides
4. Check:
   ☐ Status: 200
   ☐ Response:
     {
       "ok": true,
       "recommended_peptides": [...]
     }
   ☐ Request body includes:
     - onboarding data ✅
     - scan scores ✅
```

---

## 🐛 **Troubleshooting**

### **Issue: Always shows same peptides**
```
❌ Problem: Still showing hardcoded GHK-Cu, BPC-157, Epithalon
✅ Solution:
   1. Clear browser cache
   2. Check console for [PEPTIDES] logs
   3. Verify Edge Function deployed: supabase functions list
   4. Check database column exists: SELECT peptide_recommendations FROM scans LIMIT 1;
```

### **Issue: Loading forever**
```
❌ Problem: Spinner never stops
✅ Solution:
   1. Check console for errors
   2. Verify Edge Function is deployed
   3. Check network tab for failed requests
   4. Ensure OPENAI_API_KEY is set in Supabase
```

### **Issue: Empty recommendations**
```
❌ Problem: No peptides shown
✅ Solution:
   1. Check peptides_openness in onboarding (if "no" → empty)
   2. Check age (if <18 → limited peptides)
   3. Check console logs for API errors
   4. Verify peptides_knowledge table has data
```

---

## 📊 **Success Criteria**

✅ **PASS if:**
- Different users see different peptides
- fit_score is dynamic (not 95%, 88%, 76%)
- Peptides match user goals
- Console shows AI logs
- No hardcoded names in UI
- Changing onboarding changes peptides

❌ **FAIL if:**
- Always shows same 3 peptides
- fit_score is always 95%, 88%, 76%
- Peptides don't match user profile
- No console logs
- Same result for all users

---

## 🎯 **Quick Manual Test**

**5-minute test:**
```bash
# 1. Start app
npm run dev

# 2. Create 2 test users with different profiles
User A: Age 19, Goal=Skin
User B: Age 25, Goal=Muscle

# 3. Check peptides
User A should see: GHK-Cu, Matrixyl
User B should see: Ipamorelin, CJC-1295, BPC-157

# 4. Console logs
[PEPTIDES] AI peptides used: [different for each user]

✅ PASS: Peptides are different
❌ FAIL: Peptides are the same
```

---

**If all tests pass, AI recommendations are working! 🧬✨**
