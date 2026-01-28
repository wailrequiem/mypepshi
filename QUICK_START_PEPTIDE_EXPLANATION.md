# Quick Start: Peptide Explanation Feature

## 🚀 Deploy the Edge Function

### Option 1: Using Batch Script (Recommended)
```bash
cd c:\Users\wail\Desktop\mypepshi
.\deploy-explain-peptide.bat
```

### Option 2: Manual Command
```bash
cd c:\Users\wail\Desktop\mypepshi
supabase functions deploy explain-peptide --no-verify-jwt
```

**Important:** Make sure your OpenAI API key is configured in Supabase:
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add environment variable: `OPENAI_API_KEY=sk-...`

---

## 🧪 Test the Feature

### 1. In the App UI
1. Run the app: `npm run dev`
2. Complete onboarding flow
3. View peptide recommendations (appears after payment success or on paywall)
4. **Click any peptide card**
5. Modal opens with:
   - Peptide name, fit score, tags
   - Loading skeleton: "Generating explanation..."
   - After ~2-3 seconds: AI explanation appears with 4 sections

### 2. Expected Modal Sections
- 💡 **Why This Peptide** - Personalized relevance (3 bullets)
- 🛡️ **Safe Usage Guidance** - Educational safety tips (3 bullets)
- ⏰ **What to Expect** - Timeline and outcomes (2-3 sentences)
- ⚠️ **Important Warnings** - Critical safety info (3 bullets)

### 3. Test Caching
1. Open a peptide modal → wait for explanation to load
2. Close modal
3. **Reopen same peptide** → explanation appears instantly (cached)

---

## 🐛 Troubleshooting

### Explanation Not Loading
**Check Edge Function Logs:**
```bash
supabase functions logs explain-peptide
```

**Common Issues:**
- ❌ OpenAI API key not set → Add `OPENAI_API_KEY` in Supabase dashboard
- ❌ Function not deployed → Run `.\deploy-explain-peptide.bat`
- ❌ Network error → Check browser console for errors

### Loading Forever
- Check browser console for errors
- Verify Supabase URL and anon key in `.env.local`
- Ensure edge function is deployed with `--no-verify-jwt`

### Seeing Fallback Content
If you see generic text like "This peptide may support your wellness goals", it means:
- The API call failed (check logs)
- The soft fallback is working correctly (no crash)

---

## 📝 Console Logs

**Client-side logs** (visible in browser console):
```
[explainPeptide] Fetching explanation for: GHK-Cu
[explainPeptide] Cache hit for: GHK-Cu  (on second open)
```

**Server-side logs** (Edge Function, use DEBUG=true to enable):
```typescript
// In supabase/functions/explain-peptide/index.ts
const DEBUG = true;  // Change to enable detailed logs
```

Then check logs:
```bash
supabase functions logs explain-peptide
```

---

## ✅ Verification Checklist

- [ ] Edge function deployed with `--no-verify-jwt`
- [ ] OpenAI API key configured in Supabase
- [ ] App running locally (`npm run dev`)
- [ ] Peptide cards clickable
- [ ] Modal opens on click
- [ ] Loading skeleton appears
- [ ] AI explanation loads (~2-3 seconds)
- [ ] Explanation has 4 sections with icons
- [ ] Reopening same peptide is instant (cached)
- [ ] No console errors

---

## 🔍 Testing Different Scenarios

### Test with Different Peptides
- Each peptide should get a unique explanation
- Cache works independently per peptide name

### Test Error Handling
1. **Disconnect internet** while loading → Should show soft fallback
2. **Invalid peptide data** → Should use defaults
3. **Edge function down** → Should show fallback, no crash

### Test UI Responsiveness
- Modal scrollable if content is long
- Icons display correctly
- Text is readable (not cut off)
- Colors match theme (light/dark mode)

---

## 📦 What Was Changed

### New Files
1. `supabase/functions/explain-peptide/index.ts` - Edge function
2. `src/lib/peptides/explainPeptide.ts` - Frontend helper
3. `deploy-explain-peptide.bat` - Deployment script

### Modified Files
1. `src/components/payment/PeptideRecommendationsRow.tsx`
   - Added `useEffect` to fetch explanation on modal open
   - Added AI Explanation section with 4 subsections
   - Added loading skeleton
   - Added imports for Skeleton and explainPeptide

---

## 🎯 Next Steps

After verifying the feature works:
1. ✅ Test with multiple peptides
2. ✅ Verify caching works
3. ✅ Check mobile responsiveness
4. ✅ Test error scenarios
5. [ ] Consider adding user context (scanScores, goals) to API calls
6. [ ] Add analytics to track most-viewed peptides
7. [ ] Add "Save to Notes" functionality

---

## 📚 Full Documentation

See `PEPTIDE_EXPLANATION_FEATURE.md` for:
- Complete API documentation
- AI prompting rules
- Response format details
- Architecture overview
- Future enhancements
