// DEV NOTE: Deploy with: supabase functions deploy generate-glowup-plan --no-verify-jwt
// NO AUTH REQUIRED - Public AI-generated glow-up plans

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper: Call OpenAI to generate personalized plan
async function generateAIPlan(userInput?: any): Promise<any> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    console.error("[generate-glowup-plan] OPENAI_API_KEY not configured");
    throw new Error("AI service not configured");
  }

  // Build context from user input if provided
  const contextInfo = userInput?.scores || userInput?.goals 
    ? `User context: ${JSON.stringify(userInput)}` 
    : "No specific user data provided";

  const systemPrompt = `You are a glow-up coach creating a personalized 4-week transformation plan.

TASK: Generate a complete 4-week (28 days) glow-up plan.

STRUCTURE:
- Exactly 4 weeks
- Each week has 7 days
- Each day has:
  * day: number (1-7 within week)
  * title: short (2-3 words)
  * description: one sentence, actionable
  * minutes: estimated time (5-30)
  * category: one of [skin, jawline, symmetry, eye_area, lifestyle, posture]
  * tasks: array of 3-5 tasks, each with:
    - id: unique string (e.g., "w1d1-1")
    - label: brief task description
    - est_minutes: time estimate
    - category: same as day category

PERSONALIZATION:
${contextInfo}

RULES:
1. Week 1: Foundation - easy habits (hydration, sleep, basic skincare)
2. Week 2: Building - introduce mewing, facial exercises, SPF
3. Week 3: Consistency - more advanced techniques, exfoliation
4. Week 4: Advanced - complete routines, combining all habits
5. Keep tasks practical and achievable
6. Gradually increase difficulty
7. Mix categories for holistic improvement
8. Make each day unique and specific

RESPONSE FORMAT (CRITICAL):
Return ONLY valid JSON, no markdown, no explanation:
{
  "weeks": [
    {
      "week": 1,
      "title": "Foundation Week",
      "days": [
        {
          "day": 1,
          "title": "Hydration Start",
          "description": "Drink 8 glasses of water throughout the day.",
          "minutes": 10,
          "category": "lifestyle",
          "tasks": [
            {
              "id": "w1d1-1",
              "label": "Drink 2 glasses upon waking",
              "est_minutes": 2,
              "category": "lifestyle"
            }
          ]
        }
      ]
    }
  ]
}`;

  console.log("[generate-glowup-plan] Calling OpenAI to generate plan...");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate a personalized 4-week glow-up plan." }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[generate-glowup-plan] OpenAI error:", errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content from OpenAI");
  }

  console.log("[generate-glowup-plan] AI response received, length:", content.length);

  // Parse JSON (remove markdown if present)
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  }

  const plan = JSON.parse(jsonStr);
  console.log("[generate-glowup-plan] Plan parsed successfully, weeks:", plan.weeks?.length);

  return plan;
}

