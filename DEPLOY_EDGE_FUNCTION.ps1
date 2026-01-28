# PowerShell script to deploy the Edge Function

Write-Host "🚀 Deploying generate-dashboard Edge Function..." -ForegroundColor Cyan

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
}

# Check if OPENAI_API_KEY is set
Write-Host ""
Write-Host "📝 Checking environment variables..." -ForegroundColor Yellow
$apiKey = Read-Host "Enter your OpenAI API Key (or press Enter to skip if already set)"

if ($apiKey) {
    Write-Host "Setting OPENAI_API_KEY secret..." -ForegroundColor Green
    supabase secrets set OPENAI_API_KEY=$apiKey
} else {
    Write-Host "Skipping API key setup (assuming already configured)" -ForegroundColor Yellow
}

# Deploy the function
Write-Host ""
Write-Host "📦 Deploying function..." -ForegroundColor Green
supabase functions deploy generate-dashboard --no-verify-jwt=false

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run GENERATED_PLANS_SETUP.sql in Supabase SQL Editor"
Write-Host "2. Test the function with a scan_id"
Write-Host "3. Integrate into your dashboard component"
Write-Host ""
Write-Host "View logs: supabase functions logs generate-dashboard" -ForegroundColor Yellow
