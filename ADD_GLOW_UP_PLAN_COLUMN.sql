-- Add glow_up_plan column to scans table
-- This stores the AI-generated personalized 4-week glow-up plan

ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS glow_up_plan JSONB;

-- Add index for faster queries on plans
CREATE INDEX IF NOT EXISTS scans_glow_up_plan_idx ON public.scans USING GIN (glow_up_plan);

-- Example structure:
-- {
--   "weeks": [
--     {
--       "week": 1,
--       "status": "active",
--       "days": [
--         {
--           "day": 1,
--           "title": "Mewing Basics",
--           "description": "Learn correct tongue posture to improve jawline engagement.",
--           "difficulty": "easy",
--           "duration_minutes": 5
--         }
--       ]
--     }
--   ]
-- }