// Fallback: Fixed 4-week routine (if AI fails)
const createStandardPlan = () => {
  return {
    weeks: [
      {
        week: 1,
        title: "Foundation Week",
        days: [
          { 
            day: 1, 
            title: "Hydration Start", 
            description: "Drink 8 glasses of water throughout the day to kickstart skin health.", 
            minutes: 10, 
            category: "lifestyle",
            tasks: [
              { id: "w1d1-1", label: "Drink 2 glasses of water upon waking", est_minutes: 2, category: "lifestyle" },
              { id: "w1d1-2", label: "Set hourly water reminders on phone", est_minutes: 2, category: "lifestyle" },
              { id: "w1d1-3", label: "Drink water before each meal", est_minutes: 2, category: "lifestyle" },
              { id: "w1d1-4", label: "Track total glasses consumed today", est_minutes: 2, category: "lifestyle" },
              { id: "w1d1-5", label: "Drink final glass 1 hour before bed", est_minutes: 2, category: "lifestyle" }
            ]
          },
          { 
            day: 2, 
            title: "Sleep Routine", 
            description: "Set consistent sleep/wake times, aim for 7-8 hours nightly.", 
            minutes: 10, 
            category: "lifestyle",
            tasks: [
              { id: "w1d2-1", label: "Set fixed wake-up time", est_minutes: 2, category: "lifestyle" },
              { id: "w1d2-2", label: "Calculate ideal bedtime (7-8h before wake)", est_minutes: 2, category: "lifestyle" },
              { id: "w1d2-3", label: "Set bedtime alarm/reminder", est_minutes: 2, category: "lifestyle" },
              { id: "w1d2-4", label: "Prepare bedroom for sleep (dark, cool)", est_minutes: 5, category: "lifestyle" }
            ]
          },
          { 
            day: 3, 
            title: "Basic Skincare", 
            description: "Cleanse face morning and night with gentle cleanser.", 
            minutes: 10, 
            category: "skin",
            tasks: [
              { id: "w1d3-1", label: "Morning cleanse with gentle cleanser", est_minutes: 3, category: "skin" },
              { id: "w1d3-2", label: "Pat dry with clean towel", est_minutes: 1, category: "skin" },
              { id: "w1d3-3", label: "Evening cleanse before bed", est_minutes: 3, category: "skin" },
              { id: "w1d3-4", label: "Check cleanser ingredients (avoid harsh sulfates)", est_minutes: 3, category: "skin" }
            ]
          },
          { 
            day: 4, 
            title: "Posture Check", 
            description: "Set hourly reminders to check and correct your posture.", 
            minutes: 8, 
            category: "jawline",
            tasks: [
              { id: "w1d4-1", label: "Set hourly posture reminders", est_minutes: 2, category: "jawline" },
              { id: "w1d4-2", label: "Check spine alignment when sitting", est_minutes: 2, category: "jawline" },
              { id: "w1d4-3", label: "Roll shoulders back 5 times", est_minutes: 2, category: "jawline" },
              { id: "w1d4-4", label: "Keep head neutral (not forward)", est_minutes: 2, category: "jawline" }
            ]
          },
          { 
            day: 5, 
            title: "Facial Massage", 
            description: "Gentle upward massage on face for 5 minutes to boost circulation.", 
            minutes: 10, 
            category: "symmetry",
            tasks: [
              { id: "w1d5-1", label: "Wash hands thoroughly", est_minutes: 1, category: "symmetry" },
              { id: "w1d5-2", label: "Apply facial oil or moisturizer", est_minutes: 2, category: "symmetry" },
              { id: "w1d5-3", label: "Massage cheeks in upward circles (2 min)", est_minutes: 2, category: "symmetry" },
              { id: "w1d5-4", label: "Massage forehead outward from center (2 min)", est_minutes: 2, category: "symmetry" },
              { id: "w1d5-5", label: "Massage jawline with gentle pressure (2 min)", est_minutes: 2, category: "symmetry" }
            ]
          },
          { 
            day: 6, 
            title: "Eye Rest", 
            description: "Practice 20-20-20 rule: every 20min look 20ft away for 20sec.", 
            minutes: 8, 
            category: "eye_area",
            tasks: [
              { id: "w1d6-1", label: "Set 20-minute timer", est_minutes: 1, category: "eye_area" },
              { id: "w1d6-2", label: "Look 20 feet away for 20 seconds", est_minutes: 1, category: "eye_area" },
              { id: "w1d6-3", label: "Blink slowly 10 times", est_minutes: 1, category: "eye_area" },
              { id: "w1d6-4", label: "Repeat 6 times throughout the day", est_minutes: 5, category: "eye_area" }
            ]
          },
          { 
            day: 7, 
            title: "Weekly Review", 
            description: "Reflect on week 1 progress and habits formed so far.", 
            minutes: 15, 
            category: "lifestyle",
            tasks: [
              { id: "w1d7-1", label: "Review which habits were easiest", est_minutes: 3, category: "lifestyle" },
              { id: "w1d7-2", label: "Note which habits need more focus", est_minutes: 3, category: "lifestyle" },
              { id: "w1d7-3", label: "Take progress photo for comparison", est_minutes: 5, category: "lifestyle" },
              { id: "w1d7-4", label: "Set intentions for Week 2", est_minutes: 4, category: "lifestyle" }
            ]
          },
        ]
      },
      {
        week: 2,
        title: "Building Habits",
        days: [
          { 
            day: 8, 
            title: "SPF Daily", 
            description: "Apply SPF 30+ sunscreen every morning, even indoors.", 
            minutes: 8, 
            category: "skin",
            tasks: [
              { id: "w2d1-1", label: "Choose SPF 30+ broad spectrum sunscreen", est_minutes: 2, category: "skin" },
              { id: "w2d1-2", label: "Apply to face and neck after moisturizer", est_minutes: 3, category: "skin" },
              { id: "w2d1-3", label: "Reapply after 2 hours if near window", est_minutes: 3, category: "skin" }
            ]
          },
          { 
            day: 9, 
            title: "Mewing Basics", 
            description: "Practice tongue posture: rest tongue on roof of mouth throughout day.", 
            minutes: 15, 
            category: "jawline",
            tasks: [
              { id: "w2d2-1", label: "Place tongue flat on roof of mouth", est_minutes: 2, category: "jawline" },
              { id: "w2d2-2", label: "Close lips gently, teeth slightly apart", est_minutes: 2, category: "jawline" },
              { id: "w2d2-3", label: "Breathe through nose only", est_minutes: 2, category: "jawline" },
              { id: "w2d2-4", label: "Hold position for 5 min intervals", est_minutes: 5, category: "jawline" },
              { id: "w2d2-5", label: "Practice 3 times throughout day", est_minutes: 4, category: "jawline" }
            ]
          },
          { day: 10, title: "Eye Care", description: "Use cold compress on eyes to reduce puffiness in the morning.", minutes: 5, category: "eye_area", tasks: [{ id: "w2d3-1", label: "Prepare cold compress or chilled spoons", est_minutes: 2, category: "eye_area" }, { id: "w2d3-2", label: "Apply to closed eyes for 3 minutes", est_minutes: 3, category: "eye_area" }] },
          { day: 11, title: "Walking", description: "Take a 15-minute walk outdoors for fresh air and movement.", minutes: 15, category: "lifestyle", tasks: [{ id: "w2d4-1", label: "Put on comfortable shoes", est_minutes: 2, category: "lifestyle" }, { id: "w2d4-2", label: "Walk briskly for 15 minutes outside", est_minutes: 15, category: "lifestyle" }] },
          { day: 12, title: "Face Yoga", description: "Practice cheek lifts and jaw exercises for 5 minutes.", minutes: 8, category: "symmetry", tasks: [{ id: "w2d5-1", label: "Smile wide and hold for 10 seconds (x5)", est_minutes: 3, category: "symmetry" }, { id: "w2d5-2", label: "Puff cheeks and move air side to side (x10)", est_minutes: 3, category: "symmetry" }, { id: "w2d5-3", label: "Open mouth wide and hold (x5)", est_minutes: 2, category: "symmetry" }] },
          { day: 13, title: "Skin Hydration", description: "Add a hydrating serum or moisturizer to your routine.", minutes: 5, category: "skin", tasks: [{ id: "w2d6-1", label: "Apply hydrating serum to damp skin", est_minutes: 2, category: "skin" }, { id: "w2d6-2", label: "Follow with moisturizer", est_minutes: 3, category: "skin" }] },
          { day: 14, title: "Progress Check", description: "Take progress photo and note improvements from week 1.", minutes: 10, category: "lifestyle", tasks: [{ id: "w2d7-1", label: "Take front-facing photo in same lighting", est_minutes: 3, category: "lifestyle" }, { id: "w2d7-2", label: "Compare with Day 7 photo", est_minutes: 3, category: "lifestyle" }, { id: "w2d7-3", label: "Note visible changes", est_minutes: 4, category: "lifestyle" }] },
        ]
      },
      {
        week: 3,
        title: "Consistency Focus",
        days: [
          { day: 15, title: "Exfoliation", description: "Gently exfoliate skin 2x this week with mild scrub or chemical exfoliant.", minutes: 7, category: "skin", tasks: [{ id: "w3d1-1", label: "Wet face with lukewarm water", est_minutes: 1, category: "skin" }, { id: "w3d1-2", label: "Apply gentle exfoliant in circular motions", est_minutes: 3, category: "skin" }, { id: "w3d1-3", label: "Rinse thoroughly and pat dry", est_minutes: 2, category: "skin" }, { id: "w3d1-4", label: "Follow with moisturizer", est_minutes: 2, category: "skin" }] },
          { day: 16, title: "Chewing Practice", description: "Chew sugar-free gum for jawline engagement (10 min sessions).", minutes: 10, category: "jawline", tasks: [{ id: "w3d2-1", label: "Chew gum on right side for 5 minutes", est_minutes: 5, category: "jawline" }, { id: "w3d2-2", label: "Switch to left side for 5 minutes", est_minutes: 5, category: "jawline" }] },
          { day: 17, title: "Eye Exercises", description: "Do eye relaxation exercises to reduce strain and improve area.", minutes: 5, category: "eye_area", tasks: [{ id: "w3d3-1", label: "Look up/down 10 times slowly", est_minutes: 2, category: "eye_area" }, { id: "w3d3-2", label: "Look left/right 10 times slowly", est_minutes: 2, category: "eye_area" }, { id: "w3d3-3", label: "Roll eyes clockwise then counter (x5)", est_minutes: 2, category: "eye_area" }] },
          { day: 18, title: "Healthy Snack", description: "Replace one snack with fruit/veggies for better skin nutrition.", minutes: 5, category: "lifestyle", tasks: [{ id: "w3d4-1", label: "Choose colorful fruit or vegetable", est_minutes: 2, category: "lifestyle" }, { id: "w3d4-2", label: "Prep and eat mindfully", est_minutes: 3, category: "lifestyle" }] },
          { day: 19, title: "Face Symmetry", description: "Practice facial exercises focusing on weaker side of face.", minutes: 8, category: "symmetry", tasks: [{ id: "w3d5-1", label: "Identify weaker side in mirror", est_minutes: 2, category: "symmetry" }, { id: "w3d5-2", label: "Do 20 reps of cheek lifts on weak side", est_minutes: 3, category: "symmetry" }, { id: "w3d5-3", label: "Massage weak side for 3 minutes", est_minutes: 3, category: "symmetry" }] },
          { day: 20, title: "Advanced Mewing", description: "Maintain tongue posture while speaking and eating.", minutes: 15, category: "jawline", tasks: [{ id: "w3d6-1", label: "Practice tongue position while talking", est_minutes: 5, category: "jawline" }, { id: "w3d6-2", label: "Chew with tongue on roof between bites", est_minutes: 5, category: "jawline" }, { id: "w3d6-3", label: "Return to position after swallowing", est_minutes: 5, category: "jawline" }] },
          { day: 21, title: "Mid-Program Review", description: "Assess progress and adjust routine intensity if needed.", minutes: 10, category: "lifestyle", tasks: [{ id: "w3d7-1", label: "Review all completed tasks", est_minutes: 3, category: "lifestyle" }, { id: "w3d7-2", label: "Note biggest improvements", est_minutes: 3, category: "lifestyle" }, { id: "w3d7-3", label: "Adjust intensity for Week 4", est_minutes: 4, category: "lifestyle" }] },
        ]
      },
      {
        week: 4,
        title: "Advanced Routine",
        days: [
          { day: 22, title: "Full Skincare", description: "Complete routine: cleanse, tone, serum, moisturize, SPF in AM.", minutes: 10, category: "skin", tasks: [{ id: "w4d1-1", label: "Cleanse face thoroughly", est_minutes: 2, category: "skin" }, { id: "w4d1-2", label: "Apply toner", est_minutes: 2, category: "skin" }, { id: "w4d1-3", label: "Apply serum", est_minutes: 2, category: "skin" }, { id: "w4d1-4", label: "Moisturize", est_minutes: 2, category: "skin" }, { id: "w4d1-5", label: "Apply SPF 30+", est_minutes: 2, category: "skin" }] },
          { day: 23, title: "Jaw Resistance", description: "Perform jawline stretches and resistance exercises with hands.", minutes: 10, category: "jawline", tasks: [{ id: "w4d2-1", label: "Place fist under chin and push up", est_minutes: 3, category: "jawline" }, { id: "w4d2-2", label: "Open mouth against resistance (x10)", est_minutes: 4, category: "jawline" }, { id: "w4d2-3", label: "Jaw side-to-side against hand (x10)", est_minutes: 3, category: "jawline" }] },
          { day: 24, title: "Dark Circles", description: "Apply eye cream and do lymphatic drainage massage under eyes.", minutes: 7, category: "eye_area", tasks: [{ id: "w4d3-1", label: "Apply eye cream with ring finger", est_minutes: 2, category: "eye_area" }, { id: "w4d3-2", label: "Tap gently around orbital bone", est_minutes: 2, category: "eye_area" }, { id: "w4d3-3", label: "Massage from inner to outer corner", est_minutes: 3, category: "eye_area" }] },
          { day: 25, title: "Meal Prep", description: "Prepare healthy meals for the week with clean proteins and veggies.", minutes: 30, category: "lifestyle", tasks: [{ id: "w4d4-1", label: "Plan 5 meals with protein + veggies", est_minutes: 5, category: "lifestyle" }, { id: "w4d4-2", label: "Shop for ingredients", est_minutes: 10, category: "lifestyle" }, { id: "w4d4-3", label: "Prep and portion meals", est_minutes: 15, category: "lifestyle" }] },
          { day: 26, title: "Full Face Routine", description: "Combine all facial exercises into one complete 15-min session.", minutes: 15, category: "symmetry", tasks: [{ id: "w4d5-1", label: "Mewing (tongue position) - 5 min", est_minutes: 5, category: "symmetry" }, { id: "w4d5-2", label: "Facial massage - 5 min", est_minutes: 5, category: "symmetry" }, { id: "w4d5-3", label: "Face yoga exercises - 5 min", est_minutes: 5, category: "symmetry" }] },
          { day: 27, title: "Final Push", description: "Maintain all habits: skincare, posture, hydration, exercise.", minutes: 20, category: "lifestyle", tasks: [{ id: "w4d6-1", label: "Complete morning skincare routine", est_minutes: 5, category: "lifestyle" }, { id: "w4d6-2", label: "Drink 8 glasses water", est_minutes: 2, category: "lifestyle" }, { id: "w4d6-3", label: "Practice mewing throughout day", est_minutes: 5, category: "lifestyle" }, { id: "w4d6-4", label: "Evening skincare routine", est_minutes: 5, category: "lifestyle" }, { id: "w4d6-5", label: "Posture check every hour", est_minutes: 3, category: "lifestyle" }] },
          { day: 28, title: "Complete Review", description: "Take final progress photo, celebrate completion, prepare to restart!", minutes: 15, category: "lifestyle", tasks: [{ id: "w4d7-1", label: "Take final progress photo", est_minutes: 3, category: "lifestyle" }, { id: "w4d7-2", label: "Compare with Day 1 photo", est_minutes: 3, category: "lifestyle" }, { id: "w4d7-3", label: "Write down all visible improvements", est_minutes: 5, category: "lifestyle" }, { id: "w4d7-4", label: "Celebrate your completion!", est_minutes: 4, category: "lifestyle" }] },
        ]
      }
    ]
  };
};

