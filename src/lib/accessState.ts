// =============================================================
// Access State Helper
// Single source of truth for user access state (onboarding + payment)
// =============================================================

import { supabase } from "./supabase";
import { isPremiumActive, getSubscription } from "./stripe";

export interface AccessState {
  onboardingCompleted: boolean;
  hasPaid: boolean;
}

/**
 * Fetches the user's access state from the database.
 * Returns safe defaults if profile is missing.
 * 
 * @param userId - The user's ID from Supabase auth
 * @returns { onboardingCompleted: boolean, hasPaid: boolean }
 */
export async function getAccessState(userId: string): Promise<AccessState> {
  // Safe defaults
  const defaultState: AccessState = {
    onboardingCompleted: false,
    hasPaid: false,
  };

  if (!userId) {
    return defaultState;
  }

  try {
    // Fetch profile and subscription in parallel
    const [profileResult, subscription] = await Promise.all([
      supabase
        .from("profiles")
        .select("onboarding_json")
        .eq("id", userId)
        .single(),
      getSubscription(),
    ]);

    // Check onboarding completion from profile
    const onboardingCompleted = 
      profileResult.data?.onboarding_json?.completed === true;

    // Check payment status from subscription
    const hasPaid = isPremiumActive(subscription);

    return {
      onboardingCompleted,
      hasPaid,
    };
  } catch (error) {
    console.error("[getAccessState] Error fetching access state:", error);
    return defaultState;
  }
}

/**
 * Determines the correct route based on user's access state.
 * Implements the state machine:
 *   A) Not completed onboarding -> /onboarding
 *   B) Completed onboarding, not paid -> /paywall
 *   C) Completed onboarding, paid -> /dashboard
 * 
 * @param accessState - The user's access state
 * @returns The route path to redirect to
 */
export function getRedirectPath(accessState: AccessState): string {
  if (!accessState.onboardingCompleted) {
    return "/onboarding";
  }
  
  if (!accessState.hasPaid) {
    return "/paywall";
  }
  
  return "/dashboard";
}

/**
 * Fetches access state and returns the appropriate redirect path.
 * Convenience function combining getAccessState and getRedirectPath.
 * 
 * @param userId - The user's ID from Supabase auth
 * @returns The route path to redirect to
 */
export async function getAuthRedirectPath(userId: string): Promise<string> {
  const accessState = await getAccessState(userId);
  return getRedirectPath(accessState);
}

// =============================================================
// Payment Gating Helpers
// Used to block scan uploads/saves until payment is confirmed
// =============================================================

export interface PaidAccessResult {
  allowed: boolean;
  reason?: "NOT_AUTHENTICATED" | "PAYMENT_REQUIRED";
  userId?: string;
}

/**
 * Checks if the current user has paid and is allowed to upload scans.
 * This is the SINGLE SOURCE OF TRUTH for scan upload gating.
 * 
 * @returns { allowed: boolean, reason?: string, userId?: string }
 */
export async function requirePaidAccess(): Promise<PaidAccessResult> {
  try {
    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.warn("[requirePaidAccess] User not authenticated");
      return { allowed: false, reason: "NOT_AUTHENTICATED" };
    }

    // 2. Check payment status
    const subscription = await getSubscription();
    const hasPaid = isPremiumActive(subscription);

    if (!hasPaid) {
      console.warn("[requirePaidAccess] User has not paid - blocking scan operation");
      return { allowed: false, reason: "PAYMENT_REQUIRED", userId: user.id };
    }

    console.log("[requirePaidAccess] User has paid - scan operation allowed");
    return { allowed: true, userId: user.id };
  } catch (error) {
    console.error("[requirePaidAccess] Error checking access:", error);
    return { allowed: false, reason: "NOT_AUTHENTICATED" };
  }
}

/**
 * Simple boolean check for paid status (for UI gating)
 * 
 * @returns true if user has paid, false otherwise
 */
export async function checkHasPaid(): Promise<boolean> {
  const result = await requirePaidAccess();
  return result.allowed;
}
