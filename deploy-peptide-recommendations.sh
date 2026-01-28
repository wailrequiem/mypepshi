#!/bin/bash

# Deploy AI Peptide Recommendations System
# This script deploys the complete AI-driven peptide recommendation feature

echo "🧬 Deploying AI Peptide Recommendations..."
echo ""

# Step 1: Deploy Edge Function
echo "📦 Step 1/2: Deploying recommend-peptides Edge Function..."
supabase functions deploy recommend-peptides --no-verify-jwt

if [ $? -eq 0 ]; then
  echo "✅ Edge Function deployed successfully"
else
  echo "❌ Edge Function deployment failed"
  exit 1
fi

echo ""

# Step 2: Reminder for SQL
echo "📊 Step 2/2: Database Migration"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "   1. Open Supabase Dashboard → SQL Editor"
echo "   2. Run ADD_PEPTIDE_RECOMMENDATIONS_COLUMN.sql"
echo "   3. Ensure PEPTIDES_KNOWLEDGE_TABLE.sql was already run"
echo ""
echo "   SQL File: ADD_PEPTIDE_RECOMMENDATIONS_COLUMN.sql"
echo "   Content:"
echo "   ALTER TABLE scans ADD COLUMN IF NOT EXISTS peptide_recommendations JSONB;"
echo ""

# Step 3: Test reminder
echo "🧪 Step 3/3: Testing"
echo ""
echo "To test the AI recommendations:"
echo "   1. npm run dev"
echo "   2. Complete onboarding with different answers"
echo "   3. Take a face scan"
echo "   4. Go to Dashboard"
echo "   5. Scroll to 'AI-Picked Peptides for Your Goals'"
echo "   6. Check browser console for:"
echo "      [PEPTIDES] AI peptides used: [...]"
echo ""
echo "Expected behavior:"
echo "   ✅ Different users see different peptides"
echo "   ✅ Peptides match user goals and scan scores"
echo "   ✅ fit_score is dynamic (not hardcoded 95%, 88%, 76%)"
echo "   ✅ No more always-GHK-Cu/BPC-157/Epithalon"
echo ""

echo "✅ Deployment complete!"
echo ""
echo "📖 Full documentation: AI_PEPTIDE_RECOMMENDATIONS.md"
