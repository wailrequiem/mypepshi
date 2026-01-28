# Complete AI Dashboard Integration Guide

## 🎯 Overview

This guide covers the complete setup for AI-generated personalized dashboard data using:
- **OpenAI GPT-4 Turbo** with Structured Outputs
- **Supabase Edge Functions** (server-side only)
- **Automatic caching** to minimize API costs
- **User onboarding data** + **facial scan results** as input

## 📋 Prerequisites

1. ✅ Supabase project created
2. ✅ OpenAI API account with credits
3. ✅ Supabase CLI installed: `npm install -g supabase`
4. ✅ User authentication working
5. ✅ Onboarding data context implemented
6. ✅ Scan results saved to database

## 🚀 Quick Start (5 Steps)

### Step 1: Set OpenAI API Key

```bash
supabase secrets set OPENAI_API_KEY=sk-your-actual-openai-key
```

### Step 2: Deploy Edge Function

```bash
cd c:\Users\wail\Desktop\mypepshi
supabase functions deploy generate-dashboard
```

Or use the PowerShell script:
```powershell
.\DEPLOY_EDGE_FUNCTION.ps1
```

### Step 3: Create Database Tables

Run these SQL files in Supabase SQL Editor:
1. `PROFILES_SETUP.sql` (if not done already)
2. `GENERATED_PLANS_SETUP.sql` (for caching)

### Step 4: Add Frontend Integration

```typescript
import { getDashboardData } from "@/lib/ai";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";

const { user } = useAuth();
const { onboardingData } = useOnboarding();

// Load dashboard data
const data = await getDashboardData(user.id, onboardingData.last_scan_id);
```

### Step 5: Test It

1. Complete onboarding with a scan
2. Navigate to dashboard
3. Wait 10-15 seconds for generation
4. View personalized results

## 📦 What Gets Generated

The AI creates:

### 1. Glow-Up Plan
- 4-week structured plan
- Daily actionable tasks
- Personalized to user's struggles and goals

### 2. Peptide Recommendations
- Top 3 peptides matched to user
- Fit percentage
- Benefits, dosage, timing
- Why each is recommended

### 3. Coach Insights
- Summary of key focus areas
- Personalized recommendations
- Motivational message

## 🔐 Security

✅ **What's Secure:**
- API key stored in Edge Function secrets (never exposed)
- User authentication required (JWT verified)
- RLS policies enforce data access
- Only user can access their own data

❌ **Never Do This:**
- Store OPENAI_API_KEY in frontend code
- Store API key in .env.local
- Call OpenAI directly from browser

## 💰 Cost Management

**Per Dashboard Generation:**
- Input: ~500-800 tokens (~$0.01)
- Output: ~1000-1500 tokens (~$0.03)
- **Total: ~$0.04 per generation**

**Cost Optimization:**
1. ✅ Automatic caching (plans cached for 7 days)
2. ✅ Only regenerate on user request
3. ✅ Use `getDashboardData()` helper (checks cache first)

**Estimated Monthly Cost:**
- 1000 users × 1 generation = $40
- 1000 users × 2 generations = $80

## 🧪 Testing

### Local Testing

