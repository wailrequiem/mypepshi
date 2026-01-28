// Edge Function: explain-glowup-task (PUBLIC - NO JWT REQUIRED)
// Generates AI explanations for Glow-Up Plan tasks
// Deploy with: supabase functions deploy explain-glowup-task --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  console.log("[EXPLAIN] Function invoked - method:", req.method);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("[EXPLAIN] CORS preflight handled");
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Parse request body
    const body = await req.json();
    console.log("[EXPLAIN] Request body:", JSON.stringify(body));

    const { 
      taskTitle, 
      taskCategory, 
      dayTitle, 
      week, 
      day,
      userContext 
    } = body;

    // Validate required fields
    if (!taskTitle || !taskCategory) {
      console.log("[EXPLAIN] Missing required fields");
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: "Missing taskTitle or taskCategory" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[EXPLAIN] Generating explanation for:", taskTitle);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("[EXPLAIN] OpenAI API key not configured");
      return new Response(
        JSON.stringify({ ok: false, message: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context for AI
    const contextParts = [
      `Task: ${taskTitle}`,
      `Category: ${taskCategory}`,
    ];

    if (dayTitle) contextParts.push(`Day: ${dayTitle}`);
    if (week) contextParts.push(`Week: ${week}`);
    if (day) contextParts.push(`Day Number: ${day}`);

    // Add user context if available
    let userInfo = "";
    if (userContext) {
      if (userContext.sex) userInfo += `Gender: ${userContext.sex}\n`;
      if (userContext.age) userInfo += `Age: ${userContext.age}\n`;
      if (userContext.scores) {
        userInfo += `Face Scores:\n`;
        if (userContext.scores.skinQuality) userInfo += `- Skin Quality: ${userContext.scores.skinQuality}/10\n`;
        if (userContext.scores.jawline) userInfo += `- Jawline: ${userContext.scores.jawline}/10\n`;
        if (userContext.scores.eyeArea) userInfo += `- Eye Area: ${userContext.scores.eyeArea}/10\n`;
        if (userContext.scores.symmetry) userInfo += `- Symmetry: ${userContext.scores.symmetry}/10\n`;
        if (userContext.scores.overall) userInfo += `- Overall: ${userContext.scores.overall}/10\n`;
      }
    }

    const systemPrompt = `You are a supportive fitness and wellness coach helping people improve their appearance and health.

Generate a clear, logical explanation for the given task following STRICT RULES.

CRITICAL DISTINCTIONS:
- "Why This Matters" = BENEFITS, IMPACT, REASONING (NOT instructions)
- "How To Do It" = ACTIONABLE STEPS (NOT reasons)

STRICT RULES:
1. "Why This Matters" bullets MUST explain benefits/impact/behavioral science
   - Use words like: "improves", "helps", "reduces", "creates", "builds", "prevents"
   - NEVER use instruction verbs like: "choose", "set", "open", "do", "click", "select"
   - Focus on: consistency, habit formation, physiological benefits, behavioral outcomes
   - BAD: "Set reminders to stay consistent" → GOOD: "Consistent reminders reduce decision fatigue and build automatic habits"

2. "How To Do It" steps MUST be practical instructions
   - Use numbered steps with action verbs
   - Each step should be one clear action
   - NO reasoning or benefits in this section

3. "Common Mistakes" must be realistic pitfalls people actually make

4. "Personalized Tip" should use user context if available, otherwise give smart default

EXAMPLES:

Example 1 - Water Reminders:
GOOD "Why This Matters":
- "Consistent hydration timing improves cognitive function and maintains steady energy levels throughout the day"
- "Regular reminders eliminate decision fatigue about when to drink, making hydration automatic"
- "Steady water intake supports skin elasticity and reduces the appearance of fine lines"

BAD "Why This Matters" (these are instructions, not benefits):
- "Set reminders on your phone" ❌
- "Choose times that work for your schedule" ❌
- "Download a water tracking app" ❌

Example 2 - Posture Check:
GOOD "Why This Matters":
- "Proper alignment prevents forward head posture which can reduce jawline definition over time"
- "Regular posture awareness builds kinesthetic memory, making good posture more automatic"
- "Upright positioning improves breathing efficiency and projects confidence"

BAD "Why This Matters":
- "Check your posture every hour" ❌
- "Stand against a wall to test" ❌

RESPONSE FORMAT (STRICT JSON, no extra keys):
{
  "ok": true,
  "title": "string - the task name",
  "summary": "string - one sentence overview",
  "why_this_matters": [
    "string - benefit/impact 1 (NO instructions)",
    "string - benefit/impact 2 (NO instructions)",
    "string - benefit/impact 3 (NO instructions, optional)",
    "string - benefit/impact 4 (NO instructions, optional)"
  ],
  "how_to_do_it": [
    { "step": 1, "text": "string - action instruction" },
    { "step": 2, "text": "string - action instruction" },
    { "step": 3, "text": "string - action instruction" },
    { "step": 4, "text": "string - action instruction (optional)" },
    { "step": 5, "text": "string - action instruction (optional)" },
    { "step": 6, "text": "string - action instruction (optional)" }
  ],
  "common_mistakes": [
    "string - realistic mistake 1",
    "string - realistic mistake 2",
    "string - realistic mistake 3 (optional)",
    "string - realistic mistake 4 (optional)"
  ],
  "personalized_tip": "string - one smart tip (use user context if available)"
}

Guidelines:
- Reference the specific task and category in your explanations
- Personalize using user age, gender, or face scores if provided
- Keep bullets SHORT (1-2 sentences max)
- Be encouraging but realistic
- NO medical claims, drug advice, or guarantees
- NO negative or blackpill language
- If user has lower scores in relevant areas, acknowledge gently and focus on improvement potential`;

    const userPrompt = contextParts.join("\n") + (userInfo ? `\n\nUser Context:\n${userInfo}` : "\n\nUser Context: Not provided");

    console.log("[EXPLAIN] Calling OpenAI API...");

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
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("[EXPLAIN] OpenAI error:", openaiResponse.status, errorText);
      return new Response(
        JSON.stringify({ ok: false, message: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiResponse.json();
    const aiContent = openaiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error("[EXPLAIN] No AI content returned");
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
      console.error("[EXPLAIN] Failed to parse AI response:", parseError);
      return new Response(
        JSON.stringify({ ok: false, message: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate response structure
    if (!result.title || !result.summary || !result.why_this_matters || !result.how_to_do_it || 
        !result.common_mistakes || !result.personalized_tip) {
      console.error("[EXPLAIN] AI response missing required fields:", result);
      return new Response(
        JSON.stringify({ ok: false, message: "Incomplete AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate array structures
    if (!Array.isArray(result.why_this_matters) || !Array.isArray(result.how_to_do_it) || 
        !Array.isArray(result.common_mistakes)) {
      console.error("[EXPLAIN] AI response has invalid array structures");
      return new Response(
        JSON.stringify({ ok: false, message: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[EXPLAIN] Success - generated explanation");

    // Return success response with new schema
    return new Response(
      JSON.stringify({
        ok: true,
        title: result.title,
        summary: result.summary,
        why_this_matters: result.why_this_matters,
        how_to_do_it: result.how_to_do_it,
        common_mistakes: result.common_mistakes,
        personalized_tip: result.personalized_tip,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[EXPLAIN] Error:", error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        message: error.message || "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
