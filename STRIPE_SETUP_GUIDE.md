# Stripe Integration Setup Guide

## Overview
This guide explains how to set up the "1€ trial for 3 days, then X€/month" payment flow.

## Architecture

```
┌─────────────┐    ┌──────────────────────┐    ┌─────────────┐
│   Frontend  │───▶│ stripe-checkout-     │───▶│   Stripe    │
│   (React)   │    │ starter              │    │  Checkout   │
└─────────────┘    └──────────────────────┘    └─────────────┘
                                                      │
                                                      ▼
┌─────────────┐    ┌──────────────────────┐    ┌─────────────┐
│   Supabase  │◀───│ stripe-webhook       │◀───│   Stripe    │
│     DB      │    │                      │    │  Webhooks   │
└─────────────┘    └──────────────────────┘    └─────────────┘
```

## Step 1: Stripe Dashboard Setup

### 1.1 Create Products & Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create **Product 1: Trial Access**
   - Name: "MyPepMaxx Premium Trial"
   - Add Price: **1.00 USD** (one-time payment)
   - Note the `price_xxx` ID

3. Create **Product 2: Monthly Subscription**
   - Name: "MyPepMaxx Premium Monthly"
   - Add Price: **19.99 USD/month** (recurring)
   - Note the `price_xxx` ID

### 1.2 Set Up Webhook

1. Go to [Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://<your-project>.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

### 1.3 Get API Keys

1. Go to [Developers > API keys](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret key** (starts with `sk_live_` or `sk_test_`)

## Step 2: Database Setup

Run the SQL file in Supabase SQL Editor:

```sql
-- Copy contents from STRIPE_INTEGRATION.sql
```

Or via terminal:
```bash
# If using supabase CLI with local DB
supabase db push
```

## Step 3: Supabase Secrets

Set the required secrets:

```bash
# Set Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx

# Set Price IDs
supabase secrets set STRIPE_PRICE_ID_ONETIME_1EUR=price_xxxxx
supabase secrets set STRIPE_PRICE_ID_RECURRING=price_xxxxx

# Set Webhook Secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Verify secrets:
```bash
supabase secrets list
```

## Step 4: Deploy Edge Functions

```bash
# Deploy checkout function (requires JWT)
supabase functions deploy stripe-checkout-starter

# Deploy webhook (no JWT - Stripe needs to call it)
supabase functions deploy stripe-webhook --no-verify-jwt
```

Or use the script:
```bash
./deploy-stripe.bat
```

## Step 5: Test the Flow

### Test Mode
1. Use Stripe test keys (`sk_test_xxx`)
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry, any CVC

### Test Scenarios

1. **Happy Path:**
   - Sign up/Login
   - Click "Start Trial for 1€"
   - Complete checkout with test card
   - Verify redirect to dashboard
   - Check `subscriptions` table for `trialing` status

2. **Webhook Test:**
   - Use Stripe CLI: `stripe listen --forward-to https://xxx.supabase.co/functions/v1/stripe-webhook`
   - Or use Stripe Dashboard "Send test webhook"

3. **After Trial:**
   - Wait 3 days (or use Stripe Dashboard to advance subscription)
   - Verify status changes to `active` after first charge

## Frontend Usage

### Check Premium Access

```tsx
import { useSubscription } from "@/hooks/useSubscription";

function MyComponent() {
  const { isPremium, isTrialing, daysRemaining, isLoading } = useSubscription();

  if (isLoading) return <Loading />;

  if (!isPremium) {
    return <Paywall />;
  }

  return (
    <div>
      {isTrialing && <Badge>Trial: {daysRemaining} days left</Badge>}
      <PremiumContent />
    </div>
  );
}
```

### Start Checkout

```tsx
import { redirectToCheckout } from "@/lib/stripe";

async function handleSubscribe() {
  const result = await redirectToCheckout();
  if (result?.error) {
    alert(result.error);
  }
  // User will be redirected to Stripe
}
```

## Subscription States

| Status | Meaning | Has Access |
|--------|---------|------------|
| `trialing` | In 3-day trial period | ✅ Yes |
| `active` | Paying subscriber | ✅ Yes |
| `past_due` | Payment failed, retry pending | ⚠️ Grace period |
| `canceled` | Subscription ended | ❌ No |
| `unpaid` | All retries failed | ❌ No |
| `inactive` / null | Never subscribed | ❌ No |

## Troubleshooting

### Webhook not receiving events
1. Check Supabase function logs: `supabase functions logs stripe-webhook`
2. Verify webhook URL is correct
3. Check webhook signing secret matches

### Checkout fails with 401
- Ensure user is authenticated before calling checkout
- Check JWT token is being sent in Authorization header

### Subscription not created after payment
1. Check `stripe-webhook` logs for errors
2. Verify `STRIPE_PRICE_ID_RECURRING` is set correctly
3. Check Stripe Dashboard for subscription creation attempts

### Customer already exists error
- This is handled gracefully - existing customers are reused
- Check `stripe_customers` table for duplicates

## Environment Variables

### Supabase Edge Functions (Secrets)
```
STRIPE_SECRET_KEY=sk_xxx
STRIPE_PRICE_ID_ONETIME_1EUR=price_xxx
STRIPE_PRICE_ID_RECURRING=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Frontend (.env)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
```

## Security Checklist

- [x] Stripe secret key only on server (Edge Functions)
- [x] Webhook signature verification enabled
- [x] RLS policies on subscription tables
- [x] User can only read their own subscription
- [x] Service role only for Edge Functions
- [x] HTTPS only for webhook endpoint

## Files Created

```
📁 supabase/functions/
├── stripe-checkout-starter/index.ts  # Creates checkout session
└── stripe-webhook/index.ts           # Handles Stripe events

📁 src/
├── lib/stripe.ts                     # Frontend Stripe helpers
└── hooks/useSubscription.ts          # React hook for subscription state

📄 STRIPE_INTEGRATION.sql             # Database schema
📄 STRIPE_SETUP_GUIDE.md              # This file
📄 deploy-stripe.bat                  # Deployment script
```
