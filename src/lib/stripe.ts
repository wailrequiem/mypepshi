// =============================================================
// STRIPE CLIENT HELPERS
// Frontend utilities for Stripe integration
// =============================================================

import { supabase } from "./supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Initiates Stripe Checkout for the $1 trial
 * Creates a checkout session and redirects the user
 */
export async function startTrialCheckout(options?: {
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ url: string } | { error: string }> {
  try {
    // Get current session for auth token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error("[Stripe] No session:", sessionError);
      return { error: "Please sign in to continue" };
    }

    console.log("[Stripe] Starting trial checkout...");

    // Call Edge Function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/stripe-checkout-starter`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          success_url: options?.successUrl || `${window.location.origin}/dashboard?payment=success`,
          cancel_url: options?.cancelUrl || `${window.location.origin}/paywall?payment=cancelled`,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("[Stripe] Checkout error:", data);
      return { error: data.error || "Failed to create checkout session" };
    }

    console.log("[Stripe] Checkout session created, redirecting...");
    return { url: data.url };

  } catch (error: any) {
    console.error("[Stripe] Checkout error:", error);
    return { error: error.message || "Payment error" };
  }
}

/**
 * Redirects to Stripe Checkout
 * Convenience wrapper that handles the redirect
 */
export async function redirectToCheckout(options?: {
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ error: string } | void> {
  const result = await startTrialCheckout(options);
  
  if ("error" in result) {
    return { error: result.error };
  }

  // Redirect to Stripe Checkout
  window.location.href = result.url;
}

/**
 * Subscription status type
 */
export type SubscriptionStatus = 
  | "trialing" 
  | "active" 
  | "past_due" 
  | "canceled" 
  | "unpaid" 
  | "inactive"
  | "none";

/**
 * Subscription data returned from database
 */
export interface Subscription {
  user_id: string;
  subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  updated_at: string;
}

/**
 * Fetches the current user's subscription from database
 */
export async function getSubscription(): Promise<Subscription | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // No subscription found is not an error
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("[Stripe] Error fetching subscription:", error);
      return null;
    }

    return data as Subscription;

  } catch (error) {
    console.error("[Stripe] Error fetching subscription:", error);
    return null;
  }
}

/**
 * Checks if user has active premium access
 * Premium = (trialing OR active) AND current_period_end > now
 */
export function isPremiumActive(subscription: Subscription | null): boolean {
  if (!subscription) {
    return false;
  }

  const { status, current_period_end } = subscription;

  // Check if status allows access
  const hasAccessStatus = status === "trialing" || status === "active";
  
  if (!hasAccessStatus) {
    return false;
  }

  // Check if period is still valid
  if (!current_period_end) {
    return false;
  }

  const periodEnd = new Date(current_period_end);
  const now = new Date();

  return periodEnd > now;
}

/**
 * Gets days remaining in trial or subscription
 */
export function getDaysRemaining(subscription: Subscription | null): number {
  if (!subscription || !subscription.current_period_end) {
    return 0;
  }

  const periodEnd = new Date(subscription.current_period_end);
  const now = new Date();
  const diff = periodEnd.getTime() - now.getTime();
  
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Checks if user is in trial period
 */
export function isTrialing(subscription: Subscription | null): boolean {
  return subscription?.status === "trialing";
}
