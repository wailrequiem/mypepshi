// =============================================================
// SubscriptionGate Component
// Wraps content that requires premium subscription
// =============================================================

import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2, Lock, Clock } from "lucide-react";

interface SubscriptionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  showTrialBadge?: boolean;
}

/**
 * Wraps content that requires premium subscription
 * Shows fallback (paywall) if user is not premium
 */
export function SubscriptionGate({ 
  children, 
  fallback,
  loadingFallback,
  showTrialBadge = true,
}: SubscriptionGateProps) {
  const { isPremium, isTrialing, daysRemaining, isLoading } = useSubscription();

  // Loading state
  if (isLoading) {
    return (
      <>
        {loadingFallback || (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </>
    );
  }

  // Not premium - show fallback
  if (!isPremium) {
    return (
      <>
        {fallback || <DefaultPaywallFallback />}
      </>
    );
  }

  // Premium user - show content with optional trial badge
  return (
    <div className="relative">
      {showTrialBadge && isTrialing && (
        <TrialBadge daysRemaining={daysRemaining} />
      )}
      {children}
    </div>
  );
}

/**
 * Default paywall fallback when no custom fallback provided
 */
function DefaultPaywallFallback() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Premium Content
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Subscribe to access this content
      </p>
    </div>
  );
}

/**
 * Trial badge shown during trial period
 */
function TrialBadge({ daysRemaining }: { daysRemaining: number }) {
  return (
    <div className="absolute top-2 right-2 z-10">
      <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
        <Clock className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">
          Trial: {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left
        </span>
      </div>
    </div>
  );
}

/**
 * Simple hook to check premium status inline
 */
export function usePremiumContent() {
  const { isPremium, isLoading } = useSubscription();
  return { isPremium, isLoading };
}
