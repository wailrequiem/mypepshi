# 401 Fix - Quick Reference

## What Was Fixed
The Edge Function was returning 401 because the JWT token wasn't being sent in the Authorization header.

## Files Modified (ONLY 2 files)

### 1. `src/components/payment/GlowUpPlanSection.tsx`
**Change:** Added session token retrieval and explicit Authorization header

```typescript
// BEFORE (line 76-78):
const { data: planData, error: planError } = await supabase.functions.invoke("generate-glowup-plan", {
  body: { scanId }
});

// AFTER (line 77-90):
const { data: sessionData } = await supabase.auth.getSession();
if (!sessionData?.session?.access_token) {
  setError("Please log in to generate your plan");
  setLoading(false);
  return;
}

console.log("🎯 [GLOWUP] Calling Edge Function with JWT");
const { data: planData, error: planError } = await supabase.functions.invoke("generate-glowup-plan", {
  body: { scanId },
  headers: {
    Authorization: `Bearer ${sessionData.session.access_token}`
  }
});
```

### 2. `supabase/functions/generate-glowup-plan/index.ts`
**Changes:** 
- Added Bearer token format validation
- Simplified log format
- Changed error field from `error` to `message`

```typescript
// BEFORE (line 23):
console.log("🔑 [generate-glowup-plan] Auth header present:", !!authHeader);

// AFTER (line 23):
console.log("[generate-glowup-plan] auth header present:", !!authHeader);

// NEW (lines 33-40): Added Bearer format check
if (!authHeader.startsWith("Bearer ")) {
  console.error("❌ [generate-glowup-plan] Invalid authorization format");
  return new Response(
    JSON.stringify({ ok: false, message: "Missing Bearer token" }),
    { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// CHANGED: All 401 responses now use "message" instead of "error"
```

## Deploy

```powershell
supabase functions deploy generate-glowup-plan
```

## Test

```
✅ Open browser console
✅ Navigate to Glow-Up Plan section
✅ Look for: "🎯 [GLOWUP] Calling Edge Function with JWT"
✅ Verify: NO 401 errors
✅ Verify: Plan generates successfully
```

## Root Cause

`supabase.functions.invoke()` does NOT automatically include the user's JWT token. You must:
1. Get session via `supabase.auth.getSession()`
2. Pass token explicitly: `headers: { Authorization: "Bearer ${token}" }`

This differs from database queries (which auto-include auth).

## No Other Changes
- ✅ CORS handling intact
- ✅ No routing changes
- ✅ No paywall changes
- ✅ No coach changes
- ✅ No other component changes
