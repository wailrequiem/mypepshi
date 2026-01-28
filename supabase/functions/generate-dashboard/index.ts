import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DashboardRequest {
  scan_id: string;
}

const responseSchema = {
  type: "object",
  properties: {
    glow_up_plan: {
      type: "object",
      properties: {
        summary: { type: "string" },
        weeks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              week: { type: "number" },
              focus: { type: "string" },
              days: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number" },
                    title: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["day", "title", "description"],
                },
              },
            },
            required: ["week", "focus", "days"],
          },
        },
      },
      required: ["summary", "weeks"],
    },
    peptides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          subtitle: { type: "string" },
          fit_percentage: { type: "number" },
          why_recommended: { type: "string" },
          benefits: {
            type: "array",
            items: { type: "string" },
          },
          dosage: { type: "string" },
          timing: { type: "string" },
        },
        required: ["name", "subtitle", "fit_percentage", "why_recommended", "benefits", "dosage", "timing"],
      },
    },
    coach_insights: {
      type: "object",
      properties: {
        summary: { type: "string" },
        key_recommendations: {
          type: "array",
          items: { type: "string" },
        },
        motivational_message: { type: "string" },
      },
      required: ["summary", "key_recommendations", "motivational_message"],
    },
  },
  required: ["glow_up_plan", "peptides", "coach_insights"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { scan_id }: DashboardRequest = await req.json();

    if (!scan_id) {
      return new Response(JSON.stringify({ error: "scan_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch scan data
    const { data: scan, error: scanError } = await supabaseClient
      .from("scans")
      .select("scores_json")
      .eq("id", scan_id)
      .eq("user_id", user.id)
      .single();

    if (scanError || !scan) {
      return new Response(JSON.stringify({ error: "Scan not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user profile/onboarding data
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("onboarding_json")
      .eq("id", user.id)
      .single();

    const onboardingData = profile?.onboarding_json || {};

    // Build AI prompt with age-gating and peptide consent logic
    const age = onboardingData.age ? parseInt(onboardingData.age) : null;
    const isUnder18 = age !== null && age < 18;
    const peptidesOk = onboardingData.peptides_openness?.toLowerCase() !== "no" && !isUnder18;
    
    const userContext = `
User Profile:
- Sex: ${onboardingData.gender || "not specified"}
- Age: ${onboardingData.age || "not specified"} ${isUnder18 ? "(UNDER 18 - NO PEPTIDES)" : ""}
- Main struggles: ${(onboardingData.struggles || []).join(", ") || "not specified"}
- Confidence level: ${onboardingData.confidence || "not specified"}
- Lifestyle: ${(onboardingData.lifestyle || []).join(", ") || "not specified"}
- Mirror thoughts: ${onboardingData.mirror_thoughts || "not specified"}
- Peptide interest: ${onboardingData.peptides_openness || "not specified"} ${!peptidesOk ? "(PEPTIDES NOT RECOMMENDED)" : ""}
- Peptide knowledge: ${onboardingData.peptides_knowledge || "not specified"}
- Peptide goals: ${(onboardingData.peptides_goals || []).join(", ") || "not specified"}
- Risk tolerance: ${onboardingData.peptides_risk_tolerance || "not specified"}
- Past experience: ${onboardingData.peptides_past_experience || "not specified"}
- Timing preference: ${onboardingData.peptides_timing || "not specified"}

Facial Analysis Results:
- Overall score: ${scan.scores_json.overall || 0}/100
- Skin quality: ${scan.scores_json.skinQuality || 0}/100
- Jawline definition: ${scan.scores_json.jawline || 0}/100
- Cheekbones: ${scan.scores_json.cheekbones || 0}/100
- Facial symmetry: ${scan.scores_json.symmetry || 0}/100
- Eye area: ${scan.scores_json.eyeArea || 0}/100
- Potential score: ${scan.scores_json.potential || 0}/100

Task:
Generate a personalized glow-up plan with:
1. A 4-week structured plan with daily actionable tasks
2. ${peptidesOk ? "Top 3 peptide recommendations with detailed info" : "Educational peptide info only (no recommendations)"}
3. Coaching insights and motivation

IMPORTANT RULES:
- ${isUnder18 || !peptidesOk ? "DO NOT recommend peptides. Focus on lifestyle, skincare, training only." : "Include peptide recommendations with safety disclaimers."}
- If jawline score is low (<60): prioritize posture, neck training, body fat reduction, sleep, hydration
- If skin quality is low (<60): emphasize skincare basics (cleanser, moisturizer, SPF), diet, sleep, hydration
- Use sex/age to personalize tone and examples (male/female specific advice)
- Be practical, step-by-step, and motivating
- NO "blackpill" or insulting language
- Always include safety disclaimer (not medical advice)
`;

    // Call OpenAI with Structured Outputs
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-2024-04-09",
        messages: [
          {
            role: "system",
            content: `You are the "Maxxing Coach" AI for a paid glow-up webapp.
Goal: Return a personalized glow-up plan + peptide suggestions based on user's onboarding answers and face scan scores.

RULES:
- Output MUST be valid JSON matching the provided schema
- Be practical, step-by-step, and motivating
- DO NOT mention "blackpill" or use insulting language
- If user is under 18 or age missing: avoid peptide recommendations, focus on lifestyle + skincare + training
- If peptides_ok is "no": give peptide-free plan and only educational info
- Always include a short safety disclaimer (not medical advice)

PERSONALIZATION:
- Use sex + age to pick appropriate tone and examples (male/female specific)
- If jawline is low (<60): prioritize posture, neck training, body fat reduction, sleep, hydration
- If skin is low (<60): skincare basics (cleanser, moisturizer, SPF), diet, sleep, hydration; optional actives with caution
- If overall is decent (>70): emphasize consistency, refinement, confidence habits

Return JSON only. No markdown, no extra text.`,
          },
          {
            role: "user",
            content: userContext,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "dashboard_data",
            schema: responseSchema,
            strict: true,
          },
        },
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate dashboard data", details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const dashboardData = JSON.parse(openaiData.choices[0].message.content);

    return new Response(JSON.stringify(dashboardData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
