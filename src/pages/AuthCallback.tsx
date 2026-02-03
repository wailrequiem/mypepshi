import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAccessState } from "@/lib/accessState";

/**
 * AuthCallback - Handles OAuth redirect and routes users based on access state.
 * 
 * This page is the redirect target for Google OAuth.
 * It waits for the session to be established, then routes based on the state machine:
 *   A) Onboarding not completed -> /onboarding
 *   B) Onboarding completed, not paid -> /paywall
 *   C) Onboarding completed, paid -> /dashboard
 */
export default function AuthCallback() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      // Wait for auth to be ready
      if (isLoading) return;

      // No user -> something went wrong, go to home
      if (!user) {
        console.log("[AuthCallback] No user found, redirecting to home");
        navigate("/", { replace: true });
        return;
      }

      try {
        // Get the user's access state
        const accessState = await getAccessState(user.id);
        console.log("[AuthCallback] Access state:", accessState);
        
        // Route based on state:
        // 1. Has paid -> Dashboard
        // 2. Completed onboarding but not paid -> Paywall
        // 3. Not completed onboarding -> Onboarding
        if (accessState.hasPaid) {
          console.log("[AuthCallback] User has paid, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        } else if (accessState.onboardingCompleted) {
          console.log("[AuthCallback] Onboarding completed but not paid, redirecting to paywall");
          navigate("/paywall", { replace: true });
        } else {
          console.log("[AuthCallback] Onboarding not completed, redirecting to onboarding");
          navigate("/onboarding", { replace: true });
        }
      } catch (error) {
        console.error("[AuthCallback] Error getting redirect path:", error);
        // Default to onboarding on error
        navigate("/onboarding", { replace: true });
      }
    };

    handleRedirect();
  }, [user, isLoading, navigate]);

  // Show loading spinner while processing
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
