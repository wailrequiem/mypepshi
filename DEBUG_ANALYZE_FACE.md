# Analyze-Face Edge Function - Fully Instrumented for Debugging

## Deployment Command Used
```powershell
supabase functions deploy analyze-face --no-verify-jwt
```

## Changes Made

### 1. Full Try/Catch Wrapper
- Entire handler wrapped in try/catch
- Returns structured error JSON on any failure:
  ```json
  {
    "ok": false,
    "step": "call_openai",
    "message": "OpenAI API error...",
    "name": "Error",
    "stack": "..."
  }
  ```

### 2. Granular Step Logging
Each step logs clearly:
- **STEP 0**: Checking environment variables (OPENAI_API_KEY, SUPABASE_URL, etc.)
- **STEP 1**: Validating authentication
- **STEP 2**: Parsing request body
- **STEP 3**: Validating images (type, presence, size)
- **STEP 4**: Reading user context (sex/age)
- **STEP 5**: Building OpenAI request
- **STEP 6**: Calling OpenAI API
- **STEP 7**: Parsing OpenAI response
- **STEP 8**: Applying potential boost (+5 capped at 95)
- **STEP 9**: Returning scores

### 3. Image Validation
- Validates images are strings
- Logs raw sizes and data URL prefix presence
- **Strips `data:image/jpeg;base64,` prefix** before sending to OpenAI
- Validates max size (15MB)

### 4. Environment Check
First thing checked:
```javascript
if (!openaiKey) {
  throw new Error("OPENAI_API_KEY missing in environment");
}
```

Returns:
```json
{
  "ok": false,
  "step": "env",
  "message": "OPENAI_API_KEY missing in environment"
}
```

### 5. Response Structure
Always returns:
```javascript
{
  overall: number,      // 0-100
  aspects: {
    skin_quality: number,
    cheekbones: number,
    eye_area: number,
    jawline_definition: number,
    facial_symmetry: number,
    potential: number   // +5 boost, capped at 95
  },
  notes: { ... },
  meta: { ... }
}
```

## How to Debug

### 1. Test the scan in your app
Go to http://localhost:8080 and complete the scan flow.

### 2. Check browser console
Look for:
```
📦 Final payload to Edge Function: { sex: 'male', age: 18, ... }
📥 Edge Function response: { hasData: ..., errorStatus: ..., errorMessage: ... }
```

### 3. Check Supabase Logs
Go to: https://supabase.com/dashboard/project/yufapyazxhjmjhonmfhd/functions

Click: **analyze-face** → **Logs**

You'll see:
```
🚀 === ANALYZE-FACE EDGE FUNCTION STARTED ===
STEP 0: Checking environment variables
ENV: { hasOpenAI: true, hasSupabaseUrl: true, hasSupabaseKey: true }
STEP 1: Validating authentication
✅ User authenticated: abc123...
STEP 2: Parsing request body
Body keys: ['front_image_base64', 'side_image_base64', 'sex', 'age']
STEP 3: Validating images
Raw image sizes: { frontLength: 50000, ... }
Base64 sizes after strip: { front: 45000, side: 48000 }
STEP 4: Reading user context (sex/age)
User context: { sex: 'male', age: 18 }
STEP 5: Building OpenAI request
Request ready. Payload size: 95000
STEP 6: Calling OpenAI API...
OpenAI response status: 200
STEP 7: Parsing OpenAI response
OpenAI data received. Has choices: true
Message content length: 1200
Analysis parsed. Has aspects: true
STEP 8: Applying potential boost (+5 capped at 95)
Potential: { original: 75, boosted: 80 }
Final scores: { overall: 78, skin: 75, ... }
STEP 9: Returning scores
✅ === SUCCESS ===
```

### 4. If it fails, logs will show:
```
❌ === ERROR ===
Failed at step: call_openai
Error name: Error
Error message: OpenAI API error (401): Invalid API key
Error stack: ...
```

## Most Common Issues

### 1. OPENAI_API_KEY Missing
**Logs show:**
```
Failed at step: env
Error message: OPENAI_API_KEY missing in environment
```

**Fix:**
```powershell
supabase secrets set OPENAI_API_KEY=sk-your-actual-key
```

### 2. Invalid OpenAI Key
**Logs show:**
```
Failed at step: call_openai
OpenAI response status: 401
Error message: OpenAI API error (401): Incorrect API key...
```

**Fix:** Check your OpenAI API key at https://platform.openai.com/api-keys

### 3. Images Too Large
**Logs show:**
```
Failed at step: validate_images
Error message: Images too large: front=20000000, side=18000000, max=15000000
```

**Fix:** Already implemented image compression in frontend (should auto-compress to ~500KB-1MB)

### 4. OpenAI Rate Limit
**Logs show:**
```
Failed at step: call_openai
OpenAI response status: 429
Error message: Rate limit exceeded
```

**Fix:** Wait or upgrade OpenAI plan

## Next Steps

1. **Run a test scan** in your app
2. **Check browser console** for the error response
3. **Check Supabase logs** for detailed step-by-step execution
4. **Report back** with:
   - The exact step it failed at
   - The error message
   - Any relevant log snippets
