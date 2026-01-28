# Deploy explain-glowup-task Edge Function (PUBLIC - NO JWT)
# This script deploys the task explanation function as a public endpoint

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Deploying explain-glowup-task Edge Function (PUBLIC)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

supabase functions deploy explain-glowup-task --no-verify-jwt

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "SUCCESS! Function deployed as PUBLIC endpoint" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Test the info button in the Glow-Up Plan" -ForegroundColor White
    Write-Host "2. Check browser Network tab for 200 response" -ForegroundColor White
    Write-Host "3. Verify no 401 errors" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "DEPLOYMENT FAILED!" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you have:" -ForegroundColor Yellow
    Write-Host "1. Supabase CLI installed" -ForegroundColor White
    Write-Host "2. Logged in: supabase login" -ForegroundColor White
    Write-Host "3. Linked project: supabase link" -ForegroundColor White
    Write-Host ""
}
