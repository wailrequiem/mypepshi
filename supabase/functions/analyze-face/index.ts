import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FACE_SCHEMA = {
  name: "face_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      gender: { type: "string", enum: ["male", "female"] },
      scores: {
        type: "object",
        additionalProperties: false,
        properties: {
          skin_quality: { type: "integer", minimum: 0, maximum: 100 },
          cheekbones: { type: "integer", minimum: 0, maximum: 100 },
          eye_area: { type: "integer", minimum: 0, maximum: 100 },
          jawline_definition: { type: "integer", minimum: 0, maximum: 100 },
          facial_symmetry: { type: "integer", minimum: 0, maximum: 100 },
          potential: { type: "integer", minimum: 0, maximum: 100 },
          overall: { type: "integer", minimum: 0, maximum: 100 }
        },
        required: [
          "skin_quality",
          "cheekbones",
          "eye_area",
          "jawline_definition",
          "facial_symmetry",
          "potential",
          "overall"
        ]
      },
      notes: {
        type: "object",
        additionalProperties: false,
        properties: {
          skin_quality: { type: "string" },
          cheekbones: { type: "string" },
          eye_area: { type: "string" },
          jawline_definition: { type: "string" },
          facial_symmetry: { type: "string" },
          potential: { type: "string" }
        },
        required: [
          "skin_quality",
          "cheekbones",
          "eye_area",
          "jawline_definition",
          "facial_symmetry",
          "potential"
        ]
      }
    },
    required: ["gender", "scores", "notes"]
  }
};

