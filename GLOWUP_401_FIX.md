# 401 Unauthorized Fix - Exact Diffs

## Problem
Edge Function returns 401 Unauthorized because JWT token is not being sent properly from frontend.

## Solution

### 1. Frontend Fix: `src/components/payment/GlowUpPlanSection.tsx`

**Lines 73-85 (BEFORE):**
```typescript
        // Generate new plan from onboarding
        console.log("🎯 [GLOWUP] Generating new plan from onboarding data");

        const { data: planData, error: planError } = await supabase.functions.invoke("generate-glowup-plan", {
          body: { scanId }
        });

        if (planError) {
          console.error("❌ [GLOWUP] Error generating plan:", planError);
          throw planError;
        }

        console.log("✅ [GLOWUP] Plan generated successfully:", planData);
```

**Lines 73-93 (AFTER):**
```typescript
        // Generate new plan from onboarding
        console.log("🎯 [GLOWUP] Generating new plan from onboarding data");

        // Get session token
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

        if (planError) {
          console.error("❌ [GLOWUP] Error generating plan:", planError);
          throw planError;
        }

        console.log("✅ [GLOWUP] Plan generated successfully:", planData);
```

**Key Changes:**
- ✅ Added session token retrieval via `supabase.auth.getSession()`
- ✅ Early return with error if no session/token exists
- ✅ Explicitly pass JWT in Authorization header: `Bearer ${token}`
- ✅ Added log: "Calling Edge Function with JWT"

---

### 2. Edge Function Fix: `supabase/functions/generate-glowup-plan/index.ts`

**Lines 20-56 (BEFORE):**
```typescript
  try {
    // 1. Authenticate user
    const authHeader = req.headers.get("Authorization");
    console.log("🔑 [generate-glowup-plan] Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("❌ [generate-glowup-plan] Missing authorization header");
      return new Response(
        JSON.stringify({ ok: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("❌ [generate-glowup-plan] Auth error:", authError);
      return new Response(
        JSON.stringify({ ok: false, error: "Auth error: " + authError.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!user) {
      console.error("❌ [generate-glowup-plan] No user found");
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized - no user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ [generate-glowup-plan] User authenticated:", user.id);
```

**Lines 20-66 (AFTER):**
```typescript
  try {
    // 1. Authenticate user
    const authHeader = req.headers.get("Authorization");
    console.log("[generate-glowup-plan] auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("❌ [generate-glowup-plan] Missing authorization header");
      return new Response(
        JSON.stringify({ ok: false, message: "Missing Bearer token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
      console.error("❌ [generate-glowup-plan] Invalid authorization format");
      return new Response(
        JSON.stringify({ ok: false, message: "Missing Bearer token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("❌ [generate-glowup-plan] Auth error:", authError);
      return new Response(
        JSON.stringify({ ok: false, message: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!user) {
      console.error("❌ [generate-glowup-plan] No user found");
      return new Response(
        JSON.stringify({ ok: false, message: "Unauthorized - no user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ [generate-glowup-plan] User authenticated:", user.id);
```

**Key Changes:**
- ✅ Changed log format: `[generate-glowup-plan] auth header present:` (minimal)
- ✅ Added explicit Bearer token format check
- ✅ Changed error responses to use `message` field instead of `error` (consistent)
- ✅ Better error messages: "Missing Bearer token", "Invalid or expired token"
- ✅ All 401 responses include CORS headers

---

## Deployment

```powershell
# Redeploy Edge Function with auth fix
supabase functions deploy generate-glowup-plan
```

---

## Testing

1. **Check browser console for logs:**
   - ✅ Should see: `🎯 [GLOWUP] Calling Edge Function with JWT`
   - ✅ Should NOT see: 401 Unauthorized errors

2. **Edge Function logs:**
   ```powershell
   supabase functions log generate-glowup-plan --tail
   ```
   - ✅ Should see: `[generate-glowup-plan] auth header present: true`
   - ✅ Should see: `✅ [generate-glowup-plan] User authenticated: <user-id>`

3. **Error cases (test these work correctly):**
   - Logged out user: Should see "Please log in to generate your plan" (frontend error)
   - Invalid token: Should see "Invalid or expired token" (Edge Function 401)

---

## What Was Changed

✅ **Frontend (GlowUpPlanSection.tsx):**
- Added session token retrieval before calling Edge Function
- Early return if no session/token
- Explicitly pass JWT in Authorization header

✅ **Edge Function (generate-glowup-plan/index.ts):**
- Added Bearer token format validation
- Changed log to minimal format: `[generate-glowup-plan] auth header present:`
- Standardized error responses to use `message` field
- Better error messages for auth failures

❌ **NOT Changed:**
- Routes
- Paywall logic
- Scan flow
- Coach features
- Peptides coach
- Any other UI components
- CORS handling (kept intact)

---

## Root Cause

The issue was that `supabase.functions.invoke()` does NOT automatically include the Authorization header by default. We need to:
1. Get the session token explicitly
2. Pass it in the `headers` parameter

This is different from database queries (which automatically include auth) - Edge Function invocations require manual header passing.
