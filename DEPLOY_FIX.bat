@echo off
echo ============================================
echo  DEPLOYING recommend-peptides Edge Function
echo ============================================
echo.

echo [1/3] Checking directory...
cd /d "C:\Users\wail\Desktop\mypepshi"
if %errorlevel% neq 0 (
    echo ERROR: Could not change to project directory
    pause
    exit /b 1
)
echo ✓ Directory OK

echo.
echo [2/3] Deploying function...
call npx supabase functions deploy recommend-peptides
if %errorlevel% neq 0 (
    echo.
    echo ❌ DEPLOYMENT FAILED
    echo Check the error messages above
    pause
    exit /b 1
)

echo.
echo [3/3] Deployment complete!
echo.
echo ============================================
echo  NEXT STEPS
echo ============================================
echo 1. Go to: https://supabase.com/dashboard
echo 2. Select your project
echo 3. Go to: Edge Functions → recommend-peptides → Logs
echo 4. Test the function from your app
echo 5. Check logs for success messages
echo.
echo Expected logs:
echo   ✓ User authenticated: [userId]
echo   ✓ AI recommendations: [count]
echo.
echo If you see 401 errors:
echo   - Check JWT token in request headers
echo   - Verify user is logged in
echo   - Check .env.local has correct SUPABASE_URL
echo.
echo ============================================

pause
