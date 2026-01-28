import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("🔔 [coach-chat] Function invoked");
  console.log("📍 [coach-chat] Method:", req.method);
  console.log("📍 [coach-chat] URL:", req.url);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ [coach-chat] CORS preflight handled");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get("Authorization");
    console.log("🔑 [coach-chat] Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("❌ [coach-chat] Missing authorization header");
      return new Response(
        JSON.stringify({ ok: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("❌ [coach-chat] Auth error:", authError);
      return new Response(
        JSON.stringify({ ok: false, error: "Auth error: " + authError.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!user) {
      console.error("❌ [coach-chat] No user found");
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized - no user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ [coach-chat] User authenticated:", user.id);

    // 2. Parse request
    const bodyText = await req.text();
    console.log("📦 [coach-chat] Request body:", bodyText);
    
    let messages, scanId;
    try {
      const parsed = JSON.parse(bodyText);
      messages = parsed.messages;
      scanId = parsed.scanId;
    } catch (parseError) {
      console.error("❌ [coach-chat] Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("📝 [coach-chat] Messages:", messages.length);

    // 3. Extract intent tags from user's last message for RAG
    const lastMessage = messages[messages.length - 1];
    const lastMessageText = lastMessage?.content?.toLowerCase() || "";
    
    // Intent tag mapping
    const intentKeywords = {
      skin: ["skin", "complexion", "acne", "wrinkle", "aging", "collagen", "elastin", "glow"],
      "fat-loss": ["fat", "weight", "lean", "cutting", "shred", "body fat", "lose weight"],
      muscle: ["muscle", "gain", "bulk", "strength", "hypertrophy", "build", "mass"],
      recovery: ["recovery", "heal", "injury", "tendon", "ligament", "soreness", "repair"],
      sleep: ["sleep", "insomnia", "rest", "melatonin", "circadian"],
      anxiety: ["anxiety", "stress", "calm", "nervous", "anxious", "worry"],
      focus: ["focus", "concentration", "cognitive", "mental", "clarity", "brain", "nootropic"],
      hair: ["hair", "baldness", "alopecia", "hair loss", "hair growth"],
      libido: ["libido", "sex", "sexual", "drive", "performance"],
    };

    const selectedTags: string[] = [];
    for (const [tag, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some(kw => lastMessageText.includes(kw))) {
        selectedTags.push(tag);
      }
    }

    console.log("🏷️ [coach-chat] Intent tags detected:", selectedTags);

    // 4. Fetch onboarding data for personalized context
    let onboardingContext = "";
    let userAge = null;
    let peptidesOpenness = "";
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("onboarding_json")
        .eq("id", user.id)
        .single();

      if (profile && !profileError && profile.onboarding_json) {
        console.log("✅ [coach-chat] Onboarding data loaded");
        const onboarding = profile.onboarding_json;
        
        // Extract key data for safety checks
        userAge = onboarding.age;
        peptidesOpenness = (onboarding.peptides_openness || "").toLowerCase();
        
        // Build onboarding context
        const goals = onboarding.struggles || [];
        const lifestyle = onboarding.lifestyle || [];
        const peptidesGoals = onboarding.peptides_goals || [];
        
        onboardingContext = `
USER PROFILE & GOALS:
- Age: ${onboarding.age || "N/A"}
- Sex: ${onboarding.gender || "N/A"}
- Main struggles: ${goals.length > 0 ? goals.join(", ") : "Not specified"}
- Confidence level: ${onboarding.confidence || "N/A"}
- Lifestyle factors: ${lifestyle.length > 0 ? lifestyle.join(", ") : "Not specified"}
- Mirror thoughts: ${onboarding.mirror_thoughts || "N/A"}
- Compliments frequency: ${onboarding.compliments || "N/A"}

PEPTIDES PREFERENCES:
- Interest level: ${onboarding.peptides_openness || "Not specified"}
- Knowledge level: ${onboarding.peptides_knowledge || "N/A"}
- Goals with peptides: ${peptidesGoals.length > 0 ? peptidesGoals.join(", ") : "Not specified"}
- Risk tolerance: ${onboarding.peptides_risk_tolerance || "N/A"}
- Past experience: ${onboarding.peptides_past_experience || "N/A"}
- Timing interest: ${onboarding.peptides_timing || "N/A"}
`;
        console.log("📊 [coach-chat] Onboarding context length:", onboardingContext.length);
      } else {
        console.log("ℹ️ [coach-chat] No onboarding data found");
      }
    } catch (err) {
      console.log("⚠️ [coach-chat] Could not fetch onboarding data:", err);
    }

    // 5. RAG: Fetch relevant peptides knowledge
    let peptidesKnowledge = "";
    
    try {
      let peptidesData = [];
      
      if (selectedTags.length > 0) {
        // Query by goal tags
        const orConditions = selectedTags.map(tag => `goal_tags.cs.{${tag}}`).join(",");
        
        const { data, error } = await supabase
          .from("peptides_knowledge")
          .select("name, aliases, category, goal_tags, mechanism, benefits, risks, contraindications, evidence_level")
          .or(orConditions)
          .limit(6);

        if (data && !error) {
          peptidesData = data;
          console.log("✅ [coach-chat] Peptides knowledge loaded by tags:", peptidesData.length);
        }
      }
      
      // Fallback: get popular peptides or by name mention
      if (peptidesData.length === 0) {
        // Check if user mentioned specific peptide names
        const commonPeptides = ["bpc-157", "tb-500", "ghk-cu", "matrixyl", "ipamorelin", "cjc-1295", "epithalon", "selank", "semax"];
        const mentionedPeptide = commonPeptides.find(p => lastMessageText.includes(p.toLowerCase()));
        
        if (mentionedPeptide) {
          const { data, error } = await supabase
            .from("peptides_knowledge")
            .select("name, aliases, category, goal_tags, mechanism, benefits, risks, contraindications, evidence_level")
            .ilike("name", `%${mentionedPeptide}%`)
            .limit(3);
          
          if (data && !error) {
            peptidesData = data;
            console.log("✅ [coach-chat] Peptides knowledge loaded by name:", peptidesData.length);
          }
        } else {
          // Get popular peptides as fallback
          const { data, error } = await supabase
            .from("peptides_knowledge")
            .select("name, aliases, category, goal_tags, mechanism, benefits, risks, contraindications, evidence_level")
            .eq("popular", true)
            .limit(5);
          
          if (data && !error) {
            peptidesData = data;
            console.log("✅ [coach-chat] Peptides knowledge loaded (popular):", peptidesData.length);
          }
        }
      }

      // Build peptides knowledge context
      if (peptidesData.length > 0) {
        peptidesKnowledge = `
PEPTIDE KNOWLEDGE BASE (Use ONLY this information for peptide claims):
${peptidesData.map(p => `
• ${p.name} ${p.aliases?.length > 0 ? `(${p.aliases.join(", ")})` : ""}
  - Category: ${p.category}
  - Relevant for: ${p.goal_tags?.join(", ") || "general"}
  - How it works: ${p.mechanism}
  - Benefits: ${p.benefits}
  - Risks: ${p.risks}
  - Contraindications: ${p.contraindications}
  - Evidence level: ${p.evidence_level}
`).join("\n")}

CRITICAL PEPTIDE SAFETY RULES:
- Use ONLY the knowledge above for peptide information
- If a peptide is not listed here, say "I don't have verified information on that peptide"
- NEVER provide dosing instructions or specific protocols
- Always emphasize consulting healthcare professionals
- For users under 18: Educational information ONLY, no recommendations
- If peptides_openness is "no": Focus on natural methods, mention peptides only for education
`;
        console.log("📚 [coach-chat] Peptides knowledge context length:", peptidesKnowledge.length);
        console.log("💊 [coach-chat] Peptides included:", peptidesData.map(p => p.name).join(", "));
      } else {
        console.log("ℹ️ [coach-chat] No peptides knowledge loaded");
      }
    } catch (err) {
      console.log("⚠️ [coach-chat] Could not fetch peptides knowledge:", err);
    }

    // 6. Fetch latest scan data for context
    let scanContext = "";
    
    try {
      let query = supabase
        .from("scans")
        .select("scores_json, notes_json")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (scanId) {
        query = query.eq("id", scanId);
      }

      const { data: scan, error: scanError } = await query.limit(1).single();

      if (scan && !scanError) {
        console.log("✅ [coach-chat] Scan data loaded");
        const scores = scan.scores_json || {};
        const notes = scan.notes_json || {};

        scanContext = `
FACIAL ANALYSIS SCORES:
- Overall: ${scores.overall || "N/A"}/100
- Skin Quality: ${scores.skinQuality || "N/A"}/100
- Jawline: ${scores.jawline || "N/A"}/100
- Cheekbones: ${scores.cheekbones || "N/A"}/100
- Eye Area: ${scores.eyeArea || "N/A"}/100
- Facial Symmetry: ${scores.symmetry || "N/A"}/100
- Potential: ${scores.potential || "N/A"}/100

DETAILED ANALYSIS NOTES:
${Object.entries(notes).map(([key, value]) => `- ${key}: ${value}`).join("\n")}
`;
      } else {
        console.log("ℹ️ [coach-chat] No scan data found");
      }
    } catch (err) {
      console.log("⚠️ [coach-chat] Could not fetch scan data:", err);
    }

    // 7. Build system prompt with personalization + RAG knowledge
    // Safety check for age and peptides policy
    const userIsMinor = userAge && userAge < 18;
    const peptidesBlocked = peptidesOpenness.includes("no") || peptidesOpenness.includes("not interested");
    
    const systemPrompt = `You are a supportive, practical glow-up and peptides coach.

YOUR ROLE:
- Help users improve their appearance through safe, actionable advice
- Provide educational information about peptides, skincare, and self-improvement
- Personalize advice based on their goals, struggles, and analysis scores
- Keep responses concise, motivating, and practical (max 3-4 short paragraphs)

STRICT RULES:
❌ NO blackpill/defeatist language - always be encouraging and solution-focused
❌ NO medical claims or guarantees
❌ NO specific dosing instructions or prescription-like advice
❌ NO sourcing information (where to buy illegal/grey-market substances)
❌ NEVER say "you mentioned in onboarding" or "based on your answers" - reference preferences naturally

${userIsMinor ? `
⚠️ USER IS UNDER 18 - SPECIAL RESTRICTIONS:
- Focus on natural methods (exercise, nutrition, skincare, lifestyle)
- Peptides: Educational information ONLY, no recommendations whatsoever
- Emphasize safe, age-appropriate improvements
` : ""}

${peptidesBlocked ? `
⚠️ USER DECLINED PEPTIDES INTEREST:
- NEVER recommend or suggest peptides
- Focus exclusively on natural methods
- If asked about peptides, provide brief education then pivot to natural alternatives
` : ""}

PERSONALIZATION GUIDELINES:
${onboardingContext ? `
${onboardingContext}

IMPORTANT - Adapt your advice based on user profile:
- If struggles include confidence/attractiveness → Use extra supportive, motivating tone
- If struggles include jawline/face → Prioritize facial exercises, mewing, posture advice
- If confidence is low → Focus on quick wins and progressive improvement
- If lifestyle includes fitness → Assume some training knowledge
- If mirror thoughts are negative → Extra encouragement about potential

PEPTIDES POLICY (CRITICAL):
- If peptides_openness is "no" or negative → NEVER recommend peptides, focus on natural methods only
- If peptides_openness is "not sure" or "maybe" → Provide educational info only, no recommendations
- If peptides_openness is "yes" or positive → Educational recommendations OK, but still emphasize safety
- Always mention consulting professionals for medical decisions

TONE ADAPTATION:
- Match advice to their specific goals and struggles
- Reference their preferences naturally without saying "you said..."
- Example: Instead of "Based on your onboarding answers...", say "Given your focus on [goal]..."
` : "No user profile available - provide general advice."}

${scanContext ? `\n${scanContext}\n\nCombine facial analysis with user goals for highly targeted advice.` : ""}

${peptidesKnowledge ? `\n${peptidesKnowledge}` : ""}

If asked about dosing, sourcing, or medical advice:
→ "I can provide educational info, but for specific dosing/medical advice, please consult a healthcare professional who can assess your individual needs safely."

TONE:
- Friendly, motivating, like a knowledgeable gym buddy who knows your goals
- Use simple language, avoid medical jargon
- Focus on what they CAN do, not what they lack
- Reference their goals and preferences naturally in context`;

    // 8. Call OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    console.log("🤖 [coach-chat] Calling OpenAI...");
    console.log("📏 [coach-chat] System prompt length:", systemPrompt.length);
    console.log("🎯 [coach-chat] Context included:", {
      hasOnboarding: !!onboardingContext,
      hasScan: !!scanContext,
      hasPeptidesKnowledge: !!peptidesKnowledge,
      selectedTags: selectedTags,
      peptidesCount: peptidesKnowledge ? peptidesKnowledge.split("•").length - 1 : 0,
      userIsMinor,
      peptidesBlocked,
      promptLength: systemPrompt.length
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
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ [coach-chat] OpenAI error:", errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const reply = openaiData.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("No reply from OpenAI");
    }

    console.log("✅ [coach-chat] Reply generated, length:", reply.length);
    console.log("📤 [coach-chat] Returning response...");

    // 7. Return response
    const response = { ok: true, reply };
    console.log("📦 [coach-chat] Response object:", JSON.stringify(response).substring(0, 100));
    
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ [coach-chat] Error:", error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message || "Internal server error",
        reply: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 💪"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
