# Edge Function Returning 500 - How to Debug

## Status
✅ Frontend payload is correct (sex='male', age=18, images present)
❌ Edge Function returning 500 Internal Server Error

## Check Supabase Logs

1. Go to: https://supabase.com/dashboard/project/yufapyazxhjmjhonmfhd/functions
2. Click on `analyze-face`
3. Click "Logs" tab
4. Look for the most recent error

## Most Likely Issues

### 1. Missing OpenAI API Key
**Check if set:**
```powershell
supabase secrets list
```

**Should show:**
- OPENAI_API_KEY

**If missing, set it:**
```powershell
supabase secrets set OPENAI_API_KEY=sk-your-actual-openai-key
```

### 2. OpenAI API Error
- Invalid key
- Rate limit exceeded
- Model access denied (gpt-4o requires API access)
- Billing issue

### 3. Edge Function Runtime Error
Check logs for:
- JSON parsing errors
- Environment variable access errors
- Image size too large (OpenAI has limits)

## Expected Log Output (Success)
```
🔐 Auth header present: true
🔧 Supabase config: { hasUrl: true, hasKey: true, url: "..." }
👤 User validation: { hasUser: true, userId: "..." }
✅ User authenticated: ...
📨 Received request with keys: [...]
📦 Payload values: { sex: 'male', age: 18, ... }
👤 Resolved user context: { sex: 'male', age: 18 }
✅ Validation passed, calling OpenAI...
🤖 Raw OpenAI response received
✨ Applied potential boost: { ... }
✅ Final analysis complete: { overall: 75 }
```

## Quick Test
After checking logs, try this in terminal:
```powershell
supabase functions invoke analyze-face --method POST --body '{
  "front_image_base64": "test",
  "side_image_base64": "test",
  "sex": "male",
  "age": 18
}'
```

This will show the exact error message.
