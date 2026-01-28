# Edge Function Setup - AI Dashboard Generation

## Overview

This Edge Function generates personalized dashboard data using OpenAI's GPT-4 Turbo with Structured Outputs.

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. OpenAI API key
3. Supabase project

## Setup Steps

### 1. Initialize Supabase Project (if not done)

```bash
cd c:\Users\wail\Desktop\mypepshi
supabase init
```

### 2. Set Environment Variables

```bash
supabase secrets set OPENAI_API_KEY=sk-your-actual-key
```

Or via Supabase Dashboard:
- Go to **Project Settings** → **Edge Functions** → **Secrets**
- Add `OPENAI_API_KEY` with your OpenAI API key

### 3. Deploy the Function

```bash
supabase functions deploy generate-dashboard
```

### 4. Test Locally (Optional)

```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve generate-dashboard --env-file supabase/functions/generate-dashboard/.env

# Test it
curl -X POST http://localhost:54321/functions/v1/generate-dashboard \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"scan_id": "your-scan-uuid"}'
```

## Usage in Frontend

```typescript
import { supabase } from "@/lib/supabase";

async function generateDashboard(scanId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-dashboard`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ scan_id: scanId }),
    }
  );

  const dashboardData = await response.json();
  return dashboardData;
}
```

## Response Schema

```typescript
interface DashboardData {
  glow_up_plan: {
    summary: string;
    weeks: Array<{
      week: number;
      focus: string;
      days: Array<{
        day: number;
        title: string;
        description: string;
      }>;
    }>;
  };
  peptides: Array<{
    name: string;
    subtitle: string;
    fit_percentage: number;
    why_recommended: string;
    benefits: string[];
    dosage: string;
    timing: string;
  }>;
  coach_insights: {
    summary: string;
    key_recommendations: string[];
    motivational_message: string;
  };
}
```

## Model Details

- **Primary Model:** `gpt-4-turbo-2024-04-09`
- **Alternative:** `gpt-4-1106-preview` (if turbo unavailable)
- **Cost-effective:** `gpt-3.5-turbo` (lower quality)

The function uses OpenAI's **Structured Outputs** feature which guarantees:
- Valid JSON response
- Schema compliance
- No parsing errors
- Consistent structure

## Security

- API key stored in Edge Function secrets (server-side only)
- User authentication required
- RLS policies enforce data access control
- CORS enabled for your frontend domain

## Cost Optimization

**Estimated cost per generation:**
- Input tokens: ~500-800 tokens (~$0.01)
- Output tokens: ~1000-1500 tokens (~$0.03)
- **Total: ~$0.04 per dashboard generation**

### Tips to reduce cost:
1. Cache results (don't regenerate on every page load)
2. Use `gpt-3.5-turbo` for testing
3. Implement rate limiting
4. Only regenerate when user explicitly requests it

## Integration Example

```typescript
// In Dashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePersonalizedPlan = async (scanId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-dashboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ scan_id: scanId }),
        }
      );

      const data = await response.json();
      setDashboardData(data);
      
      // Optionally save to database for caching
      await supabase.from("generated_plans").insert({
        user_id: user.id,
        scan_id: scanId,
        plan_data: data,
      });
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <div>Generating your personalized plan...</div>}
      {dashboardData && <div>{/* Render dashboard */}</div>}
    </div>
  );
}
```

## Troubleshooting

### Error: "Unauthorized"
- Check that user is logged in
- Verify authorization header is set

### Error: "Scan not found"
- Verify scan_id exists in database
- Check RLS policies on scans table

### Error: "Failed to generate dashboard data"
- Check OPENAI_API_KEY is set correctly
- Verify API key has credits
- Check OpenAI API status

### Edge Function not responding
- Check deployment: `supabase functions list`
- View logs: `supabase functions logs generate-dashboard`

## Caching Generated Plans

To avoid regenerating plans on every page load:

1. Run `GENERATED_PLANS_SETUP.sql` in Supabase SQL Editor
2. Use the caching pattern:

```typescript
import { generateDashboardData } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

async function loadDashboard(scanId: string) {
  // 1. Check cache first
  const { data: cached } = await supabase
    .from("generated_plans")
    .select("plan_data")
    .eq("scan_id", scanId)
    .single();

  if (cached) {
    return cached.plan_data;
  }

  // 2. Generate new plan
  const data = await generateDashboardData(scanId);

  // 3. Cache it
  await supabase.from("generated_plans").upsert({
    user_id: user.id,
    scan_id: scanId,
    plan_data: data,
  });

  return data;
}
```

## Next Steps

1. Deploy the function: `supabase functions deploy generate-dashboard`
2. Set secret: `supabase secrets set OPENAI_API_KEY=sk-your-key`
3. Run `GENERATED_PLANS_SETUP.sql`
4. Test with a real scan_id
5. Integrate into dashboard UI
6. Add loading states
7. Add regenerate button for users

## Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [GPT-4 Turbo Docs](https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4)
