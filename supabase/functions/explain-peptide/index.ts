// Edge Function: explain-peptide (PUBLIC - NO JWT REQUIRED)
// Generates personalized AI explanations for peptide recommendations
// Deploy with: supabase functions deploy explain-peptide --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Debug flag for development logging
const DEBUG = false;

function log(...args: unknown[]) {
  if (DEBUG) {
    console.log("[EXPLAIN-PEPTIDE]", ...args);
  }
}

serve(async (req) => {
  log("Function invoked - method:", req.method);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    log("CORS preflight handled");
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Parse request body
    const body = await req.json();
    log("Request body:", JSON.stringify(body));

    const { peptide, userContext } = body;

    // Validate required fields
    if (!peptide || !peptide.name) {
      log("Missing required fields");
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: "Missing peptide.name" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("Generating explanation for:", peptide.name);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("[EXPLAIN-PEPTIDE] OpenAI API key not configured");
      return new Response(
        JSON.stringify({ ok: false, message: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context for AI
    const peptideInfo = [
      `Peptide Name: ${peptide.name}`,
      peptide.fit_score ? `Fit Score: ${peptide.fit_score}%` : null,
      peptide.tags && peptide.tags.length > 0 ? `Tags: ${peptide.tags.join(", ")}` : null,
      peptide.summary ? `Summary: ${peptide.summary}` : null,
    ].filter(Boolean).join("\n");

    // Add user context if available
    let userInfo = "";
    if (userContext) {
      if (userContext.scanScores) {
        userInfo += "User's Facial Analysis:\n";
        if (userContext.scanScores.skinQuality) userInfo += `- Skin Quality: ${userContext.scanScores.skinQuality}/100\n`;
        if (userContext.scanScores.jawline) userInfo += `- Jawline: ${userContext.scanScores.jawline}/100\n`;
        if (userContext.scanScores.eyeArea) userInfo += `- Eye Area: ${userContext.scanScores.eyeArea}/100\n`;
        if (userContext.scanScores.symmetry) userInfo += `- Symmetry: ${userContext.scanScores.symmetry}/100\n`;
        if (userContext.scanScores.overall) userInfo += `- Overall: ${userContext.scanScores.overall}/100\n`;
      }
      if (userContext.goals && userContext.goals.length > 0) {
        userInfo += `\nUser's Goals: ${userContext.goals.join(", ")}\n`;
      }
      if (userContext.notes) {
        userInfo += `\nUser's Notes: ${JSON.stringify(userContext.notes)}\n`;
      }
    }

    const systemPrompt = `You are a supportive wellness educator helping people understand peptides for appearance and health goals.

Generate a clear, personalized explanation for the given peptide following STRICT RULES.

STRICT RULES:
1. "why_this" = WHY this peptide is relevant for THIS USER
   - Connect to user's fit_score, tags, scanScores, and goals
   - Explain specific benefits that match their needs
   - Use words like: "addresses", "supports", "improves", "helps with"
   - Keep each bullet 1-2 sentences max
   - Max 3 bullets

2. "how_to_use_safely" = PRACTICAL SAFETY GUIDANCE (NO DOSING)
   - General safe usage principles (no specific dosages)
   - Storage, administration method (topical vs injectable)
   - When to use (time of day, with/without food if relevant)
   - Frame as educational, not prescriptive
   - Always emphasize: "This is educational only - consult a healthcare professional before use"
   - Max 3 bullets

3. "what_to_expect" = REALISTIC OUTCOMES
   - Timeline for typical results (weeks/months)
   - What users commonly report
   - Set realistic expectations
   - 2-3 sentences total

4. "warnings" = CRITICAL SAFETY INFO
   - Age restrictions (e.g., "Not recommended under 18")
   - Contraindications (pregnancy, medical conditions)
   - Legal/medical disclaimers
   - Interaction warnings if relevant
   - Max 3 bullets

RESPONSE FORMAT (STRICT JSON):
{
  "ok": true,
  "explanation": {
    "why_this": [
      "string - specific reason 1 tied to user context",
      "string - specific reason 2 tied to user context",
      "string - specific reason 3 tied to user context (optional)"
    ],
    "how_to_use_safely": [
      "string - practical guidance 1 (no dosing)",
      "string - practical guidance 2 (no dosing)",
      "string - practical guidance 3 (no dosing, optional)"
    ],
    "what_to_expect": "string - 2-3 sentences about realistic outcomes and timeline",
    "warnings": [
      "string - important warning 1",
      "string - important warning 2",
      "string - important warning 3 (optional)"
    ]
  }
}

Guidelines:
- Personalize using fit_score, tags, scanScores, and goals
- Be encouraging but realistic
- NO specific dosage instructions (refer to professional guidance)
- NO medical claims or guarantees
- NO negative or fear-mongering language
- If user has low scores in relevant areas, acknowledge gently and focus on improvement potential
- Always include disclaimer about consulting healthcare professionals
- Keep language clear and accessible (avoid heavy jargon)`;

    const userPrompt = peptideInfo + (userInfo ? `\n\nUser Context:\n${userInfo}` : "\n\nUser Context: Not provided");

    log("Calling OpenAI API...");

    // Call OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("[EXPLAIN-PEPTIDE] OpenAI error:", openaiResponse.status, errorText);
      return new Response(
        JSON.stringify({ ok: false, message: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiResponse.json();
    const aiContent = openaiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error("[EXPLAIN-PEPTIDE] No AI content returned");
      return new Response(
        JSON.stringify({ ok: false, message: "No AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse AI response
    let result;
    try {
      result = JSON.parse(aiContent);
    } catch (parseError) {
      console.error("[EXPLAIN-PEPTIDE] Failed to parse AI response:", parseError);
      return new Response(
        JSON.stringify({ ok: false, message: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate response structure
    if (!result.ok || !result.explanation) {
      console.error("[EXPLAIN-PEPTIDE] AI response missing required fields:", result);
      return new Response(
        JSON.stringify({ ok: false, message: "Incomplete AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const explanation = result.explanation;

    // Validate explanation structure with defaults
    const validatedExplanation = {
      why_this: Array.isArray(explanation.why_this) ? explanation.why_this : ["This peptide may support your wellness goals."],
      how_to_use_safely: Array.isArray(explanation.how_to_use_safely) ? explanation.how_to_use_safely : ["Consult a healthcare professional before use."],
      what_to_expect: typeof explanation.what_to_expect === 'string' ? explanation.what_to_expect : "Results vary by individual. Consult a professional for guidance.",
      warnings: Array.isArray(explanation.warnings) ? explanation.warnings : ["This is for educational purposes only. Not medical advice."]
    };

    log("Success - generated explanation");

    // Return success response
    return new Response(
      JSON.stringify({
        ok: true,
        explanation: validatedExplanation,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[EXPLAIN-PEPTIDE] Error:", error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        message: error.message || "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
