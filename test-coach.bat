@echo off
echo ========================================
echo   Testing AI Coach End-to-End
echo ========================================
echo.

echo [Step 1] Checking if Edge Function is deployed...
supabase functions list | findstr "coach-chat"
if %errorlevel% neq 0 (
    echo.
    echo WARNING: coach-chat function not found!
    echo Run: supabase functions deploy coach-chat --no-verify-jwt
    echo.
)

echo.
echo [Step 2] Checking if OpenAI API key is set...
supabase secrets list | findstr "OPENAI_API_KEY"
if %errorlevel% neq 0 (
    echo.
    echo WARNING: OPENAI_API_KEY not set!
    echo Run: supabase secrets set OPENAI_API_KEY=sk-your-key-here
    echo.
)

echo.
echo [Step 3] Starting dev server...
echo.
echo ========================================
echo   Instructions:
echo ========================================
echo.
echo 1. Open browser DevTools (F12)
echo 2. Go to Console tab
echo 3. Navigate to Dashboard -^> Coach tab
echo 4. Send a test message
echo.
echo Expected in Console:
echo   - 🚀 [CoachTab] sendMessage fired
echo   - 📤 [CoachTab] Sending message...
echo   - ✅ [coach] Reply received
echo   - ✅ [CoachTab] Success!
echo.
echo Expected in UI:
echo   - Loading indicator (typing dots)
echo   - Reply appears in chat
echo   - No red debug box
echo.
echo Expected in Network tab:
echo   - POST /functions/v1/coach-chat
echo   - Status: 200
echo   - Response: {"ok":true,"reply":"..."}
echo.
echo If you see errors:
echo   - Check red debug box at bottom
echo   - Check console logs
echo   - See COACH_DEBUG_GUIDE.md
echo.
echo ========================================
echo.
pause

npm run dev
