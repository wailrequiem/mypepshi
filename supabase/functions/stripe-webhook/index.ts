// =============================================================
// EDGE FUNCTION: stripe-webhook
// Handles all Stripe webhook events
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// 
// IMPORTANT: Configure webhook in Stripe Dashboard:
// URL: https://<project-ref>.supabase.co/functions/v1/stripe-webhook
// Events: checkout.session.completed, customer.subscription.updated,
//         customer.subscription.deleted, invoice.paid, invoice.payment_failed
// =============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
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

// Webhook secret for signature verification
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

// Helper: Get user_id from Stripe customer
async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("stripe_customers")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();
  
  return data?.user_id || null;
}

// Helper: Upsert subscription in database
async function upsertSubscription(
  userId: string, 
  subscriptionId: string | null, 
  status: string, 
  currentPeriodEnd: Date | null,
  cancelAtPeriodEnd: boolean,
  trialEnd: Date | null = null
) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert({
      user_id: userId,
      subscription_id: subscriptionId,
      status: status,
      current_period_end: currentPeriodEnd?.toISOString() || null,
      cancel_at_period_end: cancelAtPeriodEnd,
      trial_end: trialEnd?.toISOString() || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    });

  if (error) {
    console.error("[stripe-webhook] Error upserting subscription:", error);
    throw error;
  }
}

serve(async (req) => {
  console.log("[stripe-webhook] Webhook received");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // 1. Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("[stripe-webhook] No stripe-signature header");
      return new Response(
        JSON.stringify({ error: "No signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("[stripe-webhook] Signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[stripe-webhook] Event type:", event.type);

    // 3. Handle events
    switch (event.type) {
      // =========================================
      // CHECKOUT COMPLETED - Start trial subscription
      // =========================================
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[stripe-webhook] Checkout completed:", session.id);

        // Only process our starter trial checkouts
        if (session.metadata?.type !== "starter_trial") {
          console.log("[stripe-webhook] Not a starter trial checkout, skipping");
          break;
        }

        const customerId = session.customer as string;
        const paymentIntentId = session.payment_intent as string;
        const userId = session.metadata?.supabase_user_id;

        if (!userId) {
          console.error("[stripe-webhook] No user_id in session metadata");
          break;
        }

        try {
          // Get payment intent to retrieve payment method
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const paymentMethodId = paymentIntent.payment_method as string;

          if (paymentMethodId) {
            // Attach payment method to customer and set as default
            console.log("[stripe-webhook] Attaching payment method to customer...");
            
            try {
              await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
              });
            } catch (attachError) {
              // Payment method might already be attached
              console.log("[stripe-webhook] Payment method attach (may already be attached):", attachError.message);
            }

            // Set as default payment method
            await stripe.customers.update(customerId, {
              invoice_settings: {
                default_payment_method: paymentMethodId,
              },
            });
            console.log("[stripe-webhook] Set default payment method");
          }

          // Get recurring price ID from environment
          const recurringPriceId = Deno.env.get("STRIPE_PRICE_ID_RECURRING");
          if (!recurringPriceId) {
            console.error("[stripe-webhook] STRIPE_PRICE_ID_RECURRING not configured");
            break;
          }

          // Calculate trial end (3 days from now)
          const trialEnd = Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60);

          // Create subscription with trial
          console.log("[stripe-webhook] Creating subscription with 3-day trial...");
          const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: recurringPriceId }],
            trial_end: trialEnd,
            payment_settings: {
              payment_method_types: ["card"],
              save_default_payment_method: "on_subscription",
            },
            metadata: {
              supabase_user_id: userId,
            },
          });

          console.log("[stripe-webhook] Subscription created:", subscription.id, "status:", subscription.status);

          // Upsert subscription in database
          await upsertSubscription(
            userId,
            subscription.id,
            subscription.status, // 'trialing'
            new Date(subscription.current_period_end * 1000),
            subscription.cancel_at_period_end,
            new Date(trialEnd * 1000)
          );

          console.log("[stripe-webhook] ✅ Trial subscription activated for user:", userId);

        } catch (subError) {
          console.error("[stripe-webhook] Error creating subscription:", subError);
          // Still mark as trialing in our DB even if Stripe sub fails
          // This is a fallback - user paid 1€, give them access
          await upsertSubscription(
            userId,
            null,
            "trialing",
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            false,
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          );
        }
        break;
      }

      // =========================================
      // SUBSCRIPTION UPDATED
      // =========================================
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[stripe-webhook] Subscription updated:", subscription.id, "status:", subscription.status);

        const userId = subscription.metadata?.supabase_user_id || 
          await getUserIdFromCustomer(subscription.customer as string);

        if (!userId) {
          console.error("[stripe-webhook] Cannot find user for subscription");
          break;
        }

        await upsertSubscription(
          userId,
          subscription.id,
          subscription.status,
          new Date(subscription.current_period_end * 1000),
          subscription.cancel_at_period_end,
          subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
        );

        console.log("[stripe-webhook] ✅ Subscription updated in DB for user:", userId);
        break;
      }

      // =========================================
      // SUBSCRIPTION DELETED/CANCELLED
      // =========================================
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[stripe-webhook] Subscription deleted:", subscription.id);

        const userId = subscription.metadata?.supabase_user_id ||
          await getUserIdFromCustomer(subscription.customer as string);

        if (!userId) {
          console.error("[stripe-webhook] Cannot find user for deleted subscription");
          break;
        }

        await upsertSubscription(
          userId,
          subscription.id,
          "canceled",
          new Date(subscription.current_period_end * 1000),
          true,
          null
        );

        console.log("[stripe-webhook] ✅ Subscription marked canceled for user:", userId);
        break;
      }

      // =========================================
      // INVOICE PAID - Renewal success
      // =========================================
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[stripe-webhook] Invoice paid:", invoice.id);

        // Skip if not a subscription invoice
        if (!invoice.subscription) {
          console.log("[stripe-webhook] Not a subscription invoice, skipping");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.supabase_user_id ||
          await getUserIdFromCustomer(invoice.customer as string);

        if (!userId) {
          console.error("[stripe-webhook] Cannot find user for invoice");
          break;
        }

        await upsertSubscription(
          userId,
          subscription.id,
          subscription.status, // Should be 'active' after payment
          new Date(subscription.current_period_end * 1000),
          subscription.cancel_at_period_end,
          subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
        );

        console.log("[stripe-webhook] ✅ Invoice paid, subscription renewed for user:", userId);
        break;
      }

      // =========================================
      // INVOICE PAYMENT FAILED
      // =========================================
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[stripe-webhook] Invoice payment failed:", invoice.id);

        if (!invoice.subscription) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.supabase_user_id ||
          await getUserIdFromCustomer(invoice.customer as string);

        if (!userId) {
          console.error("[stripe-webhook] Cannot find user for failed invoice");
          break;
        }

        // Update status to past_due or unpaid based on Stripe's status
        await upsertSubscription(
          userId,
          subscription.id,
          subscription.status, // Will be 'past_due' or 'unpaid'
          new Date(subscription.current_period_end * 1000),
          subscription.cancel_at_period_end,
          null
        );

        console.log("[stripe-webhook] ⚠️ Payment failed for user:", userId, "status:", subscription.status);
        break;
      }

      default:
        console.log("[stripe-webhook] Unhandled event type:", event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[stripe-webhook] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Webhook error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
