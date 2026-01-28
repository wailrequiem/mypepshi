// DEV NOTE: Deploy with: supabase functions deploy update-glowup-progress --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  console.log("[update-glowup-progress] Function invoked");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.json();
    const { scanId, dayIndex, completed, taskId } = body;

    if (!scanId) {
      return new Response(
        JSON.stringify({ ok: false, error: "scanId required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[update-glowup-progress] scanId:", scanId, "dayIndex:", dayIndex, "completed:", completed, "taskId:", taskId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "Supabase not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load current progress
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select("glow_up_progress")
      .eq("id", scanId)
      .single();

    if (scanError || !scan) {
      return new Response(
        JSON.stringify({ ok: false, error: "Scan not found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let progress = scan.glow_up_progress || { completedDays: [], completedTasksByDay: {}, updatedAt: new Date().toISOString() };
    let completedDays = progress.completedDays || [];
    let completedTasksByDay = progress.completedTasksByDay || {};

    // Handle task-level updates
    if (taskId !== undefined) {
      const dayKey = `${dayIndex}`;
      const dayTasks = completedTasksByDay[dayKey] || [];
      
      if (completed) {
        // Add task if not present
        if (!dayTasks.includes(taskId)) {
          dayTasks.push(taskId);
        }
      } else {
        // Remove task if present
        const index = dayTasks.indexOf(taskId);
        if (index > -1) {
          dayTasks.splice(index, 1);
        }
      }
      
      completedTasksByDay[dayKey] = dayTasks;
      console.log("[update-glowup-progress] Updated tasks for day", dayIndex, ":", dayTasks);
    }

    // Handle day-level completion updates
    if (dayIndex !== undefined && completed !== undefined && taskId === undefined) {
      if (completed) {
        // Add dayIndex if not already present
        if (!completedDays.includes(dayIndex)) {
          completedDays.push(dayIndex);
          completedDays.sort((a, b) => a - b);
        }
      } else {
        // Remove dayIndex if present
        completedDays = completedDays.filter(d => d !== dayIndex);
      }
      console.log("[update-glowup-progress] Updated completedDays:", completedDays);
    }

    // Update progress object
    progress = {
      completedDays,
      completedTasksByDay,
      updatedAt: new Date().toISOString()
    };

    // Save to DB
    const { error: updateError } = await supabase
      .from("scans")
      .update({ glow_up_progress: progress })
      .eq("id", scanId);

    if (updateError) {
      return new Response(
        JSON.stringify({ ok: false, error: "Failed to update progress" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, progress }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[update-glowup-progress] Error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || "Internal error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
