import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAccessState } from "@/lib/accessState";

interface PaywallRouteProps {
  children: React.ReactNode;
}

/**
 * PaywallRoute - Guards the /paywall route.
 * 
 * Redirect logic:
 *   - Not authenticated -> allow (guest paywall flow)
 *   - Onboarding not completed -> redirect to /onboarding
 *   - Already paid -> redirect to /dashboard
 *   - Otherwise -> show paywall
 */
export function PaywallRoute({ children }: PaywallRouteProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [canShowPaywall, setCanShowPaywall] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      // Wait for auth to be ready
      if (isAuthLoading) return;

      // No user -> allow guest paywall flow
      if (!user) {
        setCanShowPaywall(true);
        setIsCheckingAccess(false);
        return;
      }

      try {
        const accessState = await getAccessState(user.id);
        
        if (!isMounted) return;

        // If user hasn't completed onboarding, send them there
        if (!accessState.onboardingCompleted) {
          console.log("[PaywallRoute] Onboarding not completed, redirecting to /onboarding");
          navigate("/onboarding", { replace: true });
          return;
        }

        // If user already paid, send them to dashboard
        if (accessState.hasPaid) {
          console.log("[PaywallRoute] User already paid, redirecting to /dashboard");
          navigate("/dashboard", { replace: true });
          return;
        }

        // User is in the correct state for paywall
        setCanShowPaywall(true);
      } catch (error) {
        console.error("[PaywallRoute] Error checking access:", error);
        // On error, show paywall anyway
        setCanShowPaywall(true);
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
  if (!canShowPaywall) {
    return null;
  }

  return <>{children}</>;
}
