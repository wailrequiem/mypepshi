// =============================================================
// EDGE FUNCTION: stripe-checkout-starter
// Creates a Stripe Checkout session for the $1 trial
// Deploy: supabase functions deploy stripe-checkout-starter
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
  console.log("[stripe-checkout-starter] Function invoked");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // 1. Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[stripe-checkout-starter] No authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from Supabase Auth
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("[stripe-checkout-starter] Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[stripe-checkout-starter] Authenticated user:", user.id);

    // 2. Parse request body for URLs
    let successUrl: string;
    let cancelUrl: string;
    
    try {
      const body = await req.json();
      successUrl = body.success_url || `${req.headers.get("origin")}/dashboard?payment=success`;
      cancelUrl = body.cancel_url || `${req.headers.get("origin")}/paywall?payment=cancelled`;
    } catch {
      const origin = req.headers.get("origin") || "http://localhost:5173";
      successUrl = `${origin}/dashboard?payment=success`;
      cancelUrl = `${origin}/paywall?payment=cancelled`;
    }

    // 3. Check if user already has a Stripe customer
    const { data: existingCustomer } = await supabaseAdmin
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let stripeCustomerId: string;

    if (existingCustomer?.stripe_customer_id) {
      // Use existing Stripe customer
      stripeCustomerId = existingCustomer.stripe_customer_id;
      console.log("[stripe-checkout-starter] Using existing Stripe customer:", stripeCustomerId);
    } else {
      // Create new Stripe customer
      console.log("[stripe-checkout-starter] Creating new Stripe customer...");
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save to database
      const { error: insertError } = await supabaseAdmin
        .from("stripe_customers")
        .insert({
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
        });

      if (insertError) {
        console.error("[stripe-checkout-starter] Error saving customer:", insertError);
        // Continue anyway - customer exists in Stripe
      }
      console.log("[stripe-checkout-starter] Created Stripe customer:", stripeCustomerId);
    }

    // 4. Get Price ID from environment
    const priceIdOnetime = Deno.env.get("STRIPE_PRICE_ID_ONETIME_1EUR");
    if (!priceIdOnetime) {
      console.error("[stripe-checkout-starter] STRIPE_PRICE_ID_ONETIME_1EUR not configured");
      return new Response(
        JSON.stringify({ error: "Payment configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Create Checkout Session
    console.log("[stripe-checkout-starter] Creating checkout session...");
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceIdOnetime,
          quantity: 1,
        },
      ],
      // Enable saving card for future subscription
      payment_intent_data: {
        setup_future_usage: "off_session",
        metadata: {
          supabase_user_id: user.id,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        supabase_user_id: user.id,
        type: "starter_trial",
      },
      // Custom text for checkout
      custom_text: {
        submit: {
          message: "Start your 3-day premium trial for just $1",
        },
      },
    });

    console.log("[stripe-checkout-starter] Checkout session created:", session.id);

    return new Response(
      JSON.stringify({
        ok: true,
        url: session.url,
        session_id: session.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[stripe-checkout-starter] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        ok: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
