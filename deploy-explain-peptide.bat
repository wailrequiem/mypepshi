@echo off
echo ========================================
echo Deploying explain-peptide Edge Function
echo ========================================
echo.
echo This function generates AI explanations for peptides (NO JWT required)
echo.

supabase functions deploy explain-peptide --no-verify-jwt

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo The explain-peptide function is now live and accessible without authentication.
echo.
pause
