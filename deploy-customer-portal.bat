@echo off
echo Deploying stripe-customer-portal edge function...
supabase functions deploy stripe-customer-portal --project-ref YOUR_PROJECT_REF
echo Done!
pause
