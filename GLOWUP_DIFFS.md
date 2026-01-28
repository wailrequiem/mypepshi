# Glow-Up Plan CORS Fix - Exact File Diffs

## 1. Edge Function (NEW FILE)

**File:** `supabase/functions/generate-glowup-plan/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Auth + OpenAI + Save to DB
    // All responses include corsHeaders
    return new Response(
      JSON.stringify({ ok: true, glow_up_plan: planData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

**Full file created at:** `c:\Users\wail\Desktop\mypepshi\supabase\functions\generate-glowup-plan\index.ts`

---

## 2. Frontend Component (MODIFIED)

**File:** `src/components/payment/GlowUpPlanSection.tsx`

**Lines 55-97 (BEFORE):**
```typescript
        // Try to get from scan first if scanId provided
        if (scanId) {
          console.log("🎯 [GLOWUP] Checking scan for cached plan:", scanId);
          const { data: scanData, error: scanError } = await supabase
            .from("scans")
            .select("glowup_plan")
            .eq("id", scanId)
            .single();

          if (!scanError && scanData?.glowup_plan) {
            console.log("✅ [GLOWUP] Using cached plan from scan");
            const plan = scanData.glowup_plan as GlowUpPlan;
            setWeeklyPlan(plan.weeks);
            setLoading(false);
            return;
          }
        }

        // Generate new plan from onboarding
        console.log("🎯 [GLOWUP] Generating new plan from onboarding data");
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          throw new Error("No active session");
        }

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

        console.log("✅ [GLOWUP] Plan generated successfully");
        
        if (!planData?.ok || !planData?.plan) {
          throw new Error(planData?.message || "Failed to generate plan");
        }

        const generatedPlan = planData.plan as GlowUpPlan;
        setWeeklyPlan(generatedPlan.weeks);
        setError(null);
```

**Lines 55-97 (AFTER):**
```typescript
        // Try to get from scan first if scanId provided
        if (scanId) {
          console.log("🎯 [GLOWUP] Checking scan for cached plan:", scanId);
          const { data: scanData, error: scanError } = await supabase
            .from("scans")
            .select("glow_up_plan")
            .eq("id", scanId)
            .single();

          if (!scanError && scanData?.glow_up_plan) {
            console.log("✅ [GLOWUP] Using cached plan from scan");
            const plan = scanData.glow_up_plan as GlowUpPlan;
            setWeeklyPlan(plan.weeks);
            setLoading(false);
            return;
          }
        }

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
        
        if (!planData?.ok) {
          throw new Error(planData?.message || planData?.error || "Failed to generate plan");
        }

        if (!planData?.glow_up_plan?.weeks) {
          throw new Error("Invalid plan format received");
        }

        const generatedPlan = planData.glow_up_plan as GlowUpPlan;
        setWeeklyPlan(generatedPlan.weeks);
        setError(null);
```

**Key Changes:**
1. ❌ Removed: Manual session token fetching (`getSession()`)
2. ❌ Removed: Manual Authorization header
3. ✅ Changed: Response field from `planData.plan` to `planData.glow_up_plan`
4. ✅ Added: Better error handling with multiple fallback error messages
5. ✅ Added: Validation for `glow_up_plan.weeks` structure
6. ✅ Added: Console log showing full planData for debugging

---

## 3. Database Migration (NEW FILE)

**File:** `ADD_GLOW_UP_PLAN_COLUMN.sql`

```sql
ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS glow_up_plan JSONB;

CREATE INDEX IF NOT EXISTS scans_glow_up_plan_idx ON public.scans USING GIN (glow_up_plan);
```

**Run this in:** Supabase Dashboard → SQL Editor

---

## Deployment Commands

```powershell
# 1. Deploy Edge Function
supabase functions deploy generate-glowup-plan

# 2. Or use the provided script
.\deploy-glowup.ps1

# 3. Then run ADD_GLOW_UP_PLAN_COLUMN.sql in Supabase Dashboard
```

---

## Testing Checklist

- [ ] Edge Function deployed successfully
- [ ] SQL migration executed (glow_up_plan column added)
- [ ] No CORS errors in browser console
- [ ] Plan generates on first load
- [ ] Plan caches correctly (reload shows cached plan)
- [ ] Console shows `[GLOWUP]` logs
- [ ] JWT verification working (403 when not logged in)
- [ ] Other features unaffected (coach, peptides, scan flow, paywall)

---

## Troubleshooting

**If CORS errors persist:**
1. Verify Edge Function deployed: `supabase functions list`
2. Check Edge Function logs: `supabase functions log generate-glowup-plan`
3. Verify OPENAI_API_KEY is set in Supabase Edge Function secrets
4. Clear browser cache and hard reload (Ctrl+Shift+R)

**If plan doesn't load:**
1. Check browser console for `[GLOWUP]` logs
2. Verify user has completed onboarding (profiles.onboarding_json exists)
3. Check if glow_up_plan column exists: `SELECT * FROM scans LIMIT 1;`

**If JWT errors:**
1. Ensure user is logged in before accessing plan
2. Check Supabase project URL and anon key are correct
3. Verify RLS policies allow user to update their own scans
