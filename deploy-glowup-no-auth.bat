@echo off
echo.
echo ========================================
echo  Deploying Glow-Up Plan (NO AUTH)
echo ========================================
echo.
echo Deploying generate-glowup-plan edge function...
echo IMPORTANT: Using --no-verify-jwt flag
echo.

cd /d "%~dp0"

supabase functions deploy generate-glowup-plan --no-verify-jwt

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  ✅ DEPLOYMENT SUCCESSFUL
    echo ========================================
    echo.
    echo The Glow-Up Plan is now:
    echo  - AI-generated using OpenAI gpt-4o-mini
    echo  - NO JWT / NO AUTH required
    echo  - Public endpoint for everyone
    echo  - Fresh plan generated each time
    echo.
) else (
    echo.
    echo ========================================
    echo  ❌ DEPLOYMENT FAILED
    echo ========================================
    echo.
    echo Please check:
    echo  1. Supabase CLI is installed
    echo  2. You're logged in: supabase login
    echo  3. Project is linked: supabase link
    echo  4. OPENAI_API_KEY secret is set
    echo.
)

pause
