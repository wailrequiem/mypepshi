// =============================================================
// EDGE FUNCTION: stripe-customer-portal
// Creates a Stripe Customer Portal session for subscription management
// Deploy: supabase functions deploy stripe-customer-portal
// =============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  { auth: { persistSession: false } }
);

serve(async (req) => {
  console.log("[stripe-customer-portal] Function invoked");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // 1. Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[stripe-customer-portal] No authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required", ok: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from Supabase Auth
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("[stripe-customer-portal] Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid token", ok: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[stripe-customer-portal] Authenticated user:", user.id);

    // 2. Parse request body for return URL
    let returnUrl: string;
    
    try {
      const body = await req.json();
      returnUrl = body.return_url || `${req.headers.get("origin")}/dashboard/settings`;
    } catch {
      const origin = req.headers.get("origin") || "http://localhost:5173";
      returnUrl = `${origin}/dashboard/settings`;
    }

    // 3. Get user's Stripe customer ID
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (customerError || !customerData?.stripe_customer_id) {
      console.error("[stripe-customer-portal] No Stripe customer found:", customerError);
      return new Response(
        JSON.stringify({ 
          error: "No subscription found. Please subscribe first.", 
          ok: false 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeCustomerId = customerData.stripe_customer_id;
    console.log("[stripe-customer-portal] Found Stripe customer:", stripeCustomerId);

    // 4. Create Stripe Customer Portal Session
    console.log("[stripe-customer-portal] Creating portal session...");
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    console.log("[stripe-customer-portal] Portal session created:", portalSession.id);

    return new Response(
      JSON.stringify({
        ok: true,
        url: portalSession.url,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[stripe-customer-portal] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        ok: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
