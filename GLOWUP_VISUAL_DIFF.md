# Visual Diff - 401 Unauthorized Fix

## Frontend: GlowUpPlanSection.tsx (lines 73-97)

```diff
        // Generate new plan from onboarding
        console.log("🎯 [GLOWUP] Generating new plan from onboarding data");

+       // Get session token
+       const { data: sessionData } = await supabase.auth.getSession();
+       if (!sessionData?.session?.access_token) {
+         setError("Please log in to generate your plan");
+         setLoading(false);
+         return;
+       }
+
+       console.log("🎯 [GLOWUP] Calling Edge Function with JWT");
        const { data: planData, error: planError } = await supabase.functions.invoke("generate-glowup-plan", {
-         body: { scanId }
+         body: { scanId },
+         headers: {
+           Authorization: `Bearer ${sessionData.session.access_token}`
+         }
        });

        if (planError) {
          console.error("❌ [GLOWUP] Error generating plan:", planError);
          throw planError;
        }

        console.log("✅ [GLOWUP] Plan generated successfully:", planData);
```

**Summary:**
- ➕ Added 8 lines (token retrieval, validation, header)
- ♻️ Modified 3 lines (invoke call structure)
- Total: 11 lines changed

---

## Edge Function: generate-glowup-plan/index.ts (lines 20-65)

```diff
  try {
    // 1. Authenticate user
    const authHeader = req.headers.get("Authorization");
-   console.log("🔑 [generate-glowup-plan] Auth header present:", !!authHeader);
+   console.log("[generate-glowup-plan] auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("❌ [generate-glowup-plan] Missing authorization header");
      return new Response(
-       JSON.stringify({ ok: false, error: "Missing authorization header" }),
+       JSON.stringify({ ok: false, message: "Missing Bearer token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

+   // Check for Bearer token format
+   if (!authHeader.startsWith("Bearer ")) {
+     console.error("❌ [generate-glowup-plan] Invalid authorization format");
+     return new Response(
+       JSON.stringify({ ok: false, message: "Missing Bearer token" }),
+       { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
+     );
+   }
+
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("❌ [generate-glowup-plan] Auth error:", authError);
      return new Response(
-       JSON.stringify({ ok: false, error: "Auth error: " + authError.message }),
+       JSON.stringify({ ok: false, message: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!user) {
      console.error("❌ [generate-glowup-plan] No user found");
      return new Response(
-       JSON.stringify({ ok: false, error: "Unauthorized - no user" }),
+       JSON.stringify({ ok: false, message: "Unauthorized - no user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ [generate-glowup-plan] User authenticated:", user.id);
```

**Summary:**
- ➕ Added 7 lines (Bearer format check)
- ♻️ Modified 4 lines (log format, error field names)
- Total: 11 lines changed

---

## Total Impact

**Files Changed:** 2
**Lines Added:** 15
**Lines Modified:** 7
**Total Changes:** 22 lines

**Files NOT Changed:** Everything else (routes, paywall, coach, peptides, scan flow, etc.)

---

## Key Improvements

1. **Frontend:** Explicit JWT token passing
   - Prevents 401 errors from missing auth
   - Fails fast with user-friendly error
   - Clear debug logging

2. **Edge Function:** Better auth validation
   - Checks for Bearer token format
   - Consistent error response format (`message` field)
   - Cleaner minimal logs

3. **Security:** JWT verification still enabled
   - No `--no-verify-jwt` flag
   - RLS policies enforced
   - User authentication required
