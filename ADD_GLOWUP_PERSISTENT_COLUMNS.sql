-- Glow-Up Plan Persistent State Columns
-- Add these columns to the scans table to support persistent Glow-Up Plan with auto-reset

ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS glow_up_plan jsonb;

ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS glow_up_start_date timestamptz;

ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS glow_up_progress jsonb;

-- Optional: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS scans_glow_up_start_date_idx ON public.scans(glow_up_start_date);
CREATE INDEX IF NOT EXISTS scans_user_created_idx ON public.scans(user_id, created_at DESC);

-- Example data structures:
-- glow_up_plan: { "weeks": [ { "week": 1, "title": "Foundation Week", "days": [...] } ] }
-- glow_up_start_date: '2026-01-26T12:00:00Z'
-- glow_up_progress: { "completedDays": [0, 1, 5, 7], "updatedAt": "2026-01-27T10:30:00Z" }