serve(async (req) => {
  console.log("[generate-glowup-plan] Function invoked - NO AUTH REQUIRED");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Parse optional input (scores, goals, etc. - but not required)
    let userInput;
    try {
      const body = await req.json();
      userInput = body;
      console.log("[generate-glowup-plan] Received input:", Object.keys(userInput || {}));
    } catch {
      console.log("[generate-glowup-plan] No input provided, using defaults");
      userInput = {};
    }

    // Generate AI plan (or fallback to standard)
    let plan;
    try {
      console.log("[generate-glowup-plan] Generating AI plan...");
      plan = await generateAIPlan(userInput);
      console.log("[generate-glowup-plan] ✅ AI plan generated successfully");
    } catch (aiError) {
      console.error("[generate-glowup-plan] AI generation failed:", aiError);
      console.log("[generate-glowup-plan] Falling back to standard plan");
      plan = createStandardPlan();
    }

    // Return plan with default progress tracking
    const startDate = new Date().toISOString();
    const progress = {
      completedDays: [],
      completedTasksByDay: {},
      updatedAt: startDate
    };

    return new Response(
      JSON.stringify({
        ok: true,
        plan,
        startDate,
        dayIndex: 0,
        currentWeek: 1,
        currentDay: 1,
        progress,
        message: "Plan generated successfully (no auth required)"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-glowup-plan] Error:", error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message || "Internal error",
        plan: createStandardPlan(), // Always return fallback plan
        startDate: new Date().toISOString(),
        dayIndex: 0,
        currentWeek: 1,
        currentDay: 1,
        progress: { completedDays: [], completedTasksByDay: {}, updatedAt: new Date().toISOString() }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
