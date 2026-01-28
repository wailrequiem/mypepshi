import { supabase } from "./supabase";

export interface DashboardData {
  glow_up_plan: {
    summary: string;
    weeks: Array<{
      week: number;
      focus: string;
      days: Array<{
        day: number;
        title: string;
        description: string;
      }>;
    }>;
  };
  peptides: Array<{
    name: string;
    subtitle: string;
    fit_percentage: number;
    why_recommended: string;
    benefits: string[];
    dosage: string;
    timing: string;
  }>;
  coach_insights: {
    summary: string;
    key_recommendations: string[];
    motivational_message: string;
  };
}

async function callEdgeFunction(scanId: string): Promise<DashboardData> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User must be authenticated");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("VITE_SUPABASE_URL environment variable is not set");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-dashboard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ scan_id: scanId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate dashboard data");
  }

  const data = await response.json();
  return data as DashboardData;
}

export async function getDashboardData(
  userId: string,
  scanId: string,
  forceRegenerate = false
): Promise<DashboardData> {
  // Check cache first (unless force regenerate)
  if (!forceRegenerate) {
    const { data: cached } = await supabase
      .from("generated_plans")
      .select("plan_data, created_at")
      .eq("user_id", userId)
      .eq("scan_id", scanId)
      .single();

    // Return cached if exists and is less than 7 days old
    if (cached) {
      const cacheAge = Date.now() - new Date(cached.created_at).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (cacheAge < sevenDays) {
        return cached.plan_data as DashboardData;
      }
    }
  }

  // Generate new plan via Edge Function
  const data = await callEdgeFunction(scanId);

  // Cache the result
  await supabase.from("generated_plans").upsert(
    {
      user_id: userId,
      scan_id: scanId,
      plan_data: data,
    },
    {
      onConflict: "user_id,scan_id",
    }
  );

  return data;
}
