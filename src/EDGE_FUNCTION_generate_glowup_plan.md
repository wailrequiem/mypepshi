# Edge Function: generate-glowup-plan

## 📍 Location
`supabase/functions/generate-glowup-plan/index.ts`

## 🎯 Purpose
Generates a personalized 4-week glow-up plan based on the user's onboarding data.

## 📥 Input

```typescript
{
  scanId: string  // Optional - if provided, saves plan to this scan
}
```

## 🔍 What It Does

1. Gets user from JWT auth token
2. Fetches user's `onboarding_json` from `profiles` table
3. Analyzes onboarding answers:
   - age
   - gender
   - primary_goal
   - biggest_struggles (array)
   - lifestyle (sleep, diet, hydration, activity)
   - skincare_experience
   - routine_openness (beginner/intermediate/advanced)
   - time_availability
   - motivation_level
4. Calls AI (OpenAI/Anthropic) to generate personalized plan
5. Saves `glowup_plan` JSONB to `scans` table (if scanId provided)
6. Returns plan

## 🤖 AI Prompt Structure

```
You are a glow-up coach. Generate a 4-week personalized plan.

USER DATA:
- Age: {age}
- Gender: {gender}
- Primary Goal: {primary_goal}
- Struggles: {biggest_struggles}
- Lifestyle: {lifestyle}
- Experience: {skincare_experience}
- Level: {routine_openness}
- Time: {time_availability} minutes/day
- Motivation: {motivation_level}

RULES:
1. Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "weeks": [
    {
      "week": 1,
      "status": "active",
      "days": [
        {
          "day": 1,
          "title": "Mewing Basics",
          "description": "Learn correct tongue posture to improve jawline engagement.",
          "difficulty": "easy",
          "duration_minutes": 5
        }
      ]
    }
  ]
}

2. EXACTLY 4 weeks
3. EXACTLY 5-7 days per week (adjust based on time availability)
4. Titles: 1-3 words, action-focused
5. Descriptions: 1 sentence, actionable
6. Week 1: Easy tasks for beginners
7. Gradually increase difficulty
8. Personalize based on goals:
   - Skin goal → skincare, hydration, SPF
   - Jawline goal → mewing, posture, chewing
   - Symmetry → facial exercises
   - Fat loss → diet, cardio
   - Muscle → protein, resistance
9. If age < 18: NO supplements, NO extreme routines
10. If beginner: Start very simple
11. If low time: Tasks ≤ 5 minutes
12. If low motivation: Extra encouraging, easier tasks

PERSONALIZATION IS CRITICAL. Two different users should get different plans.
```

## 📤 Output

```typescript
{
  ok: true,
  plan: {
    weeks: [
      {
        week: 1,
        status: "active",
        days: [
          {
            day: 1,
            title: "Mewing Basics",
            description: "Learn correct tongue posture to improve jawline engagement.",
            difficulty: "easy",
            duration_minutes: 5
          },
          // ... 4-6 more days
        ]
      },
      // ... 3 more weeks
    ]
  }
}
```

## 💾 Database Update

If `scanId` provided, updates:

```sql
UPDATE scans
SET glowup_plan = {generated_plan}
WHERE id = scanId;
```

## ⚠️ Error Handling

- If no user: 401 Unauthorized
- If no onboarding data: 400 Bad Request "No onboarding data found"
- If AI fails: 500 Internal Server Error
- If invalid JSON from AI: Retry once, then fallback error

## 🔒 Security

- Requires valid JWT in Authorization header
- User can only generate plan for their own data
- RLS policies on scans table ensure user_id matches

## 📝 Example Implementation

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { scanId } = await req.json()

    // Get onboarding data
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('onboarding_json')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.onboarding_json) {
      return new Response(JSON.stringify({ ok: false, error: 'No onboarding data found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const onboarding = profile.onboarding_json

    // Call AI (OpenAI/Anthropic)
    const prompt = `Generate personalized 4-week glow-up plan...` // Full prompt here
    
    // const aiResponse = await callAI(prompt, onboarding)
    // const plan = JSON.parse(aiResponse)

    // For now, generate based on logic
    const plan = generatePlanFromOnboarding(onboarding)

    // Save to scan if scanId provided
    if (scanId) {
      await supabaseClient
        .from('scans')
        .update({ glowup_plan: plan })
        .eq('id', scanId)
        .eq('user_id', user.id)
    }

    return new Response(JSON.stringify({ ok: true, plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function generatePlanFromOnboarding(onboarding: any) {
  // Logic-based generation as fallback
  const goal = onboarding.primary_goal || 'skin'
  const level = onboarding.routine_openness || 'beginner'
  const time = onboarding.time_availability || 10
  
  // Generate personalized plan based on these factors
  return {
    weeks: [
      // ... generate 4 weeks dynamically
    ]
  }
}
```

## ✅ Testing

1. Call with valid JWT + scanId
2. Check `scans.glowup_plan` is populated
3. Different onboarding → different plans
4. No onboarding data → 400 error
5. Invalid JWT → 401 error
