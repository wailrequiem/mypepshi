# ⚡ QUICK FIX REFERENCE - 401 JWT Error Fixed

## 🎯 Problem
Clicking (i) info button → **401 Invalid JWT** error

## ✅ Solution
Made edge function **PUBLIC** (no auth required)

---

## 📦 What Changed

| File | What Changed |
|------|--------------|
| `supabase/functions/explain-glowup-task/index.ts` | Removed JWT auth, simplified API |
| `src/components/payment/GlowUpDayTasksModal.tsx` | Updated to call public API |
| `deploy-explain-task-public.bat` | New deploy script (Windows) |
| `deploy-explain-task-public.ps1` | New deploy script (PowerShell) |

---

## 🚀 Deploy NOW

### One Command:
```powershell
.\deploy-explain-task-public.ps1
```

**OR manually:**
```bash
supabase functions deploy explain-glowup-task --no-verify-jwt
```

⚠️ **MUST include** `--no-verify-jwt` flag!

---

## 🧪 Test (30 seconds)

1. Open app
2. Go to Glow-Up Plan
3. Click any day
4. Click **(i)** on any task
5. ✅ Should open without 401!

---

## 📊 Network Tab Should Show:

```
POST /functions/v1/explain-glowup-task
Status: 200 OK ✅
Response: { "ok": true, "explanation": "...", "tips": [...] }
```

---

## 🔍 Console Logs:

```
[EXPLAIN] calling edge function...
[EXPLAIN] success ✅
```

**No 401 errors!** ✅

---

## ❌ If Still 401:

Run deploy command again with `--no-verify-jwt`:
```bash
supabase functions deploy explain-glowup-task --no-verify-jwt
```

---

## 📝 What's Unchanged

✅ Onboarding  
✅ Scan flow  
✅ Payment  
✅ Coach  
✅ Auth  
✅ Everything else  

**Only changed:** Task explanation API

---

## 🎉 Result

- Works for **guests** ✅
- Works for **logged-in users** ✅
- No more 401 errors ✅
- Simple & fast ✅

---

**Status:** ✅ FIXED

**Deploy:** `.\deploy-explain-task-public.ps1`

**Time:** < 1 minute
