# Quick Start: Test Peptide Recommendations

## ⚡ Fastest Path to Testing

### 1️⃣ Deploy Edge Function (30 seconds)

```bash
cd c:\Users\wail\Desktop\mypepshi
supabase functions deploy recommend-peptides
```

Or use the existing script:
```bash
.\deploy-peptide-recommendations.bat
```

### 2️⃣ Verify Database Column (10 seconds)

The column likely already exists, but to be sure, run in Supabase SQL Editor:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'scans' 
AND column_name = 'peptide_recommendations';
```

If empty result, run:
```sql
ALTER TABLE scans ADD COLUMN IF NOT EXISTS peptide_recommendations JSONB;
```

### 3️⃣ Test in App (1 minute)

1. Start your dev server: `npm run dev`
2. Log in to your app
3. Go to Dashboard
4. You should see "AI-Picked Peptides for Your Goals" below the results grid
5. First load will show loading spinner (~5-10 seconds)
6. Refresh → recommendations load instantly (cached)

---

## ✅ What Should Happen

### First View:
- Loading spinner appears
- Edge function calls OpenAI
- 3-5 peptide cards appear
- Each card has: name, fit score, tags, description, progress bar

### Subsequent Views:
- No loading spinner
- Recommendations load instantly from database
- Same peptides every time (cached)

### Different Users:
- Each user gets personalized recommendations
- Based on their scan scores and onboarding data

---

## 🚨 If Something Goes Wrong

### No recommendations showing:
```bash
# Check Supabase logs
# Dashboard → Edge Functions → recommend-peptides → Logs
```

### Loading forever:
Check browser console for errors. Likely causes:
- Edge function not deployed
- Missing OpenAI API key
- Invalid JWT token

### "Failed to load" error:
Check:
1. User is logged in
2. Scan has an ID
3. Edge function is deployed
4. OpenAI API key is set in Supabase

---

## 📊 Test Different Users

To verify different users get different recommendations:

1. Create two test accounts
2. Each does a face scan
3. Check dashboard for each user
4. Recommendations should be different (based on different scan scores)

---

## 🔄 Test Caching

1. View dashboard (wait for recommendations to load)
2. Refresh page
3. Recommendations should load instantly (no spinner)
4. Check network tab → no call to `recommend-peptides` function

---

## 📝 Quick Debug Commands

### Check if edge function exists:
```bash
supabase functions list
```

### Test edge function directly:
```bash
# Get your JWT token from browser localStorage: supabase.auth.token
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/recommend-peptides \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"scan_id": "YOUR_SCAN_ID"}'
```

### Check database for saved recommendations:
```sql
SELECT id, peptide_recommendations 
FROM scans 
WHERE peptide_recommendations IS NOT NULL 
LIMIT 5;
```

---

## 🎯 Expected Timeline

- **Deploy function**: 30 seconds
- **First recommendation generation**: 5-10 seconds
- **Cached load**: < 1 second
- **Total setup time**: < 5 minutes

---

## ✨ You're Done When...

✅ Dashboard shows "AI-Picked Peptides for Your Goals" section
✅ Peptide cards display with real data (not hardcoded)
✅ Loading state appears on first load
✅ Recommendations persist on refresh (no regeneration)
✅ Different users get different peptides
✅ Browser console has no errors

---

Need help? Check `PEPTIDE_RECOMMENDATIONS_IMPLEMENTATION.md` for detailed troubleshooting.
