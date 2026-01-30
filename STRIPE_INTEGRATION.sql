-- =============================================
-- STRIPE INTEGRATION SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Table: stripe_customers
-- Links Supabase users to Stripe customers
CREATE TABLE IF NOT EXISTS public.stripe_customers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: subscriptions
-- Tracks user subscription status
CREATE TABLE IF NOT EXISTS public.subscriptions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'inactive',
    -- Status values: 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'inactive'
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for stripe_customers
-- Users can only read their own stripe_customer record
CREATE POLICY "Users can view own stripe_customer" 
    ON public.stripe_customers 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Service role can do everything (for Edge Functions)
CREATE POLICY "Service role full access on stripe_customers" 
    ON public.stripe_customers 
    FOR ALL 
    USING (auth.jwt()->>'role' = 'service_role');

-- 5. RLS Policies for subscriptions
-- Users can only read their own subscription
CREATE POLICY "Users can view own subscription" 
    ON public.subscriptions 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Service role can do everything (for Edge Functions/Webhooks)
CREATE POLICY "Service role full access on subscriptions" 
    ON public.subscriptions 
    FOR ALL 
    USING (auth.jwt()->>'role' = 'service_role');

-- 6. Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id 
    ON public.stripe_customers(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
    ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end 
    ON public.subscriptions(current_period_end);

-- 7. Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger for subscriptions updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VERIFICATION QUERIES (run after setup)
-- =============================================

-- Check tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('stripe_customers', 'subscriptions');

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('stripe_customers', 'subscriptions');

-- Check policies:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
