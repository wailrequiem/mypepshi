# Deploy explain-glowup-task Edge Function
# This script deploys the AI task explanation feature

Write-Host "🚀 Deploying explain-glowup-task Edge Function..." -ForegroundColor Cyan

# Deploy the function
supabase functions deploy explain-glowup-task

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Edge function deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Make sure you have set the OPENAI_API_KEY secret:" -ForegroundColor Yellow
    Write-Host "   supabase secrets set OPENAI_API_KEY=sk-your-key" -ForegroundColor Gray
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