```bash
# Start local Supabase
supabase start

# Set local env
$env:OPENAI_API_KEY="sk-your-key"

# Serve function locally
supabase functions serve generate-dashboard

# Test it
curl -X POST http://localhost:54321/functions/v1/generate-dashboard `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{\"scan_id\": \"uuid-here\"}'
```

### Production Testing

```typescript
import { getDashboardData } from "@/lib/ai";

// In your component
try {
  const data = await getDashboardData(user.id, scanId);
  console.log("Generated data:", data);
} catch (error) {
  console.error("Failed:", error);
}
```

## 📊 Monitoring

### View Logs

```bash
supabase functions logs generate-dashboard
```

### Check Metrics

Go to Supabase Dashboard:
- **Edge Functions** → `generate-dashboard`
- View invocations, errors, latency

### OpenAI Usage

Go to OpenAI Dashboard:
- **Usage** → Monitor token usage and costs

## 🔧 Customization

### Change AI Model

Edit `supabase/functions/generate-dashboard/index.ts`:

```typescript
// Current (most powerful)
model: "gpt-4-turbo-2024-04-09"

// Alternative (faster, cheaper)
model: "gpt-4-1106-preview"

// Budget option (not recommended)
model: "gpt-3.5-turbo"
```

### Adjust Prompt

Edit the `userContext` string in the Edge Function to:
- Add more context
- Change tone/style
- Focus on specific aspects

### Modify Output Schema

Edit `responseSchema` in the Edge Function to:
- Add new fields
- Remove unused fields
- Change structure

## 🐛 Troubleshooting

### Error: "Unauthorized"
**Cause:** User not authenticated or invalid token

**Fix:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
// Ensure session exists before calling
```

### Error: "Scan not found"
**Cause:** scan_id doesn't exist or doesn't belong to user

**Fix:**
- Verify scan exists in database
- Check RLS policies on scans table
- Ensure scan belongs to current user

### Error: "Failed to generate dashboard data"
**Cause:** OpenAI API error (quota, invalid key, etc.)

**Fix:**
1. Check OPENAI_API_KEY is set: `supabase secrets list`
2. Verify API key has credits
3. Check OpenAI API status page
4. View detailed error in function logs

### Function not responding
**Cause:** Deployment issue or timeout

**Fix:**
```bash
# Redeploy
supabase functions deploy generate-dashboard

# Check deployment status
supabase functions list

# View logs
supabase functions logs generate-dashboard --limit 50
```

### Slow response (>30 seconds)
**Cause:** Large prompt or slow model

**Fix:**
- Use cached results when possible
- Switch to faster model (gpt-4-turbo)
- Optimize prompt length
- Increase function timeout (in supabase config)

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `supabase/functions/generate-dashboard/index.ts` | Edge Function code |
| `src/lib/ai.ts` | Frontend helper to call function |
| `GENERATED_PLANS_SETUP.sql` | Database schema for caching |
| `PROFILES_SETUP.sql` | User profiles table |
| `EDGE_FUNCTION_SETUP.md` | Detailed setup guide |
| `INTEGRATION_EXAMPLE.tsx` | Complete React example |

## 🎓 Best Practices

1. **Always check cache first**
   ```typescript
   const data = await getDashboardData(userId, scanId); // auto-checks cache
   ```

2. **Show loading states**
   - Generation takes 10-15 seconds
   - Display spinner and message

3. **Handle errors gracefully**
   - Network failures
   - API quota exceeded
   - Invalid data

4. **Add regenerate button**
   - Let users refresh their plan
   - Pass `forceRegenerate: true`

5. **Monitor costs**
   - Set up usage alerts in OpenAI dashboard
   - Review Supabase function invocations

## 🔮 Future Enhancements

- [ ] Support multiple language outputs
- [ ] Add image generation for before/after
- [ ] Real-time progress updates (streaming)
- [ ] A/B test different prompt styles
- [ ] User feedback loop (thumbs up/down)
- [ ] Historical plan comparison
- [ ] Export plan as PDF

## ❓ FAQ

**Q: Can I use gpt-3.5-turbo instead?**
A: Yes, but quality will be lower. Change `model` in Edge Function.

**Q: How often should plans be regenerated?**
A: Recommend once per week or on-demand by user.

**Q: What if user has no onboarding data?**
A: Function will use defaults, but results will be generic. Encourage onboarding completion.

**Q: Can I call this from mobile app?**
A: Yes! Same API endpoint, same authentication. Works with any HTTP client.

**Q: How do I see what the AI received as input?**
A: Check function logs: `supabase functions logs generate-dashboard`

## 📞 Support

- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)

## ✅ Checklist

Before going live:

- [ ] Edge Function deployed
- [ ] OPENAI_API_KEY secret set
- [ ] Database tables created (profiles, generated_plans)
- [ ] Frontend integration complete
- [ ] Loading states added
- [ ] Error handling implemented
- [ ] Tested with real user data
- [ ] Cost monitoring set up
- [ ] Usage alerts configured
- [ ] Caching working correctly

---

**Ready to launch?** Run `.\DEPLOY_EDGE_FUNCTION.ps1` and follow the prompts! 🚀
