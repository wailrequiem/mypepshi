-- Add peptide_recommendations column to scans table
-- This stores AI-generated peptide recommendations for each scan

ALTER TABLE scans 
ADD COLUMN IF NOT EXISTS peptide_recommendations JSONB;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_scans_peptide_recommendations 
ON scans USING GIN (peptide_recommendations);

-- Update comment
COMMENT ON COLUMN scans.peptide_recommendations IS 
'AI-generated peptide recommendations based on user profile and scan results. Format: [{"name": "...", "fit_score": 0-100, "tags": [...], "summary": "...", "why_selected": [...]}]';
