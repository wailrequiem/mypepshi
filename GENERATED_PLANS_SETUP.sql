-- Supabase SQL: Create generated_plans table for caching AI responses

CREATE TABLE IF NOT EXISTS public.generated_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, scan_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS generated_plans_user_id_idx ON public.generated_plans(user_id);
CREATE INDEX IF NOT EXISTS generated_plans_scan_id_idx ON public.generated_plans(scan_id);
CREATE INDEX IF NOT EXISTS generated_plans_created_at_idx ON public.generated_plans(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.generated_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own plans
CREATE POLICY "Users can view their own plans"
  ON public.generated_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own plans
CREATE POLICY "Users can insert their own plans"
  ON public.generated_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own plans
CREATE POLICY "Users can update their own plans"
  ON public.generated_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own plans
CREATE POLICY "Users can delete their own plans"
  ON public.generated_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get or generate plan
CREATE OR REPLACE FUNCTION get_or_generate_plan(p_scan_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cached_plan JSONB;
BEGIN
  -- Check if plan exists and is recent (less than 7 days old)
  SELECT plan_data INTO cached_plan
  FROM public.generated_plans
  WHERE user_id = auth.uid()
    AND scan_id = p_scan_id
    AND created_at > NOW() - INTERVAL '7 days'
  LIMIT 1;

  -- Return cached plan if exists
  IF cached_plan IS NOT NULL THEN
    RETURN cached_plan;
  END IF;

  -- Otherwise return null (frontend will call Edge Function)
  RETURN NULL;
END;
$$;
