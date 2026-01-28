@echo off
echo ========================================
echo   Deploying Coach Chat Edge Function
echo ========================================
echo.

echo [1/3] Checking Supabase CLI...
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Supabase CLI not found!
    echo Please install: npm install -g supabase
    pause
    exit /b 1
)
echo ✅ Supabase CLI found

echo.
echo [2/3] Deploying coach-chat function...
supabase functions deploy coach-chat --no-verify-jwt

if %errorlevel% neq 0 (
    echo.
    echo ❌ Deployment failed!
    echo Please check your Supabase connection and try again.
    pause
    exit /b 1
)

echo.
echo [3/3] Verifying deployment...
supabase functions list

echo.
echo ========================================
echo   ✅ Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure OPENAI_API_KEY is set in Supabase secrets
echo 2. Test the coach in the Dashboard (Coach tab)
echo.
echo To set OpenAI API key:
echo   supabase secrets set OPENAI_API_KEY=sk-your-key-here
echo.
pause
