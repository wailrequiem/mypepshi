import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      return new Response(
        JSON.stringify({
          ok: true,
          data: scanData.peptide_recommendations,
          cached: true
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🔄 [recommend-peptides] No cached recommendations, generating new ones...");

    // 5. Fetch onboarding data using scan's user_id
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

    // 6. Build AI prompt
    const systemPrompt = `You are an AI peptide recommendation system.

Your job: Analyze the user's facial scan results and onboarding data, then recommend 3-5 peptides that best match their needs.

STRICT OUTPUT FORMAT (JSON only):
{
  "peptides": [
    {
      "name": "GHK-Cu",
      "fit_score": 95,
      "tags": ["Skin repair", "Collagen boost", "Anti-aging"],
      "summary": "A copper peptide that supports skin regeneration and improves overall skin quality."
    }
  ]
}

SELECTION RULES:
1. Select peptides dynamically based on the user's scan scores and goals
2. Prioritize peptides that address low scoring areas (skin quality, jawline, etc.)
3. fit_score should be 85-95 for top matches
4. Recommend 3-5 peptides total
5. Focus on well-known, research-backed peptides
6. Tags should be short, benefit-focused (2-4 words each)
7. Summary should be 1-2 sentences explaining the peptide's benefits

PEPTIDE SELECTION GUIDELINES:
- Low skin quality scores → GHK-Cu, Matrixyl 3000, Copper peptides
- Wrinkles/aging concerns → Argireline, Matrixyl, Snap-8
- Volume/definition needs → Collagen peptides, GHK-Cu
- Eye area concerns → Eyeseryl, Haloxyl, Eyeliss
- Overall improvement → Broad-spectrum peptides like GHK-Cu

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

    // 9. Build the final recommendations object
    const recommendations = {
      generated_at: new Date().toISOString(),
      peptides: aiResponse.peptides || []
    };

    // 10. Save recommendations to database
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

    // 11. Return response
    return new Response(
      JSON.stringify({
        ok: true,
        data: recommendations,
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
