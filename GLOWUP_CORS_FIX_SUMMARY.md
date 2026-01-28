# Glow-Up Plan CORS Fix - Implementation Summary

## Problem
Browser blocked POST requests to the `generate-glowup-plan` Edge Function due to CORS preflight failure.

## Solution

### 1. Edge Function Created: `supabase/functions/generate-glowup-plan/index.ts`

**Key Changes:**
- ✅ Proper CORS headers defined at the top:
  ```typescript
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  ```

- ✅ OPTIONS preflight handler:
  ```typescript
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }
  ```

- ✅ All responses include `corsHeaders` (success and error cases)

- ✅ JWT verification enabled (uses `supabase.auth.getUser()` with Authorization header)

- ✅ Stable response schema:
  ```typescript
  // Success:
  { ok: true, glow_up_plan: { weeks: [...] } }
  
  // Error (still returns 200 to avoid CORS issues):
  { ok: false, error: "...", message: "..." }
  ```

- ✅ Stores result in `scans.glow_up_plan` if `scanId` provided

- ✅ Uses OpenAI GPT-4o-mini to generate personalized 4-week plans based on onboarding data

### 2. Frontend Fix: `components/payment/GlowUpPlanSection.tsx`

**Key Changes:**
- ✅ Removed manual `fetch()` call
- ✅ Now uses `supabase.functions.invoke()`:
  ```typescript
  const { data: planData, error: planError } = await supabase.functions.invoke("generate-glowup-plan", {
    body: { scanId }
  });
  ```

- ✅ Updated response parsing to match new schema:
  ```typescript
  if (!planData?.ok) {
    throw new Error(planData?.message || planData?.error || "Failed to generate plan");
  }
  
  if (!planData?.glow_up_plan?.weeks) {
    throw new Error("Invalid plan format received");
  }
  
  const generatedPlan = planData.glow_up_plan as GlowUpPlan;
  ```

- ✅ Removed manual session token fetching (handled by supabase client)

- ✅ Added console logging with `[GLOWUP]` prefix for debugging

- ✅ No changes to other features (routing, auth, paywall, coach, etc.)

### 3. Database Migration: `ADD_GLOW_UP_PLAN_COLUMN.sql`

**SQL to run:**
```sql
ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS glow_up_plan JSONB;

CREATE INDEX IF NOT EXISTS scans_glow_up_plan_idx ON public.scans USING GIN (glow_up_plan);
```

This adds the `glow_up_plan` JSONB column to store the AI-generated plans.

## Files Changed

1. **CREATED**: `supabase/functions/generate-glowup-plan/index.ts` (new Edge Function)
2. **MODIFIED**: `src/components/payment/GlowUpPlanSection.tsx` (lines 55-101)
3. **CREATED**: `ADD_GLOW_UP_PLAN_COLUMN.sql` (database migration)

## Testing Steps

1. **Deploy the Edge Function:**
   ```powershell
   supabase functions deploy generate-glowup-plan
   ```

2. **Run the SQL migration:**
   - Go to Supabase Dashboard → SQL Editor
   - Run the contents of `ADD_GLOW_UP_PLAN_COLUMN.sql`

3. **Test the flow:**
   - Complete onboarding as an authenticated user
   - Navigate to the Glow-Up Plan section
   - Verify the plan loads without CORS errors
   - Check browser console for `[GLOWUP]` logs
   - Verify the plan is personalized based on onboarding data

4. **Verify caching:**
   - Reload the page with the same `scanId`
   - Should load from `scans.glow_up_plan` (cached) instead of regenerating

## Security Notes

✅ JWT verification is ON (no `--no-verify-jwt` flag used)
✅ RLS policies ensure users can only access their own scans
✅ Edge Function validates user authentication before processing
✅ All error responses include CORS headers to prevent browser blocking

## No Changes Made To

- Coach feature
- Peptides coach chat
- Scan flow
- Paywall logic
- Routing
- Auth logic
- Any other Edge Functions

Only the Glow-Up Plan feature was modified.
