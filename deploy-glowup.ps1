# Deploy generate-glowup-plan Edge Function
# Run this from the project root: ./deploy-glowup.ps1

Write-Host "🚀 Deploying generate-glowup-plan Edge Function..." -ForegroundColor Cyan

# Deploy the function
supabase functions deploy generate-glowup-plan

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run ADD_GLOW_UP_PLAN_COLUMN.sql in Supabase Dashboard (SQL Editor)" -ForegroundColor White
    Write-Host "2. Test the glow-up plan in your app" -ForegroundColor White
    Write-Host "3. Check browser console for [GLOWUP] logs" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check error messages above and try again." -ForegroundColor Yellow
}
