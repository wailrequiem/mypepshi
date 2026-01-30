import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAccessState } from "@/lib/accessState";

interface OnboardingRouteProps {
  children: React.ReactNode;
}

/**
 * OnboardingRoute - Guards the /onboarding route.
 * 
 * Redirect logic:
 *   - Not authenticated -> allow (guest onboarding flow)
 *   - Onboarding completed + paid -> redirect to /dashboard
 *   - Onboarding completed + not paid -> redirect to /paywall
 *   - Otherwise -> show onboarding
 */
export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [canShowOnboarding, setCanShowOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      // Wait for auth to be ready
      if (isAuthLoading) return;

      // No user -> allow guest onboarding flow
      if (!user) {
        setCanShowOnboarding(true);
        setIsCheckingAccess(false);
        return;
      }

      try {
        const accessState = await getAccessState(user.id);
        
        if (!isMounted) return;

        // If user completed onboarding and paid, send to dashboard
        if (accessState.onboardingCompleted && accessState.hasPaid) {
          console.log("[OnboardingRoute] User completed onboarding + paid, redirecting to /dashboard");
          navigate("/dashboard", { replace: true });
          return;
        }

        // If user completed onboarding but not paid, send to paywall
        if (accessState.onboardingCompleted && !accessState.hasPaid) {
          console.log("[OnboardingRoute] User completed onboarding, redirecting to /paywall");
          navigate("/paywall", { replace: true });
          return;
        }

        // User hasn't completed onboarding, show it
        setCanShowOnboarding(true);
      } catch (error) {
        console.error("[OnboardingRoute] Error checking access:", error);
        // On error, show onboarding anyway
        setCanShowOnboarding(true);
      } finally {
        if (isMounted) {
          setIsCheckingAccess(false);
        }
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthLoading, navigate]);

  // Show loading spinner while checking auth or access
  if (isAuthLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render children if not allowed
  if (!canShowOnboarding) {
    return null;
  }

  return <>{children}</>;
}
