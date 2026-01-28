# Generate Dashboard Edge Function

## Environment Variables Required

```bash
OPENAI_API_KEY=sk-your-openai-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Deploy

```bash
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase functions deploy generate-dashboard
```

## Test

```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-dashboard \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scan_id": "uuid-here"}'
```
