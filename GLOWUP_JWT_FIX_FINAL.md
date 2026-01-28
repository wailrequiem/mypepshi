# JWT Fix - Final Implementation

## Changes Made (1 File Only)

### File: `src/components/payment/GlowUpPlanSection.tsx` (lines 73-103)

**BEFORE:**
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

**AFTER:**
```typescript
        // Generate new plan from onboarding
        console.log("🎯 [GLOWUP] Generating new plan from onboarding data");

        // Get session token
        const { data: sessionData } = await supabase.auth.getSession();
        const hasSession = !!sessionData?.session?.access_token;
        const tokenLen = sessionData?.session?.access_token?.length || 0;
        
        console.log("[GLOWUP] hasSession:", hasSession);
        console.log("[GLOWUP] tokenLen:", tokenLen);
        
        if (!hasSession) {
          setError("Please log in again");
          setLoading(false);
          return;
        }

        console.log("[GLOWUP] calling function");
        const { data: planData, error: planError } = await supabase.functions.invoke("generate-glowup-plan", {
          body: { scanId },
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`
          }
        });

        if (planError) {
          console.log("[GLOWUP] response error:", planError);
          throw planError;
        }

        console.log("[GLOWUP] response ok:", planData);
```

## Key Changes

1. ✅ **Added exact logs as specified:**
   - `[GLOWUP] hasSession: true/false`
   - `[GLOWUP] tokenLen: <number>`
   - `[GLOWUP] calling function`
   - `[GLOWUP] response ok:` or `[GLOWUP] response error:`

2. ✅ **Error message updated:**
   - Changed from "Please log in to generate your plan" 
   - To: "Please log in again" (as requested)

3. ✅ **JWT still passed explicitly:**
   - `Authorization: Bearer ${sessionData.session.access_token}`

4. ✅ **Using supabase.functions.invoke():**
   - Not raw fetch (already correct)

## Expected Console Output

### Success Case:
```
🎯 [GLOWUP] Generating new plan from onboarding data
[GLOWUP] hasSession: true
[GLOWUP] tokenLen: 845
[GLOWUP] calling function
[GLOWUP] response ok: { ok: true, glow_up_plan: {...} }
```

### No Session Case:
```
🎯 [GLOWUP] Generating new plan from onboarding data
[GLOWUP] hasSession: false
[GLOWUP] tokenLen: 0
(Shows error: "Please log in again")
```

### Error Case:
```
🎯 [GLOWUP] Generating new plan from onboarding data
[GLOWUP] hasSession: true
[GLOWUP] tokenLen: 845
[GLOWUP] calling function
[GLOWUP] response error: { message: "..." }
```

## Network Tab

After this fix, you should see:

```
POST /functions/v1/generate-glowup-plan
Status: 200 OK
Request Headers:
  Authorization: Bearer eyJhbGc...
Response:
  { ok: true, glow_up_plan: {...} }
```

## Testing Steps

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Navigate to Glow-Up Plan section**
4. **Look for logs:**
   - `[GLOWUP] hasSession: true`
   - `[GLOWUP] tokenLen: <some number>`
   - `[GLOWUP] calling function`
   - `[GLOWUP] response ok:`
5. **Check Network tab:**
   - Should show `200 OK` (not `401 Unauthorized`)

## No Other Changes

- ❌ No route changes
- ❌ No paywall changes
- ❌ No coach changes
- ❌ No scan flow changes
- ❌ No other UI changes
- ✅ Only `GlowUpPlanSection.tsx` modified

## Deployment

No deployment needed for frontend changes - just refresh browser:
```
Ctrl + F5 (hard refresh)
```

If Edge Function needs redeployment:
```powershell
supabase functions deploy generate-glowup-plan
```

## Troubleshooting

**If still getting 401:**
1. Check console for `[GLOWUP] hasSession: false` - means user needs to log in
2. Check console for `[GLOWUP] tokenLen: 0` - means no token available
3. Check Network tab for Authorization header - should be present
4. Log out and log back in to get fresh session

**If `hasSession: true` but still 401:**
- Token might be expired
- User should log out and log back in
- Check Edge Function logs: `supabase functions log generate-glowup-plan`
