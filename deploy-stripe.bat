@echo off
echo ============================================
echo Deploying Stripe Edge Functions
echo ============================================

echo.
echo [1/2] Deploying stripe-checkout-starter...
supabase functions deploy stripe-checkout-starter

echo.
echo [2/2] Deploying stripe-webhook (no JWT verification)...
supabase functions deploy stripe-webhook --no-verify-jwt

echo.
echo ============================================
echo Deployment complete!
echo.
echo IMPORTANT: Configure these secrets in Supabase:
echo   - STRIPE_SECRET_KEY
echo   - STRIPE_PRICE_ID_ONETIME_1EUR
echo   - STRIPE_PRICE_ID_RECURRING
echo   - STRIPE_WEBHOOK_SECRET
echo.
echo Run: supabase secrets set STRIPE_SECRET_KEY=sk_xxx
echo ============================================
