# 🧪 Glow-Up Plan No-Auth Testing Guide

## Quick Test Steps

### 1. Deploy Edge Function
```bash
cd c:\Users\wail\Desktop\mypepshi
.\deploy-glowup-no-auth.bat
```

Wait for: `✅ DEPLOYMENT SUCCESSFUL`

### 2. Verify Secrets
```bash
supabase secrets list
```

Must show:
- `OPENAI_API_KEY` ✅

If missing:
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key
```

### 3. Test Edge Function Directly

**Using PowerShell:**
```powershell
$url = "https://YOUR_PROJECT.supabase.co/functions/v1/generate-glowup-plan"
Invoke-RestMethod -Uri $url -Method POST -Headers @{"Content-Type"="application/json"} -Body "{}"
```

**Expected response:**
```json
{
  "ok": true,
  "plan": {
    "weeks": [ ... ]
  },
  "message": "Plan generated successfully (no auth required)"
}
```

### 4. Test in Browser

1. Open app: `npm run dev`
2. Navigate to Glow-Up Plan section
3. **DO NOT LOG IN** (test as guest)

**Expected behavior:**
- ✅ Plan loads automatically
- ✅ Shows loading spinner briefly
- ✅ Displays 4 weeks
- ✅ Can click any day
- ✅ Can view tasks
- ✅ Can check tasks
- ✅ No auth errors

### 5. Browser Console Check

Open DevTools (F12) and check console:

**Good logs:**
```
[GLOWUP] Fetching AI-generated plan (no auth required)
[GLOWUP] Response: {ok: true, plan: {...}}
[GLOWUP] ✅ Plan loaded, weeks: 4
```

**Bad logs (should NOT see):**
```
❌ Please log in
❌ 401 Unauthorized
❌ Cannot read property 'map' of undefined
❌ Failed to load plan
```

### 6. Network Tab Check

In DevTools Network tab:

**Request to:** `generate-glowup-plan`
- Method: POST
- Headers: Should NOT have `Authorization: Bearer ...`
- Status: 200 ✅
- Response: JSON with plan ✅

### 7. localStorage Check

In DevTools Console:
```javascript
localStorage.getItem('glowup_progress')
```

Should show:
```json
{
  "completedDays": [],
  "completedTasksByDay": {},
  "updatedAt": "2026-01-27T..."
}
```

### 8. Progress Persistence Test

1. Check a task as complete
2. Refresh page (F5)
3. Task should still be checked ✅

Clear progress:
```javascript
localStorage.removeItem('glowup_progress')
```

## ❌ Common Issues

### Issue: 401 Unauthorized

**Cause:** Function deployed with JWT verification enabled

**Fix:**
```bash
supabase functions deploy generate-glowup-plan --no-verify-jwt
```

### Issue: "AI service not configured"

**Cause:** OPENAI_API_KEY not set

**Fix:**
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase functions deploy generate-glowup-plan --no-verify-jwt
```

### Issue: Plan shows hardcoded content (not AI)

**Cause:** AI generation failed, using fallback plan

**Fix:** Check Supabase logs:
```bash
supabase functions logs generate-glowup-plan
```

Look for OpenAI errors

### Issue: "Unable to load plan"

**Cause:** Edge function not deployed or crashed

**Fix:** Check logs:
```bash
supabase functions logs generate-glowup-plan --tail
```

Redeploy:
```bash
supabase functions deploy generate-glowup-plan --no-verify-jwt
```

## ✅ Success Checklist

Before marking as complete, verify:

- [ ] Edge function deployed successfully
- [ ] No auth/JWT errors in browser console
- [ ] Plan loads without login
- [ ] 4 weeks displayed
- [ ] Each week has 7 days
- [ ] Each day has 3-5 tasks
- [ ] Days are clickable
- [ ] Tasks can be checked/unchecked
- [ ] Progress persists after refresh
- [ ] No "Cannot read property 'map' of undefined"
- [ ] No 400/401/403 errors
- [ ] Works in incognito/guest mode

## 🎯 Expected Behavior

### On First Load (No Login)
1. Shows loading spinner (2-5 seconds)
2. Displays "Your Glow-Up Plan" header
3. Shows 4 week cards
4. Week 1 is unlocked and active
5. All days in Week 1 are visible
6. Can click Day 1 to view tasks

### On Day Click
1. Modal opens with day details
2. Shows 3-5 tasks
3. Each task has checkbox
4. Can check/uncheck tasks
5. Can mark day complete
6. Modal closes on "Mark Complete"

### On Refresh
1. Plan reloads (may regenerate)
2. Progress persists (from localStorage)
3. Checked tasks still checked
4. Completed days still marked

## 🔍 Debugging Tips

### Enable Verbose Logging

In `GlowUpPlanSection.tsx`, all logs start with `[GLOWUP]`

Filter in console:
```
[GLOWUP]
```

### Check Edge Function Logs

Real-time:
```bash
supabase functions logs generate-glowup-plan --tail
```

Last 100 lines:
```bash
supabase functions logs generate-glowup-plan --limit 100
```

### Test Edge Function Independently

Create `test-glowup.html`:
```html
<!DOCTYPE html>
<html>
<body>
<button onclick="testPlan()">Test Plan</button>
<pre id="result"></pre>
<script>
async function testPlan() {
  const url = 'https://YOUR_PROJECT.supabase.co/functions/v1/generate-glowup-plan';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  });
  const data = await res.json();
  document.getElementById('result').textContent = JSON.stringify(data, null, 2);
}
</script>
</body>
</html>
```

## 📊 Performance Expectations

| Metric | Expected | Notes |
|--------|----------|-------|
| Initial load | 2-10 seconds | AI generation time |
| Subsequent loads | 2-10 seconds | Fresh generation each time |
| Day click | Instant | Local data |
| Task toggle | Instant | localStorage only |
| Progress save | Instant | localStorage only |

## 🎉 Done!

If all tests pass, you're ready to go! 🚀

The Glow-Up Plan is now:
- ✅ AI-generated
- ✅ Public (no auth)
- ✅ Fast
- ✅ Reliable
- ✅ Error-free
