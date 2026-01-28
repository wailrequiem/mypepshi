-- Create peptides_knowledge table for RAG
CREATE TABLE IF NOT EXISTS peptides_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  aliases TEXT[], -- Alternative names
  category TEXT, -- e.g., "skin", "recovery", "performance"
  goal_tags TEXT[], -- e.g., ["skin", "anti-aging", "collagen"]
  mechanism TEXT, -- How it works
  benefits TEXT, -- Key benefits
  risks TEXT, -- Potential risks
  contraindications TEXT, -- Who should avoid
  evidence_level TEXT, -- "high", "moderate", "low", "anecdotal"
  popular BOOLEAN DEFAULT false, -- Common peptides
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast tag search
CREATE INDEX IF NOT EXISTS idx_peptides_goal_tags ON peptides_knowledge USING GIN (goal_tags);
CREATE INDEX IF NOT EXISTS idx_peptides_popular ON peptides_knowledge (popular);

-- Insert sample peptides knowledge
INSERT INTO peptides_knowledge (name, aliases, category, goal_tags, mechanism, benefits, risks, contraindications, evidence_level, popular) VALUES
('BPC-157', ARRAY['Body Protection Compound'], 'recovery', ARRAY['recovery', 'healing', 'gut', 'joints', 'injury'], 
 'Promotes healing through angiogenesis and collagen synthesis. Derived from a protective protein found in gastric juice.',
 'Accelerates healing of tendons, ligaments, muscles, and gut. Reduces inflammation. May improve joint mobility.',
 'Generally well-tolerated. Potential for dizziness or nausea in some users. Long-term effects not fully studied.',
 'Not recommended during pregnancy or breastfeeding. Consult healthcare provider if you have blood disorders.',
 'moderate', true),

('TB-500', ARRAY['Thymosin Beta-4'], 'recovery', ARRAY['recovery', 'healing', 'injury', 'inflammation'],
 'Promotes cell migration and differentiation. Supports tissue repair and reduces inflammation.',
 'Accelerates wound healing. Reduces inflammation. May improve flexibility and reduce pain.',
 'Generally safe. Potential for mild injection site reactions. Limited long-term human studies.',
 'Avoid if pregnant, breastfeeding, or have active cancer.',
 'moderate', true),

('GHK-Cu', ARRAY['Copper Peptide'], 'skin', ARRAY['skin', 'anti-aging', 'collagen', 'hair', 'wound-healing'],
 'Copper-binding peptide that stimulates collagen and elastin production. Antioxidant and anti-inflammatory properties.',
 'Improves skin elasticity and firmness. Reduces fine lines. Promotes wound healing. May support hair growth.',
 'Generally safe for topical use. Copper sensitivity in rare cases. Avoid high oral doses.',
 'Not recommended if copper-sensitive or have Wilson\'s disease.',
 'high', true),

('Matrixyl (Palmitoyl Pentapeptide)', ARRAY['Pal-KTTKS'], 'skin', ARRAY['skin', 'anti-aging', 'wrinkles', 'collagen'],
 'Stimulates collagen, elastin, and hyaluronic acid production in skin.',
 'Reduces wrinkles and fine lines. Improves skin texture and firmness. Well-tolerated.',
 'Very safe for topical use. Minimal side effects.',
 'Generally safe. Patch test recommended for sensitive skin.',
 'high', true),

('Epithalon', ARRAY['Epitalon'], 'longevity', ARRAY['sleep', 'anti-aging', 'longevity', 'recovery'],
 'Tetrapeptide that may regulate melatonin production and telomerase activity.',
 'May improve sleep quality. Potential anti-aging effects. Supports circadian rhythm.',
 'Limited human research. Long-term effects unknown. May cause drowsiness.',
 'Avoid if pregnant or breastfeeding. Not enough data for long-term safety.',
 'low', false),

('Selank', ARRAY['TP-7'], 'cognitive', ARRAY['anxiety', 'focus', 'stress', 'mood'],
 'Synthetic peptide with anxiolytic and nootropic effects. Modulates GABA and serotonin.',
 'Reduces anxiety without sedation. Improves focus and mental clarity. Supports mood.',
 'Generally well-tolerated. May cause mild drowsiness or headache in some users.',
 'Not recommended during pregnancy. Use caution with other CNS medications.',
 'moderate', false),

('Semax', ARRAY['ACTH (4-10)'], 'cognitive', ARRAY['focus', 'cognitive', 'neuroprotection', 'stress'],
 'Neuropeptide that enhances cognitive function and protects brain cells.',
 'Improves focus, memory, and learning. Neuroprotective. Reduces stress effects on brain.',
 'Well-tolerated. Rare cases of overstimulation or anxiety at high doses.',
 'Caution with stimulants. Not recommended during pregnancy.',
 'moderate', false),

('Ipamorelin', ARRAY['NNC 26-0161'], 'performance', ARRAY['muscle', 'fat-loss', 'recovery', 'sleep'],
 'Growth hormone secretagogue. Stimulates GH release without affecting cortisol or prolactin.',
 'Supports muscle growth and recovery. May improve fat loss. Enhances sleep quality.',
 'Generally safe. Potential for water retention or increased hunger. Requires cycling.',
 'Avoid if you have active cancer or diabetic retinopathy. Not for those under 18.',
 'moderate', true),

('CJC-1295', ARRAY['DAC:GRF'], 'performance', ARRAY['muscle', 'recovery', 'fat-loss', 'anti-aging'],
 'Growth hormone releasing hormone analog. Extended half-life version.',
 'Supports muscle growth and fat loss. Improves recovery. May enhance sleep and skin.',
 'Generally safe when used properly. Potential for water retention. Requires monitoring.',
 'Not for those with active cancer, diabetic retinopathy, or under 18.',
 'moderate', true),

('Melanotan II', ARRAY['MT2'], 'other', ARRAY['skin', 'tanning', 'libido'],
 'Melanocortin receptor agonist. Stimulates melanin production.',
 'Promotes tanning. May increase libido. Reduces appetite in some users.',
 'Can cause nausea, flushing, increased libido (sometimes unwanted). Mole changes possible.',
 'Not for those with melanoma history or risk. Avoid during pregnancy. Monitor moles.',
 'low', false);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_peptides_knowledge_updated_at
BEFORE UPDATE ON peptides_knowledge
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
