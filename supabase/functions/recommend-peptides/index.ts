import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types
interface PeptideKnowledge {
  name: string;
  aliases: string[] | null;
  category: string | null;
  goal_tags: string[] | null;
  mechanism: string | null;
  benefits: string | null;
  risks: string | null;
  contraindications: string | null;
  evidence_level: string | null;
  notes: string | null;
}

interface RecommendedPeptide {
  name: string;
  fit_score: number;
  tags: string[];
  summary: string;
  reasons: string[];
}

/**
 * Fetch peptides knowledge base from Supabase
 */
async function getPeptidesKnowledge(supabase: any): Promise<PeptideKnowledge[]> {
  console.log("📚 [recommend-peptides] Fetching peptides_knowledge...");
  
  const { data, error } = await supabase
    .from("peptides_knowledge")
    .select("name, aliases, category, goal_tags, mechanism, benefits, risks, contraindications, evidence_level, notes")
    .limit(200);

  if (error) {
    console.error("❌ [recommend-peptides] Error fetching peptides_knowledge:", error);
    throw new Error(`Failed to fetch peptides knowledge: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.warn("⚠️ [recommend-peptides] peptides_knowledge table is empty!");
    throw new Error("peptides_knowledge table is empty. Please populate it with peptide data.");
  }

  console.log(`✅ [recommend-peptides] Loaded peptides_knowledge count=${data.length}`);
  return data;
}

/**
 * Build compact knowledge pack for AI prompt (max ~500 chars per peptide)
 */
function buildKnowledgePack(peptides: PeptideKnowledge[]): string {
  const peptideDescriptions = peptides.map((p, idx) => {
    // Safely handle aliases (might be string, array, or null)
    let aliasesArray: string[] = [];
    if (p.aliases) {
      if (Array.isArray(p.aliases)) {
        aliasesArray = p.aliases;
      } else if (typeof p.aliases === 'string') {
        try {
          aliasesArray = JSON.parse(p.aliases);
        } catch {
          aliasesArray = [p.aliases];
        }
      }
    }
    const aliases = aliasesArray.length > 0 ? ` (aka: ${aliasesArray.join(", ")})` : "";
    
    // Safely handle goal_tags
    let goalTagsArray: string[] = [];
    if (p.goal_tags) {
      if (Array.isArray(p.goal_tags)) {
        goalTagsArray = p.goal_tags;
      } else if (typeof p.goal_tags === 'string') {
        try {
          goalTagsArray = JSON.parse(p.goal_tags);
        } catch {
          goalTagsArray = [p.goal_tags];
        }
      }
    }
    const goalTags = goalTagsArray.length > 0 ? `\n  Goals: ${goalTagsArray.join(", ")}` : "";
    
    const category = p.category ? ` [${p.category}]` : "";
    const mechanism = p.mechanism ? `\n  Mechanism: ${p.mechanism.substring(0, 150)}${p.mechanism.length > 150 ? "..." : ""}` : "";
    const benefits = p.benefits ? `\n  Benefits: ${p.benefits.substring(0, 150)}${p.benefits.length > 150 ? "..." : ""}` : "";
    const risks = p.risks ? `\n  Risks: ${p.risks.substring(0, 100)}${p.risks.length > 100 ? "..." : ""}` : "";
    const contraindications = p.contraindications ? `\n  Contraindications: ${p.contraindications.substring(0, 100)}${p.contraindications.length > 100 ? "..." : ""}` : "";
    const evidence = p.evidence_level ? `\n  Evidence Level: ${p.evidence_level}` : "";
    
    return `${idx + 1}. ${p.name}${aliases}${category}${goalTags}${mechanism}${benefits}${risks}${contraindications}${evidence}`;
  }).join("\n\n");

  return peptideDescriptions;
}

/**
 * Find best matching peptide from knowledge base (exact name or alias match)
 */
function findPeptideMatch(aiPeptideName: string, knowledgeBase: PeptideKnowledge[]): PeptideKnowledge | null {
  const normalized = aiPeptideName.toLowerCase().trim();
  
  // Helper to safely get aliases array
  const getAliasesArray = (p: PeptideKnowledge): string[] => {
    if (!p.aliases) return [];
    if (Array.isArray(p.aliases)) return p.aliases;
    if (typeof p.aliases === 'string') {
      try {
        const parsed = JSON.parse(p.aliases);
        return Array.isArray(parsed) ? parsed : [p.aliases];
      } catch {
        return [p.aliases];
      }
    }
    return [];
  };
  
  // Try exact name match first
  let match = knowledgeBase.find(p => p.name.toLowerCase() === normalized);
  if (match) return match;
  
  // Try alias match
  match = knowledgeBase.find(p => {
    const aliases = getAliasesArray(p);
    return aliases.some(alias => alias.toLowerCase() === normalized);
  });
  if (match) return match;
  
  // Try partial match (contains)
  match = knowledgeBase.find(p => 
    p.name.toLowerCase().includes(normalized) || 
    normalized.includes(p.name.toLowerCase())
  );
  if (match) return match;
  
  // Try alias partial match
  match = knowledgeBase.find(p => {
    const aliases = getAliasesArray(p);
    return aliases.some(alias => 
      alias.toLowerCase().includes(normalized) || 
      normalized.includes(alias.toLowerCase())
    );
  });
  
  return match || null;
}

/**
 * Validate and correct AI recommendations against knowledge base
 */
function validateRecommendations(
  aiPeptides: any[], 
  knowledgeBase: PeptideKnowledge[]
): RecommendedPeptide[] {
  const validated: RecommendedPeptide[] = [];
  
  for (const aiPeptide of aiPeptides) {
    const match = findPeptideMatch(aiPeptide.name, knowledgeBase);
    
    if (!match) {
      console.warn(`⚠️ [recommend-peptides] Peptide not found in knowledge base: "${aiPeptide.name}" - dropping`);
      continue;
    }
    
    // Use the canonical name from knowledge base
    const canonicalName = match.name;
    if (canonicalName !== aiPeptide.name) {
      console.log(`🔄 [recommend-peptides] Matched "${aiPeptide.name}" → "${canonicalName}"`);
    }
    
    // Build the validated recommendation
    validated.push({
      name: canonicalName,
      fit_score: aiPeptide.fit_score || 85,
      tags: aiPeptide.tags || [],
      summary: aiPeptide.summary || "",
      reasons: aiPeptide.reasons || []
    });
  }
  
  return validated;
}

serve(async (req) => {
  console.log("🧬 [recommend-peptides] Function invoked");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Parse request body with detailed logging
    const rawBody = await req.text();
    console.log("📦 [recommend-peptides] RAW_BODY:", rawBody);
    
    let body = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch (parseError) {
      console.error("❌ [recommend-peptides] INVALID_JSON:", parseError.message);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "INVALID_JSON",
          message: "Request body must be valid JSON",
          received: rawBody 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("📋 [recommend-peptides] BODY_KEYS:", Object.keys(body || {}));
    console.log("📋 [recommend-peptides] BODY_VALUES:", body);
    
    // Accept both scan_id and scanId
    const scan_id = body.scan_id || body.scanId;
    
    if (!scan_id) {
      console.error("❌ [recommend-peptides] MISSING_SCAN_ID");
      console.error("📋 [recommend-peptides] Received body:", body);
      return new Response(
        JSON.stringify({ 
          ok: false,
          error: "MISSING_SCAN_ID",
          message: "scan_id or scanId is required in request body",
          received: body 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ [recommend-peptides] scan_id extracted:", scan_id);

    // 2. Initialize Supabase client (NO JWT - using service role for now)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    console.log("🔗 [recommend-peptides] Creating Supabase client (service role)");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("📋 [recommend-peptides] Processing scan:", scan_id);

    // 3. Fetch the specific scan
    const { data: scanData, error: scanError } = await supabase
      .from("scans")
      .select("id, user_id, scores_json, peptide_recommendations")
      .eq("id", scan_id)
      .single();

    if (scanError || !scanData) {
      console.error("❌ [recommend-peptides] Scan not found:", scanError);
      return new Response(
        JSON.stringify({ 
          ok: false,
          error: "SCAN_NOT_FOUND",
          message: "Scan not found",
          scanId: scan_id 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ [recommend-peptides] Scan loaded:", scan_id);
    console.log("📊 [recommend-peptides] Scan user_id:", scanData.user_id);

    // 4. Check if recommendations already exist
    if (scanData.peptide_recommendations) {
      console.log("✅ [recommend-peptides] Returning cached recommendations");
      const cachedPeptides = scanData.peptide_recommendations.peptides || [];
      return new Response(
        JSON.stringify({
          ok: true,
          recommended_peptides: cachedPeptides,
          cached: true
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🔄 [recommend-peptides] No cached recommendations, generating new ones...");
    console.log(`📋 [recommend-peptides] Using scanId=${scan_id} userId=${scanData.user_id}`);

    // 5. Fetch peptides knowledge base
    const peptidesKnowledge = await getPeptidesKnowledge(supabase);
    const knowledgePack = buildKnowledgePack(peptidesKnowledge);
    const validPeptideNames = peptidesKnowledge.map(p => p.name).join(", ");

    // 6. Fetch onboarding data using scan's user_id
    let onboardingData = {};
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_json")
        .eq("id", scanData.user_id)
        .single();

      if (profile?.onboarding_json) {
        onboardingData = profile.onboarding_json;
        console.log("✅ [recommend-peptides] Onboarding data loaded");
      }
    } catch (err) {
      console.log("⚠️ [recommend-peptides] Could not fetch onboarding:", err);
    }

    // 7. Build AI prompt with knowledge base
    const systemPrompt = `You are an AI peptide recommendation system.

Your job: Analyze the user's facial scan results and onboarding data, then recommend 3-5 peptides from the APPROVED PEPTIDES KNOWLEDGE BASE that best match their needs.

⚠️ CRITICAL SAFETY REQUIREMENTS:
- Recommendations are EDUCATIONAL ONLY - no dosage instructions, no injection protocols
- Include caution line in summary if evidence_level is weak or contraindications exist
- Do not recommend peptides with serious contraindications for the user's profile
- Focus on benefits and educational information only

📚 APPROVED PEPTIDES KNOWLEDGE BASE:
You MUST select peptides ONLY from this list. Do not make up or suggest peptides not in this list.

${knowledgePack}

VALID PEPTIDE NAMES (use exact names or aliases):
${validPeptideNames}

STRICT OUTPUT FORMAT (JSON only):
{
  "peptides": [
    {
      "name": "GHK-Cu",
      "fit_score": 92,
      "tags": ["Skin repair", "Collagen boost", "Anti-aging"],
      "summary": "A copper peptide that supports skin regeneration and improves overall skin quality. Moderate evidence base.",
      "reasons": ["Addresses low skin quality score", "Supports collagen production", "Well-researched peptide"]
    }
  ]
}

SELECTION RULES:
1. Select peptides ONLY from the knowledge base above
2. Use exact peptide names as they appear in the knowledge base (or their aliases)
3. Prioritize peptides that address the user's low scoring areas and stated goals
4. fit_score should be 85-95 for top matches (higher = better fit)
5. Recommend 3-5 peptides total
6. Consider evidence_level (prefer higher evidence peptides when available)
7. Avoid peptides with contraindications relevant to user profile
8. Tags should be short, benefit-focused (2-4 words each), derived from goal_tags and benefits
9. Summary should be 1-2 sentences: explain benefits + add caution if weak evidence/contraindications
10. Reasons should explain WHY this peptide matches the user (3-5 specific reasons)

MATCHING STRATEGY:
- Low skin quality scores → Look for peptides with "skin quality", "collagen", "repair" in goal_tags
- Wrinkles/aging concerns → Look for "anti-aging", "wrinkles", "elasticity" in goal_tags
- Volume/definition needs → Look for "volume", "definition", "structure" in goal_tags
- Eye area concerns → Look for "eye area", "dark circles", "puffiness" in goal_tags
- Match user's stated goals from onboarding to peptide goal_tags

Return ONLY valid JSON, no markdown, no code blocks.`;

    const userContext = `
USER PROFILE:
- Age: ${onboardingData.age || "N/A"}
- Gender: ${onboardingData.gender || "N/A"}
- Main goals: ${onboardingData.goals?.join(", ") || "N/A"}
- Skincare concerns: ${onboardingData.concerns?.join(", ") || "N/A"}

FACIAL ANALYSIS SCORES (areas needing improvement):
- Overall: ${scanData.scores_json?.overall || "N/A"}/100
- Skin Quality: ${scanData.scores_json?.skinQuality || scanData.scores_json?.skin_quality || "N/A"}/100
- Jawline: ${scanData.scores_json?.jawline || "N/A"}/100
- Cheekbones: ${scanData.scores_json?.cheekbones || "N/A"}/100
- Eye Area: ${scanData.scores_json?.eyeArea || scanData.scores_json?.eye_area || "N/A"}/100
- Symmetry: ${scanData.scores_json?.symmetry || "N/A"}/100
- Potential: ${scanData.scores_json?.facialPotential || scanData.scores_json?.facial_potential || scanData.scores_json?.potential || "N/A"}/100

Based on this profile and scan results, recommend 3-5 peptides that would be most beneficial.
Return ONLY valid JSON matching the exact format specified.`;

    // 7. Call OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    console.log("🤖 [recommend-peptides] Calling OpenAI...");
    console.log("📊 [recommend-peptides] Context:", {
      hasOnboarding: !!Object.keys(onboardingData).length,
      scanId: scan_id,
      overallScore: scanData.scores_json?.overall
    });

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContext },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ [recommend-peptides] OpenAI error:", errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const reply = openaiData.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("No reply from OpenAI");
    }

    // 8. Parse and validate response
    let aiResponse;
    try {
      aiResponse = JSON.parse(reply);
      console.log("✅ [recommend-peptides] AI returned", aiResponse.peptides?.length || 0, "recommendations");
    } catch (err) {
      console.error("❌ [recommend-peptides] Failed to parse AI response:", err);
      console.error("Raw response:", reply);
      throw new Error("Invalid AI response format");
    }

    // 9. Validate recommendations against knowledge base
    const validatedPeptides = validateRecommendations(
      aiResponse.peptides || [], 
      peptidesKnowledge
    );

    if (validatedPeptides.length === 0) {
      console.warn("⚠️ [recommend-peptides] No valid peptides matched from AI response");
      throw new Error("AI did not recommend any peptides from the knowledge base");
    }

    console.log(`✅ [recommend-peptides] Final recommended peptides=${validatedPeptides.length}:`, 
      validatedPeptides.map(p => p.name).join(", ")
    );

    // 10. Build the final recommendations object
    const recommendations = {
      generated_at: new Date().toISOString(),
      peptides: validatedPeptides
    };

    // 11. Save recommendations to database
    const { error: updateError } = await supabase
      .from("scans")
      .update({ 
        peptide_recommendations: recommendations 
      })
      .eq("id", scan_id)
      .eq("user_id", scanData.user_id);
    
    if (updateError) {
      console.error("❌ [recommend-peptides] Failed to save recommendations:", updateError);
      throw new Error("Failed to save recommendations to database");
    }
    
    console.log("✅ [recommend-peptides] Recommendations saved to scan:", scan_id);

    // 12. Return response
    return new Response(
      JSON.stringify({
        ok: true,
        recommended_peptides: validatedPeptides,
        cached: false
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ [recommend-peptides] FATAL ERROR:", error);
    console.error("❌ [recommend-peptides] Error message:", error.message);
    console.error("❌ [recommend-peptides] Error stack:", error.stack);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return new Response(
      JSON.stringify({ 
        ok: false, 
        message: error.message || "Internal server error",
        data: null
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
