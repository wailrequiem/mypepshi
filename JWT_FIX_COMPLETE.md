# JWT Authorization Fix - Complete

## 🔧 Problem
Edge functions `recommend-peptides` and `generate-glowup-plan` were returning **401 Unauthorized** with "Invalid JWT" error.

## 🎯 Root Cause
`supabase.functions.invoke()` does **NOT** automatically add the Authorization header. It must be passed explicitly.

---

## ✅ Files Fixed

### 1. `src/lib/peptideRecommendations.ts`

**What Changed**: Added explicit Authorization header with JWT token

**Before**:
```typescript
const response = await supabase.functions.invoke("recommend-peptides", {
  body: { scan_id: scanId },
  // ❌ No Authorization header - causes 401
});
```

**After**:
```typescript
// Get session and token
const { data: { session } } = await supabase.auth.getSession();

if (!session || !session.access_token) {
  throw new Error("Please log in again");
}

// Debug logs
console.log("[PEPTIDES] Token length:", session.access_token.length);
console.log("[PEPTIDES] User ID:", session.user.id);

// Call with explicit Authorization header
const response = await supabase.functions.invoke("recommend-peptides", {
  body: { scan_id: scanId },
  headers: {
    Authorization: `Bearer ${session.access_token}`, // ✅ Explicit JWT
  },
});
```

**Lines Changed**: 45-60

---

### 2. `src/components/payment/GlowUpPlanSection.tsx`

**What Changed**: Added explicit Authorization header to all edge function calls

#### Change A: Initial plan fetch (lines 78-103)

**Before**:
```typescript
const { data: planData, error: planError } = await supabase.functions.invoke("generate-glowup-plan", {
  body: { userId: user.id }
  // ❌ No Authorization header
});
```

**After**:
```typescript
// Get session and token
const { data: { session } } = await supabase.auth.getSession();

if (!session || !session.access_token) {
  setError("Please log in again");
  setLoading(false);
  return;
}

// Debug logs
console.log("[GLOWUP] Token length:", session.access_token.length);
console.log("[GLOWUP] User ID:", session.user.id);

// Call with explicit Authorization
const { data: planData, error: planError } = await supabase.functions.invoke("generate-glowup-plan", {
  body: { userId: user.id },
  headers: {
    Authorization: `Bearer ${session.access_token}`, // ✅ Explicit JWT
  },
});

// Enhanced error logging
if (planError) {
  console.log("[GLOWUP] Error status:", planError.status);
  console.log("[GLOWUP] Error message:", planError.message);
}
```

#### Change B: Task toggle update (lines 191-206)

**Before**:
```typescript
const { data, error } = await supabase.functions.invoke("update-glowup-progress", {
  body: { scanId, dayIndex: dayIdx, taskId, completed }
});
```

**After**:
```typescript
// Get session for auth
const { data: { session } } = await supabase.auth.getSession();
if (!session?.access_token) {
  console.error("[GLOWUP] No session for task update");
  return;
}

const { data, error } = await supabase.functions.invoke("update-glowup-progress", {
  body: { scanId, dayIndex: dayIdx, taskId, completed },
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});
```

#### Change C: Day complete update (lines 249-269)

**Before**:
```typescript
const { data, error } = await supabase.functions.invoke("update-glowup-progress", {
  body: { scanId, dayIndex: dayIdx, completed: newCompletedState }
});
```

**After**:
```typescript
// Get session for auth
const { data: { session } } = await supabase.auth.getSession();
if (!session?.access_token) {
  console.error("[GLOWUP] No session for day complete");
  // Revert optimistic update
  setProgress(prev => {
    const revertedDays = isCurrentlyCompleted
      ? [...prev.completedDays, dayIdx].sort((a, b) => a - b)
      : prev.completedDays.filter(d => d !== dayIdx);
    return { ...prev, completedDays: revertedDays };
  });
  toast({
    title: "Error",
    description: "Please log in again",
    variant: "destructive",
  });
  return;
}

const { data, error } = await supabase.functions.invoke("update-glowup-progress", {
  body: { scanId, dayIndex: dayIdx, completed: newCompletedState },
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});
```

---

## ✅ Files Already Correct (No Changes Needed)

These files already had proper JWT handling:

1. **`src/lib/coach.ts`** - coach-chat already has Authorization header (line 54-59)
2. **`src/lib/flushPendingScan.ts`** - analyze-face and generate-glowup-plan have headers (lines 131-136, 204-207)
3. **`src/lib/saveAuthenticatedScan.ts`** - analyze-face and generate-glowup-plan have headers (lines 138-143, 195-198)
4. **`src/components/payment/GlowUpDayTasksModal.tsx`** - explain-glowup-task is PUBLIC (no auth required)

---

## 🧪 Testing

### Expected Console Logs (Success)

**For Peptides**:
```
[PEPTIDES] Token length: 850
[PEPTIDES] User ID: abc-123-def
[PEPTIDES] Response received: true
✅ [PEPTIDES] Loaded peptide recommendations: 3 peptides
```

**For Glow-Up Plan**:
```
[GLOWUP] Token length: 850
[GLOWUP] User ID: abc-123-def
[GLOWUP] Response: { ok: true, plan: {...} }
```

### Network Tab

Check in browser DevTools → Network:

- **Before**: POST `/functions/v1/recommend-peptides` → 401 Unauthorized
- **After**: POST `/functions/v1/recommend-peptides` → 200 OK

---

## 🔍 Debug Commands

### 1. Verify User is Logged In
```javascript
// Browser console:
const { data } = await supabase.auth.getSession();
console.log("Session:", data.session);
console.log("Token:", data.session?.access_token?.substring(0, 50) + "...");
```

### 2. Check Token Validity
```javascript
// Browser console:
const { data } = await supabase.auth.getSession();
if (data.session) {
  const payload = JSON.parse(atob(data.session.access_token.split('.')[1]));
  console.log("Token expires:", new Date(payload.exp * 1000));
  console.log("User ID:", payload.sub);
}
```

---

## 📋 Success Checklist

✅ No 401 errors in console  
✅ Network shows 200 OK for recommend-peptides  
✅ Network shows 200 OK for generate-glowup-plan  
✅ Console logs show token length and user ID  
✅ Peptide cards appear on dashboard  
✅ Glow-Up Plan loads correctly  
✅ All updates work without auth errors  

---

## 🔐 Security Notes

**Why this is correct**:
- Session retrieved fresh each time via `supabase.auth.getSession()`
- JWT token passed explicitly in Authorization header
- Edge functions validate the JWT on every request
- User can only access their own data (verified by user_id in edge function)
- No tokens exposed in logs (only length logged for debugging)

**Key Learning**:
`supabase.functions.invoke()` does NOT automatically include the Authorization header from the Supabase client. You must:
1. Get the session with `supabase.auth.getSession()`
2. Extract `session.access_token`
3. Pass it explicitly: `headers: { Authorization: \`Bearer \${token}\` }`

---

## 🎯 Summary

**Total Changes**: 2 files modified
- `src/lib/peptideRecommendations.ts`
- `src/components/payment/GlowUpPlanSection.tsx`

**Result**: All edge function calls now include proper JWT authentication and will return 200 OK when user is logged in.

---

Need help? Check browser console for `[PEPTIDES]` or `[GLOWUP]` debug logs.
