// =============================================================
// useSubscription Hook
// Provides subscription state and premium gating
// =============================================================

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  Subscription, 
  getSubscription, 
  isPremiumActive, 
  getDaysRemaining,
  isTrialing,
  redirectToCheckout
} from "@/lib/stripe";

interface UseSubscriptionReturn {
  // State
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  
  // Premium status
  isPremium: boolean;
  isTrialing: boolean;
  daysRemaining: number;
  
  // Actions
  refresh: () => Promise<void>;
  startCheckout: () => Promise<{ error?: string }>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription data
  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const sub = await getSubscription();
      setSubscription(sub);
    } catch (err: any) {
      console.error("[useSubscription] Error:", err);
      setError(err.message || "Failed to load subscription");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("subscription_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("[useSubscription] Realtime update:", payload);
          if (payload.new) {
            setSubscription(payload.new as Subscription);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Start checkout action
  const startCheckout = useCallback(async () => {
    try {
      const result = await redirectToCheckout();
      if (result?.error) {
        return { error: result.error };
      }
      return {};
    } catch (err: any) {
      return { error: err.message || "Checkout failed" };
    }
  }, []);

  // Computed values
  const isPremium = isPremiumActive(subscription);
  const trialing = isTrialing(subscription);
  const daysRemaining = getDaysRemaining(subscription);

  return {
    subscription,
    isLoading,
    error,
    isPremium,
    isTrialing: trialing,
    daysRemaining,
    refresh,
    startCheckout,
  };
}

/**
 * Simple hook for premium gating
 * Returns true if user has active premium access
 */
export function usePremiumAccess(): { isPremium: boolean; isLoading: boolean } {
  const { isPremium, isLoading } = useSubscription();
  return { isPremium, isLoading };
}
