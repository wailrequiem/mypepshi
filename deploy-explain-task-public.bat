@echo off
echo Deploying explain-glowup-task Edge Function (PUBLIC - NO JWT)
echo ============================================================

supabase functions deploy explain-glowup-task --no-verify-jwt

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo SUCCESS! Function deployed as PUBLIC endpoint
    echo ============================================================
    echo.
    echo NEXT STEPS:
    echo 1. Test the info button in the Glow-Up Plan
    echo 2. Check browser Network tab for 200 response
    echo 3. Verify no 401 errors
    echo.
) else (
    echo.
    echo ============================================================
    echo DEPLOYMENT FAILED!
    echo ============================================================
    echo.
    echo Make sure you have:
    echo 1. Supabase CLI installed
    echo 2. Logged in: supabase login
    echo 3. Linked project: supabase link
    echo.
)

pause
