# PowerShell script to create profiles table in Supabase

Write-Host "🚀 Creating profiles table in Supabase..." -ForegroundColor Cyan

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
Write-Host "📝 Checking Supabase login status..." -ForegroundColor Yellow
$loginCheck = supabase projects list 2>&1

if ($loginCheck -like "*not logged in*" -or $loginCheck -like "*error*") {
    Write-Host "❌ Not logged in to Supabase. Please login first:" -ForegroundColor Red
    Write-Host "supabase login" -ForegroundColor Yellow
    exit 1
}

# Execute the SQL file
Write-Host "📦 Executing PROFILES_SETUP.sql..." -ForegroundColor Green

$sqlContent = Get-Content "PROFILES_SETUP.sql" -Raw

# Create a temporary SQL file for execution
$tempSql = "temp_profiles_setup.sql"
Set-Content -Path $tempSql -Value $sqlContent

# Execute via Supabase CLI
Write-Host "Running SQL..." -ForegroundColor Yellow
supabase db execute -f $tempSql

# Clean up
Remove-Item $tempSql -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Profiles table creation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Reload your app"
Write-Host "2. The 404 'profiles' errors should be gone"
Write-Host "3. Onboarding data will sync to Supabase after login"
Write-Host ""