function stripDataUrlPrefix(dataUrl: string): string {
  if (dataUrl.startsWith("data:image")) {
    const base64Index = dataUrl.indexOf("base64,");
    if (base64Index !== -1) {
      return dataUrl.substring(base64Index + 7);
    }
  }
  return dataUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let currentStep = "init";

  try {
    console.log("🚀 === ANALYZE-FACE EDGE FUNCTION STARTED ===");

    // STEP 0: Check environment
    currentStep = "env";
    console.log("STEP 0: Checking environment variables");
    
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    console.log("ENV:", {
      hasOpenAI: !!openaiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
    });

    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY missing in environment");
    }

    // STEP 1: Auth validation
    currentStep = "auth";
    console.log("STEP 1: Validating authentication");
    
    const authHeader = req.headers.get("Authorization") ?? "";
    console.log("Auth header present:", !!authHeader);

    if (!authHeader || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing auth header or Supabase config");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("User validation failed:", userError?.message);
      return new Response(
        JSON.stringify({ 
          ok: false,
          step: "auth",
          message: "Unauthorized - Invalid session",
          details: userError?.message 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ User authenticated:", user.id);

    // STEP 2: Parse body
    currentStep = "parse_body";
    console.log("STEP 2: Parsing request body");
    
    let body;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error(`Failed to parse JSON body: ${e.message}`);
    }

    console.log("Body keys:", Object.keys(body));
    console.log("[analyze-face] received keys:", Object.keys(body));

    // STEP 3: Normalize and validate images (accept URLs or base64)
    currentStep = "validate_images";
    console.log("STEP 3: Normalizing and validating images");

    // Normalize key aliases to standard names
    // Accept: front_image_url, frontImageUrl, front_url, frontUrl, frontSignedUrl
    const frontImageUrl = body.front_image_url 
      || body.frontImageUrl 
      || body.front_url 
      || body.frontUrl 
      || body.frontSignedUrl;
    
    // Accept: side_image_url, sideImageUrl, side_url, sideUrl, sideSignedUrl
    const sideImageUrl = body.side_image_url 
      || body.sideImageUrl 
      || body.side_url 
      || body.sideUrl 
      || body.sideSignedUrl;
    
    // Base64 keys (already standard)
    const frontImageBase64 = body.front_image_base64;
    const sideImageBase64 = body.side_image_base64;

    // Log what we detected
    console.log("[analyze-face] normalized:", {
      hasFrontUrl: !!frontImageUrl,
      hasSideUrl: !!sideImageUrl,
      hasFrontB64: !!frontImageBase64,
      hasSideB64: !!sideImageBase64
    });

    let frontImageForAI: string;
    let sideImageForAI: string;
    let usingUrls = false;

    // Prefer URLs over base64
    if (frontImageUrl && sideImageUrl) {
      console.log("✅ Using image URLs (new format)");
      frontImageForAI = frontImageUrl;
      sideImageForAI = sideImageUrl;
      usingUrls = true;
    } else if (frontImageBase64 && sideImageBase64) {
      console.log("⚠️ Using base64 images (legacy format)");
      const frontImage = stripDataUrlPrefix(frontImageBase64);
      const sideImage = stripDataUrlPrefix(sideImageBase64);
      
      console.log("Base64 sizes after strip:", {
        front: frontImage.length,
        side: sideImage.length,
      });

      // Check sizes
      const MAX_SIZE = 15_000_000; // 15MB
      if (frontImage.length > MAX_SIZE || sideImage.length > MAX_SIZE) {
        throw new Error(`Images too large: front=${frontImage.length}, side=${sideImage.length}, max=${MAX_SIZE}`);
      }

      frontImageForAI = `data:image/jpeg;base64,${frontImage}`;
      sideImageForAI = `data:image/jpeg;base64,${sideImage}`;
      usingUrls = false;
    } else {
      throw new Error("Either (front_image_url + side_image_url) or (front_image_base64 + side_image_base64) required");
    }

    console.log("Image format:", {
      usingUrls,
      frontPreview: frontImageForAI.substring(0, 80) + "...",
      sidePreview: sideImageForAI.substring(0, 80) + "...",
    });

    // STEP 4: Read user context
    currentStep = "read_context";
    console.log("STEP 4: Reading user context (sex/age)");

    const sex = body.sex ?? body.gender ?? "skip";
    const age = body.age ?? null;

    console.log("✅ analyze-face input", { 
      sex, 
      age, 
      usingUrls,
      imageFormat: usingUrls ? "URLs" : "base64"
    });

    // STEP 5: Build OpenAI request
    currentStep = "build_request";
    console.log("STEP 5: Building OpenAI request");

    const prompt = `You are a BRUTAL, no-nonsense facial aesthetics expert. Analyze these two images (front and side view) with ZERO sugar-coating. Be RAW and HONEST.

User context:
- Sex: ${sex === "skip" ? "not specified" : sex}
- Age: ${age || "not specified"}

First, determine the gender (male or female) based on the images.

Then analyze and score these facial aspects (0-100, integers only):
1. skin_quality: texture, clarity, tone, blemishes, acne, pores, wrinkles, oiliness
2. cheekbones: prominence, definition, positioning, hollowness (or lack thereof)
3. eye_area: shape, symmetry, under-eye bags/dark circles, eyelid health, canthal tilt, puffiness
4. jawline_definition: sharpness, angle, definition, mandible prominence, chin projection, neck fat
5. facial_symmetry: balance between left/right sides, alignment, proportions
6. potential: improvement potential with skincare, lifestyle, mewing, fitness, grooming
7. overall: average of all the above scores excluding potential

BRUTAL SCORING RULES - NO MERCY (except potential):
- All scores are integers 0-100
- DO NOT be nice. DO NOT spare feelings. Give the REAL score.
- 50 is AVERAGE. Most people ARE average. Don't be afraid to give 40s and 50s.
- If you see ANY of these, score BELOW 45:
  * ANY visible acne, acne scars, or uneven texture → skin_quality 30-45
  * Recessed chin, weak jaw, double chin, no jaw angle → jawline_definition 25-40
  * Round/chubby face, no visible cheekbones → cheekbones 30-45
  * Puffy eyes, visible dark circles, asymmetric eyes → eye_area 35-45
  * Noticeable asymmetry → facial_symmetry 35-45
- Score 50-60 = nothing special, just average/okay
- Score 60-70 = slightly above average, decent
- Score 70-80 = genuinely good looking feature
- Score 80+ = RARE, only for striking/model-tier features
- Most regular people should get 35-55 overall. That's NORMAL.
- Don't give 70+ unless the feature is genuinely impressive

EXCEPTION - POTENTIAL MUST BE HIGH:
- ALWAYS give potential between 78-95
- Low current scores = MORE room for growth = HIGHER potential
- Even ugly people can improve dramatically with effort
- Minimum potential is 78, typically give 82-92

SCORING REALITY CHECK:
- 85-100: Model/celebrity tier (top 2%)
- 70-84: Attractive (top 15%)
- 55-69: Above average
- 40-54: Average (most people are here)
- 25-39: Below average
- 0-24: Severe issues

For each aspect (except overall), provide a SHORT, DIRECT note explaining WHY you gave that score. Be specific about what's wrong or right.`;

    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a brutally honest facial aesthetics analyzer. Give raw, unfiltered scores. Most people are average (40-55). Don't inflate scores to be nice. Be direct and specific in your notes. Return JSON only.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: frontImageForAI,
              },
            },
            {
              type: "image_url",
              image_url: {
                url: sideImageForAI,
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: FACE_SCHEMA,
      },
      max_tokens: 1500,
      temperature: 0.3,
    };

    console.log("Request ready. Payload size:", JSON.stringify(requestBody).length);

    // STEP 6: Call OpenAI
    currentStep = "call_openai";
    console.log("STEP 6: Calling OpenAI API...");

    let analysisResult;
    try {
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("OpenAI response status:", openaiResponse.status);

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error("❌ openai error", {
          status: openaiResponse.status,
          error: errorText
        });
        
        return new Response(
          JSON.stringify({
            ok: false,
            step: "call_openai",
            message: `OpenAI API error (${openaiResponse.status}): ${errorText}`
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // STEP 7: Parse OpenAI response
      currentStep = "parse_openai";
      console.log("STEP 7: Parsing OpenAI response");

      const openaiData = await openaiResponse.json();
      console.log("OpenAI data received. Has choices:", !!openaiData.choices);

      if (!openaiData.choices || !openaiData.choices[0]) {
        throw new Error("OpenAI response missing choices");
      }

      const messageContent = openaiData.choices[0].message?.content;
      if (!messageContent) {
        throw new Error("OpenAI response missing message content");
      }

      console.log("Message content length:", messageContent.length);

      try {
        analysisResult = JSON.parse(messageContent);
      } catch (e) {
        console.error("Failed to parse message content:", messageContent.substring(0, 200));
        throw new Error(`Failed to parse analysis JSON: ${e.message}`);
      }

      console.log("✅ openai output", analysisResult);

    } catch (openaiError) {
      console.error("❌ openai error", openaiError);
      
      return new Response(
        JSON.stringify({
          ok: false,
          step: "call_openai",
          message: openaiError.message || "OpenAI call failed"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // STEP 8: Recalculate potential and overall
    currentStep = "recalculate_scores";
    console.log("STEP 8: Recalculating potential (+8 boost) and overall");

    const scores = analysisResult.scores;
    
    // Calculate potential with +8 boost, capped at 100
    const basePotential = scores.potential;
    scores.potential = Math.min(100, basePotential + 8);

    // Recalculate overall as average of all 6 aspects
    const scoreValues = [
      scores.skin_quality,
      scores.cheekbones,
      scores.eye_area,
      scores.jawline_definition,
      scores.facial_symmetry,
      scores.potential,
    ];
    scores.overall = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);

    console.log("Final scores:", {
      gender: analysisResult.gender,
      overall: scores.overall,
      skin_quality: scores.skin_quality,
      cheekbones: scores.cheekbones,
      eye_area: scores.eye_area,
      jawline_definition: scores.jawline_definition,
      facial_symmetry: scores.facial_symmetry,
      potential: scores.potential,
    });

    // STEP 9: Return scores
    currentStep = "return_scores";
    console.log("STEP 9: Returning scores");
    
    const finalResponse = {
      ok: true,
      data: analysisResult
    };
    
    const responseJson = JSON.stringify(finalResponse);
    console.log("✅ analyze-face returning", responseJson.slice(0, 200));
    console.log("✅ === SUCCESS ===");

    return new Response(
      responseJson, 
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("❌ === ERROR ===");
    console.error("Failed at step:", currentStep);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Return 200 with ok:false instead of 500 for better error handling
    // Only return 401 for auth errors, everything else is 200 with ok:false
    const statusCode = currentStep === "auth" ? 401 : 200;

    return new Response(
      JSON.stringify({
        ok: false,
        step: currentStep,
        message: error.message,
        name: error.name,
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
